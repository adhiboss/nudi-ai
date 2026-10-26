import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Storage configuration
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
OUTPUTS_DIR = STORAGE_DIR / "outputs"
TEMP_DIR = STORAGE_DIR / "temp"

for directory in [STORAGE_DIR, UPLOADS_DIR, OUTPUTS_DIR, TEMP_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Model paths
MODELS_DIR = BASE_DIR / "models"
PIPER_VOICES_DIR = MODELS_DIR / "piper_voices"
WAV2LIP_MODEL_PATH = MODELS_DIR / "wav2lip" / "wav2lip.onnx"
YUNET_MODEL_PATH = MODELS_DIR / "yunet.onnx"

# System tools
WINGET_FFMPEG = r"C:\Users\adith\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"
FFMPEG_PATH = WINGET_FFMPEG if os.path.exists(WINGET_FFMPEG) else "ffmpeg"

# Validation limits
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
MAX_SCRIPT_LENGTH = 500  # characters
MIN_SCRIPT_LENGTH = 1
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Piper executable
VENV_PIPER = BASE_DIR / ".venv" / "Scripts" / "piper.exe"
PIPER_EXEC = str(VENV_PIPER) if VENV_PIPER.exists() else "piper"
