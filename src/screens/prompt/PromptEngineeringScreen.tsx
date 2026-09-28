import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../store/AuthContext';
import { storage } from '../../services/storage';
import { fullstackApi } from '../../api/fullstackApi';
import { certificateApi } from '../../api/certificateApi';
import { Certificate } from '../../types';
import { Icon } from '../../components/Icon';
import { CertificateModal } from '../../components/CertificateModal';
import { PROMPT_STAGES, PromptStage } from './promptCourseData';

const FONT_FAMILY = Platform.OS === 'android' ? undefined : 'System';

const MODULE_CARDS = [
  {
    id: 1,
    title: 'Module 1 — Beginner Foundations',
    shortDesc: 'Master Personas, Style Constraints, Target Audience Adaptation & Markdown Tables.',
    level: 'Beginner',
    lessonCount: 4,
    stageIds: [1, 2, 3, 4],
    accentColor: '#059669',
    cardBg: '#ECFDF5',
    borderColor: '#6EE7B7',
    badgeBg: '#D1FAE5',
    icon: 'code'
  },
  {
    id: 2,
    title: 'Module 2 — Intermediate Prompting',
    shortDesc: 'Master Few-Shot Examples, Content Summarization, Tone Modulation & Brainstorming.',
    level: 'Intermediate',
    lessonCount: 4,
    stageIds: [5, 6, 7, 8],
    accentColor: '#2563EB',
    cardBg: '#EFF6FF',
    borderColor: '#93C5FD',
    badgeBg: '#DBEAFE',
    icon: 'terminal'
  },
  {
    id: 3,
    title: 'Module 3 — Advanced Engineering',
    shortDesc: 'Master Chain-of-Thought Reasoning, Defensive Guardrails, Meta-Prompting & Secure Code.',
    level: 'Advanced',
    lessonCount: 4,
    stageIds: [9, 10, 11, 12],
    accentColor: '#7C3AED',
    cardBg: '#F5F3FF',
    borderColor: '#C4B5FD',
    badgeBg: '#EDE9FE',
    icon: 'shield'
  }
];

