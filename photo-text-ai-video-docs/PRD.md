# Product Requirements Document

## 1. Product summary
A lightweight web application that creates a talking-head video from a still photo and user-written script. Users choose a voice, generate the video, preview it, and download the result.

## 2. Problem
Creating a talking video often requires recording, editing, voice-over work, and lip-sync tools. This product reduces the workflow to a few inputs and one generation action.

## 3. Target users
- Content creators producing short explainers or social videos.
- Educators creating narrated material.
- Small businesses creating simple presenter videos.
- Users creating videos from photos they own or have permission to use.

## 4. MVP user journey
1. User opens the create-video page.
2. User uploads a supported portrait image.
3. User enters the exact script to be spoken.
4. User selects a supported voice and language.
5. User confirms they have permission to use the image and any represented person's likeness.
6. User clicks **Generate video**.
7. App validates inputs and creates a generation job.
8. UI displays queued/processing status and handles failure.
9. On success, user previews and downloads an MP4.

## 5. MVP functional requirements
### FR-1: Photo upload
- Support JPG/JPEG, PNG, and WEBP, subject to provider compatibility.
- Show the selected image and allow replacement/removal.
- Enforce configurable file-size and image-dimension limits.
- Validate the actual file type, not only the filename extension.

### FR-2: Script input
- Provide a multiline text field with a visible character/word count.
- Enforce a configurable maximum length.
- Reject empty or whitespace-only scripts.
- Preserve the text the user submits; do not silently rewrite it.

### FR-3: Voice selection
- Show only voices supported by the configured speech/video provider.
- Display language and voice labels.
- Use a default voice only when clearly indicated in the UI.

### FR-4: Video generation
- Submit a generation request through the backend.
- Create a persistent job record with a unique ID.
- Display queued, processing, completed, and failed states.
- Avoid duplicate generation on repeated clicks where possible.
- Support polling or provider webhooks to update job state.

### FR-5: Preview and download
- Show a video player when generation succeeds.
- Provide a download action when the output is available.
- Store the output in app-controlled storage if long-term availability is required.
- Explain when an output link is temporary or expired.

### FR-6: Errors and guidance
- Provide actionable messages for invalid images, unsupported voices, provider errors, timeouts, and rate limits.
- Do not expose raw stack traces or secret provider responses to users.

## 6. Non-functional requirements
- Responsive on desktop and mobile.
- Accessible labels, keyboard navigation, and visible focus states.
- API credentials remain server-side.
- User media is private by default and served using controlled or signed URLs.
- Generation is asynchronous; page refreshes should not lose the job status.
- Add basic rate limiting and generation quotas before public launch.
- Track operational errors without unnecessarily retaining user content.

## 7. Out of scope for MVP
- Full timeline editor or multi-scene video editor.
- Custom avatar training.
- Voice cloning.
- Payments/subscriptions.
- Team workspaces and collaboration.
- Automatic script writing or translation.
- Public gallery or social feed.

## 8. Success criteria
- A user can complete the end-to-end flow without developer assistance.
- Invalid inputs are rejected before paid/provider generation is triggered.
- The user can see whether a job is processing, failed, or completed.
- Successful output plays and downloads correctly.
- The application can switch video-generation providers through an adapter rather than major UI changes.

## 9. Key risks and assumptions
- Video generation can be slow and provider quotas may change.
- Free tiers are not guaranteed to be permanent or suitable for commercial use.
- Self-hosted models may require a compatible GPU or paid compute.
- Lip-sync quality depends on the photo, audio, language, and model.
- Software and model/voice licenses must be reviewed independently.

## 10. Open decisions
- First deployment target: local development, a GPU host, or a hosted API.
- Initial video provider: self-hosted model or commercial API.
- Exact supported image size, script limit, and generation quota.
- Whether accounts are required for the first release.
- Output retention period and privacy/deletion policy.
