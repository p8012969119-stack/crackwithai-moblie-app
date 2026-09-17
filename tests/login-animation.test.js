const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const ShallowRenderer = require('react-shallow-renderer');
const ts = require('typescript');
let response, saved = [];
const file = path.resolve(__dirname, '../src/store/AuthContext.tsx');
const mod = new Module(file, module);
mod.filename = file; mod.paths = Module._nodeModulePaths(path.dirname(file));
const original = mod.require.bind(mod);
mod.require = id => {
  if (id.endsWith('/authApi')) return {authApi: {login: async () => response()}};
  if (id.endsWith('/storage')) return {storage: {saveToken: async () => saved.push('token'), saveUser: async () => saved.push('user')}};
  if (id.endsWith('/client')) return {setUnauthorizedListener() {}};
  if (id.endsWith('/session')) return {restoreValidatedSession: async () => null};
  return original(id);
};
mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true}}).outputText, file);
const tick = () => new Promise(resolve => setImmediate(resolve));
const setup = () => {
  saved = [];
  const renderer = new ShallowRenderer();
  renderer.render(React.createElement(mod.exports.AuthProvider, null));
  return {renderer, auth: () => renderer.getRenderOutput().props.value};
};
const valid = () => ({success: true, data: {token: 'test-token', user: {_id: 'test-user'}}});
(async () => {
  response = valid;
  let {renderer, auth} = setup(), finish, calls = 0;
  const pending = auth().login('test@example.invalid', 'test-password', () => {
    calls++; assert.deepEqual(saved, ['token', 'user']);
    return new Promise(resolve => {finish = resolve;});
  });
  await tick();
  assert.equal(calls, 1); assert.equal(auth().isAuthenticated, false, 'navigator must wait for the full-body celebration');
  finish(); await pending;
  assert.equal(auth().isAuthenticated, true); assert.equal(auth().isLoading, false);
  renderer.unmount();
  for (const failure of [() => {throw Error('Invalid credentials');}, () => ({success: false, message: 'Login rejected'}), () => ({success: true, data: {user: {_id: 'test-user'}}})]) {
    ({renderer, auth} = setup()); response = failure;
    await assert.rejects(auth().login('test@example.invalid', 'wrong', async () => {throw Error('celebration should never run');}));
    assert.equal(auth().isAuthenticated, false); assert.deepEqual(saved, []); assert.equal(auth().isLoading, false);
    renderer.unmount();
  }
  response = valid; ({renderer, auth} = setup());
  await auth().login('test@example.invalid', 'test-password', async () => {throw Error('animation cancelled');});
  assert.equal(auth().isAuthenticated, true, 'animation failure must not fail valid authentication'); renderer.unmount();
  ({renderer, auth} = setup());
  await auth().login('test@example.invalid', 'test-password');
  assert.equal(auth().isAuthenticated, true, 'existing callers without an animation remain supported'); renderer.unmount();
  ({renderer, auth} = setup());
  await auth().login('test@example.invalid', 'test-password', () => new Promise(() => {}));
  assert.equal(auth().isAuthenticated, true, 'a stalled animation is bounded'); renderer.unmount();
  console.log('PASS: real session validation and persistence before celebration, navigation after animation, rejected/invalid sessions, cancelled or stalled animation, existing login callers');
})().catch(error => {console.error(error); process.exitCode = 1;});
