# Certificate branding, course logos and Dashboard learning assistant

Implemented September 12–13, 2026 in the existing React Native/Express application.

## Inspection and preserved behavior

Reviewed Home, both course card components, Courses, Course Details, Profile, Certificates, CertificateModal, CertificateCard, learning/result components, theme primitives, types, navigation, API transport, the Course model/controller/routes/service, published MongoDB course responses, curriculum seeds, authentication middleware, response/error patterns, AI provider router/configuration, and existing assistant session/message models. Reviewed the logo source manifest, local assets and official brand references.

The existing curriculum, four-module navigation, required lesson/quiz checks, confirmed completion, certificate schema/issuance/download APIs, auth/session handling and bottom tabs remain in place. The screenshot's trophy was an emoji-backed `award` icon; dedicated certificate uses now render a native document-and-seal mark. Existing unrelated edits in Tools and other screens were preserved.

## 1. Files changed

New frontend files:

- `src/components/CertificateMark.tsx`
- `src/components/TrainingAssistant.tsx`
- `src/api/trainingApi.ts`
- `tests/training-ui.test.js`

Updated frontend files:

- `src/screens/dashboard/HomeScreen.tsx`
- `src/screens/courses/CourseDetailsScreen.tsx`
- `src/screens/certificates/CertificatesScreen.tsx`
- `src/screens/quiz/QuizResultScreen.tsx`
- `src/screens/profile/ProfileScreen.tsx`
- `src/components/ToolLogo.tsx`
- `src/components/CourseCard.tsx`
- `src/components/learning/CourseCard.tsx`
- `src/components/learning/LearningLayout.tsx`
- `src/components/CertificateCard.tsx`
- `src/components/CertificateModal.tsx`
- `src/api/courseData.ts`, `src/types/index.ts`
- `src/assets/tool-logos/copilot.png`, `copilot.svg`, `sources.json`
- `tests/courses.test.js`, `package.json` (test command only)

New backend files:

- `backend/services/ai-training.service.js`
- `backend/controllers/ai-training.controller.js`
- `backend/routes/ai-training.routes.js`
- `backend/seed/course-branding.js`
- `backend/tests/ai-training.test.js`
- `backend/public/assets/course-logos/` (15 bundled PNG assets)

Updated backend files:

- `backend/models/course.js`
- `backend/seed/courses.js`
- `backend/start-with-db.js`
- `backend/app.js`
- `backend/package.json` (test/migration commands only)

No library installation or package-version change was required for these features. Pre-edit source copies are in `/tmp/cwa-branding-before/`. This workspace has no Git history.

## 2. Certificate logo and gold completion styling

`CertificateMark` draws a document, fine text lines and a gold checked seal using React Native views. It scales without raster blur and has an accessibility label. `CompletionBadge` supplies the small gold tick on completed Dashboard course cards. Existing course-list completion badges stay gold and depend on backend completion/certification, never on opening a course or reaching a locally calculated percentage.

Certificate entry points on Home/Profile, certificate lists/cards, the modal header and confirmed course-completion sections use the new mark. Lesson quiz success uses a check; it does not imply a certificate is already earned. `ActionButton` now supports a gold variant with dark readable text. View/Download Certificate uses this variant; the chatbot retains purple/black actions. The actual certificate document retains CrackWithAI's logo and existing purple/gold design. PDF generation and export code were not replaced.

## 3. Course branding

The Course model now has one optional `logoUrl` field; existing `thumbnail` remains the separate cover field. Categories, tags, descriptions, progress and completion data retain their current fields. Course responses already serialize the model, so the additive field reaches catalog, learning-path and dashboard responses without duplicating endpoints.

`ToolLogo` uses an exact course-slug mapping for bundled assets. It cannot accidentally select Zapier from words in Gamma's title. Catalog asset references use bundled copies offline; valid custom HTTPS logo URLs are supported, with a known brand asset or clean book icon on failure. Images use `contain` inside a consistent rounded container. Covers no longer override main course logos. Dashboard cards, both course-card components, Course Details and chatbot recommendations share this component.

