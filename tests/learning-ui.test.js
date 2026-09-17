// Focused presentation tests. Native host views are substituted; actual learning
// components and production curriculum text are rendered with React.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const ShallowRenderer = require('react-shallow-renderer');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const definition = require('../backend/seed/curriculum').courses[0];
const native = Object.fromEntries(['View','Text','Pressable','TouchableOpacity','ScrollView','ActivityIndicator','TextInput','Modal','Image'].map(name=>[name,name]));
native.StyleSheet = {create: value=>value};
native.Platform = {OS:'ios'};
native.Animated = {Value: class {constructor(value){this.value=value;} interpolate(){return this.value;}},View:'AnimatedView'};
const cache = new Map();
const stub = () => null;
function load(file) {
  if(cache.has(file))return cache.get(file);
  const mod = new Module(file,module);
  mod.filename = file;
  mod.paths = Module._nodeModulePaths(path.dirname(file));
  const requireOriginal = mod.require.bind(mod);
  mod.require = id=>{
    if(id==='react-native')return native;
    if(id==='react-native-safe-area-context')return {SafeAreaView:'SafeAreaView'};
    if(id.endsWith('ToolLogo'))return {ToolLogo:stub};
    if(id.endsWith('CertificateModal'))return {CertificateModal:stub};
    if(id.endsWith('certificateApi'))return {certificateApi:{issueCertificate:async()=>{throw Error('Tests must not issue real certificates');}}};
    if(id.startsWith('.')){
      const target=path.resolve(path.dirname(file),id);
      for(const ext of ['.tsx','.ts'])if(fs.existsSync(target+ext))return load(target+ext);
    }
    return requireOriginal(id);
  };
  cache.set(file,mod.exports);
  const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021,jsx:ts.JsxEmit.React,esModuleInterop:true},fileName:file}).outputText;
  mod._compile(compiled,file);
  return mod.exports;
}
const toolkit=load(path.join(root,'src/components/learning/LearningLayout.tsx'));
const {CourseCard}=load(path.join(root,'src/components/learning/CourseCard.tsx'));
const {ModuleRoadmap}=load(path.join(root,'src/components/learning/ModuleRoadmap.tsx'));
const {QuizResultScreen}=load(path.join(root,'src/screens/quiz/QuizResultScreen.tsx'));
function render(Component,props){const renderer=new ShallowRenderer();renderer.render(React.createElement(Component,props));return renderer;}
function nodes(tree){
  if(!tree||typeof tree!=='object')return [];
  if(Array.isArray(tree))return tree.flatMap(nodes);
  return [tree,...nodes(tree.props?.children)];
}
const course={_id:'course-under-test',title:definition.tool,description:definition.description,shortDescription:definition.shortDescription,totalLessons:12,progressPercentage:72,isEnrolled:true,certified:false};
let opened=0;
let card=render(CourseCard,{course,onPress:()=>opened++}).getRenderOutput();
assert.equal(card.props.disabled,false);
card.props.onPress();
assert.equal(opened,1);
assert.equal(nodes(card).find(n=>n.type===toolkit.CourseProgress).props.progress,72);
card=render(CourseCard,{course:{...course,isLocked:true},onPress:()=>opened++}).getRenderOutput();
assert.equal(card.props.disabled,true,'backend-locked course is not tappable');
assert.equal(card.props.accessibilityState.disabled,true);
card=render(CourseCard,{course:{...course,progressPercentage:100,certified:false},onPress:()=>{}}).getRenderOutput();
assert.notEqual(nodes(card).find(n=>n.type===toolkit.StatusBadge).props.label,'Completed','100% lesson progress alone is not a certificate');
card=render(CourseCard,{course:{...course,certified:true},onPress:()=>{}}).getRenderOutput();
assert.equal(nodes(card).find(n=>n.type===toolkit.StatusBadge).props.tone,'gold');
console.log('PASS: course cards preserve real percentages and backend lock/certification states');

const modules=definition.modules.map((m,i)=>({...m,_id:'module-'+i,course:course._id,lessons:m.lessons.map((l,j)=>({...l,_id:'lesson-'+i+'-'+j,course:course._id,isUnlocked:i===0&&j===0,isCompleted:false}))}));
let selected=null;
const roadmap=render(ModuleRoadmap,{modules,nextLessonId:modules[0].lessons[0]._id,onLesson:lesson=>{selected=lesson;}});
let tree=roadmap.getRenderOutput();
assert.equal(nodes(tree).filter(n=>n.props?.accessibilityState?.expanded===false).length,4);
nodes(tree).find(n=>n.props?.accessibilityLabel===modules[0].title).props.onPress();
tree=roadmap.getRenderOutput();
let rows=nodes(tree).filter(n=>n.props?.accessibilityState?.disabled!==undefined);
assert.equal(rows.filter(n=>!n.props.disabled).length,1);
rows.find(n=>!n.props.disabled).props.onPress();
assert.equal(selected._id,modules[0].lessons[0]._id);
const secondModule=nodes(tree).find(n=>n.props?.accessibilityLabel===modules[1].title);
secondModule.props.onPress();
tree=roadmap.getRenderOutput();
rows=nodes(tree).filter(n=>n.props?.accessibilityState?.disabled!==undefined);
assert.equal(rows.filter(n=>!n.props.disabled).length,1,'expanding a locked module must not unlock its lessons');
assert.equal(rows.filter(n=>n.props.disabled).length,5);
console.log('PASS: module expansion exposes locked lessons without making them tappable');

const calls=[];
const navigation={navigate:(...args)=>calls.push(args),replace:(...args)=>calls.push(args)};
const result={status:'Pass',percentage:80,correctAnswers:8,wrongAnswers:2,obtainedMarks:8,totalMarks:10,courseCompleted:false};
let screen=render(QuizResultScreen,{route:{params:{courseId:course._id,result}},navigation}).getRenderOutput();
let footer=nodes(screen.props.footer).filter(n=>n.type===toolkit.ActionButton);
assert(!footer.some(n=>n.props.title.toLowerCase()==='view certificate'),'passing alone must not bypass backend course completion');
footer[0].props.onPress();
assert.deepEqual(calls.pop(),['CourseDetails',{courseId:course._id,showRoadmap:true}]);
screen=render(QuizResultScreen,{route:{params:{courseId:course._id,result:{...result,courseCompleted:true}}},navigation}).getRenderOutput();
footer=nodes(screen.props.footer).filter(n=>n.type===toolkit.ActionButton);
assert(footer.some(n=>n.props.title.toLowerCase()==='view certificate'));
screen=render(QuizResultScreen,{route:{params:{courseId:course._id,lessonId:'lesson-under-test',result:{...result,status:'Fail'}}},navigation}).getRenderOutput();
footer=nodes(screen.props.footer).filter(n=>n.type===toolkit.ActionButton);
footer[0].props.onPress();
assert.deepEqual(calls.pop(),['Quiz',{courseId:course._id,lessonId:'lesson-under-test'}]);
console.log('PASS: result actions preserve retry/roadmap routes and require backend confirmation for certificates');

const button=render(toolkit.ActionButton,{title:definition.modules[0].lessons[0].title,onPress:()=>{},loading:true}).getRenderOutput();
assert.equal(button.props.disabled,true);
const content=render(toolkit.ReadingContent,{text:'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.'}).getRenderOutput();
assert.equal(nodes(content).filter(n=>n.type==='Text').length,3);
const progress=render(toolkit.CourseProgress,{progress:125}).getRenderOutput();
assert.equal(progress.props.accessibilityValue.now,100);
console.log('PASS: loading controls cannot double-submit; paragraphs remain separate; accessible progress is bounded');
