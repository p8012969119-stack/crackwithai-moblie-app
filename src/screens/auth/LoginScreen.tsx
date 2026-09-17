import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Keyboard, Platform, TouchableOpacity, Image, TextInput, AccessibilityInfo, AppState, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../../store/AuthContext';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {AnimatedEyeToggle} from '../../components/AnimatedAuthIcons';
import {LoginMascot, LoginMascotHandle} from '../../components/LoginMascot';

const gradient = ['#EEE7FC', '#F0E9FC', '#F2ECFD', '#F4EFFD', '#F6F2FD', '#F8F5FE', '#FAF8FE', '#FCFAFF', '#FDFCFF', '#FFFFFF'];

export const LoginScreen = ({navigation}: {navigation: {navigate: (route: string, params?: Record<string, unknown>) => void}}) => {
  const {login, isLoading} = useAuth();
  const {height} = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [active, setActive] = useState(false);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [emailFocused, setEmailFocused] = useState(false);
  const mascot = useRef<LoginMascotHandle>(null);
  const emailSeat = useRef<View>(null);
  const submitLock = useRef(false);
  const live = useRef(true);
  useFocusEffect(useCallback(() => {setActive(true); return () => {setActive(false); mascot.current?.reset();};}, []));
  useEffect(() => {
    live.current = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {if (live.current) setReduceMotion(value);});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const app = AppState.addEventListener('change', state => {setForeground(state === 'active'); if (state !== 'active') mascot.current?.reset();});
    return () => {live.current = false; motion.remove(); app.remove();};
  }, []);
  const clearError = () => {setErrorMessage(null); if (!submitLock.current) mascot.current?.reset();};
  const celebrate = async () => {
    if (!live.current || AppState.currentState !== 'active') return;
    // Constrain travel to the visible screen, while the starting position is
    // always defined by the email field itself, never a screen coordinate.
    const seatY = await new Promise<number>(resolve => {
      let settled = false;
      const timer = setTimeout(() => {if (!settled) {settled = true; resolve(height / 2);}}, 100);
      emailSeat.current?.measureInWindow((_x, y) => {if (!settled) {settled = true; clearTimeout(timer); resolve(y);}});
    });
    await mascot.current?.react('success', Math.max(0, Math.min(145, height - seatY - 95)));
  };
  const handleLogin = async () => {
    if (submitLock.current) return;
    setErrorMessage(null); mascot.current?.reset();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {setErrorMessage('Please enter both email address and password.'); return;}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {setErrorMessage('Please enter a valid email address.'); return;}
    submitLock.current = true; setSubmitting(true); Keyboard.dismiss();
    try {
      await login(trimmedEmail, password, celebrate);
    } catch (cause) {
      if (!live.current) return;
      const error = cause as {message?: string; requiresVerification?: boolean; code?: string};
      if (error.requiresVerification || error.code === 'EMAIL_NOT_VERIFIED') {
        navigation.navigate('OtpVerification', {email: trimmedEmail, password, fromRegister: true}); return;
      }
      setErrorMessage(error.message || 'Invalid email or password. Please try again.');
      await mascot.current?.react('failure');
    } finally {submitLock.current = false; if (live.current) setSubmitting(false);}
  };
  const busy = submitting || isLoading;
  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>{gradient.map(color => <View key={color} style={{flex: 1, backgroundColor: color}} />)}</View>
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" showsVerticalScrollIndicator={false} contentContainerStyle={s.content} removeClippedSubviews={false}>
        <View style={s.brand}>
          <Image source={require('../../assets/images/logo/crackwithai.png')} style={s.logo} resizeMode="contain" />
          <Text style={s.heading}>Welcome Back</Text>
          <Text style={s.subtitle}>Your next bright idea starts here.</Text>
        </View>
        <View style={s.form}>
          <View pointerEvents="none" style={s.toySpace}><Text style={[s.spark, {left: '22%', top: 40}]}>✧</Text><Text style={[s.spark, {right: '18%', top: 75, fontSize: 13}]}>✦</Text></View>
          <View ref={emailSeat} collapsable={false} style={s.emailAnchor}>
            <View style={s.mascotAnchor}><LoginMascot ref={mascot} reduceMotion={reduceMotion} active={active && foreground && !busy} /></View>
            <View style={[s.emailField, emailFocused && s.emailFocused]}>
              <Text style={s.emailLabel}>Email Address</Text>
              <TextInput accessibilityLabel="Email Address" placeholder="you@example.com" placeholderTextColor="#A094B3" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="username" autoComplete="email" value={email} editable={!busy} onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} onChangeText={value => {clearError(); setEmail(value);}} style={s.emailInput} />
            </View>
          </View>
          <View style={s.password}>
            <Input label="Password" accessibilityLabel="Password" placeholder="Enter your password" textContentType="password" autoComplete="password" autoCapitalize="none" autoCorrect={false} isPassword secureTextEntry={!showPassword} value={password} editable={!busy} onChangeText={value => {clearError(); setPassword(value);}} rightIcon={<AnimatedEyeToggle showPassword={showPassword} onPress={() => setShowPassword(value => !value)} color="#7660BE" />} />
          </View>
          <TouchableOpacity accessibilityRole="button" disabled={busy} style={s.forgot} onPress={() => navigation.navigate('ForgotPassword')}><Text style={s.link}>Forgot password?</Text></TouchableOpacity>
          {!!errorMessage && <View accessibilityLiveRegion="polite" style={s.error}><Text style={s.errorText}>{errorMessage}</Text></View>}
          <Button title={busy ? 'Signing in…' : 'Sign In'} onPress={handleLogin} loading={busy} disabled={busy} size="large" style={s.submit} />
        </View>
        <View style={s.footer}><Text style={s.footerText}>New to CrackWithAI?</Text><TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => navigation.navigate('Register')} style={s.register}><Text style={s.link}>Create Account</Text></TouchableOpacity></View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
};
const s = StyleSheet.create({
  flex: {flex: 1}, screen: {flex: 1, backgroundColor: '#F5F0FD'}, content: {flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingTop: 20, paddingBottom: 28},
  brand: {alignItems: 'center'}, logo: {width: 175, height: 51, marginBottom: 20}, heading: {fontSize: 28, lineHeight: 35, fontWeight: '700', letterSpacing: -.6, color: '#30243E'}, subtitle: {fontSize: 13, lineHeight: 21, color: '#8B7C9C', marginTop: 6},
  form: {width: '100%', maxWidth: 400, alignSelf: 'center', overflow: 'visible'}, toySpace: {height: 176}, spark: {position: 'absolute', color: '#B9A4DB', fontSize: 23},
  emailAnchor: {zIndex: 10, overflow: 'visible', marginBottom: 18}, mascotAnchor: {position: 'absolute', top: -146, left: '50%', marginLeft: -75, width: 150, height: 180, zIndex: 20, overflow: 'visible'},
  emailField: {height: 78, borderRadius: 18, borderWidth: 1, borderColor: '#D9CFE8', backgroundColor: '#FFFFFF', shadowColor: '#6D4699', shadowOpacity: .05, shadowOffset: {width: 0, height: 4}, shadowRadius: 12}, emailFocused: {borderColor: '#9C7ACB'},
  emailLabel: {position: 'absolute', top: 10, left: 16, fontSize: 11, fontWeight: '600', color: '#857293'}, emailInput: {flex: 1, fontSize: 15, color: '#3E304C', paddingHorizontal: 16, paddingTop: 28, paddingBottom: 9},
  password: {zIndex: 1}, forgot: {alignSelf: 'flex-end', minHeight: 40, justifyContent: 'center', marginTop: -10, marginBottom: 8}, link: {fontSize: 13, fontWeight: '600', color: '#7753B4'},
  error: {backgroundColor: '#FFF0ED', padding: 12, borderRadius: 12, marginBottom: 12}, errorText: {fontSize: 13, lineHeight: 19, color: '#9C4E50'},
  submit: {backgroundColor: '#7655B8', borderRadius: 18, height: 54, shadowColor: '#8A65B8', shadowOpacity: .18, shadowOffset: {width: 0, height: 5}, shadowRadius: 12},
  footer: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginTop: 15, gap: 6}, footerText: {fontSize: 13, color: '#93849F'}, register: {minHeight: 44, justifyContent: 'center'},
});
