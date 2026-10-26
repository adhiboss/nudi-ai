# Today's Task

## Objective
Prove the core pipeline works locally before building the full web interface.

## Checklist
- [x] Confirm Python and required system tools are installed.
- [x] Create a virtual environment for the backend.
- [x] Install Piper TTS using the official project instructions.
- [x] Download/select one compatible voice and review that voice's license.
- [x] Generate a short WAV file from a test script.
- [x] Set up the selected talking-head model using its official instructions.
- [x] Generate a test video using a photo you own or have permission to use.
- [x] Play the result and note visual/audio quality, runtime, and hardware usage.
- [x] Record exact working commands and any errors in `MEMORY.md`.

## Test input
- Script: `Hello! This is a test of my photo-to-talking-video application.`
- Image: use a non-sensitive test portrait that you have permission to animate (`backend/test_portrait.jpg`).
- Voice: `en_US-lessac-medium`.

## Acceptance criteria
- [x] Speech audio is generated successfully.
- [x] Talking-head model accepts the photo and audio.
- [x] Output video plays correctly (`backend/test_output.mp4`).
- [x] Setup is repeatable from the documented commands.

## If blocked
Do not build the entire UI yet. Capture the exact error, operating system, Python version, GPU availability, and command that failed. Resolve the model setup first.
