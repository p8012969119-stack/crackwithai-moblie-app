import React from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
export const palette = {ink:'#17233B',muted:'#526079',brand:'#5145CD',soft:'#F2F0FF',line:'#E4E8EF',green:'#12734E',white:'#FFFFFF'};
export const Action = ({label,onPress,secondary=false,disabled=false,busy=false}: {label:string;onPress:()=>void;secondary?:boolean;disabled?:boolean;busy?:boolean}) => <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled:disabled || busy}} disabled={disabled || busy} onPress={onPress} style={[ui.action,secondary && ui.secondary,(disabled || busy) && {opacity:.5}]}>{busy ? <ActivityIndicator color={secondary ? palette.brand : '#fff'} /> : <Text style={[ui.actionText,secondary && {color:palette.brand}]}>{label}</Text>}</TouchableOpacity>;
export const Notice = ({message,retry}: {message:string;retry?:()=>void}) => <View accessibilityRole="alert" style={ui.notice}><Text style={ui.body}>{message}</Text>{retry && <Action label="Try again" secondary onPress={retry} />}</View>;
export const Meter = ({value}: {value:number}) => <View accessibilityRole="progressbar" accessibilityValue={{min:0,max:100,now:value}} style={ui.meter}><View style={[ui.fill,{width:`${Math.max(0,Math.min(100,value))}%`}]} /></View>;
export const ui = StyleSheet.create({
 safe:{flex:1,backgroundColor:'#fff'},page:{padding:24,paddingBottom:48,width:'100%',maxWidth:1160,alignSelf:'center'},
 eyebrow:{fontSize:12,fontWeight:'800',letterSpacing:1.4,color:palette.brand,marginBottom:10},
 title:{fontSize:32,fontWeight:'800',letterSpacing:-.8,color:palette.ink,lineHeight:39},
 heading:{fontSize:21,fontWeight:'700',color:palette.ink,lineHeight:28},
 body:{fontSize:16,lineHeight:25,color:palette.muted},small:{fontSize:13,lineHeight:20,color:palette.muted},
 action:{minHeight:48,paddingVertical:13,paddingHorizontal:18,borderRadius:10,backgroundColor:palette.brand,justifyContent:'center',alignItems:'center'},
 secondary:{backgroundColor:palette.soft},actionText:{fontSize:15,fontWeight:'700',color:'#fff'},
 notice:{padding:18,gap:12,backgroundColor:'#FFF7ED',borderRadius:12,marginVertical:12},
 row:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:12},
 meter:{height:8,backgroundColor:'#E9E6FA',borderRadius:8,overflow:'hidden'},fill:{height:8,backgroundColor:palette.brand,borderRadius:8},
 divider:{height:1,backgroundColor:palette.line,marginVertical:22},
 back:{paddingVertical:12,minHeight:44},backText:{color:palette.brand,fontSize:15,fontWeight:'600'},
 code:{fontFamily:'Menlo',fontSize:13,lineHeight:21,color:'#26345A',backgroundColor:'#F4F6FA',padding:16,borderRadius:10},
});
