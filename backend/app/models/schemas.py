from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class VoiceInfo(BaseModel):
    id: str
    name: str
    language: str
    gender: str
    sample_text: str
    description: str

class GenerationJobResponse(BaseModel):
    id: str
    status: JobStatus
    stage_message: Optional[str] = "Job submitted"
    script_text: str
    voice_id: str
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    output_video_url: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
