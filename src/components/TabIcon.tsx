import React from 'react';
import {StyleSheet, View} from 'react-native';

export type TabIconName = 'home' | 'courses' | 'workspace' | 'tools';

// Native shapes stay crisp at every display scale and inherit the tab tint.
// Kept separate from the shared emoji icons used elsewhere in the app.
export const TabIcon = ({name, color, size = 24}: {
  name: TabIconName;
  color: string;
  size?: number;
}) => {
  const stroke = {borderColor: color};
  let symbol: React.ReactNode;

  switch (name) {
    case 'home':
      symbol = <>
        <View style={[styles.house, stroke]} />
        <View style={[styles.roof, stroke]} />
        <View style={[styles.door, stroke]} />
      </>;
      break;
    case 'courses':
      symbol = <>
        <View style={[styles.page, styles.leftPage, stroke]} />
        <View style={[styles.page, styles.rightPage, stroke]} />
        <View style={[styles.pageLine, {left: 5, backgroundColor: color}]} />
        <View style={[styles.pageLine, {left: 14, backgroundColor: color}]} />
      </>;
      break;
    case 'workspace':
      symbol = <>
        <Sparkle color={color} size={20} />
        <View style={styles.smallSparkle}><Sparkle color={color} size={8} /></View>
      </>;
      break;
    case 'tools':
      symbol = <View style={styles.grid}>{[0, 1, 2, 3].map(index =>
        <View key={index} style={[styles.tile, stroke]} />
      )}</View>;
      break;
  }

  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants" style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
    <View style={[styles.canvas, {transform: [{scale: size / 24}]}]}>{symbol}</View>
  </View>;
};

function Sparkle({color, size}: {color: string; size: number}) {
  return <View style={{width: size, height: size}}>{[0, 90, 180, 270].map(rotation =>
    <View key={rotation} style={[StyleSheet.absoluteFillObject, {transform: [{rotate: `${rotation}deg`}]}]}>
      <View style={{position: 'absolute', top: 0, left: size * 0.32, width: 0, height: 0,
        borderLeftWidth: size * 0.18, borderRightWidth: size * 0.18, borderBottomWidth: size * 0.5,
        borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color}} />
    </View>
  )}</View>;
}

const styles = StyleSheet.create({
  canvas: {width: 24, height: 24, justifyContent: 'flex-end'},
  house: {position: 'absolute', left: 4, top: 11, width: 16, height: 11, borderWidth: 1.8, borderTopWidth: 0, borderBottomLeftRadius: 3, borderBottomRightRadius: 3},
  roof: {position: 'absolute', left: 4.5, top: 4.5, width: 15, height: 15, borderLeftWidth: 1.8, borderTopWidth: 1.8, borderTopLeftRadius: 2, transform: [{rotate: '45deg'}]},
  door: {position: 'absolute', left: 9, bottom: 2, width: 6, height: 8, borderWidth: 1.8, borderBottomWidth: 0, borderTopLeftRadius: 2, borderTopRightRadius: 2},
  page: {position: 'absolute', top: 4, width: 10.5, height: 16, borderWidth: 1.8, borderRadius: 2},
  leftPage: {left: 2, transform: [{skewY: '8deg'}]},
  rightPage: {right: 2, transform: [{skewY: '-8deg'}]},
  pageLine: {position: 'absolute', top: 9, width: 4.5, height: 1.5, borderRadius: 1},
  smallSparkle: {position: 'absolute', top: 0, right: 0},
  grid: {position: 'absolute', top: 2, left: 2, width: 20, height: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 4},
  tile: {width: 8, height: 8, borderWidth: 1.8, borderRadius: 2.5},
});
