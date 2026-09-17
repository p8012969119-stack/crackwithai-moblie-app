const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const ShallowRenderer = require('react-shallow-renderer');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
let focus, calls = 0, answer, lastSignal, lastParams;
const native = Object.fromEntries(['View','Text','Pressable','ScrollView','TextInput','Image','ActivityIndicator'].map(name => [name,name]));
native.StyleSheet = {create: value => value}; native.Keyboard = {dismiss() {}}; native.Platform = {OS: 'ios'};
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const mod = new Module(file, module); mod.filename = file; mod.paths = Module._nodeModulePaths(path.dirname(file));
  const original = mod.require.bind(mod);
  mod.require = id => {
    if (id === 'react-native') return native;
    if (id === 'react-native-safe-area-context') return {SafeAreaView: 'SafeAreaView'};
    if (id === '@react-navigation/native') return {useFocusEffect: callback => {focus = callback;}};
    if (id.endsWith('.png')) return id;
    if (id.endsWith('speechRecognition')) return {speechRecognition:{subscribe:()=>({remove(){}}),cancel(){},stop(){},start:async()=>{throw Error('Speech unavailable');}}};
    if (id.endsWith('trainingApi')) return {trainingApi: {chat: (...args) => {calls++; lastParams = args; lastSignal = args[2]; return answer();}}};
    if (id.startsWith('.')) for (const ext of ['.ts', '.tsx']) {const target = path.resolve(path.dirname(file), id + ext); if (fs.existsSync(target)) return load(target);}
    return original(id);
  };
  cache.set(file, mod.exports);
  mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions: {jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true}}).outputText, file);
  cache.set(file, mod.exports); return mod.exports;
}
function nodes(tree) {if (!tree || typeof tree !== 'object') return []; if (Array.isArray(tree)) return tree.flatMap(nodes); return [tree, ...nodes(tree.props?.children)];}
const tick = () => new Promise(resolve => setImmediate(resolve));
(async () => {
  const {ToolLogo, resolveLogoUri} = load(path.join(root,'src/components/ToolLogo.tsx'));
  const logos = new ShallowRenderer();
  logos.render(React.createElement(ToolLogo,{courseKey:'Gamma course mentioning Zapier',slug:'gamma-ai-presentation'}));
  assert(nodes(logos.getRenderOutput()).find(n=>n.type==='Image').props.source.endsWith('/gamma.png'));
  logos.render(React.createElement(ToolLogo,{courseKey:'GitHub Copilot',slug:'github-copilot'}));
  assert(nodes(logos.getRenderOutput()).find(n=>n.type==='Image').props.source.endsWith('/copilot.png'));
  logos.render(React.createElement(ToolLogo,{courseKey:'Unknown',slug:'unknown',logoUrl:'https://example.invalid/logo.png'}));
  const img=nodes(logos.getRenderOutput()).find(n=>n.type==='Image'); assert.equal(img.props.resizeMode,'contain'); img.props.onError();
  assert(!nodes(logos.getRenderOutput()).some(n=>n.type==='Image'));
  assert.equal(resolveLogoUri('file:///private/token'),undefined);
  assert.equal(resolveLogoUri('/assets/course-logos/../token'),undefined);
  const {TrainingAssistant} = load(path.join(root,'src/components/TrainingAssistant.tsx'));
  const renderer = new ShallowRenderer(); let destination;
  renderer.render(React.createElement(TrainingAssistant,{onStartCourse:id=>{destination=id;}})); const cleanup = focus();
  const all = () => nodes(renderer.getRenderOutput());
  const button = title => all().find(n=>n.props.title===title || (title==='Send' && n.props.accessibilityLabel==='Send message'));
  assert(JSON.stringify(renderer.getRenderOutput()).includes('What would you like to learn or do today?'));
  assert.equal(button('Send').props.disabled,true);
  all().find(n=>n.props.accessibilityLabel==='Voice input').props.onPress(); await tick();
  assert.equal(all().find(n=>n.type==='TextInput').props.value,'','failed speech must never fabricate text');
  assert(all().some(n=>n.type==='Text'&&n.props.children==='Speech unavailable'));
  let resolve;
  answer=()=>new Promise(done=>{resolve=done;});
  const quick=all().find(n=>n.type==='Pressable' && n.props.accessibilityLabel==='Create presentations');
  quick.props.onPress(); quick.props.onPress(); assert.equal(calls,1); assert.equal(button('Send').props.disabled,true);assert(nodes(button('Send')).some(n=>n.type==='ActivityIndicator'));
  resolve({conversationId:'real-session',message:'Learn presentations with Gamma.',recommendedCourse:{_id:'real-course',title:'Gamma AI Presentation',slug:'gamma-ai-presentation',description:'Create presentations',logoUrl:'/assets/course-logos/gamma.png'},provider:'catalog'}); await tick();
  button('Start Course').props.onPress(); assert.equal(destination,'real-course');
  all().find(n=>n.type==='TextInput').props.onChangeText('Research a topic');
  answer=async()=>{throw Error('offline');}; button('Send').props.onPress(); await tick();
  assert(button('Retry message')); assert.equal(lastParams[1],'real-session'); assert(!button('Start Course'),'old recommendations hidden after failure');
  answer=async()=>({conversationId:'real-session',message:'What do you want to research?',recommendedCourse:null,provider:'catalog'});
  button('Retry message').props.onPress(); await tick(); assert(!button('Retry message')); assert(!button('Start Course'));
  answer=()=>new Promise(()=>{}); all().find(n=>n.type==='TextInput').props.onChangeText('automate'); button('Send').props.onPress(); cleanup(); assert.equal(lastSignal.aborted,true);
  renderer.unmount();
  console.log('PASS: slug-specific official logos, cover separation, aspect ratio, invalid/failed logo fallback; greeting, quick prompts, send deduplication, loading, recommendation navigation, conversation context, error/retry and cancellation');
})().catch(error=>{console.error(error);process.exitCode=1;});
