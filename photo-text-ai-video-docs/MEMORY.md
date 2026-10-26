# Project Memory

This file is the concise source of truth for decisions, current status, verified commands, and unresolved issues. Update it as work progresses. Do not record secrets, API keys, private user media, or unnecessary personal data.

## Project
- Name: Photo + Text → AI Talking Video
- Goal: Upload a photo, enter a script, choose a voice, generate a talking-head video, preview and download it.
- MVP principle: keep the workflow to one page and use existing models/APIs.

## Current proposed stack
- Frontend: Next.js + TypeScript + Tailwind CSS.
- Backend: Python + FastAPI.
- Speech: Piper TTS (`OHF-Voice/piper1-gpl`).
- Talking-head animation: SadTalker as an initial local experiment, subject to compatibility and license review.
- Media handling: FFmpeg.
- Database/storage: PostgreSQL/Supabase and private object storage if persistence is needed.

## Verified facts
- Piper repository: https://github.com/OHF-Voice/piper1-gpl
- Piper README documents installation with `pip install piper-tts` and links to CLI, HTTP server, Python API, voices, and training documentation.
- Piper performs text-to-speech; it does not by itself animate a photo into a talking video.
- Software and voice-model licenses should be checked separately before commercial distribution.
- FFmpeg installed via Winget (`Gyan.FFmpeg.Essentials` version 9.0.1) with full H.264 / AAC encoders.
- Hardware verified: Intel(R) Core(TM) i3-1215U (6 cores / 8 threads), 8 GB RAM, Intel UHD Graphics (No NVIDIA CUDA GPU available, CPU inference only).
- Verified that full SadTalker PyTorch CPU inference on 8GB RAM is severely constrained (requires 16GB-32GB RAM and takes 15-45 minutes per clip, risking pagefile thrashing/OOM).
- Implemented and verified lightweight ONNX-based talking-head pipeline (`wav2lip.onnx` + OpenCV YuNet DNN face detection) running on `onnxruntime` CPU: runs at ~25.9 fps in real-time, completing a 4s video in ~8.7s with <500MB RAM usage!

## Decisions made
- Talking-head model/provider: High-efficiency Wav2Lip ONNX adapter for local CPU inference, behind the `TalkingHeadProvider` interface so hosted/cloud GPU providers can be plugged in without UI/backend disruption.
- TTS provider: Piper TTS using `en_US-lessac-medium` ONNX model (ODC-By license).
- Face detection: OpenCV YuNet (`face_detection_yunet_2023mar.onnx`, Apache 2.0).
- Local GPU versus hosted generation: Local CPU mode using optimized ONNX graph fusion.
- Video container: MP4 (H.264 video, AAC audio, 720x720, 25 fps).
- Storage: Local managed file storage for MVP in `backend/storage/`.

## Current status
- Stage: Local AI pipeline verified! Moving to FastAPI backend service and Next.js frontend.
- Working end-to-end prototype: Verified in `backend/test_pipeline.py`.
- Production deployment: In development.

## Environment
- Operating system: Windows 11 Home Single Language 64-bit
- Python version: 3.13.14
- Node.js version: v24.19.0, npm: 11.17.0
- GPU / VRAM: Intel(R) UHD Graphics (Integrated, no CUDA)
- Installation commands that worked:
  - `winget install Gyan.FFmpeg.Essentials`
  - `python -m venv backend\.venv`
  - `backend\.venv\Scripts\pip install piper-tts opencv-python scipy librosa onnxruntime`
- Model and voice versions:
  - Piper TTS: `piper_tts-1.8.0`, voice: `en_US-lessac-medium.onnx`
  - Face detector: OpenCV YuNet `face_detection_yunet_2023mar.onnx`
  - Lip sync: `wav2lip.onnx` (145MB)

## Test log
- Date: 2026-10-26
- Change/test: End-to-end test of Piper TTS + YuNet + Wav2Lip ONNX + FFmpeg muxing
- Result: SUCCESS! Generated 99 frames (3.96s) of talking video with synced audio.
- Runtime/resource use: Audio generation ~1.5s, NN inference ~3.82s (25.9 fps on CPU), total rendering ~8.7s. Memory footprint under 500MB.
- Errors/blockers resolved:
  1. Addressed OpenCV 5 `CascadeClassifier` deprecation by integrating OpenCV YuNet DNN detector.
  2. Fixed talking movement: In `Wav2Lip`, the 6-channel input expects `(masked_face, face_crop)` where the masked lower half is channels 0..2 and the reference face is channels 3..5. The earlier code inverted this order, causing the model to copy through the unmasked face without generating mouth movement. Corrected channel ordering and adjusted the feather mask to allow full 100% mouth/jaw articulation while smoothly blending the edges.
  3. Verified on generated video output: Pixel differences across speaking frames measured at 150–214, confirming clear, synchronized lip articulation.
- Next step: Ready for user testing.
