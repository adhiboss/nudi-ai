import os
import uuid
from pathlib import Path
import cv2
import numpy as np
from app.config import UPLOADS_DIR, OUTPUTS_DIR, TEMP_DIR, MAX_UPLOAD_SIZE_BYTES, ALLOWED_IMAGE_TYPES

class StorageService:
    @staticmethod
    def validate_and_save_image(file_bytes: bytes, filename: str) -> str:
        """Validates image size, format (magic bytes + cv2 decode), and saves it securely."""
        if len(file_bytes) == 0:
            raise ValueError("Uploaded file is empty.")
            
        if len(file_bytes) > MAX_UPLOAD_SIZE_BYTES:
            raise ValueError(f"File size exceeds maximum allowed limit of {MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB.")

        # Check magic bytes
        ext = StorageService._detect_image_type(file_bytes)
        if not ext:
            raise ValueError("Invalid image format. Supported formats: JPG, PNG, WEBP.")

        # Decode image using cv2 to verify integrity
        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Corrupt or invalid image file. Could not decode.")

        h, w = img.shape[:2]
        if w < 100 or h < 100:
            raise ValueError(f"Image dimensions too small ({w}x{h}). Minimum required is 100x100.")

        # Save to uploads dir with unique filename
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        target_path = UPLOADS_DIR / unique_name
        with open(target_path, "wb") as f:
            f.write(file_bytes)

        return str(target_path)

    @staticmethod
    def _detect_image_type(data: bytes) -> str:
        """Detect file type via magic bytes."""
        if data.startswith(b"\xff\xd8\xff"):
            return "jpg"
        if data.startswith(b"\x89PNG\r\n\x1a\n"):
            return "png"
        if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
            return "webp"
        return ""

    @staticmethod
    def get_output_path(job_id: str) -> str:
        return str(OUTPUTS_DIR / f"{job_id}.mp4")

    @staticmethod
    def cleanup_file(filepath: str):
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception:
                pass
