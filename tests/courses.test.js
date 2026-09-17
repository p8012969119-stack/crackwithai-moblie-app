// Exercise production adapters and screen callbacks with controlled transport failures.
// Fixtures are isolated to this test; the app continues to use the real API.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const ShallowRenderer = require('react-shallow-renderer');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const native = Object.fromEntries(['View', 'Text', 'Pressable', 'ScrollView', 'ActivityIndicator', 'TextInput', 'Image', 'FlatList', 'RefreshControl'].map(name => [name, name]));
native.StyleSheet = {create: value => value};
native.Platform = {OS: 'ios'};
native.Alert = {alert: () => {}};
let focus;
let token = 'test-session';
const cache = new Map([
  [path.join(root, 'src/services/storage.ts'), {storage: {
    getToken: async () => token, removeToken: async () => { token = null; }, removeUser: async () => {},
  }}],
  [path.join(root, 'src/constants/config.ts'), {CONFIG: {API_BASE_URL: 'http://127.0.0.1:5001/api', TIMEOUT: 2000}}],
  [path.join(root, 'src/store/AuthContext.tsx'), {useAuth: () => ({user: {name: 'Learner'}})}],
]);
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const mod = new Module(file, module);
  mod.filename = file;
  mod.paths = Module._nodeModulePaths(path.dirname(file));
  const original = mod.require.bind(mod);
  mod.require = id => {
    if (id === 'react-native') return native;
    if (id === 'react-native-safe-area-context') return {SafeAreaView: 'SafeAreaView'};
    if (id === '@react-navigation/native') return {useFocusEffect: callback => {focus = callback;}};
    if (id.endsWith('.png')) return 1;
    if (id.endsWith('ToolLogo')) return {ToolLogo: () => null};
    if (id.startsWith('.')) {
      for (const ext of ['.ts', '.tsx']) {
        const target = path.resolve(path.dirname(file), id + ext);
        if (fs.existsSync(target)) return load(target);
      }
    }
    return original(id);
  };
  cache.set(file, mod.exports);
  mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021, jsx: ts.JsxEmit.React, esModuleInterop: true}, fileName: file,
  }).outputText, file);
  return mod.exports;
}
const {apiClient, ApiError} = load(path.join(root, 'src/api/client.ts'));
const {courseApi} = load(path.join(root, 'src/api/courseApi.ts'));
const {CourseDetailsScreen} = load(path.join(root, 'src/screens/courses/CourseDetailsScreen.tsx'));
const {InlineCertificateCanvas} = load(path.join(root, 'src/components/InlineCertificateCanvas.tsx'));
const {certificateApi} = load(path.join(root, 'src/api/certificateApi.ts'));
const {CoursesScreen} = load(path.join(root, 'src/screens/courses/CoursesScreen.tsx'));
const {CourseCard} = load(path.join(root, 'src/components/learning/CourseCard.tsx'));
const toolkit = load(path.join(root, 'src/components/learning/LearningLayout.tsx'));
const fixtures = [
  {_id: 'one', title: 'First Course', description: null, level: 'beginner', isFree: true, thumbnail: 'not-a-url'},
  {_id: 'two', title: 'Second Course', description: 'Other content'},
];
const calls = [];
let responses;
function reset() {
  responses = {'/courses': fixtures, '/courses/my-learning': [{course: {_id: 'one'}, progressPercentage: 35, completedLessons: ['lesson']}], '/certificates/my-certificates': []};
  calls.length = 0;
  apiClient.defaults.adapter = async config => {
    calls.push(config.url);
    assert.equal(config.headers.Authorization, 'Bearer test-session');
    const data = responses[config.url];
    if (data instanceof Error) throw {config, code: 'ERR_BAD_RESPONSE', response: {status: 503, data: {message: 'Private database stack trace'}}};
    return {config, status: 200, headers: {}, data: {success: true, data}};
  };
}
const settle = () => new Promise(resolve => setImmediate(resolve));
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
function screen() {
  const renderer = new ShallowRenderer();
  const navigationCalls = [];
  renderer.render(React.createElement(CoursesScreen, {navigation: {navigate: (...args) => navigationCalls.push(args)}}));
  const cleanup = focus();
  return {renderer, cleanup, navigationCalls, list: () => renderer.getRenderOutput().props.children};
}
(async () => {
  reset();
  let response = await courseApi.getAllCourses();
  assert.equal(response.data.length, 2);
  assert.equal(response.data[0].description, '');
  assert.equal(response.data[0].progressPercentage, 35);
  assert.equal(response.data[1].progressPercentage, undefined, 'missing progress must not be invented');
  assert.equal(response.progressAvailable, true);
  assert.equal((await courseApi.getMyLearning()).data.length, 1);

  responses['/courses/my-learning'] = new Error('unavailable');
  response = await courseApi.getAllCourses();
  assert.equal(response.data.length, 2, 'progress failure must not discard the catalog');
  assert.equal(response.progressAvailable, false);
  assert.equal(response.data[0].isEnrolled, undefined);
  assert(!response.learningError.includes('Private'));
  await assert.rejects(courseApi.getMyLearning(), /temporarily unavailable/);
  reset();
  responses['/certificates/my-certificates'] = new Error('unavailable');
  response = await courseApi.getAllCourses();
  assert.equal(response.data[0].progressPercentage, 35);
  assert.equal(response.data[0].certified, undefined);
  assert.equal(response.progressAvailable, true);
  responses['/courses'] = {invalid: true};
  await assert.rejects(courseApi.getAllCourses(), error => error.code === 'INVALID_COURSE_DATA');
  reset();
  responses['/courses'] = [null, {}, fixtures[0], fixtures[0], {_id: 'odd', title: null, description: 12, shortDescription: {}, level: null, price: null}];
  response = await courseApi.getAllCourses();
  assert.equal(response.data.length, 2, 'invalid IDs and duplicates cannot become list keys');
  assert.equal(response.data[1].title, 'Untitled course');
  assert.equal(response.data[1].shortDescription, undefined);
  assert.equal(response.data[1].price, undefined);
  console.log('PASS: real response envelope, optional fields, stable IDs, progress and certificate partial failures');

  const failure = apiClient.interceptors.response.handlers[0].rejected;
  await assert.rejects(failure({code: 'ECONNABORTED'}), /took too long/);
  await assert.rejects(failure({code: 'ERR_NETWORK'}), /Unable to connect/);
  await assert.rejects(failure({response: {status: 500, data: {message: 'Private database stack trace'}}}), error => !error.message.includes('Private'));
  const logs = [];
  const originalInfo = console.info;
  global.__DEV__ = true;
  console.info = (...args) => logs.push(args);
  try {
    await assert.rejects(failure({code: 'ERR_NETWORK', config: {method: 'get', url: '/courses?token=secret-query', headers: {Authorization: 'Bearer secret-token'}}}));
    assert(!JSON.stringify(logs).includes('secret-'));
    assert.equal(logs[0][1].transport, 'network');
  } finally { console.info = originalInfo; delete global.__DEV__; }
  console.log('PASS: timeout/offline/server messages and credential-free development diagnostics');

  reset();
  let view = screen();
  assert.equal(view.list().props.ListEmptyComponent.type, toolkit.LearningSkeleton);
  await settle();
  assert.equal(view.list().props.data.length, 2);
  const tab = label => nodes(view.list().props.ListHeaderComponent).find(node => node.props?.accessibilityRole === 'tab' && node.props.children.props.children.toLowerCase() === label.toLowerCase());
  tab('My learning').props.onPress();
  assert.equal(view.list().props.data.length, 1);
  tab('All courses').props.onPress();
  assert.equal(calls.length, 3, 'tab switches must not repeat all three HTTP requests');
  const search = () => nodes(view.list().props.ListHeaderComponent).find(node => node.type === 'TextInput');
  search().props.onChangeText('second');
  assert.equal(view.list().props.data[0]._id, 'two');
  view.list().props.renderItem({item: view.list().props.data[0]}).props.onPress();
  assert.deepEqual(view.navigationCalls.pop(), ['CourseDetails', {courseId: 'two'}]);
  search().props.onChangeText('no-match');
  assert.equal(view.list().props.ListEmptyComponent.props.title, 'No matching courses');
  view.list().props.ListEmptyComponent.props.onRetry();
  assert.equal(view.list().props.data.length, 2);
  responses['/courses'] = new Error('offline');
  await view.list().props.refreshControl.props.onRefresh();
  assert.equal(view.list().props.data.length, 2, 'refresh failure preserves displayed courses');
  const retry = nodes(view.list().props.ListHeaderComponent).find(node => node.type === toolkit.ActionButton);
  reset();
  await retry.props.onPress();
  assert.equal(calls.length, 3, 'retry sends the real request group once');
  view.cleanup(); view.renderer.unmount();

  reset(); responses['/courses'] = new Error('offline');
  view = screen(); await settle();
  assert.equal(view.list().props.ListEmptyComponent.props.title, 'Unable to load courses');
  reset(); await view.list().props.ListEmptyComponent.props.onRetry();
  assert.equal(view.list().props.data.length, 2);
  view.cleanup(); view.renderer.unmount();
  reset(); responses['/courses'] = null;
  view = screen(); await settle();
  assert.equal(view.list().props.ListEmptyComponent.props.title, 'No courses available yet');
  assert.equal(view.list().props.ListEmptyComponent.props.onRetry, undefined);
  view.cleanup(); view.renderer.unmount();
  reset(); responses['/courses/my-learning'] = [];
  view = screen(); await settle();
  nodes(view.list().props.ListHeaderComponent).find(node => node.props?.accessibilityRole === 'tab' && node.props.children.props.children.toLowerCase() === 'my learning').props.onPress();
  assert.equal(view.list().props.ListEmptyComponent.props.title, 'Your next chapter starts here');
  view.cleanup(); view.renderer.unmount();

  let release;
  apiClient.defaults.adapter = config => new Promise(resolve => {release = () => resolve({config, status: 200, headers: {}, data: {success: true, data: []}});});
  const controller = new AbortController();
  const cancelled = apiClient.get('/courses', {signal: controller.signal});
  await settle(); controller.abort(); release();
  await assert.rejects(cancelled, error => error.code === 'ERR_CANCELED');
  reset();
  responses['/courses'] = Array.from({length: 15}, (_, i) => ({_id: `page-${i}`, title: `Course ${i + 1}`, description: i === 14 ? 'Hidden-tail-description' : 'Course description'}));
  responses['/courses/my-learning'] = responses['/courses'].map(course => ({course: course._id, progressPercentage: 0}));
  view = screen(); await settle();
  assert.equal(view.list().props.data.length, 10);
  assert.equal(view.list().props.ListFooterComponent.props.title, 'Show More');
  view.list().props.ListFooterComponent.props.onPress();
  assert.equal(view.list().props.data.length, 15);
  assert.equal(new Set(view.list().props.data.map(course => course._id)).size, 15);
  view.list().props.ListFooterComponent.props.onPress();
  assert.equal(view.list().props.data.length, 10);
  const query = value => nodes(view.list().props.ListHeaderComponent).find(node => node.type === 'TextInput').props.onChangeText(value);
  query('course 15');
  assert.equal(view.list().props.data[0]._id, 'page-14');
  query('hidden-tail');
  assert.equal(view.list().props.data[0]._id, 'page-14');
  nodes(view.list().props.ListHeaderComponent).find(node => node.props?.accessibilityRole === 'tab' && node.props.children.props.children.toLowerCase() === 'my learning').props.onPress();
  assert.equal(view.list().props.data[0]._id, 'page-14');
  assert.equal(view.list().props.ListFooterComponent, null);
  view.cleanup(); view.renderer.unmount();
  console.log('PASS: dynamic 10/15 pagination, collapse, and title/description search across both tabs');
  console.log('PASS: screen loading, search, tabs, navigation, empty/error states, refresh preservation, real retry and cancellation');

  const renderer = new ShallowRenderer();
  renderer.render(React.createElement(CourseCard.type, {course: fixtures[0], onPress: () => {}}));
  assert(!nodes(renderer.getRenderOutput()).some(node => node.type === 'Image'), 'invalid image URLs use the local logo');
  assert(!nodes(renderer.getRenderOutput()).some(node => node.type === toolkit.CourseProgress), 'unknown progress stays absent');
  renderer.render(React.createElement(CourseCard.type, {course: {...fixtures[0], thumbnail: 'https://example.invalid/course.png'}, onPress: () => {}}));
  assert(!nodes(renderer.getRenderOutput()).some(node => node.type === 'Image'), 'cover thumbnails never override tool branding');
  console.log('PASS: cover/logo separation and no fabricated progress');
  const {summarizeLearning} = require('../backend/services/learning-progress');
  const modules = Array.from({length: 4}, (_, i) => ({_id: 'm'+i, title: 'Module '+i, course: 'one', order: i+1}));
  const lessons = modules.flatMap(module => Array.from({length: 3}, (_, i) => ({_id: module._id+'l'+i, module: module._id, course: 'one', title: 'Lesson '+i, isCompleted: false, isUnlocked: module._id==='m0' && i===0})));
  let summary = summarizeLearning({completedLessons: [lessons[0]._id, lessons[0]._id, 'foreign-id'], progressPercentage: 999}, lessons, modules);
  assert.equal(summary.completedLessonCount, 1);
  assert.equal(summary.progressPercentage, 8);
  assert.equal(summary.courseCompleted, false);
  summary = summarizeLearning({completedLessons: lessons.map(l => l._id), status: 'in_progress'}, lessons, modules);
  assert.equal(summary.learningCompleted, true);
  assert.equal(summary.courseCompleted, false);
  assert.equal(summarizeLearning({completedLessons: lessons.map(l => l._id), status: 'completed'}, lessons, modules).courseCompleted, true);
  assert.equal(summarizeLearning({completedLessons: lessons.map(l => l._id), status: 'completed'}, lessons, modules.slice(0,3)).courseCompleted, false);
  console.log('PASS: canonical progress excludes duplicate/foreign IDs and separates 100% learning from completed courses');

  const detailPath = {course: fixtures[0], modules: modules.map(m => ({...m, lessons: lessons.filter(l => l.module === m._id)})), lessons, summary: {...summary, progressPercentage: 0, completedLessonCount: 0, learningCompleted: false}, progress: {completedLessons: []}, quiz: {available: false}};
  courseApi.getLearningPath = async () => ({success: true, data: detailPath});
  const detail = new ShallowRenderer(); const detailCalls = [];
  detail.render(React.createElement(CourseDetailsScreen, {route: {params: {courseId: 'one'}}, navigation: {goBack: () => {}, navigate: (...args) => detailCalls.push(args)}}));
  const detailCleanup = focus(); await settle();
  let output = detail.getRenderOutput();
  assert(!JSON.stringify(output).includes('Certificate Locked'));
  assert(!JSON.stringify(output).includes('Final Assessment'));
  assert.equal(output.props.footer, undefined);
  assert.equal(nodes(output).find(n => n.props?.modules).props.modules.length,4);
  detailPath.summary = {...summary, courseCompleted: true};
  detailCleanup(); const nextCleanup = focus(); await settle();
  output = detail.getRenderOutput();
  assert.equal(output.props.footer.props.title, 'View Certificate');
  assert.equal(output.props.footer.props.variant, 'gold');
  certificateApi.issueCertificate = async () => {throw new Error('network');};
  await output.props.footer.props.onPress();
  assert.equal(detailCalls.length,0,'failed certificate issuance cannot open a certificate');
  certificateApi.issueCertificate = async () => ({success:true,data:{_id:'real-certificate',status:'active'}});
  await detail.getRenderOutput().props.footer.props.onPress();
  assert.deepEqual(detailCalls.pop(), ['Certificates', {certificateId:'real-certificate'}]);
  nextCleanup(); detail.unmount();
  const certificate = new ShallowRenderer();
  certificate.render(React.createElement(InlineCertificateCanvas, {studentName: 'Account Full Name', courseTitle: 'Backend Course Name', issueDate: undefined, isUnlocked: false}));
  assert.equal(certificate.getRenderOutput(),null);
  certificate.render(React.createElement(InlineCertificateCanvas, {studentName: 'Account Full Name', courseTitle: 'Backend Course Name', issueDate: undefined, isUnlocked: true}));
  assert(JSON.stringify(certificate.getRenderOutput()).includes('Date unavailable'));
  assert(JSON.stringify(certificate.getRenderOutput()).includes('Account Full Name'));
  assert(!JSON.stringify(certificate.getRenderOutput()).includes('CWA-VERIFIED-9912'));
  console.log('PASS: four-module details, hidden pre-completion certificate, gold success action, real certificate route and no invented date/ID');

})().catch(error => {console.error(error); process.exitCode = 1;});
