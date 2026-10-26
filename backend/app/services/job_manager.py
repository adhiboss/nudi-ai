import os
import uuid
import threading
from datetime import datetime, timezone
from typing import Dict, Optional
from concurrent.futures import ThreadPoolExecutor

from app.models.schemas import GenerationJobResponse, JobStatus
from app.services.storage_service import StorageService
from app.services.speech_service import PiperSpeechProvider
from app.services.talking_head_service import Wav2LipOnnxProvider
from app.config import TEMP_DIR

class JobManager:
    def __init__(self):
        self._jobs: Dict[str, GenerationJobResponse] = {}
        self._lock = threading.Lock()
        self._executor = ThreadPoolExecutor(max_workers=2)
        self.speech_provider = PiperSpeechProvider()
        self.talking_head_provider = Wav2LipOnnxProvider()

    def create_job(self, image_path: str, script_text: str, voice_id: str) -> GenerationJobResponse:
        job_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        job = GenerationJobResponse(
            id=job_id,
            status=JobStatus.QUEUED,
            stage_message="Job queued, preparing AI models...",
            script_text=script_text,
            voice_id=voice_id,
            created_at=now,
            updated_at=now
        )

        with self._lock:
            self._jobs[job_id] = job

        # Dispatch background worker
        self._executor.submit(self._process_job, job_id, image_path, script_text, voice_id)
        return job

    def get_job(self, job_id: str) -> Optional[GenerationJobResponse]:
        with self._lock:
            return self._jobs.get(job_id)

    def delete_job(self, job_id: str) -> bool:
        with self._lock:
            job = self._jobs.pop(job_id, None)
        if job:
            output_path = StorageService.get_output_path(job_id)
            StorageService.cleanup_file(output_path)
            return True
        return False

    def _update_job(self, job_id: str, **kwargs):
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                for k, v in kwargs.items():
                    setattr(job, k, v)
                job.updated_at = datetime.now(timezone.utc)

    def _process_job(self, job_id: str, image_path: str, script_text: str, voice_id: str):
        temp_wav = str(TEMP_DIR / f"{job_id}.wav")
        output_mp4 = StorageService.get_output_path(job_id)

        try:
            self._update_job(
                job_id,
                status=JobStatus.PROCESSING,
                stage_message="Synthesizing speech with Piper TTS..."
            )

            # 1. Synthesize audio
            self.speech_provider.synthesize(script_text, voice_id, temp_wav)

            # 2. Progress callback for video generation
            def on_progress(stage: str):
                self._update_job(job_id, stage_message=stage)

            # 3. Animate portrait
            self.talking_head_provider.generate(
                image_path=image_path,
                audio_path=temp_wav,
                output_path=output_mp4,
                progress_callback=on_progress
            )

            # 4. Mark completed
            self._update_job(
                job_id,
                status=JobStatus.COMPLETED,
                stage_message="Video generation complete!",
                output_video_url=f"/api/media/{job_id}.mp4",
                completed_at=datetime.now(timezone.utc)
            )

        except Exception as e:
            error_msg = str(e)
            print(f"Error in job {job_id}: {error_msg}")
            self._update_job(
                job_id,
                status=JobStatus.FAILED,
                stage_message="Generation failed",
                error_code="PROCESSING_ERROR",
                error_message=f"Failed to generate video: {error_msg}"
            )
        finally:
            # Clean up temporary audio file and uploaded image
            StorageService.cleanup_file(temp_wav)
            StorageService.cleanup_file(image_path)

job_manager = JobManager()
