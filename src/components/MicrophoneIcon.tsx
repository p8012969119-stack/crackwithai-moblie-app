import React from 'react';
import {View} from 'react-native';

/** Monochrome microphone drawn with native strokes, not an emoji. */
export const MicrophoneIcon = ({color = '#726182'}: {color?: string}) => <View accessible={false} style={{width: 22, height: 24, alignItems: 'center'}}>
  <View style={{position: 'absolute', top: 1, width: 8, height: 13, borderRadius: 5, borderWidth: 1.6, borderColor: color}} />
  <View style={{position: 'absolute', top: 7, width: 16, height: 11, borderWidth: 1.6, borderTopWidth: 0, borderBottomLeftRadius: 9, borderBottomRightRadius: 9, borderColor: color}} />
  <View style={{position: 'absolute', top: 17, width: 1.6, height: 5, backgroundColor: color}} />
  <View style={{position: 'absolute', top: 21, width: 8, height: 1.6, borderRadius: 1, backgroundColor: color}} />
</View>;
