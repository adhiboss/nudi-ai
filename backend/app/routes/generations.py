from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.models.schemas import GenerationJobResponse
from app.services.storage_service import StorageService
from app.services.job_manager import job_manager
from app.config import MAX_SCRIPT_LENGTH, MIN_SCRIPT_LENGTH

router = APIRouter(prefix="/api/generations", tags=["Generations"])

@router.post("", response_model=GenerationJobResponse, status_code=status.HTTP_201_CREATED)
async def create_generation(
    photo: UploadFile = File(..., description="Portrait image (JPG, PNG, or WEBP)"),
    script: str = Form(..., description="Script text to speak"),
    voice_id: str = Form(..., description="Selected voice identifier"),
    consent: bool = Form(..., description="Confirmation of likeness and image rights")
):
    # 1. Validate consent
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must confirm you have permission to use the photo and any likeness depicted."
        )

    # 2. Validate script
    cleaned_script = script.strip()
    if len(cleaned_script) < MIN_SCRIPT_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Script cannot be empty or whitespace only."
        )
    if len(cleaned_script) > MAX_SCRIPT_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Script exceeds maximum length of {MAX_SCRIPT_LENGTH} characters."
        )

    # 3. Validate voice
    available_voices = {v.id for v in job_manager.speech_provider.list_voices()}
    if voice_id not in available_voices:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Selected voice '{voice_id}' is not available. Please choose from: {', '.join(available_voices)}"
        )

    # 4. Read and validate photo
    try:
        photo_bytes = await photo.read()
        saved_image_path = StorageService.validate_and_save_image(photo_bytes, photo.filename or "upload.jpg")
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to process image upload.")

    # 5. Create job and return immediately
    job = job_manager.create_job(
        image_path=saved_image_path,
        script_text=cleaned_script,
        voice_id=voice_id
    )

    return job

@router.get("/{job_id}", response_model=GenerationJobResponse)
def get_generation_status(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Generation job '{job_id}' not found."
        )
    return job

@router.delete("/{job_id}")
def delete_generation(job_id: str):
    deleted = job_manager.delete_job(job_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Generation job '{job_id}' not found."
        )
    return {"message": "Job and associated output successfully deleted."}
