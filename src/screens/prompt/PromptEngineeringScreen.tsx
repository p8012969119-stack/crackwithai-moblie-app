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
import { PROMPT_STAGES } from './promptCourseData';

const FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';
const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

const MODULE_CARDS = [
  {
    id: 1,
    title: 'Module 1 — Beginner Foundations',
    shortDesc: 'Master Personas, Style Constraints, Audience Adaptation & Markdown Tables.',
    level: 'Beginner',
    lessonCount: 4,
    stageIds: [1, 2, 3, 4],
    cardBg: '#FFB870', // Bright Apricot Orange (matching Fullstack HTML card)
    accentColor: '#D97706',
    icon: 'code'
  },
  {
    id: 2,
    title: 'Module 2 — Intermediate Prompting',
    shortDesc: 'Master Few-Shot Examples, Content Summarization, Tone Modulation & Brainstorming.',
    level: 'Intermediate',
    lessonCount: 4,
    stageIds: [5, 6, 7, 8],
    cardBg: '#74C0FC', // Vibrant Sky Blue (matching Fullstack CSS card)
    accentColor: '#2563EB',
    icon: 'terminal'
  },
  {
    id: 3,
    title: 'Module 3 — Advanced Engineering',
    shortDesc: 'Master Chain-of-Thought Reasoning, Defensive Guardrails & Secure Code.',
    level: 'Advanced',
    lessonCount: 4,
    stageIds: [9, 10, 11, 12],
    cardBg: '#C490FF', // Vibrant Lavender Purple (matching Fullstack Capstone card)
    accentColor: '#7C3AED',
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
            colors={['#111827']}
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

        {/* VIEW 1: ONLY BRIGHT FULLSTACK-STYLE MODULE CARDS */}
        {selectedModuleId === null ? (
          <View style={styles.modulesStack}>
            {MODULE_CARDS.map((mod) => {
              const completedInModule = mod.stageIds.filter((id) =>
                completedStageIds.includes(id)
              ).length;

              return (
                <TouchableOpacity
                  key={`module-card-${mod.id}`}
                  style={[
                    styles.fullstackCourseCard,
                    { backgroundColor: mod.cardBg }
                  ]}
                  activeOpacity={0.88}
                  onPress={() => setSelectedModuleId(mod.id)}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.iconCircleBg}>
                      <Icon name={mod.icon as any} size={28} color="#0F172A" />
                    </View>

                    <View style={styles.cardHeaderCenter}>
                      <Text style={styles.courseName}>{mod.title}</Text>
                      <Text style={styles.courseSubtitle}>{mod.shortDesc}</Text>
                    </View>
                  </View>

                  <View style={styles.cardBottomRow}>
                    <View style={styles.ctaButton}>
                      <Text style={styles.ctaButtonText}>Start</Text>
                      <Icon name="arrow-right" size={15} color="#FFFFFF" />
                    </View>

                    <Text style={styles.progressCounterText}>
                      {completedInModule}/{mod.lessonCount} Lessons
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {isAllCompleted && (
              <TouchableOpacity
                style={styles.certBtn}
                activeOpacity={0.85}
                onPress={handleViewCertificate}
              >
                <Icon name="award" size={18} color="#FFFFFF" />
                <Text style={styles.certBtnText}>View Official Certificate 🎉</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* VIEW 2: LESSONS LIST FOR SELECTED MODULE */
          <View style={styles.viewBlock}>
            {/* Selected Module Banner Header */}
            {selectedModule && (
              <View
                style={[
                  styles.moduleBannerHeaderCard,
                  { backgroundColor: selectedModule.cardBg }
                ]}
              >
                <View style={styles.bannerHeaderTop}>
                  <Icon name={selectedModule.icon as any} size={26} color="#0F172A" />
                  <Text style={styles.modBannerLevel}>
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

            {/* 4 Lessons Cards for this Module */}
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
                      { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                      isActive && { borderColor: '#111827', borderWidth: 2 }
                    ]}
                    activeOpacity={0.88}
                    onPress={() => handleOpenStage(stg.id)}
                  >
                    <View style={[styles.cardLeftBar, { backgroundColor: selectedModule?.cardBg || '#111827' }]} />

                    <View style={styles.cardInnerContent}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.numBadgePill}>
                          <Text style={styles.numBadgeText}>
                            LESSON {stageNumFormatted}
                          </Text>
                        </View>

                        <View style={styles.diffBadge}>
                          <Text style={styles.diffBadgeText}>
                            {stg.category}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.stageTitleText}>{stg.title}</Text>
                      <Text style={styles.stageSubtitleText} numberOfLines={2}>
                        {stg.subtitle}
                      </Text>

                      <View style={styles.lessonCardBottomRow}>
                        <View
                          style={[
                            styles.statusPill,
                            isCompleted && { backgroundColor: '#10B981' },
                            isActive && !isCompleted && { backgroundColor: '#111827' }
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
                        <Icon name="chevron-right" size={18} color="#0F172A" />
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
    paddingVertical: 10,
    marginBottom: 12,
  },
  backBtnText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  modulesStack: {
    gap: 18,
    marginTop: 4,
  },
  fullstackCourseCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  iconCircleBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderCenter: {
    flex: 1,
  },
  courseName: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  courseSubtitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 4,
  },
  ctaButtonText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  progressCounterText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    opacity: 0.8,
  },

  /* Certificate Button */
  certBtn: {
    marginTop: 10,
    backgroundColor: '#059669',
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  certBtnText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* View 2 Styles */
  viewBlock: {
    gap: 12,
  },
  moduleBannerHeaderCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  modBannerLevel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  modBannerTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modBannerDesc: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 19,
  },
  sectionHeaderRow: {
    marginTop: 4,
    marginBottom: 4,
  },
  sectionHeadingTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionHeadingSub: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  numBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  diffBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  stageTitleText: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  stageSubtitleText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
  },
  lessonCardBottomRow: {
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
  },
});
