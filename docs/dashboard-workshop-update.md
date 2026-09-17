# Dashboard and AI Workshop update — 13 September 2026

## Starting point

The existing app, native project, API clients, authentication, navigation, tool catalog, course/progress services and provider configuration were inspected before implementation. The previous course/certificate and training-assistant work was already present. There is no Git history in this workspace; source backups for this change are in `/tmp/cwa-workshop-before`.

The Dashboard placed the assistant before product banners and used a static tools list. Workshop contained decorative listening UI, hardcoded model choices and sample conversation history. Its API adapter returned canned responses after failures, and its history format did not match the text-chat backend. The native SpeechModule file existed for speech playback/PDF sharing but was not included in the Xcode target.

## Implemented behavior

- Dashboard order: four real overview cards → existing learning assistant → Explore Courses → Explore AI Tools. Greeting/profile remain above the content. The cards reuse backend current-course, lesson progress, streak and certificate counts. Course logos, completion badges and existing destinations remain intact.
- Dashboard tools now come from the existing `/api/auth/aitools` catalog, with deduplication, categories, optional logos and real retry/empty states. Local development startup seeds the project's existing six tool definitions only when the collection is empty. No existing tool records are overwritten by this startup check.
- Added the existing user's `learningStreak` to the Dashboard response as `streak`; no invented streak value. Canonical course/lesson progress calculations remain unchanged.
- Reworked the existing AI Workshop screen with a compact welcome state, two draft suggestions, conversation layout, safe basic Markdown/code rendering, copy response, saved local per-user history and New Chat.
- Composer has a subtle 180 ms focus-border/shadow animation, respects Reduce Motion, grows between 46 and 140 points, and keeps separate model, microphone and send controls. KeyboardAvoidingView and keyboard-aware bottom tabs are implemented; hardware/size-specific verification remains pending.
- Model choices come from the existing authenticated `/api/chat/models` endpoint. The next message sends the selected backend model alias through the existing `/api/ai/chat` endpoint. Backend rejects unsupported/unconfigured aliases. No keys are sent to the app. Configured does not guarantee provider uptime; failures produce an error/retry state.
- Chat sends proper user/assistant history, supports cancellation and a 90-second timeout, prevents duplicate sends and retains a new draft when retrying a previous failed request. Failed provider calls no longer create fake Workshop replies.
- Added native Apple Speech recognition through the existing SpeechModule, linked Speech.framework and included the source in the iOS target. Added microphone and speech-recognition usage descriptions. No new dependency or package-version change was required.
- Dictation supports partial text, Done, Cancel, interruption/background cleanup, permission/no-speech/unavailable errors, and inserts text into an editable draft. It never auto-sends. Recognition prefers on-device processing where supported; audio is not sent to the CrackWithAI backend. Existing TTS and PDF sharing methods remain.

## Files changed

Frontend:
- `src/screens/dashboard/HomeScreen.tsx`
- `src/components/DashboardOverview.tsx` (new)
- `src/components/DashboardTools.tsx` (new)
- `src/screens/ai/AIScreen.tsx`
- `src/components/WorkshopMessage.tsx` (new)
- `src/services/speechRecognition.ts` (new)
- `src/api/aiApi.ts`
- `src/types/index.ts`
- `src/navigation/MainTabNavigator.tsx`

Native:
- `ios/CrackWithAI/SpeechModule.h`
- `ios/CrackWithAI/SpeechModule.mm`
- `ios/CrackWithAI/Info.plist`
- `ios/CrackWithAI.xcodeproj/project.pbxproj`

Backend/tests:
- `backend/services/ai-tools.service.js`
- `backend/services/dashboard.service.js`
- `backend/start-with-db.js`
- `tests/workshop.test.js` (new)
- `backend/tests/workshop.test.js` (new)
- `package.json` (test:workshop script)

No duplicate screens, routes, API clients, course models or backend project were created. No schema migration was needed. The simulator uses a separate local Workshop QA learner for these checks; the user's course progress was not modified.

## Verification

Passed:
- `npm run typecheck`
- `npm run test:workshop`: model filtering/selection, request history/cancellation, invalid responses, provider errors, retry, duplicate-send protection, local chat history, dictation-to-editable-draft behavior (mocked native events), four overview cards and bounded progress.
- `npm run test:courses`
- `npm run test:learning-ui`
- `npm run test:training-ui`
- `npm run test:session -- --unit`
- `npm --prefix backend run test:training` using isolated MongoDB.
- `npm --prefix backend run test:learning`: all 15 authenticated course journeys, quizzes, module locks, progress, completion, certificates/PDFs, persistence and isolation.
- Final native iOS build and launch on iPhone 17 Pro simulator, iOS 26.5. Log: `/tmp/cwa-workshop-ios.log`.
- Live local API returned all six real tools.
- Live `/api/ai/chat` returned a real Gemini response (reported provider model `gemini-3.7-flash`).
- Simulator accessibility showed four overview cards followed by the assistant, courses and tools. Dashboard screenshot showed the new card layout. QA sign-in succeeded.

