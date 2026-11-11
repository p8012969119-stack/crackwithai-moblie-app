import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';

const gradient = ['#EEE7FC', '#F0E9FC', '#F2ECFD', '#F4EFFD', '#F6F2FD', '#F8F5FE', '#FAF8FE', '#FCFAFF', '#FDFCFF', '#FFFFFF'];

export const OtpVerificationScreen = ({ route, navigation }: any) => {
  const { login } = useAuth();

  const email = route?.params?.email || 'user@example.com';
  const password = route?.params?.password || '';
  const fromRegister = route?.params?.fromRegister ?? false;
  const fromForgot = route?.params?.fromForgot ?? !fromRegister;

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleOtpChange = (text: string, index: number) => {
    setErrorMessage(null);
    const newDigits = [...otpDigits];

    // Handle 6-digit paste
    if (text.length > 1) {
      const pasted = text.replace(/[^0-9]/g, '').slice(0, 6);
      const updated = pasted.split('');
      while (updated.length < 6) updated.push('');
      setOtpDigits(updated);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = text.replace(/[^0-9]/g, '');
    setOtpDigits(newDigits);

    // Auto-advance to next box
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setErrorMessage(null);
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter all 6 digits of the OTP code.');
      return;
    }

    try {
      setLoading(true);
      await authApi.verifyOTP(email, code);

      if (fromForgot) {
        navigation.navigate('ResetPassword', { email, otp: code });
      } else if (fromRegister && password) {
        try {
          await login(email, password);
        } catch {
          navigation.navigate('Login');
        }
      } else {
        navigation.navigate('Login');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setErrorMessage(null);
      await authApi.sendOTP(email);
      setResendTimer(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
      {/* Soft Violet Gradient Background Overlay matching Login */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        {gradient.map((color) => (
          <View key={color} style={{ flex: 1, backgroundColor: color }} />
        ))}
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
        >
          {/* Brand Header with Official CrackWithAI Logo */}
          <View style={s.brand}>
            <Image
              source={require('../../assets/images/logo/crackwithai.png')}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={s.heading}>Verify OTP Code</Text>
            <Text style={s.subtitle}>
              Please check your email inbox and enter the 6-digit code below.
            </Text>
          </View>

          {/* Form Container */}
          <View style={s.form}>
            {/* Soft Violet Email Banner */}
            <View style={s.emailBanner}>
              <View style={s.bannerIconBadge}>
                <Icon name="mail" size={16} color="#7655B8" />
              </View>
              <Text style={s.bannerText}>
                OTP sent to <Text style={s.emailHighlight}>{email}</Text> via email.
              </Text>
            </View>

            {/* Error Container */}
            {!!errorMessage && (
              <View accessibilityLiveRegion="polite" style={s.errorBox}>
                <Text style={s.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* 6-Digit OTP Inputs Row */}
            <View style={s.otpRow}>
              {otpDigits.map((digit, i) => {
                const isFocused = focusedIndex === i;
                const isFilled = !!digit;
                return (
                  <TextInput
                    key={i}
                    ref={(ref) => (inputRefs.current[i] = ref)}
                    style={[
                      s.otpBox,
                      (isFilled || isFocused) && s.otpBoxActive,
                    ]}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={digit}
                    onFocus={() => setFocusedIndex(i)}
                    onBlur={() => setFocusedIndex(null)}
                    onChangeText={(text) => handleOtpChange(text, i)}
                    onKeyPress={(e) => handleKeyPress(e, i)}
                    selectTextOnFocus
                  />
                );
              })}
            </View>

            {/* Signature Violet Submit Button */}
            <Button
              title={loading ? 'Verifying OTP…' : 'Verify OTP'}
              onPress={handleVerify}
              loading={loading}
              disabled={loading}
              size="large"
              style={s.submitBtn}
            />

            {/* Resend OTP Timer & Button */}
            <View style={s.resendContainer}>
              <Text style={s.resendLabel}>Didn't receive the code? </Text>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7} style={s.resendBtn}>
                  <Text style={s.link}>Resend OTP</Text>
                </TouchableOpacity>
              ) : (
                <Text style={s.timerText}>Resend OTP in {resendTimer}s</Text>
              )}
            </View>
          </View>

          {/* Back to Sign In Footer */}
          <View style={s.footer}>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={loading}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Login');
                }
              }}
              style={s.loginBtn}
            >
              <Text style={s.link}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#F5F0FD' },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 28,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logo: {
    width: 175,
    height: 51,
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: '#30243E',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 21,
    color: '#8B7C9C',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  emailBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EDFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D9CFE8',
  },
  bannerIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#6D4699',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: '#5C4A73',
    lineHeight: 18,
  },
  emailHighlight: {
    fontWeight: '700',
    color: '#7655B8',
  },
  errorBox: {
    backgroundColor: '#FFF0ED',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9C4E50',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D9CFE8',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#30243E',
    shadowColor: '#6D4699',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  otpBoxActive: {
    borderColor: '#7655B8',
    backgroundColor: '#FAF7FD',
  },
  submitBtn: {
    backgroundColor: '#7655B8',
    borderRadius: 18,
    height: 54,
    shadowColor: '#8A65B8',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 3,
    width: '100%',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendLabel: {
    fontSize: 13,
    color: '#93849F',
  },
  resendBtn: {
    minHeight: 36,
    justifyContent: 'center',
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7753B4',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#93849F',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
