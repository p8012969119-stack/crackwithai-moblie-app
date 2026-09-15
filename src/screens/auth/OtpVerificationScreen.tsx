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
import { authApi } from '../../api/authApi';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export const OtpVerificationScreen = ({ route, navigation }: any) => {
  const { login } = useAuth();

  const email = route?.params?.email || 'user@example.com';
  const password = route?.params?.password || '';
  const fromRegister = route?.params?.fromRegister ?? false;
  const fromForgot = route?.params?.fromForgot ?? !fromRegister;

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
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
      // Verify OTP code with backend API
      await authApi.verifyOTP(email, code);

      if (fromForgot) {
        navigation.navigate('ResetPassword', { email, otp: code });
      } else if (fromRegister && password) {
        // Auto-login registered user into CrackWithAI main dashboard
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header with Official CrackWithAI Logo */}
        <View style={styles.brandContainer}>
          <Image
            source={require('../../assets/images/logo/crackwithai.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandSubtitle}>Master Tech & AI Skills on Mobile</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Login');
                }
              }}
              style={styles.backIconBtn}
              activeOpacity={0.7}
            >
              <Icon name="chevron-left" size={22} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.cardTitle}>Verify OTP Code</Text>
          </View>

          <Text style={styles.cardSubtitle}>
            Please check your email inbox and enter the 6-digit code below.
          </Text>

          {/* Nodemailer Email Banner */}
          <View style={styles.emailBanner}>
            <View style={styles.bannerIconBadge}>
              <Icon name="mail" size={16} color="#5653fe" />
            </View>
            <Text style={styles.bannerText}>
              OTP sent to <Text style={styles.emailHighlight}>{email}</Text> via email.
            </Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* 6 Digit OTP Inputs Row */}
          <View style={styles.otpRow}>
            {otpDigits.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => (inputRefs.current[i] = ref)}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                ]}
                keyboardType="number-pad"
                maxLength={6}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                selectTextOnFocus
              />
            ))}
          </View>

          <Button
            title={loading ? 'Verifying OTP...' : 'Verify OTP'}
            variant="primary"
            size="large"
            onPress={handleVerify}
            loading={loading}
            disabled={loading}
            style={styles.submitBtn}
            textStyle={styles.submitBtnText}
          />

          {/* Resend OTP Timer & Button */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendLabel}>Didn't receive the code? </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>Resend OTP in {resendTimer}s</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 220,
    height: 70,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.medium,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backIconBtn: {
    marginRight: 8,
    padding: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    marginTop: 4,
    lineHeight: 20,
  },
  emailBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEDFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C7C5FF',
  },
  bannerIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: '#3B36B4',
    lineHeight: 18,
  },
  emailHighlight: {
    fontWeight: '700',
    color: '#5653fe',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  errorText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.danger,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  otpBoxFilled: {
    borderColor: '#5653fe',
    backgroundColor: '#EEEDFF',
  },
  submitBtn: {
    backgroundColor: '#5653fe',
    borderRadius: 28, // Fully curved
    height: 56,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    includeFontPadding: false,
    lineHeight: 22,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5653fe',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
