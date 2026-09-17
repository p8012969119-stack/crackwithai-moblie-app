# Dashboard alignment and artwork — 14 September 2026

Implemented in the existing Dashboard:
- Assistant header wraps inside its card; removed the overflowing AI ACTIVE badge.
- Six equal suggestion tiles in a numbered two-column, three-row grid. Short labels remain connected to the original learning-goal messages and real recommendation API.
- Simple monochrome microphone, without the emoji or outlined decorative button. Preserved a 44-point touch area and existing speech integration.
- Smaller input area, softer border, consistent padding and restrained purple accents.
- Removed the voice-error simulation that generated sample text. Errors preserve the user's draft. Speech is cancelled on navigation away; results are capped at the input limit.
- Added four coordinated original illustrations for learning, progress, streak and tools. Images sit behind a tint with white text and a readable progress bar.
- Preserved four-card scrolling and backend progress. Auto-scroll pauses for interaction, respects Reduce Motion and stops when the screen is inactive.
- The AI Tools overview card now navigates to Tools, rather than Courses.

## Files
- src/components/TrainingAssistant.tsx
- src/components/MicrophoneIcon.tsx (new)
- src/components/DashboardOverview.tsx
- src/screens/dashboard/HomeScreen.tsx
- tests/training-ui.test.js
- src/assets/dashboard/learning.png
- src/assets/dashboard/progress.png
- src/assets/dashboard/streak.png
- src/assets/dashboard/tools.png

## Artwork generation
Built-in image_gen tool used; no API-key/CLI generation. Copied outputs into the project and inspected all four images. The source resolution returned was 1672×941 (streak: 1672×940), despite requesting 3840×2160. These are high-resolution assets for small iPhone cards, not native 4K images. No artificial upscaling is claimed.

Each prompt used this exact template with the subject below:

Use case: stylized-concept. Asset type: premium iOS dashboard card background for CrackWithAI. Create a refined cinematic 3D still life of SUBJECT. Landscape 3840x2160 4K requested. Subject concentrated in the right third, left two thirds quiet dark tonal gradient for white UI text. Fine glass and ceramic materials, soft studio rim lighting, sparse tasteful composition, crisp edges. No words, no numbers, no company logos, no watermark. This belongs to a cohesive set of four professional learning dashboard illustrations.

Subjects:
- learning: an elegant open book and a floating glass lesson tile, violet and indigo
- progress: three ascending translucent steps with a fine luminous upward curve, deep teal and mint
- streak: a sculptural amber flame rising above a subtle circular daily calendar ring, burnt orange and gold
- tools: four floating glass tiles representing code brackets, an envelope, an audio microphone and a picture frame, midnight purple and blue

## Verification
Passed npm run typecheck, npm run test:training-ui and npm run test:workshop. The assistant tests cover recommendation navigation, conversation context, real retry/cancellation, duplicate-send protection, and preservation of an empty draft when speech fails.

The iOS build/launch attempt was rejected by automatic approval review because the usage limit was reached. No bypass was attempted. Visual verification of these latest Dashboard changes remains pending. Native voice transcription remains subject to the previously reported simulator speech-service failure; this change does not claim that voice recognition is now verified.

## Installed and visually verified

The subsequent build was approved and successfully installed/launched on the iPhone 17 Pro simulator. The old screenshot was from the previously installed app, before the blocked build could deliver the source changes.

Visual inspection confirmed all four image-backed cards and the aligned two-column prompt grid. Corrected an image sizing issue that left a solid-color strip at the card edges by letting the absolute image fill its parent bounds instead of combining percentage dimensions with insets. Rebuilt successfully again (`/tmp/cwa-dashboard-edge-ios.log`). Confirmed the plain microphone and complete assistant input in the running app. Screenshot saved as `docs/dashboard-updated.png`.

TypeScript, assistant tests and Workshop tests all pass. This resolves the pending installation/visual-verification note above.
