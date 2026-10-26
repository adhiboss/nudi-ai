# Architecture

## 1. Overview
The application accepts a photo and script, generates speech audio, animates the photo using a talking-head model, and returns an MP4.

```text
Browser (Next.js)
  ├── Photo upload
  ├── Script and voice selection
  └── Job status / video preview
          |
          v
Backend API (FastAPI)
  ├── Input validation
  ├── Job creation and status
  ├── Provider adapters
  └── Authorization / rate limits
      |             |
      v             v
Database         Object storage
(job metadata)   (private photo/audio/video files)
      |
      v
Background worker / job queue
  ├── Text-to-speech adapter (Piper initially)
  ├── Talking-head adapter (SadTalker or hosted provider)
  ├── FFmpeg for optional muxing/conversion
  └── Update job status and output location
```

## 2. Suggested technology choices
- Frontend: Next.js, React, TypeScript, Tailwind CSS.
- Backend: Python, FastAPI, Pydantic.
- Speech: Piper TTS running locally or in a controlled worker.
- Talking-head generation: SadTalker for an initial self-hosted experiment, or a hosted provider behind the same adapter interface.
- Media processing: FFmpeg.
- Metadata database: PostgreSQL (Supabase is an option).
- Object storage: private S3-compatible storage or Supabase Storage.
- Background jobs: start with a worker process and a durable queue; Redis with RQ/Celery is an option if needed.
- Hosting: deploy the web/API separately from GPU-heavy workers if the chosen model requires a GPU.

These are proposed choices, not requirements. Confirm model compatibility, hardware needs, license terms, and provider pricing before committing.

## 3. Main request flow
1. Browser uploads the photo through a backend-controlled flow or a signed upload URL.
2. Backend validates the file and creates a `generation_job` record.
3. Worker retrieves the photo and script.
4. Speech adapter produces a WAV audio file using the selected voice.
5. Talking-head adapter receives the photo and audio and produces a video.
6. Worker validates the output, optionally uses FFmpeg to normalize/containerize it as MP4, and stores it.
7. Worker updates the job to `completed` with an output reference.
8. Browser polls job status or receives an event and displays the preview/download link.

## 4. Provider adapter contracts
Keep provider-specific implementation behind interfaces such as:

- `SpeechProvider.synthesize(text, voice_id, language) -> AudioArtifact`
- `TalkingHeadProvider.generate(image_ref, audio_ref, options) -> VideoArtifact`
- `StorageProvider.put(file, content_type) -> StorageRef`
- `StorageProvider.create_download_url(ref) -> URL`

The concrete implementation may differ. A hosted provider may accept text directly and generate its own speech; in that case, avoid synthesizing audio separately unless needed.

## 5. Suggested data model
### generation_jobs
- `id` — UUID primary key
- `status` — `queued | processing | completed | failed`
- `script_text` — protected user content; retain only as needed
- `voice_id` — selected voice identifier
- `language` — requested language
- `input_image_ref` — private storage reference
- `audio_ref` — optional private storage reference
- `output_video_ref` — optional private storage reference
- `provider_name` — provider used
- `error_code` — safe, machine-readable failure code
- `created_at`, `updated_at`, `completed_at`
- `user_id` — nullable for anonymous MVP, if anonymous use is permitted

## 6. API sketch
- `POST /api/uploads` — create or authorize an upload.
- `POST /api/generations` — validate inputs and create a job.
- `GET /api/generations/{job_id}` — return status and safe output metadata.
- `GET /api/voices` — return available voice options.
- `DELETE /api/generations/{job_id}` — delete job and associated media, subject to authorization.

Return a job ID quickly; do not keep the HTTP request open while the video renders.

## 7. Job states
- `queued`: accepted and waiting.
- `processing`: worker has started.
- `completed`: output is stored and validated.
- `failed`: generation stopped; safe error code is available.

Ensure state transitions are validated and retries do not create uncontrolled duplicate jobs.

## 8. Security and privacy
- Keep provider keys in environment variables or a secrets manager.
- Never expose private storage credentials or unrestricted bucket URLs.
- Validate uploads by MIME/content, size, and image decoding.
- Use authorization checks for every job and media request.
- Add rate limits and quotas before public release.
- Use short-lived signed URLs where appropriate.
- Define retention and deletion policies for photos, audio, scripts, and videos.
- Obtain user confirmation that they have rights/consent to use the likeness.
- Avoid voice cloning or deceptive impersonation in the MVP.

## 9. Operational concerns
- Log job IDs, timing, provider status, and safe error codes—not secrets or unnecessary user content.
- Track queue depth, generation duration, failure rate, and storage usage.
- Set timeouts and bounded retries.
- Clean up abandoned temporary files.
- Keep GPU inference isolated from web request handling.
- Test with short scripts and low-resolution images before optimizing quality.
