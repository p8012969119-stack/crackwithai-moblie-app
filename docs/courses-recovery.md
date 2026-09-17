# Courses recovery — September 12, 2026

## Inspection and stopping point

The app entry is `index.js` → `App.tsx` → `AuthProvider` / `RootNavigator` → `MainTabNavigator` → `CoursesScreen`. The repository already contained the Courses redesign, reusable learning cards, course details/roadmap, real course/progress/certificate adapters, and session validation. The September 11 handoff records a previous fix for manufactured demo sessions. That fix is present and was preserved.

There is no `.git` directory in this workspace. File timestamps and the handoff establish the implementation state, but cannot establish the precise last action of the previous session.

Inspected source/configuration:

- `index.js`, `App.tsx`, `package.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`.
- `src/screens/courses/CoursesScreen.tsx`, `CourseDetailsScreen.tsx`.
- `src/components/learning/CourseCard.tsx`, `LearningLayout.tsx`, `src/components/ToolLogo.tsx`.
- `src/api/client.ts`, `learningTransport.ts`, `courseApi.ts`; session tests also exercise auth/dashboard adapters.
- `src/services/session.ts`, `storage.ts`, `src/store/AuthContext.tsx`.
- `src/navigation/RootNavigator.tsx`, `MainTabNavigator.tsx`, `src/types/index.ts`, `src/constants/config.ts`.
- `backend/package.json`, `server.js`, `start-with-db.js`, `app.js`.
- `backend/config/database.js`, `env.js`; course routes/controller/service and the My learning service.
- `backend/helpers/response.helper.js`, `backend/seed/learning-system.js`, `backend/docs/learning-system-handoff.md`.
- `ios/CrackWithAI/Info.plist`, existing tests and native project/dependency structure.

## Confirmed causes

1. No process was listening on port 5001. A host-side `curl` returned connection refused; Metro alone was listening on port 8081. This was reproduced outside the sandbox, ruling out sandbox networking as the cause of the screenshot.
2. Starting the existing `npm run backend` restored the persistent local MongoDB and API. `GET http://127.0.0.1:5001/api/courses` then returned success with 15 real courses.
3. Retrying in the simulator reached the backend but returned the app to Sign In through its existing expired-session handling. The user must sign in with their own account; credentials were not extracted or fabricated.
4. The original adapter used `Promise.all` for catalog, progress, and certificates: failure of any dependency hid the entire catalog. This amplified service failures but was not the cause of the stopped listener.

The route remains `GET /api/courses`, returning `{ success: true, data: [...] }`. My learning is `GET /api/courses/my-learning`; certificates are `GET /api/certificates/my-certificates`. The latter two require the JWT supplied by the existing storage interceptor. No endpoint or authentication architecture changed.

## Changes

- `src/api/client.ts`: distinguish transport timeout, network, 401, and server failures; preserve cancellation; add development diagnostics without authorization headers, request bodies, raw response bodies, or query parameters. Existing 401 invalidation remains.
- `src/api/learningTransport.ts`: accept an optional abort signal.
- `src/api/courseData.ts`: validate the actual backend list envelope, normalize missing optional fields, reject malformed list containers, skip invalid/duplicate IDs, and merge real progress/certificate data without inventing percentages.
- `src/api/courseApi.ts`: preserve catalog data on progress/certificate service failures, report partial availability, and propagate authentication failures. My learning never reports an unavailable progress service as an empty enrollment list.
- `src/screens/courses/CoursesScreen.tsx`: reuse one loaded catalog across tabs; title search; focus cleanup and request deduplication; stable refresh behavior; distinct catalog/search/enrollment empty states; existing detail and profile routes.
- `src/components/learning/CourseCard.tsx`: optional level/free/premium metadata, valid backend thumbnails with logo fallback, conditional real progress, and a black Start/Continue control within the existing card navigation.
- `tests/courses.test.js`: transport and presentation regression tests.
- `tests/mobile-session.test.js`: extend disposable real HTTP/MongoDB coverage to starting a course, My learning, and the existing detail adapter.
- `package.json`: expose the focused tests as `test:courses` and `test:learning-ui`; no dependency/version changes.
- This report.

## Verification

- `npm run typecheck`: passed.
- `npm run test:courses`: passed. Covers optional/malformed/null data, unique keys, partial failures, safe error messages/logs, loading, retry, search, tabs without duplicate calls, detail route parameters, empty states, refresh preservation, cancellation, and image fallback.
- `npm run test:learning-ui`: passed existing card/roadmap/result/accessibility tests.
- `npm run test:session -- --unit`: passed existing session restoration, expiration, stale-401 and outage tests.
- `npm run test:session`: passed against disposable HTTP/MongoDB, including real sign-in, 15-course catalog, enrollment, My learning, and course detail data.
- `npm run ios -- --no-packager --udid 20858703-CE55-443C-8203-AF3EC7B67090`: native build and launch passed on iPhone 17 Pro (iOS 26.5).
- No lint command/dependency is configured.
- Existing Mongoose deprecation warnings (`new` vs `returnDocument`) occur in the integration test; they do not fail it.
- Simulator verification confirmed the original error, retry reaching the restored backend, and the existing transition to Sign In. Authenticated visual tap-through, bottom-tab interactions, small-iPhone layout and runtime React warnings remain unverified pending the user's sign-in. Shallow rendering tests do not substitute for native layout verification.

Logs: `/tmp/cwa-courses-ios-build.log` and `/tmp/cwa-courses-session-test.log`. Pre-edit copies of the five original production files are in `/tmp/cwa-courses-before/` (temporary, not a Git history).

## Running locally

The backend started during this task is running. Sign in directly in the simulator, then open Courses.

After restarting the Mac or stopping development processes, keep the backend running in its own terminal:

```sh
cd /Users/prakash2008/Documents/CWA-MobileApp
npm run backend
```

Start Metro in a second terminal if port 8081 is not already serving this project:

```sh
cd /Users/prakash2008/Documents/CWA-MobileApp
npm start
```

Build/launch in another terminal when needed:

```sh
cd /Users/prakash2008/Documents/CWA-MobileApp
npm run ios -- --no-packager
```

For the simulator, `127.0.0.1:5001` reaches the Mac. A physical iPhone needs the Mac's reachable LAN address in `src/constants/config.ts`, the same network, and local-network permission. This is bare React Native, not Expo: the existing `process.env.EXPO_PUBLIC_API_URL` expression is not automatically inlined by the current Babel config. Change the fallback URL explicitly when testing a physical device, then reload. Physical-device networking was not tested in this session. A release API URL must be configured before distribution.
