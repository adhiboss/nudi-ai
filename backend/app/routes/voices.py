from fastapi import APIRouter
from typing import List
from app.models.schemas import VoiceInfo
from app.services.job_manager import job_manager

router = APIRouter(prefix="/api/voices", tags=["Voices"])

@router.get("", response_model=List[VoiceInfo])
def get_voices():
    """Return only supported voices that are installed and ready."""
    return job_manager.speech_provider.list_voices()