export const PromptEngineeringScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [completedStageIds, setCompletedStageIds] = useState<number[]>([1]);
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [certificateModalVisible, setCertificateModalVisible] = useState<boolean>(false);
  const [earnedCertificate, setEarnedCertificate] = useState<Certificate | null>(null);

  const storageKey = `@crackwithai_prompt_progress_${user?._id || 'guest'}`;

  const loadProgress = useCallback(async () => {
    try {
      const stored = await storage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.completedStageIds) && parsed.completedStageIds.length > 0) {
          setCompletedStageIds(parsed.completedStageIds);
          if (parsed.activeStageId) {
            setActiveStageId(parsed.activeStageId);
          }
        }
      }

      // Sync backend progress if available
      try {
        const backendProgress = await fullstackApi.getProgress('prompt-engineering');
        if (backendProgress?.completedLessonIds?.length) {
          const count = Math.min(12, Math.max(1, Math.ceil((backendProgress.completedLessonIds.length / 12) * 12)));
          const stageList = Array.from({ length: count }, (_, i) => i + 1);
          setCompletedStageIds((prev) => Array.from(new Set([...prev, ...stageList])));
        }
      } catch {}
    } catch {} finally {
      setRefreshing(false);
    }
  }, [storageKey]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const completedCount = completedStageIds.length;
  const totalStages = PROMPT_STAGES.length;
  const percentage = Math.round((completedCount / totalStages) * 100);
  const isAllCompleted = completedCount >= totalStages;

  const handleOpenStage = (stageId: number) => {
    navigation.navigate('PromptStageDetail', { stageId });
  };

  const handleViewCertificate = async () => {
    if (earnedCertificate) {
      setCertificateModalVisible(true);
      return;
    }
    try {
      const myCerts = await certificateApi.getMyCertificates();
      const promptCert = myCerts?.data?.find(
        (c: any) =>
          c.courseName?.toLowerCase().includes('prompt') ||
          c.course?.title?.toLowerCase().includes('prompt')
      );
      if (promptCert) {
        setEarnedCertificate(promptCert);
        setCertificateModalVisible(true);
        return;
      }
    } catch {}

    const certNumber = `CWA-PROMPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const certData: Certificate = {
      _id: `cert-prompt-${Date.now()}`,
      user: user?._id || 'guest',
      course: 'prompt-engineering',
      certificateId: certNumber,
      certificateNumber: certNumber,
      verificationCode: certNumber,
      recipientName: user?.fullName || user?.name || 'AI Prompt Engineer',
      userName: user?.fullName || user?.name || 'AI Prompt Engineer',
      courseName: 'Prompt Engineering Mastery',
      issueDate: new Date().toISOString(),
      issuedAt: new Date().toISOString(),
      percentage: 100,
      status: 'active',
    };
    setEarnedCertificate(certData);
    setCertificateModalVisible(true);
  };

  const selectedModule = MODULE_CARDS.find((m) => m.id === selectedModuleId);
  const moduleLessons = selectedModule
    ? PROMPT_STAGES.filter((s) => selectedModule.stageIds.includes(s.id))
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProgress();
            }}
            colors={['#5653FE']}
          />
        }
      >
        {/* Back Navigation Header */}
        {selectedModuleId === null ? (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>‹ Back to dashboard</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setSelectedModuleId(null)}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>‹ Back to all modules</Text>
          </TouchableOpacity>
        )}

        {/* VIEW 1: SELECT A MODULE */}
        {selectedModuleId === null ? (
          <View style={styles.viewBlock}>
            {/* Page Title */}
            <Text style={styles.eyebrow}>CRACKWITHAI / COURSES</Text>
            <Text style={styles.title}>PROMPT ENGINEERING</Text>
            <Text style={styles.subtitle}>
              Select a module below to view its 4 interactive lessons & start reading and practicing.
            </Text>

            {/* Minimal Progress Card */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressTitle}>
                  {isAllCompleted ? 'Course Completed 🎉' : 'Overall Course Progress'}
                </Text>
                <Text style={styles.progressPercent}>{percentage}%</Text>
              </View>

              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${Math.max(6, percentage)}%` }]} />
              </View>

              <Text style={styles.progressSub}>
                {completedCount} of {totalStages} Lessons Completed
              </Text>

              {isAllCompleted ? (
                <TouchableOpacity
                  style={styles.certBtn}
                  activeOpacity={0.85}
                  onPress={handleViewCertificate}
                >
                  <Icon name="award" size={16} color="#FFFFFF" />
                  <Text style={styles.certBtnText}>View Official Certificate</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeadingTitle}>Course Modules</Text>
              <Text style={styles.sectionHeadingSub}>Tap any module to view its lessons</Text>
            </View>

            {/* 3 Colorful Module Cards */}
            <View style={styles.modulesStack}>
              {MODULE_CARDS.map((mod) => {
                const completedInModule = mod.stageIds.filter((id) =>
                  completedStageIds.includes(id)
                ).length;
                const modPercent = Math.round((completedInModule / mod.lessonCount) * 100);

                return (
                  <TouchableOpacity
                    key={`module-card-${mod.id}`}
                    style={[
                      styles.heroModuleCard,
                      { backgroundColor: mod.cardBg, borderColor: mod.borderColor }
                    ]}
                    activeOpacity={0.88}
                    onPress={() => setSelectedModuleId(mod.id)}
                  >
                    {/* Top Level Pill & Icon */}
                    <View style={styles.modCardTopRow}>
                      <View style={[styles.modLevelPill, { backgroundColor: mod.badgeBg }]}>
                        <Text style={[styles.modLevelText, { color: mod.accentColor }]}>
                          MODULE {mod.id} · {mod.level.toUpperCase()}
                        </Text>
                      </View>
                      <View style={[styles.modIconCircle, { backgroundColor: mod.badgeBg }]}>
                        <Icon name={mod.icon as any} size={18} color={mod.accentColor} />
                      </View>
                    </View>

                    {/* Title & Short Description */}
                    <Text style={styles.modCardTitle}>{mod.title}</Text>
                    <Text style={styles.modCardDesc}>{mod.shortDesc}</Text>

                    {/* Progress Bar & CTA */}
                    <View style={styles.modCardBottomRow}>
                      <View style={styles.modProgressInfo}>
                        <View style={styles.modProgressTrack}>
                          <View
                            style={[
                              styles.modProgressFill,
                              { width: `${Math.max(8, modPercent)}%`, backgroundColor: mod.accentColor }
                            ]}
                          />
                        </View>
                        <Text style={styles.modProgressText}>
                          {completedInModule} of {mod.lessonCount} Lessons Completed
                        </Text>
                      </View>

                      <View style={[styles.modCtaBtn, { backgroundColor: mod.accentColor }]}>
                        <Text style={styles.modCtaText}>Explore Lessons ➔</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          /* VIEW 2: LESSONS LIST FOR SELECTED MODULE */
          <View style={styles.viewBlock}>
            {/* Selected Module Banner Header */}
            {selectedModule && (
              <View
                style={[
                  styles.moduleBannerHeaderCard,
                  { backgroundColor: selectedModule.cardBg, borderColor: selectedModule.borderColor }
                ]}
              >
                <View style={[styles.modLevelPill, { backgroundColor: selectedModule.badgeBg, alignSelf: 'flex-start' }]}>
                  <Text style={[styles.modLevelText, { color: selectedModule.accentColor }]}>
                    MODULE {selectedModule.id} · {selectedModule.level.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.modBannerTitle}>{selectedModule.title}</Text>
                <Text style={styles.modBannerDesc}>{selectedModule.shortDesc}</Text>
              </View>
            )}

            {/* Section Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeadingTitle}>Module Lessons</Text>
              <Text style={styles.sectionHeadingSub}>
                Tap any lesson below to read the technique & practice
              </Text>
            </View>

            {/* 4 Colorful Lesson Cards for this Module */}
            <View style={styles.lessonsStack}>
              {moduleLessons.map((stg) => {
                const isCompleted = completedStageIds.includes(stg.id);
                const isActive = activeStageId === stg.id;
                const stageNumFormatted = stg.id < 10 ? `0${stg.id}` : `${stg.id}`;

                return (
                  <TouchableOpacity
                    key={`lesson-card-${stg.id}`}
                    style={[
                      styles.colorLessonCard,
                      { backgroundColor: selectedModule?.cardBg, borderColor: selectedModule?.borderColor },
                      isActive && { borderColor: selectedModule?.accentColor, borderWidth: 2 }
                    ]}
                    activeOpacity={0.88}
                    onPress={() => handleOpenStage(stg.id)}
                  >
                    {/* Left Color Accent Bar */}
                    <View style={[styles.cardLeftBar, { backgroundColor: selectedModule?.accentColor }]} />

                    <View style={styles.cardInnerContent}>
                      {/* Top Row: Number & Category */}
                      <View style={styles.cardTopRow}>
                        <View style={[styles.numBadgePill, { backgroundColor: selectedModule?.badgeBg }]}>
                          <Text style={[styles.numBadgeText, { color: selectedModule?.accentColor }]}>
                            LESSON {stageNumFormatted}
                          </Text>
                        </View>

                        <View style={[styles.diffBadge, { backgroundColor: selectedModule?.badgeBg }]}>
                          <Text style={[styles.diffBadgeText, { color: selectedModule?.accentColor }]}>
                            {stg.category}
                          </Text>
                        </View>
                      </View>

                      {/* Title & Subtitle */}
                      <Text style={styles.stageTitleText}>{stg.title}</Text>
                      <Text style={styles.stageSubtitleText} numberOfLines={2}>
                        {stg.subtitle}
                      </Text>

                      {/* Bottom Footer Action */}
                      <View style={styles.cardBottomRow}>
                        <View
                          style={[
                            styles.statusPill,
                            isCompleted && { backgroundColor: '#10B981' },
                            isActive && !isCompleted && { backgroundColor: selectedModule?.accentColor }
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              (isCompleted || (isActive && !isCompleted)) && { color: '#FFFFFF' }
                            ]}
                          >
                            {isCompleted ? 'Completed ✓' : isActive ? 'In Progress ⚡' : 'Read & Practice ▶'}
                          </Text>
                        </View>
                        <Icon name="chevron-right" size={18} color={selectedModule?.accentColor} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Certificate Modal */}
      {earnedCertificate && (
        <CertificateModal
          visible={certificateModalVisible}
          certificate={earnedCertificate}
          onClose={() => setCertificateModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 60,
  },
  backBtn: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5653FE',
  },
  viewBlock: {
    gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5653FE',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#5653FE',
    padding: 18,
    marginBottom: 12,
    shadowColor: '#5653FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5653FE',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#EEEDFF',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5653FE',
    borderRadius: 4,
  },
  progressSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  certBtn: {
    marginTop: 12,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  certBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    marginTop: 8,
    marginBottom: 6,
  },
  sectionHeadingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionHeadingSub: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },

  /* 3 Hero Module Cards */
  modulesStack: {
    gap: 16,
    marginTop: 4,
  },
  heroModuleCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  modCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modLevelPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modLevelText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modCardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 16,
  },
  modCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modProgressInfo: {
    flex: 1,
  },
  modProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  modProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  modProgressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  modCtaBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modCtaText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Module Banner Header in View 2 */
  moduleBannerHeaderCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 8,
  },
  modBannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 4,
  },
  modBannerDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },

  /* Lessons List Cards */
  lessonsStack: {
    gap: 12,
    marginTop: 4,
  },
  colorLessonCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLeftBar: {
    width: 6,
  },
  cardInnerContent: {
    flex: 1,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  numBadgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  numBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  stageTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  stageSubtitleText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  statusPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  }
});
