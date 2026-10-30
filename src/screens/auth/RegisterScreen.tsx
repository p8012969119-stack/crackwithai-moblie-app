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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../../api/authApi';
import { Button } from '../../components/Button';
import { AnimatedEyeToggle } from '../../components/AnimatedAuthIcons';

const gradient = ['#EEE7FC', '#F0E9FC', '#F2ECFD', '#F4EFFD', '#F6F2FD', '#F8F5FE', '#FAF8FE', '#FCFAFF', '#FDFCFF', '#FFFFFF'];

export const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = () => setErrorMessage(null);

  const handleRegister = async () => {
    clearError();
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
      await authApi.register({ name: trimmedName, email: trimmedEmail, password });

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
          {/* Official CrackWithAI Brand Header */}
          <View style={s.brand}>
            <Image
              source={require('../../assets/images/logo/crackwithai.png')}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={s.heading}>Create Account</Text>
            <Text style={s.subtitle}>Start your AI and Full-Stack learning journey.</Text>
          </View>

          {/* Form Fields matching Login's violet card design */}
          <View style={s.form}>
            {/* Full Name Field */}
            <View style={[s.fieldBox, nameFocused && s.fieldFocused]}>
              <Text style={s.fieldLabel}>Full Name</Text>
              <TextInput
                placeholder="Prakash Raj"
                placeholderTextColor="#A094B3"
                autoCapitalize="words"
                autoCorrect={false}
                value={name}
                editable={!loading}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                onChangeText={(val) => {
                  clearError();
                  setName(val);
                }}
                style={s.fieldInput}
              />
            </View>

            {/* Email Field */}
            <View style={[s.fieldBox, emailFocused && s.fieldFocused]}>
              <Text style={s.fieldLabel}>Email Address</Text>
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor="#A094B3"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                autoComplete="email"
                value={email}
                editable={!loading}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                onChangeText={(val) => {
                  clearError();
                  setEmail(val);
                }}
                style={s.fieldInput}
              />
            </View>

            {/* Password Field */}
            <View style={[s.fieldBox, passwordFocused && s.fieldFocused]}>
              <Text style={s.fieldLabel}>Password</Text>
              <TextInput
                placeholder="Create a strong password"
                placeholderTextColor="#A094B3"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                value={password}
                editable={!loading}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                onChangeText={(val) => {
                  clearError();
                  setPassword(val);
                }}
                style={s.fieldInput}
              />
              <View style={s.eyeToggleBox}>
                <AnimatedEyeToggle
                  showPassword={showPassword}
                  onPress={() => setShowPassword((prev) => !prev)}
                  color="#7660BE"
                />
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={[s.fieldBox, confirmFocused && s.fieldFocused]}>
              <Text style={s.fieldLabel}>Confirm Password</Text>
              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor="#A094B3"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                value={confirmPassword}
                editable={!loading}
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
                onChangeText={(val) => {
                  clearError();
                  setConfirmPassword(val);
                }}
                style={s.fieldInput}
              />
              <View style={s.eyeToggleBox}>
                <AnimatedEyeToggle
                  showPassword={showConfirmPassword}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  color="#7660BE"
                />
              </View>
            </View>

            {/* Error Message Alert */}
            {!!errorMessage && (
              <View accessibilityLiveRegion="polite" style={s.errorBox}>
                <Text style={s.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Signature Violet Submit Button */}
            <Button
              title={loading ? 'Creating Account…' : 'Create Account'}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              size="large"
              style={s.submitBtn}
            />
          </View>

          {/* Switch to Login Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>Already have an account?</Text>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={loading}
              onPress={() => navigation.navigate('Login')}
              style={s.loginBtn}
            >
              <Text style={s.link}>Sign In</Text>
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
    marginBottom: 20,
  },
  logo: {
    width: 175,
    height: 51,
    marginBottom: 16,
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
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: 14,
  },
  fieldBox: {
    height: 74,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9CFE8',
    backgroundColor: '#FFFFFF',
    shadowColor: '#6D4699',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    position: 'relative',
    justifyContent: 'center',
  },
  fieldFocused: {
    borderColor: '#9C7ACB',
  },
  fieldLabel: {
    position: 'absolute',
    top: 10,
    left: 16,
    fontSize: 11,
    fontWeight: '600',
    color: '#857293',
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    color: '#3E304C',
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 8,
  },
  eyeToggleBox: {
    position: 'absolute',
    right: 14,
    top: 24,
  },
  errorBox: {
    backgroundColor: '#FFF0ED',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9C4E50',
  },
  submitBtn: {
    backgroundColor: '#7655B8',
    borderRadius: 18,
    height: 54,
    marginTop: 4,
    shadowColor: '#8A65B8',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: '#93849F',
  },
  loginBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7753B4',
  },
});
