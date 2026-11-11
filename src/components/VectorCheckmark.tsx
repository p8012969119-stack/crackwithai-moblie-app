import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface VectorCheckmarkProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

/**
 * Mathematically precise vector checkmark drawn with native subpixel borders.
 * Never looks thin or jagged like a text character or font glyph.
 */
export const VectorCheckmark: React.FC<VectorCheckmarkProps> = ({
  size = 20,
  color = '#FFFFFF',
  strokeWidth = 3,
  style,
}) => {
  const width = size * 0.52;
  const height = size * 0.28;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <View
        style={{
          width: width,
          height: height,
          borderLeftWidth: strokeWidth,
          borderBottomWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '-45deg' }],
          marginTop: -size * 0.12,
          borderBottomLeftRadius: strokeWidth > 3 ? 1.5 : 1,
        }}
      />
    </View>
  );
};

interface CompletedBadgeProps {
  size?: number;
  badgeColor?: string;
  checkmarkColor?: string;
  style?: ViewStyle;
}

/**
 * Premium completed badge with rich emerald background,
 * subtle elevation and crisp white checkmark.
 */
export const CompletedBadge: React.FC<CompletedBadgeProps> = ({
  size = 46,
  badgeColor = '#10B981',
  checkmarkColor = '#FFFFFF',
  style,
}) => {
  return (
    <View
      style={[
        styles.badgeBase,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          backgroundColor: badgeColor,
          shadowColor: badgeColor,
        },
        style,
      ]}
    >
      <VectorCheckmark
        size={Math.round(size * 0.56)}
        color={checkmarkColor}
        strokeWidth={size >= 40 ? 3.5 : size >= 24 ? 2.5 : 2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  badgeBase: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.32,
    shadowRadius: 6,
    elevation: 4,
  },
});
