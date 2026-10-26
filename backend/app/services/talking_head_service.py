import os
import sys
import subprocess
import time
from abc import ABC, abstractmethod
from typing import Callable, Optional
import cv2
import numpy as np
import onnxruntime as ort

from app.config import WAV2LIP_MODEL_PATH, YUNET_MODEL_PATH, FFMPEG_PATH, TEMP_DIR

# Import audio processing helper from backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
import audio

class TalkingHeadProvider(ABC):
    @abstractmethod
    def generate(self, image_path: str, audio_path: str, output_path: str, progress_callback: Optional[Callable[[str], None]] = None) -> str:
        pass

class Wav2LipOnnxProvider(TalkingHeadProvider):
    def __init__(self):
        self._session = None

    def _get_session(self):
        if self._session is None:
            if not os.path.exists(WAV2LIP_MODEL_PATH):
                raise FileNotFoundError(f"Wav2Lip model file not found at {WAV2LIP_MODEL_PATH}")
            # Initialize ONNX Runtime session with optimized CPU graph
            opts = ort.SessionOptions()
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            self._session = ort.InferenceSession(
                str(WAV2LIP_MODEL_PATH),
                sess_options=opts,
                providers=["CPUExecutionProvider"]
            )
        return self._session

    def detect_face(self, image: np.ndarray):
        """Detect the primary face in the image with YuNet DNN."""
        h, w = image.shape[:2]
        if os.path.exists(YUNET_MODEL_PATH):
            detector = cv2.FaceDetectorYN_create(str(YUNET_MODEL_PATH), "", (w, h), score_threshold=0.6)
            ret, faces = detector.detect(image)
            if faces is not None and len(faces) > 0:
                faces = sorted(faces, key=lambda f: f[-1] * f[2] * f[3], reverse=True)
                x, y, fw, fh = [int(v) for v in faces[0][:4]]
                
                # Expand padding
                pad_x = int(fw * 0.1)
                pad_y_top = int(fh * 0.1)
                pad_y_bottom = int(fh * 0.15)
                
                x1 = max(0, x - pad_x)
                y1 = max(0, y - pad_y_top)
                x2 = min(w, x + fw + pad_x)
                y2 = min(h, y + fh + pad_y_bottom)
                return (x1, y1, x2 - x1, y2 - y1)
        
        # Fallback to center region
        size = min(h, w) // 2
        cx, cy = w // 2, h // 2
        return (cx - size // 2, cy - size // 2, size, size)

    def generate(self, image_path: str, audio_path: str, output_path: str, progress_callback: Optional[Callable[[str], None]] = None) -> str:
        if progress_callback:
            progress_callback("Analyzing image and extracting facial features...")

        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read input image from {image_path}")

        # Limit max dimension to 720 for optimal performance and crispness
        h, w = img.shape[:2]
        max_dim = 720
        if max(h, w) > max_dim:
            scale = max_dim / float(max(h, w))
            img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
            h, w = img.shape[:2]

        fx, fy, fw, fh = self.detect_face(img)
        face_crop = img[fy:fy+fh, fx:fx+fw]
        face_crop_96 = cv2.resize(face_crop, (96, 96))

        if progress_callback:
            progress_callback("Processing audio speech spectrogram...")

        wav = audio.load_wav(audio_path, 16000)
        mel = audio.melspectrogram(wav)

        fps = 25
        wav_duration = len(wav) / 16000.0
        num_frames = max(1, int(wav_duration * fps))

        # Build mel chunks for each frame
        mel_step_size = 16
        mel_chunks = []
        mel_idx_multiplier = 80.0 / float(fps)

        for i in range(num_frames):
            start_idx = int(i * mel_idx_multiplier)
            if start_idx + mel_step_size > mel.shape[1]:
                chunk = mel[:, len(mel[0]) - mel_step_size:]
            else:
                chunk = mel[:, start_idx:start_idx + mel_step_size]
            mel_chunks.append(chunk)

        mel_chunks = np.array(mel_chunks, dtype=np.float32)  # (N, 80, 16)
        mel_chunks = np.expand_dims(mel_chunks, axis=1)      # (N, 1, 80, 16)

        # Build vid inputs
        masked_face = face_crop_96.copy()
        masked_face[48:, :] = 0  # lower half mask

        # Correct channel order for Wav2Lip: (masked_face, face_crop_96)
        combined_face = np.concatenate([masked_face, face_crop_96], axis=2)
        combined_face = combined_face.astype(np.float32) / 255.0
        combined_face = np.transpose(combined_face, (2, 0, 1))

        vid_input = np.repeat(np.expand_dims(combined_face, axis=0), num_frames, axis=0)

        if progress_callback:
            progress_callback(f"Generating lip synchronization ({num_frames} frames)...")

        session = self._get_session()
        batch_size = 16
        gen_faces = []

        for start in range(0, num_frames, batch_size):
            end = min(start + batch_size, num_frames)
            mel_batch = mel_chunks[start:end]
            vid_batch = vid_input[start:end]

            preds = session.run(None, {"mel": mel_batch, "vid": vid_batch})[0]
            for b in range(preds.shape[0]):
                pred = preds[b]
                pred = np.transpose(pred, (1, 2, 0))
                pred = np.clip(pred * 255.0, 0, 255).astype(np.uint8)
                gen_faces.append(pred)

        if progress_callback:
            progress_callback("Compositing video frames and blending facial expressions...")

        temp_video = str(TEMP_DIR / f"temp_{int(time.time()*1000)}.mp4")
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(temp_video, fourcc, fps, (w, h))

        # Precision blending mask ensuring full-amplitude mouth and jaw movement
        mask_96 = np.zeros((96, 96), dtype=np.float32)
        mask_96[45:55, 10:86] = np.linspace(0.0, 1.0, 10)[:, None]
        mask_96[55:88, 10:86] = 1.0
        mask_96[88:95, 10:86] = np.linspace(1.0, 0.0, 7)[:, None]
        mask_96 = cv2.GaussianBlur(mask_96, (9, 9), 0)
        mask_96 = np.expand_dims(mask_96, axis=2)

        for face_pred in gen_faces:
            frame = img.copy()
            pred_resized = cv2.resize(face_pred, (fw, fh))
            mask_resized = cv2.resize(mask_96, (fw, fh))
            if len(mask_resized.shape) == 2:
                mask_resized = np.expand_dims(mask_resized, axis=2)

            original_roi = frame[fy:fy+fh, fx:fx+fw].astype(np.float32)
            blended = (pred_resized.astype(np.float32) * mask_resized + original_roi * (1.0 - mask_resized)).astype(np.uint8)
            frame[fy:fy+fh, fx:fx+fw] = blended
            out.write(frame)

        out.release()

        if progress_callback:
            progress_callback("Encoding and finalizing MP4 with synchronized audio...")

        cmd = [
            FFMPEG_PATH, "-y",
            "-i", temp_video,
            "-i", audio_path,
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            output_path
        ]

        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode != 0:
            raise RuntimeError(f"FFmpeg muxing failed: {proc.stderr}")

        if os.path.exists(temp_video):
            try:
                os.remove(temp_video)
            except Exception:
                pass

        return output_path
