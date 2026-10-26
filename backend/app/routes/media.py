import os
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from app.config import OUTPUTS_DIR

router = APIRouter(prefix="/api/media", tags=["Media"])

@router.get("/{filename}")
def get_media_file(filename: str):
    # Sanitize filename
    safe_name = os.path.basename(filename)
    file_path = OUTPUTS_DIR / safe_name

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested media file not found."
        )

    return FileResponse(
        path=str(file_path),
        media_type="video/mp4",
        filename=safe_name,
        headers={
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600"
        }
    )
