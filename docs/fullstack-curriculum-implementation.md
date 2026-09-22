# Full Stack curriculum implementation

Implemented in the existing React Native application and Express/Mongoose backend. The supplied documents describe Angular, but this repository uses React Native; the implementation preserves that architecture, authentication, API client, AI provider routing, and database connection.

## Curriculum and educational content

The screenshot's 23 modules span six months and 24 weeks. Capstone Part 1 spans weeks 21–22. There are 234 lessons and 23 module projects. No module requires completion of an earlier module.

| Month | Week | Module | Lessons |
|---|---|---|---:|
| 1 | 1 | HTML5 Fundamentals | 12 |
| 1 | 2 | CSS3 Essentials | 10 |
| 1 | 3 | CSS3 Advanced | 10 |
| 1 | 4 | Modern CSS & UI Frameworks | 10 |
| 2 | 5 | JavaScript Foundations | 10 |
| 2 | 6 | JavaScript Intermediate | 10 |
| 2 | 7 | Modern JavaScript (ES6+) | 10 |
| 2 | 8 | Git & Version Control | 10 |
| 3 | 9 | React.js Basics | 10 |
| 3 | 10 | React.js State Management | 10 |
| 3 | 11 | React.js Advanced | 10 |
| 3 | 12 | UI Libraries & Next.js Intro | 10 |
| 4 | 13 | Node.js Basics | 10 |
| 4 | 14 | Express.js Fundamentals | 10 |
| 4 | 15 | Database (MongoDB) | 10 |
| 4 | 16 | Authentication & Security | 10 |
| 5 | 17 | Full Stack MERN Integration | 10 |
| 5 | 18 | State Management & Redux | 10 |
| 5 | 19 | File Upload & Third-Party APIs | 10 |
| 5 | 20 | Deployment & DevOps Basics | 10 |
| 6 | 21–22 | Capstone Project - Part 1 | 12 |
| 6 | 23 | Capstone Project - Part 2 | 10 |
| 6 | 24 | Career Preparation | 10 |

Each lesson stores an objective, explanation, walkthrough, use case, code excerpt, common mistake, practice guidance, activity, checkpoint, reading references, order, and estimated duration. Examples are teaching excerpts with context, not a claim that every fragment is a standalone application. Additional portfolio, registration, contact-form, quiz, and dashboard exercises appear within lesson activities. Module projects have requirements, expected behavior, a reference guide, starter files, and structured validation rules. Starter files intentionally fail the assignment checks.

Content lives in `backend/seed/fullstack-content/month1.js` through `month6.js`; outline metadata is in `modules.json`; projects are in `practice.js`. The seed expands and persists this content. Frontend screens never import these seed files.

## Database models

`backend/models/fullstack-curriculum.js` defines:

- `FullStackCourse`, `CurriculumMonth`, `CurriculumWeek`: global curriculum hierarchy, ordering, publication, objectives, and module metadata.
- `CurriculumLesson`: authored content and server-held checkpoint answers.
- `CurriculumPractice`: one project specification per module.
- `FullStackWeekProgress`: authenticated user plus module, read lessons, completed checkpoints, project completion, resume location, and review state.
- `FullStackWorkspace`: authenticated user plus module, project files/folders, revision, and submission checks.
- `FullStackSubmission`: immutable evidence snapshot and instructor review outcome.

Compound unique indexes prevent duplicate per-user progress and workspaces. Content is not copied into user records. Seed reruns preserve IDs, admin edits, and learner progress. Explicit `--refresh` updates authored content while retaining progress; review its educational impact before use on a live course.

## API endpoints

All routes below are under `/api/fullstack`. Learner routes use the existing JWT middleware and the authenticated `req.user._id`; body/query user IDs cannot select ownership. Responses use the existing `{success, data}` envelope and private, non-cacheable headers.

