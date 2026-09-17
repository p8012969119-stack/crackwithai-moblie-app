// Exercise the mobile TypeScript adapters against real local HTTP/MongoDB.
// Only native storage and the API base URL are substituted for this Node test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const {once} = require('node:events');
const ts = require('typescript');
const mongoose = require('../backend/node_modules/mongoose');
const {MongoMemoryServer} = require('../backend/node_modules/mongodb-memory-server');
const jwt = require('../backend/node_modules/jsonwebtoken');

process.env.JWT_SECRET = 'isolated-mobile-session-test-only';
process.env.ASSISTANT_EMBEDDINGS_ENABLED = 'false';
const root = path.resolve(__dirname, '..');
let savedToken = null;
let savedUser = null;
let server, db;
const storage = {
  getToken: async () => savedToken,
  saveToken: async value => { savedToken = value; },
  removeToken: async () => { savedToken = null; },
  getUser: async () => savedUser,
  saveUser: async value => { savedUser = value; },
  removeUser: async () => { savedUser = null; },
};

function mobileLoader(baseURL) {
  const cache = new Map([
    [path.join(root, 'src/services/storage.ts'), {storage}],
    [path.join(root, 'src/constants/config.ts'), {CONFIG: {API_BASE_URL: baseURL, TIMEOUT: 2000}}],
  ]);
  return function load(file) {
    if (cache.has(file)) return cache.get(file);
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021, esModuleInterop: true},
      fileName: file,
    }).outputText;
    const mod = new Module(file, module);
    mod.filename = file;
    mod.paths = Module._nodeModulePaths(path.dirname(file));
    const originalRequire = mod.require.bind(mod);
    mod.require = id => {
      if (id.startsWith('.')) {
        const target = path.resolve(path.dirname(file), `${id}.ts`);
        if (fs.existsSync(target)) return load(target);
      }
      return originalRequire(id);
    };
    cache.set(file, mod.exports);
    mod._compile(output, file);
    return mod.exports;
  };
}

