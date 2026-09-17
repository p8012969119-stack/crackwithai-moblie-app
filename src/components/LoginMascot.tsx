import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';

export interface LoginMascotHandle {react: (result: 'success' | 'failure', drop?: number) => Promise<void>; reset: () => void}
type Props = {reduceMotion: boolean; active: boolean};

/** Articulated native toy: every limb belongs to the same animated root. */
export const LoginMascot = forwardRef<LoginMascotHandle, Props>(({reduceMotion, active}, ref) => {
  const [mood, setMood] = useState<'idle' | 'success' | 'failure'>('idle');
  const jump = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const orbit = useRef(new Animated.Value(0)).current;
  const reaction = useRef<Animated.CompositeAnimation | null>(null);
  const finish = useRef<(() => void) | null>(null);
  const mounted = useRef(true);
  const reset = () => {
    reaction.current?.stop(); finish.current?.(); finish.current = null;
    jump.setValue(0); tilt.setValue(0); orbit.setValue(0); setMood('idle');
  };
  useImperativeHandle(ref, () => ({reset, react: (result, drop = 130) => {
    reset(); setMood(result);
    if (reduceMotion) return Promise.resolve();
    return new Promise<void>(resolve => {
      finish.current = resolve;
      const timing = (value: Animated.Value, toValue: number, duration: number) => Animated.timing(value, {toValue, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true, isInteraction: false});
      reaction.current = result === 'success'
        ? Animated.sequence([
          timing(jump, 5, 120), timing(jump, -56, 260), timing(jump, 0, 240),
          timing(jump, -20, 170), timing(jump, 0, 170), timing(jump, Math.max(0, drop), 380),
        ])
        : Animated.sequence([
          Animated.parallel([Animated.sequence([timing(tilt, -.10, 120), timing(tilt, .10, 140), timing(tilt, -.08, 140), timing(tilt, .10, 140)]), timing(orbit, 1, 540)]),
          Animated.parallel([timing(tilt, -.23, 450), timing(jump, 20, 450)]), Animated.delay(450),
        ]);
      reaction.current.start(() => {finish.current?.(); finish.current = null;});
    });
  }}), [reduceMotion]);
  useEffect(() => {
    mounted.current = true;
    return () => {mounted.current = false; reaction.current?.stop(); finish.current?.(); finish.current = null;};
  }, []);
  useEffect(() => {
    sway.setValue(0); blink.setValue(1);
    if (!active || reduceMotion || mood !== 'idle') return;
    const legs = Animated.loop(Animated.sequence([
      Animated.timing(sway, {toValue: 1, duration: 1250, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false}),
      Animated.timing(sway, {toValue: -1, duration: 1250, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false}),
    ]));
    const eyes = Animated.loop(Animated.sequence([
      Animated.delay(3100), Animated.timing(blink, {toValue: .12, duration: 90, useNativeDriver: true, isInteraction: false}),
      Animated.timing(blink, {toValue: 1, duration: 130, useNativeDriver: true, isInteraction: false}),
    ]));
    legs.start(); eyes.start(); return () => {legs.stop(); eyes.stop();};
  }, [active, reduceMotion, mood, sway, blink]);

  return <View pointerEvents="none" accessible accessibilityLabel={`Full-body AI boy toy, ${mood === 'success' ? 'happy jump' : mood === 'failure' ? 'dizzy and resting on the email field' : 'sitting on the email field'}`} style={s.stage}>
    <Animated.View style={[s.toy, {transform: [{translateY: jump}, {rotate: tilt.interpolate({inputRange: [-1, 1], outputRange: ['-360deg', '360deg']})}]}]}>
      {/* Paired seated legs and trainers remain visible in front of the seat. */}
      {[-1, 1].map(side => <Animated.View key={`leg${side}`} style={[s.leg, {left: side < 0 ? 45 : 79, transform: [{rotate: sway.interpolate({inputRange: [-1, 1], outputRange: side < 0 ? ['-7deg', '5deg'] : ['5deg', '-7deg']})}]}]}>
        <View style={s.trouserHighlight} /><View style={s.sock} /><View style={s.shoe}><View style={s.shoeShine} /><View style={s.sole} /></View>
      </Animated.View>)}
      <View style={s.neck} />
      <Animated.View style={[s.torso, {transform: [{scaleY: sway.interpolate({inputRange: [-1, 1], outputRange: [.985, 1.015]})}]}]}>
        <View style={s.shirtGlow} /><View style={s.collar} /><View style={s.emblem}><Text style={s.emblemText}>✦</Text></View><View style={s.hem} />
      </Animated.View>
      {[-1, 1].map(side => <View key={`arm${side}`} style={[s.arm, {left: side < 0 ? 28 : 99, transform: [{rotate: side < 0 ? '13deg' : '-13deg'}]}]}>
        <View style={s.sleeveShine} /><View style={s.wrist} /><View style={s.hand}><View style={[s.thumb, {left: side < 0 ? 10 : -3}]} /></View>
      </View>)}
      <Animated.View style={[s.headGroup, {transform: [{rotate: sway.interpolate({inputRange: [-1, 1], outputRange: ['-1deg', '1deg']})}]}]}>
        <View style={[s.ear, {left: 14}]} /><View style={[s.ear, {right: 14}]} />
        <View style={s.head}><View style={s.faceGlow} />
          <View style={[s.brow, {left: 16, transform: [{rotate: mood === 'failure' ? '-15deg' : '-4deg'}]}]} /><View style={[s.brow, {right: 16, transform: [{rotate: mood === 'failure' ? '15deg' : '4deg'}]}]} />
          <Animated.View style={[s.eyes, {transform: [{scaleY: mood === 'failure' ? .5 : blink}]}]}>{[0, 1].map(i => <View key={i} style={s.eye}><View style={s.eyeLight} /><View style={s.eyeSmallLight} /></View>)}</Animated.View>
          <View style={[s.cheek, {left: 9}]} /><View style={[s.cheek, {right: 9}]} /><View style={s.nose} />
          <View style={[s.mouth, mood === 'success' && s.happyMouth, mood === 'failure' && s.sadMouth]} />
        </View>
        <View style={s.hairCap} /><View style={s.hairSwoop} /><View style={s.hairShine} /><View style={s.hairCurl} />
      </Animated.View>
      {mood === 'failure' && <Animated.View style={[s.stars, {transform: [{rotate: orbit.interpolate({inputRange: [0, 1], outputRange: ['-20deg', '340deg']})}]}]}><Text style={[s.star, {left: 8, top: 15}]}>✦</Text><Text style={[s.star, {right: 4, top: 1}]}>✦</Text><Text style={[s.star, {right: 24, top: 42}]}>✧</Text></Animated.View>}
    </Animated.View>
  </View>;
});
const s = StyleSheet.create({
  stage: {width: 150, height: 180, overflow: 'visible'}, toy: {width: 150, height: 180, overflow: 'visible'},
  leg: {position: 'absolute', left: 45, top: 130, width: 26, height: 33, borderRadius: 10, backgroundColor: '#514982', borderWidth: 1, borderColor: '#443B73'},
  trouserHighlight: {position: 'absolute', top: 3, left: 4, width: 5, height: 19, borderRadius: 3, backgroundColor: '#786CAD'},
  sock: {position: 'absolute', top: 24, left: 4, width: 18, height: 10, borderRadius: 4, backgroundColor: '#E6DCFF'},
  shoe: {position: 'absolute', top: 29, left: -5, width: 36, height: 18, borderRadius: 10, backgroundColor: '#FAF6FF', borderWidth: 1, borderColor: '#D2C7E5', shadowColor: '#413158', shadowOpacity: .18, shadowOffset: {width: 0, height: 3}, shadowRadius: 2},
  shoeShine: {position: 'absolute', top: 3, left: 8, width: 18, height: 3, borderRadius: 3, backgroundColor: '#FFFFFF'}, sole: {position: 'absolute', bottom: 1, left: 2, right: 2, height: 4, borderRadius: 4, backgroundColor: '#B6A4D7'},
  neck: {position: 'absolute', top: 82, left: 64, width: 22, height: 17, borderRadius: 6, backgroundColor: '#D99F79'},
  torso: {position: 'absolute', top: 92, left: 42, width: 67, height: 51, borderRadius: 21, backgroundColor: '#8164D5', borderWidth: 1.5, borderColor: '#6951BC', shadowColor: '#4D3380', shadowOpacity: .2, shadowOffset: {width: 0, height: 3}, shadowRadius: 4, overflow: 'hidden'},
  shirtGlow: {position: 'absolute', top: 5, left: 7, width: 38, height: 27, borderRadius: 18, backgroundColor: '#9F87EB'}, collar: {position: 'absolute', top: -4, left: 20, width: 24, height: 10, borderRadius: 8, backgroundColor: '#5B469B'},
  emblem: {position: 'absolute', top: 15, left: 24, width: 21, height: 21, borderRadius: 8, backgroundColor: '#EDE3FF', alignItems: 'center', justifyContent: 'center'}, emblemText: {color: '#8660C5', fontSize: 17}, hem: {position: 'absolute', bottom: 0, left: 4, right: 4, height: 7, borderRadius: 8, backgroundColor: '#6B51B7'},
  arm: {position: 'absolute', top: 98, width: 24, height: 33, borderRadius: 11, backgroundColor: '#866ADB', borderWidth: 1, borderColor: '#7658C6'}, sleeveShine: {position: 'absolute', left: 4, top: 3, width: 5, height: 16, borderRadius: 4, backgroundColor: '#AF97F1'}, wrist: {position: 'absolute', top: 25, left: 3, width: 17, height: 9, borderRadius: 5, backgroundColor: '#E9B68E'}, hand: {position: 'absolute', top: 29, left: 1, width: 22, height: 19, borderRadius: 9, backgroundColor: '#F3C9A4', borderWidth: 1, borderColor: '#DCA985'}, thumb: {position: 'absolute', top: 3, width: 9, height: 12, borderRadius: 6, backgroundColor: '#F6CFAD'},
  headGroup: {position: 'absolute', top: 6, left: 9, width: 132, height: 86}, head: {position: 'absolute', top: 12, left: 24, width: 84, height: 74, borderRadius: 33, backgroundColor: '#EAB38B', borderWidth: 1, borderColor: '#D79C76', shadowColor: '#8B583D', shadowOffset: {width: 0, height: 2}, shadowOpacity: .15, shadowRadius: 3, overflow: 'hidden'},
  faceGlow: {position: 'absolute', top: 9, left: 6, width: 66, height: 52, borderRadius: 30, backgroundColor: '#F9D7B8'}, ear: {position: 'absolute', top: 42, width: 15, height: 21, borderRadius: 9, backgroundColor: '#EFB990', borderWidth: 2, borderColor: '#DCA57D'},
  hairCap: {position: 'absolute', top: 3, left: 25, width: 83, height: 29, borderTopLeftRadius: 34, borderTopRightRadius: 37, borderBottomLeftRadius: 9, borderBottomRightRadius: 12, backgroundColor: '#30253A'}, hairSwoop: {position: 'absolute', top: 0, left: 38, width: 57, height: 30, borderRadius: 20, backgroundColor: '#413047', transform: [{rotate: '-16deg'}]}, hairShine: {position: 'absolute', top: 5, left: 48, width: 35, height: 6, borderRadius: 6, backgroundColor: '#68516C', transform: [{rotate: '-14deg'}]}, hairCurl: {position: 'absolute', top: 22, left: 29, width: 14, height: 19, borderBottomLeftRadius: 12, backgroundColor: '#30253A', transform: [{rotate: '-10deg'}]},
  brow: {position: 'absolute', top: 28, width: 15, height: 3, borderRadius: 3, backgroundColor: '#6A463E'}, eyes: {position: 'absolute', top: 35, left: 17, right: 17, flexDirection: 'row', justifyContent: 'space-between'}, eye: {width: 13, height: 18, borderRadius: 7, backgroundColor: '#30283B'}, eyeLight: {position: 'absolute', top: 3, left: 3, width: 4, height: 5, borderRadius: 3, backgroundColor: '#FFFFFF'}, eyeSmallLight: {position: 'absolute', bottom: 3, right: 2, width: 2, height: 2, borderRadius: 1, backgroundColor: '#B4A7DA'},
  cheek: {position: 'absolute', top: 53, width: 15, height: 7, borderRadius: 6, backgroundColor: '#EDA990'}, nose: {position: 'absolute', top: 49, left: 38, width: 8, height: 7, borderRadius: 5, backgroundColor: '#E6AC86'}, mouth: {position: 'absolute', top: 59, left: 34, width: 16, height: 8, borderBottomWidth: 2, borderColor: '#A7645B', borderBottomLeftRadius: 10, borderBottomRightRadius: 10}, happyMouth: {backgroundColor: '#A76063', height: 10, borderTopLeftRadius: 2, borderTopRightRadius: 2}, sadMouth: {top: 62, transform: [{rotate: '180deg'}], height: 6},
  stars: {position: 'absolute', top: -12, left: 10, width: 132, height: 84}, star: {position: 'absolute', color: '#D9A23E', fontSize: 18},
});