| Method | Path | Purpose |
|---|---|---|
| GET | `/course` | Published course |
| GET | `/curriculum` | Six-month outline plus personal progress |
| GET | `/months`, `/month/:monthId` | Month views |
| GET | `/weeks/:weekId` | Module, lessons, task, and personal state |
| GET | `/lessons/:lessonId` | Lesson with checkpoint answer withheld |
| GET | `/progress`, `/progress/:weekId` | Overall or module progress |
| POST | `/progress/:weekId/start` | Record module start/resume |
| POST | `/lessons/:lessonId/read` | Record reading and resume location |
| POST | `/lessons/:lessonId/complete` | Validate `{answer: optionIndex}` |
| GET/PUT | `/weeks/:weekId/workspace` | Load/save owned `{files, folders, revision}` |
| POST | `/weeks/:weekId/check` | Inspect current project without completing |
| POST | `/project/:weekId/complete` | Persist checked snapshot and apply completion/review rules |
| POST | `/progress/:weekId/complete` | Same validated submission behavior |
| GET | `/submissions` | Current learner's evidence submission statuses |
| GET | `/preview-runtime` | Bundled browser React/JSX runtime |
| GET | `/admin/submissions` | Admin-only pending review queue |
| POST | `/admin/submissions/:submissionId/review` | Admin-only `{status, feedback}` review |

Review status is `approved` or `changes_requested`; feedback must contain 20–4,000 characters. The existing active admin identity is required. No large admin management UI was added. Models support future editing/reordering/publication workflows.

## Progress and validation

Reading alone does not complete a lesson. A correct checkpoint answer is required. All of a module's checkpoints unlock its project workspace. Module completion requires both those checkpoints and project completion. Overall percentage weights completed modules by week span, so Capstone Part 1 contributes two of the 24 weeks.

Validation parses HTML elements, CSS declarations, JavaScript/JSX syntax trees, JSON, and evidence-document structure. Commented-out tags, inert templates, and JavaScript strings cannot impersonate required source constructs. Invalid syntax produces visible failures. Checks report each authored requirement and explicitly state that source checks do not prove runtime behavior. Learners must run projects and follow behavioral checklists.

Git/deployment/capstone/career evidence projects enter instructor review after their structure checks pass. Arbitrary prose never automatically completes those modules. An approved evidence snapshot awards project completion. Review retries are idempotent for the same reviewer, outcome, and feedback.

Workspace saves use optimistic revisions: a stale session receives HTTP 409 instead of overwriting another session. Paths reject traversal, duplicates, reserved segments, and file/folder collisions. Each workspace allows up to 40 files, 40 folders, and 75 KB of source. Backend code is parsed, never executed on the API host.

The legacy HTML completion route also now validates submitted source before updating progress. The old shared local fallback completion state has been removed from its API adapter.

## App and workspace

The white curriculum overview reads all metadata and progress from the API. It includes search, grouped months, module status, week estimates, projects, and Continue Learning. Module pages show objectives, lesson reading, examples, activities, checkpoints, and practice access.

The workspace includes file/folder creation, rename/delete, tabs, syntax highlighting, line numbers, editing, Run/Stop, Save, Reset confirmation, Export, Preview, Console, Terminal, Checks, and AI assistance. Mobile panels preserve a usable editor height. Saving during editing retains newer unsaved changes.

HTML/CSS/JavaScript execute from current workspace files in an opaque-origin sandboxed iframe. React supports local modules, JSX, JSON/CSS imports, React Router, Redux Toolkit, and React Redux from a locally bundled runtime. Preview code cannot access the host editor or its native persistence/AI bridge. Runtime errors appear in Console.

The terminal provides real workspace file commands (`ls`, `cat`, `touch`, `mkdir`, `mv`, `rm`) plus `run`, `check`, `save`, and `clear`; it is not an operating-system shell. Node/Express/MongoDB, Next.js server rendering, framework build pipelines, deployment, Git, and payment services require a local or hosted development environment. The app explains that boundary rather than simulating successful execution.

Export shares a JSON archive with all files/folders. To extract it into a **new** local directory:

```sh
node backend/scripts/exportCurriculumProject.js project.json ./my-project
```

The extractor refuses existing destinations and invalid paths. Review exported source before installing packages or running scripts.

