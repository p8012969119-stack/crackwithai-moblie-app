import React from 'react';
import {View} from 'react-native';

export const certificateGold = {ink: '#694600', fill: '#EFC66A', pale: '#FFF8E7', line: '#D9AC48'};

/** A scalable document and verified seal, drawn natively so it stays crisp on iOS. */
export const CertificateMark = ({size = 48}: {size?: number}) => {
  const unit = size / 48;
  return <View accessible accessibilityLabel="Certificate achievement" style={{width: size, height: size, borderRadius: size * .3, backgroundColor: certificateGold.pale, borderWidth: 1, borderColor: '#F0DCA8', alignItems: 'center', justifyContent: 'center'}}>
    <View style={{width: 25 * unit, height: 30 * unit, borderRadius: 3 * unit, borderWidth: 1.7 * unit, borderColor: certificateGold.ink, backgroundColor: '#FFFFFF', padding: 5 * unit, gap: 4 * unit}}>
      <View style={{height: 2 * unit, width: 11 * unit, backgroundColor: certificateGold.line, borderRadius: unit}} />
      <View style={{height: 1.5 * unit, width: 13 * unit, backgroundColor: '#D8D1BF'}} />
      <View style={{height: 1.5 * unit, width: 9 * unit, backgroundColor: '#D8D1BF'}} />
    </View>
    <View style={{position: 'absolute', right: 5 * unit, bottom: 5 * unit}}><CompletionBadge size={18 * unit} /></View>
  </View>;
};

export const CompletionBadge = ({size = 20}: {size?: number}) => <View accessible accessibilityLabel="Course completed" style={{width: size, height: size, borderRadius: size / 2, backgroundColor: certificateGold.fill, borderWidth: 1, borderColor: certificateGold.line, alignItems: 'center', justifyContent: 'center'}}>
  <View style={{width: size * .42, height: size * .23, borderLeftWidth: 1.7, borderBottomWidth: 1.7, borderColor: certificateGold.ink, transform: [{rotate: '-45deg'}], marginTop: -size * .08}} />
</View>;
