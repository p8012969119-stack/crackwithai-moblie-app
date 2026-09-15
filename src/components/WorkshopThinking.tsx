import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';

export const WorkshopThinking = ({animate}: {animate: boolean}) => {
  const phase = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    phase.setValue(0);
    if (!animate) return;
    const loop = Animated.loop(Animated.timing(phase, {
      toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true, isInteraction: false,
    }));
    loop.start();
    return () => {loop.stop(); phase.setValue(0);};
  }, [animate, phase]);
  return <View style={styles.row} accessible accessibilityLabel="AI is thinking" accessibilityLiveRegion="polite">
    <View style={styles.symbol}><Text style={styles.spark}>✦</Text></View>
    <Text style={styles.label}>Thinking</Text>
    <View style={styles.dots}>{[0, 1, 2].map(index => {
      const start = index * .18;
      const inputRange = [0, start + .1, start + .25, start + .4, 1];
      return <Animated.View key={index} style={[styles.dot, {
        opacity: animate ? phase.interpolate({inputRange, outputRange: [.3, .3, 1, .3, .3]}) : .65,
        transform: [{translateY: animate ? phase.interpolate({inputRange, outputRange: [0, 0, -4, 0, 0]}) : 0}],
      }]} />;
    })}</View>
  </View>;
};
const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8},
  symbol: {width: 30, height: 30, borderRadius: 10, backgroundColor: '#F0E9FC', alignItems: 'center', justifyContent: 'center'},
  spark: {color: '#8060C9', fontSize: 21}, label: {fontSize: 14, color: '#79658E', fontWeight: '500'},
  dots: {flexDirection: 'row', gap: 5, alignItems: 'center', height: 18}, dot: {width: 5, height: 5, borderRadius: 3, backgroundColor: '#9672D8'},
});
