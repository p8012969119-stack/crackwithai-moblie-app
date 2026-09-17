import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { AnimatedEyeToggle } from '../../components/AnimatedAuthIcons';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export const RegisterScreen = ({ navigation }: any) => {
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please create a password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    try {
      setLoading(true);
      // Register account using existing backend API (backend sends verification OTP email)
      await authApi.register({ name: trimmedName, email: trimmedEmail, password });

      // Navigate to OTP verification section
      navigation.navigate('OtpVerification', {
        email: trimmedEmail,
        password: password,
        fromRegister: true,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Account may already exist.');
    } finally {
      setLoading(false);
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
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>
            Create your account to start your learning journey.
          </Text>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={(text) => {
              setErrorMessage(null);
              setName(text);
            }}
          />

          <Input
            label="Email Address"
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setErrorMessage(null);
              setEmail(text);
            }}
          />

          <Input
            label="Password"
            placeholder="Create your password"
            isPassword
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setErrorMessage(null);
              setPassword(text);
            }}
            rightIcon={
              <AnimatedEyeToggle
                showPassword={showPassword}
                onPress={() => setShowPassword(!showPassword)}
                color="#5653fe"
              />
            }
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            isPassword
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={(text) => {
              setErrorMessage(null);
              setConfirmPassword(text);
            }}
            rightIcon={
              <AnimatedEyeToggle
                showPassword={showConfirmPassword}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                color="#5653fe"
              />
            }
          />

          <Button
            title={loading ? 'Creating Account...' : 'Create Account'}
            variant="primary"
            size="large"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.submitBtn}
            textStyle={styles.submitBtnText}
          />
        </View>

        {/* Switch to Login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
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
    marginBottom: 20,
  },
  logoImage: {
    width: 220,
    height: 65,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
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
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
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
  submitBtn: {
    backgroundColor: '#5653fe',
    borderRadius: 28, // Fully curved pill shape
    height: 56,
    marginTop: 8,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5653fe',
  },
});
