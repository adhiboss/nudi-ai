# Project Rules

## Purpose
Build a simple web application that turns a user-provided photo and script into a talking-head AI video with selectable speech voices.

## Product principles
1. Keep the core flow simple: **Upload photo → Enter script → Choose voice → Generate → Preview/download**.
2. Build an MVP before adding accounts, billing, templates, team features, or advanced editing.
3. Prefer existing speech and video-generation models/APIs over training a model from scratch.
4. Keep provider-specific code behind interfaces so providers can be replaced without rewriting the app.
5. Be transparent about generation progress, errors, limits, and expected costs.
6. Do not claim a video was generated until the provider confirms success and the output is available.

## Engineering rules
- Keep secrets and API keys on the server. Never expose them in browser code or commit them to Git.
- Validate file type, file size, script length, voice choice, and provider responses on the server.
- Treat all uploaded files and user text as untrusted input.
- Use asynchronous/background processing for video generation; requests may take a long time.
- Persist job status and recover gracefully from timeouts, retries, and provider failures.
- Do not log full scripts, private image URLs, API keys, or other sensitive user content unnecessarily.
- Use clear names, small modules, type hints where practical, and comments for non-obvious logic.
- Add tests for validation, job-state transitions, provider adapters, and error handling.
- Format and lint code consistently. Run tests before marking a task complete.
- Keep dependencies minimal and document setup commands.

## AI and content safety
- Require users to have permission to use uploaded photos and voices.
- Do not facilitate impersonation or deceptive use of a real person. Provide clear consent and acceptable-use guidance.
- Label generated content as AI-generated where appropriate.
- Set limits on script length, generation frequency, and file size to control abuse and cost.
- Check the license of every model, package, and voice asset before commercial distribution. Piper's software license and each voice model's license must be reviewed separately.

## Definition of done
A task is complete when:
- The expected behavior works locally.
- Relevant validation and error states are handled.
- Tests pass, or any missing tests are explicitly documented.
- Documentation/configuration examples are updated.
- No secrets or generated user media are committed accidentally.
