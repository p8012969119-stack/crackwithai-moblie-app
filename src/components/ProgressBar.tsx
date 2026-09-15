import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 100
  showLabel?: boolean;
  height?: number;
  barColor?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
  height = 8,
  barColor = COLORS.primary,
  backgroundColor = COLORS.border,
  style,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress || 0)));

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { height, backgroundColor, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              height,
              backgroundColor: barColor,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
      {showLabel && <Text style={styles.label}>{clampedProgress}%</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  label: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    minWidth: 36,
    textAlign: 'right',
  },
});
