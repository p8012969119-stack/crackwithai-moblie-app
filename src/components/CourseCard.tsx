import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Course } from '../types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { Icon } from './Icon';
import { ToolLogo } from './ToolLogo';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
  onStartOrContinue?: () => void;
  horizontal?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPress,
  onStartOrContinue,
  horizontal = false,
}) => {
  const progress = Number.isFinite(course.progressPercentage) ? Math.max(0, Math.min(100, course.progressPercentage!)) : 0;
  const isCompleted = course.courseCompleted === true || course.certified === true;
  const isEnrolled = course.isEnrolled || progress > 0;
  const isLocked = course.isLocked || false;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      disabled={isLocked}
      style={[
        styles.card,
        horizontal ? styles.cardHorizontal : styles.cardVertical,
        isLocked && styles.cardLocked,
      ]}
      onPress={onPress}
    >
      {/* 1. Course Image Visual Banner */}
      <View style={styles.imageWrapper}>
        <View style={{padding:20,backgroundColor:'#EEEDFF',height:112,justifyContent:'center'}}><ToolLogo courseKey={course.title} slug={course.slug} logoUrl={course.logoUrl}/></View>

        {/* Gold Completion Badge */}
        {isCompleted && (
          <View style={styles.goldTickBadge}>
            <Icon name="check-circle" size={24} color="#956300" />
          </View>
        )}
      </View>

      {/* 2. Card Content & Meta Info */}
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {course.title}
          </Text>
          {isCompleted && (
            <View style={styles.goldTickInline}>
              <Icon name="check-circle" size={16} color="#F59E0B" />
            </View>
          )}
        </View>

        <Text style={styles.metaSubtitle} numberOfLines={2}>{course.shortDescription || course.description}</Text>
        {/* Subtitle / Lessons & Duration Meta */}
        <Text style={styles.metaSubtitle} numberOfLines={1}>
          {course.totalLessons ?? course.totalLessonsCount ?? 0} Lessons • {course.duration ?? 0} mins
        </Text>

        {/* Progress Indicator State */}
        <View style={styles.progressContainer}>
          {isCompleted ? (
            <View style={styles.completedProgressRow}>
              <View style={styles.completedProgressBarBg}>
                <View style={styles.completedProgressBarFill} />
              </View>
              <Text style={styles.completedPercentText}>100% Complete</Text>
            </View>
          ) : isEnrolled ? (
            <View style={styles.inProgressRow}>
              <View style={styles.inProgressTrack}>
                <View style={[styles.inProgressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.inProgressText}>{progress}% · In Progress</Text>
            </View>
          ) : (
            <View style={styles.notStartedRow}>
              <View style={styles.notStartedDot} />
              <Text style={styles.notStartedText}>Not Started</Text>
            </View>
          )}
        </View>

        {/* Action Button - Start Course / Continue */}
        <TouchableOpacity
          style={[styles.actionBtn, isLocked && styles.actionBtnDisabled]}
          onPress={onStartOrContinue || onPress}
          disabled={isLocked}
        >
          <Text style={styles.actionBtnText}>
            {isCompleted ? 'Review Course ›' : isEnrolled ? 'Continue Course ›' : 'Start Course ›'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.medium,
  },
  cardVertical: {
    width: '100%',
  },
  cardHorizontal: {
    width: 285,
    marginRight: SPACING.md,
  },
  cardLocked: {
    opacity: 0.65,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
  },
  brandWatermark: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  brandWatermarkText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.4,
  },
  goldTickBadge: {
    position: 'absolute',
    top: 10,
    left: 12,
    backgroundColor: '#FEF3C7',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  content: {
    padding: SPACING.md + 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  goldTickInline: {
    marginLeft: 6,
  },
  metaSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 14,
  },
  completedProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedProgressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  completedProgressBarFill: {
    height: '100%',
    width: '100%',
    backgroundColor: '#F59E0B',
  },
  completedPercentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 8,
  },
  inProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inProgressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  inProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  inProgressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 8,
  },
  notStartedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notStartedDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#94A3B8',
    marginRight: 6,
  },
  notStartedText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: '#5653fe',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5653fe',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