No lint script is configured.

Known pre-existing test failure: `test:ai-providers` fails at the code-generator fallback assertion (missing expected rejection, line 398). The same failure was reproduced with the original ai-tools service backup. It is unrelated to Workshop; broad code-generator fallback behavior was not rewritten.

## Remaining verification and runtime notes

Live testing stopped at the iOS Save Password prompt after QA sign-in. Automatic approval review rejected clicking Not Now because the account usage limit was reached. No workaround was attempted.

Tap Not Now manually; the QA password does not need to be saved. Then verify Workshop focus/keyboard layout, selected-model next-message behavior, microphone permissions, actual spoken transcription/Done/Cancel, and small/large iPhone layouts. Native recognition is implemented and compiled, but successful real microphone transcription has NOT yet been verified. UI/unit mocks do not substitute for that test.

The saved real-user session had expired and correctly returned to Sign In. Sign back into your own account after QA if desired; no password changes were made. The API base URL remains `http://localhost:5001/api` for the simulator. A physical iPhone needs a reachable development-machine address.

## Follow-up verification and fixes

After UI access resumed:

- Verified the software keyboard leaves the Workshop composer and Send control visible, and the bottom tabs hide while the keyboard is open.
- Verified the configured-model bottom sheet, selected-provider label, and preserved history after rebuilding/relaunching.
- Gemini returned a real response after its provider retry. Switching to Groq exposed a request-contract bug: the text router's HTTP providers require `message`, while Workshop passed only `prompt`. The Workshop backend now passes both. A live Groq retry succeeded, and the saved Groq reply was verified in the app.
- Added `backend/tests/workshop-provider.test.js`, which exercises the actual service, router and Groq HTTP adapter with a substituted HTTP transport. It checks the outgoing message, configured model and prior assistant history. Included it in `npm run test:workshop`.
- Improved `WorkshopMessage.tsx` to render Markdown tables as stacked labeled rows on narrow screens, with headings, emphasis, inline code, quotes and separators. No new rendering dependency.
- Learning recommendations now pass the real slug and logo URL to the existing ToolLogo component.
- Added DEBUG-only native speech diagnostics containing only the error domain/code, never audio or transcript text.
- Final native rebuild/launch passed (`/tmp/cwa-workshop-ios-final.log`). The relaunched app did not show the stale Metro connection warning.
- Native microphone action reached Apple Speech but failed on this simulator with **kLSRErrorDomain code 300**. The app displayed its error and remained usable for typed chat. Successful spoken transcription, Done/Cancel with real speech, and physical-device permission behavior remain unverified. This is not reported as a working microphone test.
- Separate small/large iPhone visual checks remain unverified. The standard iPhone 17 Pro keyboard/composer layout was inspected.

During verification, newer Dashboard carousel and learning-assistant edits appeared in the shared workspace. Those edits were preserved. The overview test harness was updated to support their Dimensions dependency. The earlier overview descriptions in this report describe the original implementation of this task; the latest shared source controls the current card presentation.

Apple's documented on-device recognition behavior was checked: https://developer.apple.com/documentation/speech/sfspeechrecognitionrequest/requiresondevicerecognition . The implementation requests on-device recognition when the recognizer reports support; otherwise Apple may require a network connection. The exact simulator failure above was observed locally, not inferred from that documentation.

## Compact composer and animation update — 14 September 2026

Removed the two Workshop suggestion cards requested in the screenshot. The empty composer now uses a compact single-row layout with model, microphone and Send controls. Focusing/typing expands the same input to a multiline composer. Typing adds a soft 2.2-second violet glow pulse; the real pending-request state uses a separate staggered three-dot animation in the new `WorkshopThinking.tsx` component. Animations respect Reduce Motion and stop on screen blur/background; no backend or voice behavior was changed.

Changed: `src/screens/ai/AIScreen.tsx`, new `src/components/WorkshopThinking.tsx`, and the existing Workshop test harness for animation/native mocks and compact/expanded state checks.

Verification: TypeScript and `npm run test:workshop` pass. iOS build and launch pass (`/tmp/cwa-workshop-animation-ios.log`). Simulator screenshots confirmed the compact empty bar, removed suggestions, expanded violet typing outline and separate thinking dots. A real Gemini request completed successfully after displaying the thinking state.
