# Nudi AI — Photo + Text to AI Talking Video

A clean, full-stack web application MVP that turns a portrait photo and written script into a synchronized, talking-head AI video.

```
Upload Photo + Enter Script + Choose Voice → Generate AI Video → Preview and Download
```

---

## Architecture Overview

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons.
- **Backend API**: Python 3.13, FastAPI, Uvicorn, Pydantic v2.
- **Text-to-Speech (TTS)**: Piper TTS (`OHF-Voice/piper1-gpl`) running offline with lightweight ONNX neural voice models (`en_US-lessac-medium`, `en_US-ryan-medium`).
- **Talking-Head Generation**: High-efficiency ONNX pipeline (`wav2lip.onnx` + OpenCV YuNet DNN face detection) running real-time CPU inference (~25 fps on an Intel Core i3 with 8GB RAM).
- **Video & Audio Processing**: FFmpeg (H.264 video, AAC audio, 720p 25 fps).
- **Asynchronous Job Processing**: ThreadPoolExecutor with in-memory state tracking and real-time frontend polling (`queued` → `processing` → `completed` / `failed`).

---

## Directory Structure

```text
nudi-ai/
├── backend/
│   ├── app/
│   │   ├── config.py              # Configuration & storage paths
│   │   ├── models/schemas.py      # Pydantic schemas (VoiceInfo, GenerationJobResponse)
│   │   ├── services/
│   │   │   ├── storage_service.py # Upload validation & media storage
│   │   │   ├── speech_service.py  # Piper TTS provider
│   │   │   ├── talking_head_service.py # Wav2Lip ONNX & YuNet provider
│   │   │   └── job_manager.py     # Background job queue & state management
│   │   └── routes/
│   │       ├── voices.py          # GET /api/voices
│   │       ├── generations.py     # POST /api/generations, GET /api/generations/{id}
│   │       └── media.py           # GET /api/media/{filename}
│   ├── models/                    # ONNX model files
│   │   ├── piper_voices/          # Piper voice ONNX + JSON configs
│   │   ├── wav2lip/               # wav2lip.onnx model
│   │   └── yunet.onnx             # OpenCV YuNet face detection model
│   ├── storage/                   # Private file storage
│   │   ├── uploads/
│   │   ├── outputs/
│   │   └── temp/
│   ├── tests/
│   │   ├── test_api.py            # Automated pytest unit & validation tests
│   │   └── test_e2e_live.py       # Live integration test against running servers
│   ├── audio.py                   # Mel-spectrogram audio processing
│   ├── hparams.py                 # Neural audio hyperparameters
│   ├── main.py                    # FastAPI entrypoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx           # Single-page creation interface
│   │   ├── components/
│   │   │   ├── Header.tsx         # Header with wordmark & privacy dialog
│   │   │   ├── PhotoUpload.tsx    # Drag-and-drop upload & sample loader
│   │   │   ├── ScriptInput.tsx    # Textarea with live character/word count
│   │   │   ├── VoiceSelector.tsx  # Interactive voice selection cards
│   │   │   ├── ConsentCheckbox.tsx# Rights & likeness authorization
│   │   │   ├── GenerationStatus.tsx# Live step-by-step progress tracker
│   │   │   └── VideoResult.tsx    # Video player & download controls
│   │   ├── lib/api.ts             # API client connecting to backend
│   │   └── types/index.ts         # TypeScript interfaces
│   └── package.json
├── photo-text-ai-video-docs/      # Project specifications & memory records
├── .env.example
├── .gitignore
└── README.md
```

---

## Prerequisites

1. **Python 3.10+** (Tested on Python 3.13)
2. **Node.js 18+** (Tested on Node.js v24)
3. **FFmpeg**:
   - On Windows: `winget install Gyan.FFmpeg.Essentials`
   - On macOS: `brew install ffmpeg`
   - On Linux (Ubuntu/Debian): `sudo apt-get install -y ffmpeg`

---

## Quick Start Setup

### 1. Backend Setup

```powershell
# Navigate to the backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # On Linux/macOS: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Download AI Models

Run the following command to download the Piper voice models, YuNet face detector, and Wav2Lip ONNX weights:

```powershell
python -c "
import os, urllib.request

os.makedirs('models/piper_voices', exist_ok=True)
os.makedirs('models/wav2lip', exist_ok=True)

# 1. Download Piper voices
base_piper = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/'
voices = [('lessac/medium', 'en_US-lessac-medium'), ('ryan/medium', 'en_US-ryan-medium')]
for folder, name in voices:
    for ext in ['.onnx', '.onnx.json']:
        dst = f'models/piper_voices/{name}{ext}'
        if not os.path.exists(dst):
            print(f'Downloading {name}{ext}...')
            urllib.request.urlretrieve(f'{base_piper}{folder}/{name}{ext}', dst)

# 2. Download YuNet face detector
if not os.path.exists('models/yunet.onnx'):
    print('Downloading yunet.onnx...')
    urllib.request.urlretrieve('https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx', 'models/yunet.onnx')

# 3. Download Wav2Lip ONNX model
if not os.path.exists('models/wav2lip/wav2lip.onnx'):
    print('Downloading wav2lip.onnx (~145MB)...')
    urllib.request.urlretrieve('https://huggingface.co/bluefoxcreation/Wav2lip-Onnx/resolve/main/wav2lip.onnx', 'models/wav2lip/wav2lip.onnx')

print('All models downloaded successfully!')
"
```

#### Start the Backend Server

```powershell
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### 2. Frontend Setup

In a new terminal:

```powershell
cd frontend

# Install packages
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Running Automated Tests

### Backend Unit & Validation Tests
Runs 8 automated tests verifying health check, voice listing, input validation (empty script, max length, missing consent, invalid voice, invalid image format), and job creation:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest tests/test_api.py -v
```

### End-to-End Live Integration Test
Tests the full lifecycle against the running server: uploads a portrait, synthesizes speech, renders lip-synced video, and downloads the resulting MP4:

```powershell
cd backend
.\.venv\Scripts\python.exe tests/test_e2e_live.py
```

---

## Content Safety & Licenses

- **Consent Required**: Users must possess authorization to use uploaded photos and animate any person's likeness.
- **Piper TTS**: Software is GPL-3.0 licensed; voice models (`en_US-lessac-medium`, `en_US-ryan-medium`) are licensed under Open Data Commons Attribution (ODC-By v1.0).
- **YuNet Face Detector**: Apache 2.0 license.
- **Wav2Lip ONNX**: Permitted for research and evaluation purposes.
- **Privacy**: Photos, scripts, and video outputs are processed locally and stored in private directories; no user content is logged or sent to external cloud APIs.
