import React,{useCallback,useRef,useState} from 'react';
import {ActivityIndicator,Linking,ScrollView,StyleSheet,Text,TouchableOpacity,View,useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect,useNavigation,useRoute} from '@react-navigation/native';
import {curriculumApi} from '../../api/curriculumApi';
import {ModuleDetail} from '../../types/curriculum';
import {Action,Meter,Notice,palette,ui} from '../../components/fullstack/CurriculumUI';
import {useAuth} from '../../store/AuthContext';
export const CurriculumModuleScreen=()=>{
 const {weekId}=useRoute<any>().params; const navigation=useNavigation<any>(); const {user}=useAuth(); const {width}=useWindowDimensions();
 const [data,setData]=useState<ModuleDetail|null>(null);const [selected,setSelected]=useState<string|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [answer,setAnswer]=useState<number|null>(null);const [feedback,setFeedback]=useState('');const [revision,setRevision]=useState(0);
 const active=useRef(false);const scroll=useRef<ScrollView>(null);
 useFocusEffect(useCallback(()=>{active.current=true;const abort=new AbortController();setError('');setData(null);
  curriculumApi.module(weekId,abort.signal).then(value=>{if(active.current){setData(value);setSelected(current=>current || value.module.lastLessonId || null);}}).catch(e=>{if(active.current)setError(e.message);});
  return()=>{active.current=false;abort.abort();};
 },[weekId,user?._id,revision]));
 const run=async(fn:()=>Promise<void>)=>{if(busy)return;setBusy(true);setError('');try{await fn();}catch(e:any){if(active.current)setError(e.message);}finally{if(active.current)setBusy(false);}};
 const choose=(id:string)=>{setSelected(id);setAnswer(null);setFeedback('');scroll.current?.scrollTo({y:0,animated:true});
  // Reading records the resume location; only a correct checkpoint awards completion.
  curriculumApi.read(id).catch(e=>{if(active.current)setError(e.message);});
 };
 const lesson=data?.lessons.find(l=>l._id===selected);
 const begin=()=>run(async()=>{const result=await curriculumApi.start(weekId);if(active.current){setData(result);choose(result.module.lastLessonId || result.lessons[0]._id);}});
 const complete=()=>run(async()=>{if(!lesson || answer===null)return;await curriculumApi.read(lesson._id);const result=await curriculumApi.complete(lesson._id,answer);if(active.current){setFeedback(result.message);if(result.detail)setData(result.detail);}});
 return <SafeAreaView style={ui.safe} edges={['top']}><ScrollView ref={scroll} contentContainerStyle={ui.page}>
  <TouchableOpacity accessibilityRole="button" onPress={()=>lesson ? setSelected(null) : navigation.goBack()} style={ui.back}><Text style={ui.backText}>‹ {lesson ? 'Module overview' : 'All modules'}</Text></TouchableOpacity>
  {error && <Notice message={error} retry={!data ? ()=>setRevision(x=>x+1) : undefined} />}
  {!data && !error && <ActivityIndicator color={palette.brand} style={{margin:40}} />}
  {data && <>
   <Text style={ui.eyebrow}>WEEK {data.module.weekNumber}{data.module.weekEnd!==data.module.weekNumber ? `–${data.module.weekEnd}` : ''} / {data.module.estimatedTime.toUpperCase()}</Text>
   <Text style={ui.title}>{lesson ? lesson.title : data.module.title}</Text>
   <Text style={[ui.body,{marginTop:10}]}>{lesson ? lesson.objective : data.module.topic}</Text>
   <View style={{marginVertical:20,gap:8}}><Meter value={data.module.totalLessons ? Math.round(data.module.completedLessons.length/data.module.totalLessons*100) : 0} /><Text style={ui.small}>{data.module.completedLessons.length}/{data.module.totalLessons} lesson checkpoints · Project {data.module.projectCompleted ? 'completed' : 'not submitted'}</Text></View>
   <View style={{flexDirection:width>=850 ? 'row' : 'column',gap:28}}>
    <View style={{flex:1}}>
     {!lesson ? <>
      <Text style={ui.heading}>What you’ll learn</Text>
      {data.module.objectives.map((objective,i)=><Text key={i} style={[ui.body,{marginTop:10}]}>• {objective}</Text>)}
      <View style={{marginTop:22}}><Action label={data.module.status==='Not Started' ? 'Start Learning' : 'Continue Learning'} onPress={begin} busy={busy} /></View>
      <View style={ui.divider} /><Text style={ui.heading}>Your practical project</Text><Text style={[ui.body,{marginTop:10,fontWeight:'700',color:palette.ink}]}>{data.task.title}</Text><Text style={[ui.body,{marginTop:8}]}>{data.task.problem}</Text>
      {data.task.requirements.map((requirement,i)=><Text key={i} style={[ui.body,{marginTop:10}]}>{i+1}. {requirement}</Text>)}
      {data.module.reviewStatus==='pending' && <Notice message="Your evidence is awaiting instructor review. This module remains in progress until it is approved." />}
      {!!data.module.reviewFeedback && <Notice message={data.module.reviewFeedback} />}
      <View style={{marginTop:20}}><Action label={data.module.projectCompleted ? 'Reopen project workspace' : data.module.practiceAvailable ? 'Open project workspace' : 'Complete lesson checkpoints to unlock practice'} disabled={!data.module.practiceAvailable} onPress={()=>navigation.navigate('CurriculumWorkspace',{weekId})} /></View>
     </> : <>
      <Text style={ui.small}>{lesson.estimatedMinutes} minute lesson · {data.module.completedLessons.includes(lesson._id) ? '✓ Checkpoint passed' : 'Not completed'}</Text>
      {lesson.sections.map((section,i)=><View key={i} style={{marginTop:24}}><Text style={ui.heading}>{section.title}</Text><Text selectable style={[ui.body,{marginTop:10}]}>{section.body}</Text></View>)}
      {lesson.examples.map((example,i)=><View key={i} style={{marginTop:24}}><Text style={ui.heading}>Example</Text><Text style={[ui.small,{marginVertical:8}]}>{example.language} · Teaching excerpt; use the setup and context described in this lesson.</Text><ScrollView horizontal><Text selectable style={ui.code}>{example.code}</Text></ScrollView></View>)}
      <View style={ui.divider} /><Text style={ui.heading}>Common mistakes</Text>{lesson.commonMistakes.map((text,i)=><Text key={i} style={[ui.body,{marginTop:8}]}>{text}</Text>)}
      <Text style={[ui.heading,{marginTop:24}]}>Practice guidance</Text>{lesson.bestPractices.map((text,i)=><Text key={i} style={[ui.body,{marginTop:8}]}>{text}</Text>)}
      <Text style={[ui.heading,{marginTop:24}]}>Try it yourself</Text><Text selectable style={[ui.body,{marginTop:10}]}>{lesson.activity}</Text>
      <View style={styles.checkpoint}><Text style={ui.eyebrow}>LESSON CHECKPOINT</Text><Text style={ui.heading}>{lesson.checkpoint.question}</Text>
       {lesson.checkpoint.options.map((option,i)=><TouchableOpacity key={i} accessibilityRole="radio" accessibilityState={{checked:answer===i}} onPress={()=>{setAnswer(i);setFeedback('');}} style={[styles.option,answer===i && styles.selected]}><Text style={[ui.body,answer===i && {color:palette.brand,fontWeight:'600'}]}>{answer===i ? '●' : '○'} {option}</Text></TouchableOpacity>)}
       <Action label="I’ve studied this lesson — check my answer" disabled={answer===null} busy={busy} onPress={complete} />
       {!!feedback && <Text accessibilityLiveRegion="polite" style={[ui.body,{marginTop:12}]}>{feedback}</Text>}
      </View>
      {data.module.completedLessons.includes(lesson._id) && <Action label={data.lessons.findIndex(l=>l._id===lesson._id)<data.lessons.length-1 ? 'Next lesson' : 'Return to module project'} onPress={()=>{const index=data.lessons.findIndex(l=>l._id===lesson._id);if(index<data.lessons.length-1)choose(data.lessons[index+1]._id);else setSelected(null);}} />}
      <Text style={[ui.heading,{marginTop:28}]}>Further reading</Text>{lesson.sources.map(url=><TouchableOpacity accessibilityRole="link" key={url} onPress={()=>Linking.openURL(url).catch(()=>setError('Unable to open this reference.'))} style={{paddingVertical:10}}><Text style={[ui.small,{color:palette.brand}]}>{url.replace('https://','')}</Text></TouchableOpacity>)}
     </>}
    </View>
    <View style={{width:width>=850 ? 280 : '100%'}}><Text style={ui.heading}>Module lessons</Text><Text style={[ui.small,{marginVertical:8}]}>Choose any lesson. Every module is open.</Text>{data.lessons.map((item,i)=><TouchableOpacity accessibilityRole="button" key={item._id} onPress={()=>choose(item._id)} style={[styles.lesson,item._id===selected && {backgroundColor:palette.soft}]}><Text style={styles.lessonNumber}>{data.module.completedLessons.includes(item._id) ? '✓' : String(i+1).padStart(2,'0')}</Text><Text style={[ui.body,{flex:1,color:palette.ink,fontSize:14}]}>{item.title}</Text></TouchableOpacity>)}</View>
   </View>
  </>}
 </ScrollView></SafeAreaView>;
};
const styles=StyleSheet.create({checkpoint:{padding:20,backgroundColor:'#F7F8FC',borderRadius:14,marginVertical:24},option:{borderWidth:1,borderColor:palette.line,borderRadius:9,padding:14,marginVertical:8,backgroundColor:'#fff',minHeight:48},selected:{borderColor:palette.brand,backgroundColor:palette.soft},lesson:{flexDirection:'row',gap:12,padding:12,borderBottomWidth:1,borderColor:palette.line,borderRadius:6,minHeight:52},lessonNumber:{fontSize:14,fontWeight:'700',color:palette.brand,marginTop:4}});
