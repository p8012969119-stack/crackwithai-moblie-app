import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { authApi } from '../../api/authApi';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { AnimatedEyeToggle } from '../../components/AnimatedAuthIcons';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export const ResetPasswordScreen = ({ route, navigation }: any) => {
  const email = route?.params?.email || '';
  const otp = route?.params?.otp || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleResetPassword = async () => {
    setErrorMessage(null);
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
      // Reset password using backend API
      await authApi.resetPassword({ email, otp, password: newPassword });
      setSuccessModalVisible(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. Please try again.');
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
          <Text style={styles.cardTitle}>Create New Password</Text>
          <Text style={styles.cardSubtitle}>
            Enter a new password for your account to complete reset.
          </Text>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Input
            label="New Password"
            placeholder="Enter new password"
            isPassword
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={(text) => {
              setErrorMessage(null);
              setNewPassword(text);
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
            placeholder="Confirm new password"
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
            title={loading ? 'Resetting Password...' : 'Reset Password'}
            variant="primary"
            size="large"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            style={styles.submitBtn}
            textStyle={styles.submitBtnText}
          />
        </View>
      </ScrollView>

      {/* Success Dialog Modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.checkBadge}>
              <Text style={styles.checkEmoji}>🎉</Text>
            </View>
            <Text style={styles.modalTitle}>Password Reset Successful</Text>
            <Text style={styles.modalSub}>
              Your password has been updated successfully. You can now sign in with your new password.
            </Text>
            <Button
              title="Sign In"
              variant="primary"
              size="large"
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.navigate('Login');
              }}
              style={styles.modalBtn}
              textStyle={styles.submitBtnText}
            />
          </View>
        </View>
      </Modal>
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
  cardTitle: {
    fontSize: 24,
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
    borderRadius: 28, // Fully curved
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  checkBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  checkEmoji: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalBtn: {
    width: '100%',
    backgroundColor: '#5653fe',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