The previous Copilot file was GitHub's Octocat. It was replaced with GitHub's actual Copilot glyph from the [official Copilot page](https://github.com/features/copilot), with the source SVG retained. Gamma's existing floating-G asset matches its [official brand avatar guidance](https://brand.gamma.app/). Nano Banana uses the Google Gemini brand because it is a [Gemini image-generation feature](https://gemini.google/overview/image-generation/), not an invented banana-company logo. Original asset URLs are retained in `src/assets/tool-logos/sources.json`. All 15 bundled logos were inspected together for identity and aspect ratio.

## 4. Dashboard learning assistant

A compact white/purple card follows the greeting and precedes the existing product banners and course sections. It provides a greeting, six quick prompts, editable input, loading state, conversation replies, a recommendation card, Retry message and New conversation. Home's greeting, streak, certificate access, existing course progress/Continue actions, product banners, tool sections and navigation remain intact.

Input has a 1,000-character limit, prevents empty sends and duplicate requests, and uses keyboard avoidance. Conversation display is bounded and scrollable. Requests abort when leaving the screen. Failed or paused requests retain the question for retry, while stale recommendation actions are hidden. Account identity keys the component so conversations are not shared between signed-in users.

## 5. Backend API

`POST /api/ai-training/chat` uses the existing JWT middleware and response envelope:

```json
{
  "message": "I want to create a presentation",
  "conversationId": "optional existing conversation ID"
}
```

Successful responses contain `data.conversationId`, `data.message`, `data.recommendedCourse` (a real MongoDB course or null), and `data.provider`. The top-level `message` also contains the reply. Only published courses are considered. Invalid/empty/oversized input returns 400, missing auth returns 401, another user's conversation returns 404, and overlapping requests for the same user return 429. Database/service failures produce a retryable 503 without exposing provider payloads or credentials.

The route reuses AssistantSession/AssistantMessage with `metadata.purpose: "ai-training"`; no duplicate conversation model was introduced. Each conversation is scoped to its authenticated owner. Recent history helps classify follow-ups.

## 6. AI provider and fallback

The service reuses `aiProviderRouter.generateStandaloneText` and the configured backend environment. The local default is Gemini. A live simulator reply succeeded through Gemini; an earlier reply used the catalog fallback after the eight-second response deadline. Provider output is restricted to a course ID and confidence. IDs must exist in the queried published catalog. The explanation and recommendation card use actual course data, rather than provider-invented titles, IDs or capabilities.

On provider error/timeout/invalid output, a weighted catalog matcher compares the goal with title, slug, category, tags, descriptions and outcomes. It uses intent vocabulary, not hardcoded course IDs. It supports presentations, automation, images, research, coding, video, voice and writing, and also discovers new courses through their own metadata. Weak, tied or unclear matches ask for clarification. There is no Resume/Career Studio course in the current database, so the fallback does not invent one. A cooldown prevents repeated immediate provider retries. Set `AI_TRAINING_PROVIDER_ENABLED=false` on the backend to use catalog matching only.

The eight-second deadline bounds the assistant response; the shared provider's underlying request can still finish under its own existing timeout. No provider settings or keys were changed.

## 7. Database migration

All 15 local courses now have their own `/assets/course-logos/<brand>.png` reference. Only `logoUrl` was changed. The migration is idempotent and records previous logo values before writing; the local backup is `backend/backups/course-branding-1789238332204.json`. Course IDs, covers, curriculum, user progress, attempts and certificates were preserved.

New course seeds populate the field. The existing local development startup applies the branding migration. For another database, deploy the assets/code and run:

```sh
npm --prefix backend run migrate:course-branding
npm --prefix backend run migrate:course-branding -- --apply
```

The first command is a dry run. This task did not deploy or modify a remote production database.

## 8. Navigation

Start Course calls the existing `CourseDetails` route with the returned MongoDB `_id`. It neither opens an external website nor creates a duplicate screen. The live simulator recommendation opened Gamma's existing screen with four modules and zero of twelve lessons completed. Starting a lesson/enrolling still uses the established course flow.

## 9. Validation

Passed:

- `npm run typecheck`.
- `npm run test:training-ui`: greeting, prompt/send, request deduplication, loading, conversation context, recommendation navigation, network retry, cancellation, exact slug matching, logo failure handling and aspect ratio.
- `npm --prefix backend run test:training`: real local HTTP/JWT/MongoDB, input validation, conversation ownership, provider classification, invented-ID rejection, provider outage fallback, presentation/automation/image/research matches, unclear/resume/negated goals, newly added courses, unpublished-course exclusion, empty catalog and idempotent logo migration.
- `npm run test:courses`, including cover/logo separation, ten/fifteen-course behavior, progress and gold certificate action checks.
- `npm run test:learning-ui` and `npm run test:session -- --unit`.
- `npm --prefix backend run test:learning`: all fifteen authenticated twelve-lesson course journeys, module locks, quizzes, failure/retry, real completion, certificate issuance/PDF and persistence/migration recovery in a disposable database.
- `npm run ios -- --no-packager --udid 20858703-CE55-443C-8203-AF3EC7B67090`: build, installation and launch on iPhone 17 Pro.
- Production iOS JavaScript bundle and asset export.
- Live catalog returned 15 courses with 15 logo references; the served Copilot asset returned HTTP 200.
- Live simulator: Dashboard assistant appears, presentation prompt/retry returns Gamma, and Start Course opens the existing Gamma module screen. Dashboard spacing, logo cards and the gold certificate entry icon were visually inspected.

No lint command is configured. Existing Mongoose deprecation warnings remain. Test shutdown can report an interrupted background knowledge-index update after the disposable database closes; assertions pass.

Evidence logs: `/tmp/cwa-branding-ios.log`, `/tmp/cwa-training-final.log`, `/tmp/cwa-branding-learning.log`, `/tmp/cwa-branding-bundle.log`. Temporary files may be removed by the OS.

## 10. Remaining checks

The Mac locked during the final simulator pass. Further native keyboard/small-iPhone checks and a signed-in certificate download/share-sheet walkthrough require unlocking it. The automated completion and PDF tests passed; they do not replace those remaining native visual checks. Physical-device networking remains untested. Keep the existing local backend and Metro running for development; no additional key is required for the catalog fallback.
