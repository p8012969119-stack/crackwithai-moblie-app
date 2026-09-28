import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../../components/Icon';

interface PromptHeroBannerProps {
  completedCount: number;
  totalStages: number;
  currentStageId: number;
  onPressPrimaryAction: () => void;
  isAllCompleted: boolean;
  onViewCertificate?: () => void;
}

export const PromptHeroBanner: React.FC<PromptHeroBannerProps> = ({
  completedCount,
  totalStages,
  currentStageId,
  onPressPrimaryAction,
  isAllCompleted,
  onViewCertificate,
}) => {
  const percentage = Math.round((completedCount / totalStages) * 100);

  return (
    <View style={styles.heroContainer}>
      {/* Brand & Eyebrow */}
      <View style={styles.eyebrowRow}>
        <View style={styles.badgePill}>
          <Icon name="sparkles" size={13} color="#7C3AED" />
          <Text style={styles.badgeText}>CRACKWITHAI / INTERACTIVE AI</Text>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveText}>AI COACH ONLINE</Text>
        </View>
      </View>

      {/* Main Title & Value Prop */}
      <Text style={styles.title}>Prompt Engineering</Text>
      <Text style={styles.subtitle}>
        Learn how to communicate with AI clearly, get better responses, and build powerful prompts.
      </Text>

      {/* 4 Pillars Section */}
      <View style={styles.pillarsGrid}>
        <View style={styles.pillarItem}>
          <View style={[styles.pillarIconBox, { backgroundColor: '#EEF2FF' }]}>
            <Icon name="book-open" size={16} color="#4F46E5" />
          </View>
          <Text style={styles.pillarTitle}>Learn</Text>
          <Text style={styles.pillarDesc}>Understand how prompts work</Text>
        </View>

        <View style={styles.pillarItem}>
          <View style={[styles.pillarIconBox, { backgroundColor: '#FDF4FF' }]}>
            <Icon name="terminal" size={16} color="#A855F7" />
          </View>
          <Text style={styles.pillarTitle}>Practice</Text>
          <Text style={styles.pillarDesc}>Write prompts yourself</Text>
        </View>

        <View style={styles.pillarItem}>
          <View style={[styles.pillarIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Icon name="refresh-cw" size={16} color="#059669" />
          </View>
          <Text style={styles.pillarTitle}>Improve</Text>
          <Text style={styles.pillarDesc}>Get AI feedback & refine</Text>
        </View>

        <View style={styles.pillarItem}>
          <View style={[styles.pillarIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Icon name="award" size={16} color="#D97706" />
          </View>
          <Text style={styles.pillarTitle}>Master</Text>
          <Text style={styles.pillarDesc}>Build production prompts</Text>
        </View>
      </View>

      {/* Progress & CTA Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>
              {isAllCompleted ? 'Course Completed 🎉' : 'Your Learning Journey'}
            </Text>
            <Text style={styles.progressSub}>
              {completedCount} of {totalStages} topics completed ({percentage}%)
            </Text>
          </View>
          <View style={styles.percentBadge}>
            <Text style={styles.percentText}>{percentage}%</Text>
          </View>
        </View>

        {/* Progress Track */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(6, percentage)}%` }]} />
        </View>

        {/* Action Button */}
        {isAllCompleted ? (
          <TouchableOpacity
            style={styles.certificateBtn}
            activeOpacity={0.85}
            onPress={onViewCertificate}
          >
            <Icon name="award" size={18} color="#FFFFFF" />
            <Text style={styles.certificateBtnText}>View Official Certificate</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={onPressPrimaryAction}
          >
            <Text style={styles.primaryBtnText}>
              {completedCount === 0 ? 'Start Learning' : `Continue Stage ${currentStageId}`}
            </Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 18,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  pillarItem: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pillarIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pillarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  pillarDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  progressCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  primaryBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  certificateBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  certificateBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
