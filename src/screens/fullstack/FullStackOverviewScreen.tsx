import React, {useCallback, useState} from 'react';
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {curriculumApi} from '../../api/curriculumApi';
import {Curriculum} from '../../types/curriculum';
import {Action, Meter, Notice, palette, ui} from '../../components/fullstack/CurriculumUI';
import {useAuth} from '../../store/AuthContext';
export const FullStackOverviewScreen = () => {
 const navigation = useNavigation<any>(); const {user} = useAuth();
 const [data,setData] = useState<Curriculum|null>(null); const [error,setError] = useState('');
 const [loading,setLoading] = useState(true); const [revision,setRevision] = useState(0); const [query,setQuery] = useState('');
 useFocusEffect(useCallback(()=>{
  const controller = new AbortController(); let active=true;
  setLoading(true); setError(''); setData(null);
  curriculumApi.overview(controller.signal).then(value=>{if(active)setData(value);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;controller.abort();};
 },[revision,user?._id]));
 const open = (weekId:string) => navigation.navigate('CurriculumModule',{weekId});
 const months = data?.months.map(month=>({...month,modules:month.modules.filter(m=>`${m.title} ${m.topic} ${m.detailedContent.join(' ')}`.toLowerCase().includes(query.toLowerCase()))})).filter(m=>m.modules.length) || [];
 return <SafeAreaView style={ui.safe} edges={['top']}><ScrollView refreshControl={<RefreshControl refreshing={loading && !!data} onRefresh={()=>setRevision(x=>x+1)} />} contentContainerStyle={ui.page}>
  <TouchableOpacity accessibilityRole="button" onPress={()=>navigation.goBack()} style={ui.back}><Text style={ui.backText}>‹ Back to learning</Text></TouchableOpacity>
  <Text style={ui.eyebrow}>CRACKWITHAI / DEVELOPER PATH</Text>
  <Text style={ui.title}>Full Stack Web Development</Text>
  <Text style={[ui.body,{marginTop:10}]}>6-Month Full Stack Web Development Curriculum</Text>
  <Text style={[ui.small,{marginTop:8}]}>Explore any module. Build your skills through lessons, checkpoints, and practical projects.</Text>
  {loading && !data && <ActivityIndicator style={{margin:36}} color={palette.brand} size="large" />}
  {error ? <Notice message={error} retry={()=>setRevision(x=>x+1)} /> : null}
  {data && <>
   <View style={styles.summary}>
    <View style={styles.stats}>{[[data.months.length,'months'],[data.progress.totalWeeks,'weeks'],[data.progress.totalLessons,'lessons'],[`${data.progress.completedModules}/${data.progress.totalModules}`,'modules completed']].map(([value,label])=><View key={String(label)} style={styles.stat}><Text style={styles.value}>{value}</Text><Text style={ui.small}>{label}</Text></View>)}</View>
    <View style={[ui.row,{justifyContent:'space-between',marginBottom:10}]}><Text style={ui.body}>Your curriculum progress</Text><Text style={styles.percent}>{data.progress.percentage}%</Text></View>
    <Meter value={data.progress.percentage} />
    <Text style={[ui.small,{marginTop:10}]}>{data.progress.completedWeeks} of {data.progress.totalWeeks} weeks completed · {data.progress.completedLessons} lesson checkpoints passed</Text>
    {data.progress.lastWeekId && <View style={{marginTop:18}}><Action label={`Continue ${data.months.flatMap(m=>m.modules).find(m=>m._id===data.progress.lastWeekId)?.title || 'learning'}`} onPress={()=>open(data.progress.lastWeekId!)} /></View>}
   </View>
   <TextInput accessibilityLabel="Search curriculum modules" placeholder="Search HTML, React, MongoDB…" placeholderTextColor={palette.muted} value={query} onChangeText={setQuery} style={styles.search} clearButtonMode="while-editing" />
   {!months.length && <Text style={ui.body}>No modules match this search.</Text>}
   {months.map(month=><View key={month._id} style={styles.month}>
    <Text style={ui.eyebrow}>MONTH {month.monthNumber}</Text><Text style={ui.heading}>{month.title}</Text>
    {month.modules.map(module=><TouchableOpacity key={module._id} accessibilityRole="button" accessibilityLabel={`Open ${module.title}, ${module.status}`} onPress={()=>open(module._id)} style={styles.module}>
     <View style={[ui.row,{justifyContent:'space-between'}]}><Text style={styles.week}>WEEK {module.weekNumber}{module.weekEnd!==module.weekNumber ? `–${module.weekEnd}` : ''} · {module.estimatedTime}</Text><Text style={[styles.status,module.status==='Completed' && {color:palette.green}]}>{module.status==='Completed' ? '✓ ' : ''}{module.status}</Text></View>
     <Text style={[ui.heading,{fontSize:19,marginTop:9}]}>{module.title} <Text style={{color:palette.brand}}>›</Text></Text>
     <Text style={[ui.body,{marginTop:4}]}>{module.topic}</Text>
     <Text style={[ui.small,{marginTop:6}]}>{module.detailedContent.join(' · ')}</Text>
     <Text style={[ui.small,{marginTop:12,color:palette.ink}]}><Text style={{fontWeight:'700'}}>Build: </Text>{module.practicalProject}</Text>
     <Text style={[ui.small,{marginTop:6}]}>{module.completedLessons.length}/{module.totalLessons} lessons · Project {module.projectCompleted ? 'completed' : 'not submitted'}</Text>
    </TouchableOpacity>)}
   </View>)}
  </>}
 </ScrollView></SafeAreaView>;
};
const styles=StyleSheet.create({summary:{backgroundColor:'#F7F8FC',padding:22,borderRadius:16,marginVertical:24},stats:{flexDirection:'row',flexWrap:'wrap',gap:22,marginBottom:24},stat:{minWidth:90,flexGrow:1},value:{fontSize:27,fontWeight:'800',color:palette.ink,marginBottom:4},percent:{fontSize:20,fontWeight:'800',color:palette.brand},search:{borderWidth:1,borderColor:palette.line,borderRadius:10,padding:15,fontSize:16,color:palette.ink,minHeight:50},month:{marginTop:32},module:{paddingVertical:22,borderBottomWidth:1,borderColor:palette.line},week:{fontSize:12,fontWeight:'700',color:palette.muted,letterSpacing:.5},status:{fontSize:12,fontWeight:'700',color:palette.brand}});
