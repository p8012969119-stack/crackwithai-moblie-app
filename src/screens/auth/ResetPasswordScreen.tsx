import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../../api/authApi';
import { Button } from '../../components/Button';
import { AnimatedEyeToggle } from '../../components/AnimatedAuthIcons';

const gradient = ['#EEE7FC', '#F0E9FC', '#F2ECFD', '#F4EFFD', '#F6F2FD', '#F8F5FE', '#FAF8FE', '#FCFAFF', '#FDFCFF', '#FFFFFF'];

export const ResetPasswordScreen = ({ route, navigation }: any) => {
  const email = route?.params?.email || '';
  const otp = route?.params?.otp || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const clearError = () => setErrorMessage(null);

  const handleResetPassword = async () => {
    clearError();
    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword({ email, otp, password: newPassword });
      setSuccessModalVisible(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. Please try again.');
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
          {/* Brand Header with Official CrackWithAI Logo */}
          <View style={s.brand}>
            <Image
              source={require('../../assets/images/logo/crackwithai.png')}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={s.heading}>Create New Password</Text>
            <Text style={s.subtitle}>
              Enter a new secure password for your CrackWithAI account.
            </Text>
          </View>

          {/* Form Fields matching Login's violet card design */}
          <View style={s.form}>
            {/* New Password Field */}
            <View style={[s.fieldBox, newPasswordFocused && s.fieldFocused]}>
              <Text style={s.fieldLabel}>New Password</Text>
              <TextInput
                placeholder="Enter new password"
                placeholderTextColor="#A094B3"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                value={newPassword}
                editable={!loading}
                onFocus={() => setNewPasswordFocused(true)}
                onBlur={() => setNewPasswordFocused(false)}
                onChangeText={(text) => {
                  clearError();
                  setNewPassword(text);
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
            <View style={[s.fieldBox, confirmPasswordFocused && s.fieldFocused]}>
              <Text style={s.fieldLabel}>Confirm New Password</Text>
              <TextInput
                placeholder="Confirm new password"
                placeholderTextColor="#A094B3"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                value={confirmPassword}
                editable={!loading}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                onChangeText={(text) => {
                  clearError();
                  setConfirmPassword(text);
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

            {/* Error Container */}
            {!!errorMessage && (
              <View accessibilityLiveRegion="polite" style={s.errorBox}>
                <Text style={s.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Signature Violet Submit Button */}
            <Button
              title={loading ? 'Resetting Password…' : 'Reset Password'}
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading}
              size="large"
              style={s.submitBtn}
            />
          </View>

          {/* Back to Sign In Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>Remember your password?</Text>
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

      {/* Success Dialog Modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.checkBadge}>
              <Text style={s.checkEmoji}>🎉</Text>
            </View>
            <Text style={s.modalTitle}>Password Reset Successful</Text>
            <Text style={s.modalSub}>
              Your password has been updated successfully. You can now sign in with your new password.
            </Text>
            <Button
              title="Sign In"
              size="large"
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.navigate('Login');
              }}
              style={s.submitBtn}
            />
          </View>
        </View>
      </Modal>
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
    elevation: 2,
    marginBottom: 14,
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
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
    fontSize: 15,
    color: '#3E304C',
    paddingTop: 18,
    paddingBottom: 2,
    paddingRight: 40,
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
    marginBottom: 14,
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
    marginTop: 6,
    shadowColor: '#8A65B8',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 3,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 48, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#6D4699',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  checkBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3EDFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkEmoji: {
    fontSize: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#30243E',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    lineHeight: 19,
    color: '#8B7C9C',
    textAlign: 'center',
    marginBottom: 22,
  },
});