(async () => {
  if (process.argv.includes('--unit')) {
    const load = mobileLoader('http://session-test.invalid/api');
    const {restoreValidatedSession} = load(path.join(root, 'src/services/session.ts'));
    const {apiClient, setUnauthorizedListener} = load(path.join(root, 'src/api/client.ts'));
    const {authApi} = load(path.join(root, 'src/api/authApi.ts'));
    let calls = 0;
    let status = 200;
    const user = {_id: 'verified-learner', fullName: 'Verified Learner'};
    apiClient.defaults.adapter = async config => {
      calls++;
      if (status !== 200) throw {config, response: {status, data: {message: 'Request failed', code: status === 403 ? 'EMAIL_NOT_VERIFIED' : 'USER_AUTH_EXPIRED', requiresVerification: status === 403}}};
      return {config, status: 200, headers: {}, data: {success: true, data: user}};
    };
    savedToken = 'demo_session_token';
    savedUser = {_id: 'u_demo'};
    assert.equal(await restoreValidatedSession(), null);
    assert.equal(calls, 0, 'demo token must not be sent to the backend');
    assert.equal(savedToken, null);
    assert.equal(savedUser, null);
    assert.equal(await restoreValidatedSession(), null);
    assert.equal(savedToken, null, 'fresh install must not invent credentials');

    savedToken = 'saved-real-session';
    assert.equal((await restoreValidatedSession()).user._id, user._id);
    assert.equal(calls, 1, 'restoration verifies the profile once');
    let invalidations = 0;
    setUnauthorizedListener(() => {invalidations++;});
    status = 401;
    assert.equal(await restoreValidatedSession(), null);
    assert.equal(savedToken, null);
    assert.equal(savedUser, null);
    assert.equal(invalidations, 1);

    savedToken = 'new-session';
    savedUser = user;
    const onFailure = apiClient.interceptors.response.handlers[0].rejected;
    await assert.rejects(onFailure({config: {headers: {Authorization: 'Bearer old-session'}}, response: {status: 401, data: {message: 'Expired'}}}));
    assert.equal(savedToken, 'new-session');
    assert.equal(invalidations, 1);

    status = 503;
    await assert.rejects(restoreValidatedSession(), error => error.status === 503);
    assert.equal(savedToken, 'new-session');
    apiClient.defaults.adapter = async config => {throw {config, message: 'Network Error'};};
    await assert.rejects(restoreValidatedSession(), /Unable to connect/);
    assert.equal(savedToken, 'new-session');
    assert.equal(savedUser._id, user._id);
    await assert.rejects(onFailure({response: {status: 403, data: {message: 'Verify email', code: 'EMAIL_NOT_VERIFIED', requiresVerification: true}}}), error => error.requiresVerification && error.code === 'EMAIL_NOT_VERIFIED' && error.status === 403);
    console.log('PASS: demo cleanup, fresh install, profile validation, 401 navigation notification, stale 401, outage recovery, and verification metadata');
    return;
  }
  db = await MongoMemoryServer.create({instance: {ip: '127.0.0.1'}});
  await mongoose.connect(db.getUri());
  await require('../backend/seed/learning-system').migrate({apply: true, backup: false});
  const User = require('../backend/models/user');
  const {hashPassword} = require('../backend/utiles/bcript');
  const learner = await User.create({fullName: 'Session Test Learner', email: 'session@example.invalid', password: await hashPassword('isolated-password'), isVerified: true});
  const app = require('../backend/node_modules/express')();
  app.use(require('../backend/node_modules/express').json());
  app.use('/api/auth', require('../backend/routes/auth.routes'));
  app.use('/api/auth/dashboard', require('../backend/routes/dashboard.routes'));
  app.use('/api/courses', require('../backend/routes/course.routes'));
  app.use('/api/certificates', require('../backend/routes/certificate.routes'));
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const load = mobileLoader(base);
  const {restoreValidatedSession} = load(path.join(root, 'src/services/session.ts'));
  const {authApi} = load(path.join(root, 'src/api/authApi.ts'));
  const {courseApi} = load(path.join(root, 'src/api/courseApi.ts'));
  const {userApi} = load(path.join(root, 'src/api/userApi.ts'));
  const {apiClient, setUnauthorizedListener} = load(path.join(root, 'src/api/client.ts'));

  savedToken = 'demo_session_token';
  savedUser = {_id: 'u_demo'};
  assert.equal(await restoreValidatedSession(), null);
  assert.equal(savedToken, null);
  assert.equal(savedUser, null);
  assert.equal(await restoreValidatedSession(), null, 'fresh install does not invent a session');
  console.log('PASS: legacy demo session is removed; fresh installs require real sign-in');

  const login = await authApi.login({email: learner.email, password: 'isolated-password'});
  savedToken = login.data.token;
  const session = await restoreValidatedSession();
  assert.equal(session.user._id, String(learner._id));
  assert.equal(savedUser.fullName, learner.fullName);
  const catalog = await courseApi.getAllCourses();
  assert.equal(catalog.data.length, 15);
  assert(catalog.data.every(course => course.title && !course.certified && !course.isEnrolled));
  assert.equal((await userApi.getDashboard()).success, true);
  assert.equal((await courseApi.getMyLearning()).data.length, 0);
  console.log('PASS: real login and restoration load all 15 courses and dashboard through mobile adapters');

  const courseId = catalog.data[0]._id;
  const started = await courseApi.startCourse(courseId);
  assert.equal(started.data.course._id, courseId);
  const enrolled = await courseApi.getMyLearning();
  assert.equal(enrolled.data.length, 1);
  assert.equal(enrolled.data[0]._id, courseId);
  assert.equal(enrolled.data[0].isEnrolled, true);
  assert.equal(enrolled.data[0].progressPercentage, 0, 'zero is shown only when returned by the real progress API');
  const detail = await courseApi.getLearningPath(courseId);
  assert.equal(detail.data.course._id, courseId);
  assert.equal(detail.data.modules.length, 4);
  assert.equal(detail.data.lessons.length, 12);
  assert(detail.data.lessons.some(lesson => lesson.isUnlocked));
  console.log('PASS: real course start appears in My learning and the existing detail route loads its modules/lessons');

  let invalidations = 0;
  setUnauthorizedListener(() => { invalidations++; });
  savedToken = jwt.sign({id: String(learner._id), role: 'user'}, process.env.JWT_SECRET, {expiresIn: -1});
  await assert.rejects(courseApi.getAllCourses(), error => error.status === 401);
  await new Promise(resolve => setTimeout(resolve, 30));
  assert(invalidations > 0, 'expired session notifies navigation');
  assert.equal(savedToken, null);
  assert.equal(savedUser, null);
  console.log('PASS: expired session clears persisted state and notifies navigation');

  await assert.rejects(authApi.login({email: learner.email, password: 'wrong'}), error => error.status === 401 && error.code === 'INVALID_CREDENTIALS');
  const onFailure = apiClient.interceptors.response.handlers[0].rejected;
  await assert.rejects(onFailure({response: {status: 403, data: {message: 'Verify email', code: 'EMAIL_NOT_VERIFIED', requiresVerification: true}}}), error => error.requiresVerification && error.code === 'EMAIL_NOT_VERIFIED');

  savedToken = login.data.token;
  savedUser = session.user;
  const before = invalidations;
  await assert.rejects(onFailure({config: {headers: {Authorization: 'Bearer old-session'}}, response: {status: 401, data: {message: 'Expired'}}}));
  assert.equal(savedToken, login.data.token, 'stale 401 must not clear a newer login');
  assert.equal(invalidations, before);

  await new Promise(resolve => server.close(resolve));
  server = null;
  await assert.rejects(restoreValidatedSession(), /Unable to connect/);
  assert.equal(savedToken, login.data.token, 'network failures retain the real session for retry');
  assert.equal(savedUser._id, String(learner._id));
  console.log('PASS: login errors retain metadata; stale failures and network outages preserve a valid session');
})().catch(error => {console.error(error); process.exitCode = 1;}).finally(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  if (db) await db.stop();
});