AI uses the existing `aiApi.chat` provider flow with the current file, assignment, and learner question. A selector loads configured models from the backend; Groq is selected initially when available. It can explain/debug/suggest code. Suggested code requires explicit review and confirmation before replacing a file. AI does not award completion. Provider credentials remain on the backend; provider outages surface as errors. A failed model-list request leaves editing and project checks available and clearly disables AI until retry.

## Main files changed

- Backend models/routes/services: `models/fullstack-curriculum.js`, `routes/curriculum.routes.js`, `services/curriculum.service.js`, `services/curriculum-validation.js`, `services/curriculum-runtime.js`.
- Backend seed/content: `seed/fullstack-curriculum.js`, `seed/fullstack-content/`.
- Backend compatibility/startup: `routes/fullstack.routes.js`, `controllers/fullstack.controller.js`, `services/fullstack.service.js`, `start-with-db.js`.
- Backend dependencies, lockfile, export utility, and curriculum/workspace tests.
- Frontend API/types: `src/api/curriculumApi.ts`, `src/types/curriculum.ts`, `src/api/fullstackApi.ts`.
- Frontend screens: `FullStackOverviewScreen.tsx`, `CurriculumModuleScreen.tsx`, `CurriculumWorkspaceScreen.tsx`, legacy HTML screens, and dashboard entry.
- Frontend components: `src/components/fullstack/CurriculumUI.tsx`, `workspaceDocument.js`.
- Navigation, npm test scripts, and `ios/Podfile.lock` to link the already-declared WebView dependency.

`backend` is a nested Git repository. Review and commit its changes separately from the mobile repository.

## Setup and verification

```sh
npm run typecheck
npm run test:fullstack
npm run test:fullstack-workspace
cd backend
npm run validate:fullstack
npm run seed:fullstack
```

`seed:fullstack` uses configured `CONNECTION_STRING`; local `start-with-db.js` seeds automatically. The production `server.js` requires running the seed as a deployment step. The default seed does not overwrite existing authored records. Browser tests require Chrome. API tests start an isolated temporary MongoDB and do not use learner production data.

Verified:

- TypeScript compilation and authored content/count validation.
- Real MongoDB/API/JWT tests: user A completes HTML, user B sees no A completion or draft, B changes only B, then A's progress/draft remains intact. Forged body user IDs cannot change ownership.
- Idempotent seed, unique progress, checkpoint gates, arbitrary module access, stale-save conflicts, invalid paths/source, hidden answers, publication behavior, instructor review authorization, and 24-week weighting.
- Browser tests: file/folder edits, tabs, actual HTML/CSS/JS and React interactions, console, terminal, sandbox isolation, save race, reviewed AI code application, mobile panels.
- JavaScript/JSX teaching excerpts parsed for syntax; exported project extraction tested for correct files, traversal rejection, and overwrite refusal.
- Live provider check through the authenticated API: Groq returned HTTP 200 and an actual explanation of HTML labels. The configured Gemini model returned a provider 404, exposed by the API as a clear error; the selector allows another configured model.
- iPhone simulator: login, dashboard entry, all six months/23 modules/234 lessons, and HTML module content verified. Native testing discovered a missing WebView module in the old installed binary; CocoaPods now links it, `xcodebuild` succeeded, and the rebuilt app was installed/launched.

## Remaining limits

- Full backend/server-rendering execution and an OS terminal are not embedded in the app. Exported projects run in an external development environment.
- Static source checks are not behavioral test suites. Instructor reviews are required for evidence projects; backend project checks currently verify source structure rather than making live API requests.
- The configured Gemini model remains unavailable; Groq was verified successfully. Other configured providers were not individually tested.
- Final interaction with the rebuilt native workspace remains unverified. First the Mac lock blocked computer access; the subsequent simulator inspection was rejected by automatic approval review because the account usage limit was reached. Browser workspace tests and the iOS build passed; these are not a substitute for the remaining native interaction check.
- Automated syntax/content checks do not substitute for running every full learner project or a human instructional review of all 234 lessons.
- Existing `test:courses`, `test:learning-ui`, and `test:session` suites are blocked by pre-existing missing `src/api/courseApi.ts` / `src/components/learning/CourseCard.tsx` files. These unrelated suites are not reported as passing.
- Android and physical-device QA remain unverified. There is no deployment claim.
