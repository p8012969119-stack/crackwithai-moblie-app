import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'purple' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'purple':
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
        };
      case 'medium':
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
        };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{disabled:disabled || loading,busy:loading}}
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[
        styles.baseContainer,
        variantStyle.container,
        sizeStyle.container,
        (disabled || loading) && styles.disabledContainer,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#5653fe' : '#FFFFFF'}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.baseText,
              variantStyle.text,
              sizeStyle.text,
              disabled && styles.disabledText,
              leftIcon ? { marginLeft: SPACING.xs } : null,
              rightIcon ? { marginRight: SPACING.xs } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28, // Fully curved / pill shape
  },
  baseText: {
    ...TYPOGRAPHY.button,
    textAlign: 'center',
    includeFontPadding: false,
  },
  // Primary CTA is Brand Violet #5653fe
  primaryContainer: {
    backgroundColor: '#5653fe',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryContainer: {
    backgroundColor: '#EEEDFF',
  },
  secondaryText: {
    color: '#5653fe',
    fontWeight: '600',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#5653fe',
  },
  outlineText: {
    color: '#5653fe',
    fontWeight: '600',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#5653fe',
  },
  dangerContainer: {
    backgroundColor: COLORS.danger,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  // Sizes
  smallContainer: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
  },
  smallText: {
    fontSize: 14,
  },
  mediumContainer: {
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
  mediumText: {
    fontSize: 16,
  },
  largeContainer: {
    height: 56,
    paddingHorizontal: 28,
    borderRadius: 28, // Fully curved
  },
  largeText: {
    fontSize: 17,
    fontWeight: '700',
  },
  // Disabled
  disabledContainer: {
    opacity: 0.55,
  },
  disabledText: {
    color: '#FFFFFF',
  },
});
