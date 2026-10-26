import os
import sys
import time
import subprocess
import cv2
import numpy as np
import onnxruntime as ort

# Add backend directory to sys.path so audio and hparams are imported cleanly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import audio
from hparams import hparams as hp

FFMPEG_PATH = r"C:\Users\adith\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"
if not os.path.exists(FFMPEG_PATH):
    FFMPEG_PATH = "ffmpeg"

def detect_face(image):
    """Detect primary face in image using OpenCV YuNet DNN."""
    h, w = image.shape[:2]
    yunet_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "yunet.onnx")
    
    if os.path.exists(yunet_path):
        detector = cv2.FaceDetectorYN_create(yunet_path, '', (w, h), score_threshold=0.6)
        ret, faces = detector.detect(image)
        if faces is not None and len(faces) > 0:
            # Sort by confidence * area
            faces = sorted(faces, key=lambda f: f[-1] * f[2] * f[3], reverse=True)
            x, y, fw, fh = [int(v) for v in faces[0][:4]]
            
            # Add padding around face
            pad_x = int(fw * 0.1)
            pad_y_top = int(fh * 0.1)
            pad_y_bottom = int(fh * 0.15)
            
            x1 = max(0, x - pad_x)
            y1 = max(0, y - pad_y_top)
            x2 = min(w, x + fw + pad_x)
            y2 = min(h, y + fh + pad_y_bottom)
            return (x1, y1, x2 - x1, y2 - y1)
    
    # Fallback center crop
    size = min(h, w) // 2
    cx, cy = w // 2, h // 2
    return (cx - size // 2, cy - size // 2, size, size)

def run_talking_pipeline(image_path, audio_path, model_path, output_path):
    start_time = time.time()
    print(f"Loading portrait: {image_path}")
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not load image at {image_path}")
    
    # Scale image to max dimension 720 to save memory and inference time
    h, w = img.shape[:2]
    max_dim = 720
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        h, w = img.shape[:2]
    print(f"Image resolution: {w}x{h}")
    
    fx, fy, fw, fh = detect_face(img)
    print(f"Detected face bounding box: x={fx}, y={fy}, w={fw}, h={fh}")
    face_crop = img[fy:fy+fh, fx:fx+fw]
    face_crop_96 = cv2.resize(face_crop, (96, 96))
    
    print(f"Loading and processing audio: {audio_path}")
    wav = audio.load_wav(audio_path, 16000)
    mel = audio.melspectrogram(wav)
    
    # Total frames at 25 FPS
    fps = 25
    wav_duration = len(wav) / 16000.0
    num_frames = int(wav_duration * fps)
    print(f"Audio duration: {wav_duration:.2f}s -> Generating {num_frames} frames at {fps} fps")
    
    print("Loading ONNX model into ONNX Runtime...")
    session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
    
    # Prepare mel chunks for all frames
    mel_step_size = 16
    mel_chunks = []
    mel_idx_multiplier = 80.0 / float(fps)
    
    for i in range(num_frames):
        start_idx = int(i * mel_idx_multiplier)
        if start_idx + mel_step_size > mel.shape[1]:
            # Pad with zeros if at the end
            chunk = mel[:, start_idx:]
            pad_width = mel_step_size - chunk.shape[1]
            chunk = np.pad(chunk, ((0, 0), (0, pad_width)), mode='constant')
        else:
            chunk = mel[:, start_idx:start_idx + mel_step_size]
        mel_chunks.append(chunk)
    
    mel_chunks = np.array(mel_chunks, dtype=np.float32)  # (N, 80, 16)
    mel_chunks = np.expand_dims(mel_chunks, axis=1)      # (N, 1, 80, 16)
    
    # Prepare video frames input (N, 6, 96, 96)
    # vid is: face crop (3 channels) + masked face (3 channels with lower half zeroed)
    masked_face = face_crop_96.copy()
    masked_face[48:, :] = 0  # mask lower half
    
    combined_face = np.concatenate([face_crop_96, masked_face], axis=2) # (96, 96, 6)
    combined_face = combined_face.astype(np.float32) / 255.0
    combined_face = np.transpose(combined_face, (2, 0, 1)) # (6, 96, 96)
    
    # Repeat for each frame
    vid_input = np.repeat(np.expand_dims(combined_face, axis=0), num_frames, axis=0) # (N, 6, 96, 96)
    
    print("Running neural network inference...")
    batch_size = 16
    gen_faces = []
    inf_start = time.time()
    
    for start in range(0, num_frames, batch_size):
        end = min(start + batch_size, num_frames)
        mel_batch = mel_chunks[start:end]
        vid_batch = vid_input[start:end]
        
        preds = session.run(None, {'mel': mel_batch, 'vid': vid_batch})[0]
        # preds: (B, 3, 96, 96)
        for b in range(preds.shape[0]):
            pred = preds[b] # (3, 96, 96)
            pred = np.transpose(pred, (1, 2, 0)) # (96, 96, 3)
            pred = np.clip(pred * 255.0, 0, 255).astype(np.uint8)
            gen_faces.append(pred)
            
    inf_time = time.time() - inf_start
    print(f"Inference completed in {inf_time:.2f}s ({num_frames / inf_time:.1f} fps)!")
    
    # Create temporary silent video
    temp_video = "backend/temp_silent.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_video, fourcc, fps, (w, h))
    
    # Generate feather mask for smooth seamless blending
    mask_96 = np.zeros((96, 96), dtype=np.float32)
    # Blend lower half (chin and lips) with smooth gradient
    mask_96[40:50, :] = np.linspace(0, 1, 10)[:, None]
    mask_96[50:90, 5:91] = 1.0
    # Soften edges
    mask_96 = cv2.GaussianBlur(mask_96, (11, 11), 0)
    mask_96 = np.expand_dims(mask_96, axis=2)
    
    print("Compositing frames...")
    for idx, face_pred in enumerate(gen_faces):
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
    print("Video frames saved. Merging audio using FFmpeg...")
    
    # Merge with FFmpeg
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
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg failed: {res.stderr}")
        
    if os.path.exists(temp_video):
        os.remove(temp_video)
        
    total_time = time.time() - start_time
    print(f"Video generated successfully in {total_time:.2f}s!")
    print(f"Output saved to: {output_path} (Size: {os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    run_talking_pipeline(
        image_path="backend/test_portrait.jpg",
        audio_path="backend/test_speech.wav",
        model_path="backend/models/wav2lip/wav2lip.onnx",
        output_path="backend/test_output.mp4"
    )
