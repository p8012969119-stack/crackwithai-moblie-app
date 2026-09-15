import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Lesson } from '../types';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Icon } from './Icon';

interface LessonCardProps {
  lesson: Lesson;
  index?: number;
  onPress: () => void;
  isUnlocked?: boolean;
  isCurrent?: boolean;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  index,
  onPress,
  isUnlocked = true,
  isCurrent = false,
}) => {
  const isCompleted = lesson.isCompleted;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!isUnlocked}
      style={[
        styles.card,
        isCurrent && styles.cardCurrent,
        isCompleted && styles.cardCompleted,
        !isUnlocked && styles.cardLocked,
      ]}
      onPress={onPress}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.badge,
            isCompleted
              ? styles.badgeCompleted
              : isCurrent
              ? styles.badgeCurrent
              : isUnlocked
              ? styles.badgeUnlocked
              : styles.badgeLocked,
          ]}
        >
          {isCompleted ? (
            <Icon name="check-circle" size={16} color="#FFFFFF" />
          ) : !isUnlocked ? (
            <Icon name="lock" size={14} color={COLORS.textMuted} />
          ) : (
            <Text style={[styles.badgeText, isCurrent && styles.badgeTextCurrent]}>
              {(index !== undefined ? index + 1 : lesson.order) || '•'}
            </Text>
          )}
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                isCurrent && styles.titleCurrent,
                isCompleted && styles.titleCompleted,
                !isUnlocked && styles.titleLocked,
              ]}
              numberOfLines={1}
            >
              {lesson.title}
            </Text>
            {isCurrent && (
              <View style={styles.currentTag}>
                <Text style={styles.currentTagText}>CURRENT</Text>
              </View>
            )}
          </View>
          <Text style={styles.duration} numberOfLines={1}>
            {lesson.duration ? `${lesson.duration} mins` : '15 mins'}
            {lesson.topics && lesson.topics.length > 0 ? ` • ${lesson.topics.length} topics` : ' • 3 topics'}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {isUnlocked ? (
          <Icon name="chevron-right" size={18} color={isCurrent ? COLORS.primary : COLORS.textSecondary} />
        ) : (
          <Icon name="lock" size={16} color={COLORS.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardCurrent: {
    backgroundColor: COLORS.badgePurpleBg,
    borderColor: COLORS.primary,
  },
  cardLocked: {
    backgroundColor: '#FAFAFC',
    borderColor: COLORS.border,
    opacity: 0.65,
  },
  cardCompleted: {
    backgroundColor: COLORS.badgeSuccessBg,
    borderColor: '#A7F3D0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: SPACING.sm,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  badgeUnlocked: {
    backgroundColor: COLORS.primaryLight,
  },
  badgeCurrent: {
    backgroundColor: COLORS.primary,
  },
  badgeCompleted: {
    backgroundColor: COLORS.success,
  },
  badgeLocked: {
    backgroundColor: COLORS.border,
  },
  badgeText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
  },
  badgeTextCurrent: {
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    flexShrink: 1,
  },
  titleCurrent: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  titleLocked: {
    color: COLORS.textMuted,
  },
  titleCompleted: {
    color: COLORS.badgeSuccessText,
  },
  currentTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  currentTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  duration: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
    color: COLORS.textSecondary,
  },
  rightSection: {
    marginLeft: SPACING.xs,
  },
});

