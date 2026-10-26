# Project Tasks and Phases

## Phase 0 — Decisions and setup
- [x] Choose local-model versus hosted-provider approach for talking-head generation.
- [x] Review licenses for Piper, selected Piper voices, talking-head model, and dependencies.
- [x] Confirm hardware requirements and test a sample end-to-end generation.
- [x] Create repository and baseline README.
- [x] Add `.env.example` without real secrets.
- [x] Add `.gitignore` for virtual environments, generated media, secrets, and build artifacts.

## Phase 1 — Working local proof of concept
- [x] Install and test Piper TTS with one supported voice.
- [x] Generate WAV audio from a short text script.
- [x] Install and test the chosen talking-head model with one photo and WAV file.
- [x] Confirm output playback and document generation time/resource requirements.
- [x] Document known limitations and setup commands.

**Exit criteria:** A local script can turn a permitted test photo and text into a playable talking-head video. (VERIFIED!)

## Phase 2 — Frontend MVP
- [x] Create Next.js application and base layout.
- [x] Build photo upload and image preview.
- [x] Build script textarea with length counter.
- [x] Build voice selector populated from supported voices.
- [x] Add consent/rights confirmation.
- [x] Add Generate button with loading/disabled states.
- [x] Add progress, error, preview, and download UI.
- [x] Check mobile responsiveness and accessibility.

## Phase 3 — Backend and generation jobs
- [x] Create FastAPI application.
- [x] Add server-side input validation.
- [x] Implement `POST /api/generations`.
- [x] Add durable job state persistence.
- [x] Implement background worker.
- [x] Add Piper speech adapter.
- [x] Add talking-head provider adapter.
- [x] Add output validation and optional FFmpeg conversion.
- [x] Implement `GET /api/generations/{job_id}`.
- [x] Add safe error mapping, timeouts, and bounded retries.
- [x] Connect frontend to the API.

## Phase 4 — Storage and reliability
- [x] Add private storage for uploads and outputs.
- [x] Restrict media access and use controlled URLs.
- [x] Add retention and deletion behavior.
- [x] Handle refresh/reconnect while a job is running via polling.
- [x] Prevent accidental duplicate submissions with button state locks.
- [x] Add cleanup for temporary files and abandoned jobs.
- [x] Add basic logs and metrics.

## Phase 5 — Testing and hardening
- [x] Test invalid file types and oversized images.
- [x] Test empty and overly long scripts.
- [x] Test unavailable voice/model and provider failure.
- [x] Test timeout, retry, and interrupted worker behavior.
- [x] Test output download and playback.
- [x] Test unauthorized access to another user's job/media.
- [x] Add rate limits and generation quotas.
- [x] Review privacy, consent, and license notices.

## Phase 6 — Deployment
- [ ] Deploy frontend.
- [ ] Deploy API and worker in an environment suitable for the chosen model.
- [ ] Configure secrets through deployment environment settings.
- [ ] Configure storage, database backups, and cleanup.
- [ ] Run an end-to-end smoke test.
- [ ] Document deployment, rollback, and troubleshooting.

## Post-MVP backlog
- [ ] User accounts and generation history.
- [ ] More voices and languages.
- [ ] Subtitles and aspect-ratio presets.
- [ ] Usage quotas and billing.
- [ ] Alternative video providers.
- [ ] Better progress estimates and generation queue visibility.

## Completion rule
Do not mark a phase complete until its exit criteria are verified. Record blockers and unverified assumptions in `MEMORY.md`.
