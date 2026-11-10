import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Platform,
  Alert
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
    icon: 'code'
  },
  {
    id: 2,
    title: 'Module 2 — Intermediate Prompting',
    shortDesc: 'Master Few-Shot Examples, Content Summarization, Tone Modulation & Brainstorming.',
    level: 'Intermediate',
    lessonCount: 4,
    stageIds: [5, 6, 7, 8],
    icon: 'terminal'
  },
  {
    id: 3,
    title: 'Module 3 — Advanced Engineering',
    shortDesc: 'Master Chain-of-Thought Reasoning, Defensive Guardrails & Secure Code.',
    level: 'Advanced',
    lessonCount: 4,
    stageIds: [9, 10, 11, 12],
    icon: 'shield'
  }
];

export const PromptEngineeringScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [completedStageIds, setCompletedStageIds] = useState<number[]>([]);
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [certificateModalVisible, setCertificateModalVisible] = useState<boolean>(false);
  const [earnedCertificate, setEarnedCertificate] = useState<Certificate | null>(null);

  const storageKey = `@crackwithai_prompt_progress_${user?._id || 'guest'}`;

  const loadProgress = useCallback(async () => {
    try {
      let localList: number[] = [];

      // 1. Read user-specific prompt progress storage
      const stored = await storage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.completedStageIds)) {
            localList = parsed.completedStageIds;
          }
          if (parsed.activeStageId) {
            setActiveStageId(parsed.activeStageId);
          }
        } catch {}
      }

      // 2. Read fast local storage from fullstackApi
      const rawStoredLessons = await storage.getItem('@cwa_completed_lessons_prompt-engineering');
      if (rawStoredLessons) {
        try {
          const parsedSlugs = JSON.parse(rawStoredLessons);
          if (Array.isArray(parsedSlugs)) {
            parsedSlugs.forEach((s: string) => {
              const matched = PROMPT_STAGES.find(stg => stg.slug === s || String(stg.id) === s);
              if (matched && !localList.includes(matched.id)) {
                localList.push(matched.id);
              }
            });
          }
        } catch {}
      }

      // 3. Sync with backend progress
      try {
        const backendProgress = await fullstackApi.getProgress('prompt-engineering');
        if (backendProgress?.completedLessonIds?.length) {
          backendProgress.completedLessonIds.forEach((s: string) => {
            const matched = PROMPT_STAGES.find(stg => stg.slug === s || String(stg.id) === s);
            if (matched && !localList.includes(matched.id)) {
              localList.push(matched.id);
            }
          });
        }
      } catch {}

      const finalList = Array.from(new Set(localList));
      setCompletedStageIds(finalList);

      const nextUncompleted = PROMPT_STAGES.find(s => !finalList.includes(s.id));
      if (nextUncompleted) {
        setActiveStageId(nextUncompleted.id);
      } else if (finalList.length >= 12) {
        setActiveStageId(12);
      }
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
    const isUnlocked = stageId === 1 || completedStageIds.includes(stageId - 1) || completedStageIds.includes(stageId);
    if (!isUnlocked) {
      Alert.alert(
        'Lesson Locked 🔒',
        `Please complete Lesson ${stageId - 1} (${PROMPT_STAGES[stageId - 2]?.title || ''}) before starting this lesson.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: `Go to Lesson ${stageId - 1}`, onPress: () => navigation.navigate('PromptStageDetail', { stageId: stageId - 1 }) }
        ]
      );
      return;
    }
    navigation.navigate('PromptStageDetail', { stageId });
  };

  const handleViewCertificate = async () => {
    if (earnedCertificate) {
      setCertificateModalVisible(true);
      return;
    }

    try {
      const courseCert = await fullstackApi.getCertificate('prompt-engineering');
      if (courseCert) {
        const certData: Certificate = {
          _id: courseCert.id || `cert-prompt-${Date.now()}`,
          user: user?._id || 'guest',
          course: 'prompt-engineering',
          certificateId: courseCert.verificationId || courseCert.id,
          certificateNumber: courseCert.verificationId || courseCert.id,
          verificationCode: courseCert.verificationId || courseCert.id,
          recipientName: courseCert.studentName || user?.fullName || user?.name || 'AI Prompt Engineer',
          userName: courseCert.studentName || user?.fullName || user?.name || 'AI Prompt Engineer',
          courseName: courseCert.courseTitle || 'Prompt Engineering Mastery',
          issueDate: courseCert.completedDate || new Date().toISOString(),
          issuedAt: courseCert.completedDate || new Date().toISOString(),
          percentage: 100,
          status: 'active',
        };
        setEarnedCertificate(certData);
        setCertificateModalVisible(true);
        return;
      }
    } catch {}

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

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (selectedModuleId === null ? navigation.goBack() : setSelectedModuleId(null))}
        >
          <Icon name="chevron-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {selectedModuleId === null ? 'Prompt Engineering' : selectedModule?.title || 'Module Lessons'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

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
            colors={['#7C3AED']}
          />
        }
      >
        {/* VIEW 1: MODULE CARDS */}
        {selectedModuleId === null ? (
          <View style={styles.viewBlock}>
            {/* COURSE COMPLETION HERO BANNER */}
            {isAllCompleted && (
              <View style={styles.courseCompleteHeroCard}>
                <View style={styles.courseCompleteTopRow}>
                  <Text style={styles.courseCompleteTrophy}>🏆</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.courseCompleteTitle}>Course 100% Completed!</Text>
                    <Text style={styles.courseCompleteSubtitle}>All 12 Prompt Engineering Lessons Mastered</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.heroCertBtn}
                  activeOpacity={0.85}
                  onPress={handleViewCertificate}
                >
                  <Icon name="award" size={18} color="#FFFFFF" />
                  <Text style={styles.heroCertBtnText}>View Official Certificate 🎉</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* SECTION HEADING */}
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionHeaderTitle}>Prompt Modules</Text>
              <View style={styles.overallProgressPill}>
                <Text style={styles.overallProgressPillText}>
                  {completedCount}/{totalStages} Done ({Math.min(100, Math.round((completedCount / totalStages) * 100))}%)
                </Text>
              </View>
            </View>

            {/* COMPACT CLEAN MODULE CARDS */}
            <View style={styles.modulesStack}>
              {MODULE_CARDS.map((mod) => {
                const modCompleted = completedStageIds.filter(id => mod.stageIds.includes(id)).length;
                const isModDone = modCompleted >= mod.stageIds.length;

                return (
                  <TouchableOpacity
                    key={`module-card-${mod.id}`}
                    style={styles.cleanWhiteCard}
                    activeOpacity={0.88}
                    onPress={() => setSelectedModuleId(mod.id)}
                  >
                    <View style={styles.cardMainRow}>
                      <View style={[styles.logoSquareContainer, isModDone && { backgroundColor: '#DCFCE7' }]}>
                        <Icon name={isModDone ? 'check' : (mod.icon as any)} size={26} color={isModDone ? '#059669' : '#7C3AED'} />
                      </View>

                      <View style={styles.cardCenterBlock}>
                        <Text style={styles.courseName}>{mod.title}</Text>
                        <Text style={styles.courseSubtext}>{mod.shortDesc}</Text>
                        <Text style={styles.modProgressText}>
                          {modCompleted} of {mod.lessonCount} lessons completed {isModDone ? '✓' : ''}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardFooterRow}>
                      <TouchableOpacity
                        style={[styles.startBtnPill, isModDone && { backgroundColor: '#059669' }]}
                        activeOpacity={0.85}
                        onPress={() => setSelectedModuleId(mod.id)}
                      >
                        <Text style={styles.startBtnPillText}>{isModDone ? 'Review Module' : 'Explore Module'}</Text>
                        <Icon name={isModDone ? 'check' : 'arrow-right'} size={13} color="#FFFFFF" />
                      </TouchableOpacity>
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
          </View>
        ) : (
          /* VIEW 2: LESSONS LIST FOR SELECTED MODULE */
          <View style={styles.viewBlock}>
            {selectedModule && (
              <View style={styles.moduleBannerHeaderCard}>
                <Text style={styles.modBannerTitle}>{selectedModule.title}</Text>
                <Text style={styles.modBannerDesc}>{selectedModule.shortDesc}</Text>
              </View>
            )}

            <Text style={styles.sectionHeaderTitle}>Module Lessons</Text>

            <View style={styles.lessonsStack}>
              {moduleLessons.map((stg) => {
                const isCompleted = completedStageIds.includes(stg.id);
                const isUnlocked = stg.id === 1 || completedStageIds.includes(stg.id - 1) || isCompleted;
                const isActive = activeStageId === stg.id && isUnlocked;
                const stageNumFormatted = stg.id < 10 ? `0${stg.id}` : `${stg.id}`;

                return (
                  <TouchableOpacity
                    key={`lesson-card-${stg.id}`}
                    style={[
                      styles.colorLessonCard,
                      isActive && { borderColor: '#7C3AED', borderWidth: 2 },
                      !isUnlocked && { opacity: 0.65, backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }
                    ]}
                    activeOpacity={0.88}
                    onPress={() => handleOpenStage(stg.id)}
                  >
                    <View style={styles.cardInnerContent}>
                      <View style={styles.cardTopRow}>
                        <View style={[styles.numBadgePill, !isUnlocked && { backgroundColor: '#E2E8F0' }]}>
                          <Text style={[styles.numBadgeText, !isUnlocked && { color: '#64748B' }]}>
                            LESSON {stageNumFormatted}
                          </Text>
                        </View>
                        <View style={styles.diffBadge}>
                          <Text style={styles.diffBadgeText}>{stg.category}</Text>
                        </View>
                      </View>

                      <Text style={[styles.stageTitleText, !isUnlocked && { color: '#64748B' }]}>{stg.title}</Text>
                      <Text style={styles.stageSubtitleText} numberOfLines={2}>
                        {stg.subtitle}
                      </Text>

                      <View style={styles.lessonCardBottomRow}>
                        <View
                          style={[
                            styles.statusPill,
                            isCompleted && { backgroundColor: '#10B981' },
                            isActive && !isCompleted && { backgroundColor: '#7C3AED' },
                            !isUnlocked && { backgroundColor: '#E2E8F0' }
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              (isCompleted || (isActive && !isCompleted)) && { color: '#FFFFFF' },
                              !isUnlocked && { color: '#64748B' }
                            ]}
                          >
                            {isCompleted ? 'Completed ✓' : !isUnlocked ? `Locked 🔒 (Finish L${stg.id - 1})` : isActive ? 'In Progress ⚡' : 'Start Lesson ▶'}
                          </Text>
                        </View>
                        <Icon
                          name={!isUnlocked ? 'lock' : isCompleted ? 'check' : 'chevron-right'}
                          size={18}
                          color={!isUnlocked ? '#94A3B8' : isCompleted ? '#10B981' : '#0F172A'}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

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
  topBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9'
  },
  topBarTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center'
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 60,
  },
  viewBlock: {
    gap: 12,
  },
  sectionHeaderTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
    marginBottom: 6
  },
  modulesStack: {
    gap: 14,
  },
  cleanWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14
  },
  logoSquareContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardCenterBlock: {
    flex: 1
  },
  courseName: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 22
  },
  courseSubtext: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC'
  },
  startBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  startBtnPillText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  certBtn: {
    marginTop: 10,
    backgroundColor: '#059669',
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  certBtnText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  moduleBannerHeaderCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 18,
    padding: 16,
    marginBottom: 4,
  },
  modBannerTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modBannerDesc: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    color: '#5B21B6',
    lineHeight: 18,
  },
  lessonsStack: {
    gap: 12,
  },
  colorLessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardInnerContent: {
    flex: 1,
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
    borderTopColor: '#F8FAFC',
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
  courseCompleteHeroCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 18,
    marginBottom: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  courseCompleteTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  courseCompleteTrophy: {
    fontSize: 34,
  },
  courseCompleteTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '900',
    color: '#92400E',
  },
  courseCompleteSubtitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    color: '#B45309',
    marginTop: 2,
  },
  heroCertBtn: {
    backgroundColor: '#D97706',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroCertBtnText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 6,
  },
  overallProgressPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overallProgressPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  modProgressText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11.5,
    color: '#7C3AED',
    marginTop: 6,
    fontWeight: '700',
  },
});
