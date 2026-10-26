# Design Specification

## 1. Design goal
A minimal, calm, utility-first interface. The product should feel like a focused creation tool, not a complex video editor or social network.

## 2. Primary screen
Single-page flow with the following hierarchy:

1. Header: product wordmark and a small help/privacy link.
2. Title: “Create a talking video”.
3. Short supporting sentence explaining the photo + script workflow.
4. Photo upload area with preview and replace/remove actions.
5. Script textarea with character/word count.
6. Voice selection controls with language labels.
7. Consent checkbox confirming permission to use the image/likeness.
8. Primary “Generate video” button.
9. Generation progress/status area.
10. Output video player and download action after success.

## 3. Layout
- Desktop: centered content column, approximately 720–900 px wide; optional two-column layout only if it improves clarity.
- Mobile: single column, full-width controls, no horizontal overflow.
- Keep the main action visible without excessive scrolling.
- Do not show advanced controls until required by user feedback.

## 4. Visual language
- Neutral background and high-contrast text.
- One restrained accent color for the primary action.
- Clear borders and subtle surface contrast for upload and input areas.
- Consistent spacing scale and corner radius.
- Use icons only when they improve recognition; always pair important icons with labels.
- Avoid unnecessary gradients, decorative animations, and large blocks of marketing copy.

## 5. Interaction states
### Upload
- Empty: upload icon, supported file types, size guidance.
- Selected: image preview, filename, replace and remove actions.
- Error: concise explanation and corrective action.

### Generate
- Disabled when required inputs are missing or invalid.
- Loading state prevents repeated submissions.
- Show clear status: “Queued”, “Generating speech”, “Creating video”, or “Finalizing” only when the backend can support those stages. Otherwise use a general “Generating video” state.
- Do not invent a percentage-based progress indicator if the provider does not report progress.

### Result
- Show the video player, duration if known, and download action.
- If generation fails, preserve inputs and offer retry when safe.
- Explain if a result link expires.

## 6. Accessibility
- Every input has a visible label.
- Upload is keyboard accessible.
- Focus indicators are visible.
- Error messages are associated with the relevant field.
- Do not communicate status through color alone.
- Respect reduced-motion preferences.

## 7. Content tone
Use short, literal labels:
- “Upload photo”
- “What should the person say?”
- “Choose a voice”
- “Generate video”
- “Your video is ready”
- “Try again”

Avoid exaggerated claims such as “perfectly realistic” or guaranteed generation times.

## 8. Responsive and quality checks
- Verify desktop and mobile layouts.
- Test long scripts and long filenames.
- Ensure progress and errors do not shift the page unpredictably.
- Ensure the generated video fits the viewport and remains playable on mobile.
