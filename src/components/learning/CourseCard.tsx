import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Course } from '../../types';
import { ToolLogo } from '../ToolLogo';
import {
  CourseProgress,
  LearningIcon,
  StatusBadge,
  learningStyles as s,
  palette,
} from './LearningLayout';

export const CourseCard = React.memo(
  ({ course, onPress }: { course: Course; onPress: () => void }) => {
    const completed = course.courseCompleted === true || course.certified === true;
    const locked = course.isLocked === true;
    const active = course.isEnrolled || Boolean(course.progressPercentage);
    const status = locked
      ? 'Locked'
      : completed
      ? 'Completed'
      : active
      ? 'In progress'
      : course.isEnrolled === false
      ? 'Not started'
      : 'Explore course';

    const lessons = course.totalLessons ?? course.totalLessonsCount;
    const counts = course as Course & {
      totalModules?: number;
      moduleCount?: number;
    };
    const modules = counts.totalModules ?? counts.moduleCount;
    const duration = course.totalEstimatedMinutes ?? course.duration;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={course.title + '. ' + status}
        accessibilityState={{
          disabled: locked,
        }}
        disabled={locked}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          locked && styles.lockedCard,
          pressed && styles.pressedCard,
        ]}
      >
        <View style={s.between}>
          <ToolLogo courseKey={course.title} slug={course.slug} logoUrl={course.logoUrl} size={46} />
          <StatusBadge
            label={status}
            tone={completed ? 'gold' : active ? 'purple' : 'neutral'}
            icon={locked ? 'lock' : completed ? 'check' : undefined}
          />
        </View>

        <View style={styles.textContainer}>
          <Text numberOfLines={2} style={styles.title}>
            {course.title}
          </Text>
          <Text numberOfLines={2} style={styles.description}>
            {course.shortDescription ||
              course.description ||
              'Open this course to explore its lessons.'}
          </Text>
        </View>

        <View style={styles.metaRow}>
          {modules != null && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{modules} Modules</Text>
            </View>
          )}
          {lessons != null && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{lessons} Lessons</Text>
            </View>
          )}
          {duration != null && duration > 0 && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{duration} min</Text>
            </View>
          )}
          {course.level && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{course.level.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {course.progressPercentage !== undefined && (
          <CourseProgress
            progress={course.progressPercentage}
            compact
            gold={completed}
            label={completed ? 'Course completed' : 'Progress'}
          />
        )}

        <View
          style={[
            styles.actionBanner,
            locked ? styles.actionBannerLocked : styles.actionBannerActive,
          ]}
        >
          <Text
            style={[
              styles.actionText,
              locked ? styles.actionTextLocked : styles.actionTextActive,
            ]}
          >
            {locked
              ? 'Locked · Complete prerequisites'
              : completed
              ? 'Review Course'
              : active
              ? 'Continue Learning'
              : 'Start Course'}
          </Text>
          <LearningIcon
            name={locked ? 'lock' : 'next'}
            size={14}
            color={locked ? palette.muted : palette.white}
          />
        </View>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  lockedCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  pressedCard: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  thumbnail: {
    width: 46,
    height: 46,
    borderRadius: 14,
  },
  textContainer: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: palette.ink,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 20,
    color: palette.muted,
    fontWeight: '400',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  metaBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  levelBadge: {
    backgroundColor: palette.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: palette.purple,
    letterSpacing: 0.5,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  actionBannerActive: {
    backgroundColor: palette.ink,
  },
  actionBannerLocked: {
    backgroundColor: '#E2E8F0',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionTextActive: {
    color: palette.white,
  },
  actionTextLocked: {
    color: palette.muted,
  },
});
