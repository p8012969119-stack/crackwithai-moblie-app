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
            {/* SECTION HEADING */}
            <Text style={styles.sectionHeaderTitle}>Prompt Modules</Text>

            {/* COMPACT CLEAN MODULE CARDS */}
            <View style={styles.modulesStack}>
              {MODULE_CARDS.map((mod) => {
                return (
                  <TouchableOpacity
                    key={`module-card-${mod.id}`}
                    style={styles.cleanWhiteCard}
                    activeOpacity={0.88}
                    onPress={() => setSelectedModuleId(mod.id)}
                  >
                    <View style={styles.cardMainRow}>
                      <View style={styles.logoSquareContainer}>
                        <Icon name={mod.icon as any} size={26} color="#7C3AED" />
                      </View>

                      <View style={styles.cardCenterBlock}>
                        <Text style={styles.courseName}>{mod.title}</Text>
                        <Text style={styles.courseSubtext}>{mod.shortDesc}</Text>
                      </View>
                    </View>

                    <View style={styles.cardFooterRow}>
                      <TouchableOpacity
                        style={styles.startBtnPill}
                        activeOpacity={0.85}
                        onPress={() => setSelectedModuleId(mod.id)}
                      >
                        <Text style={styles.startBtnPillText}>Explore Module</Text>
                        <Icon name="arrow-right" size={13} color="#FFFFFF" />
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
                const isActive = activeStageId === stg.id;
                const stageNumFormatted = stg.id < 10 ? `0${stg.id}` : `${stg.id}`;

                return (
                  <TouchableOpacity
                    key={`lesson-card-${stg.id}`}
                    style={[
                      styles.colorLessonCard,
                      isActive && { borderColor: '#7C3AED', borderWidth: 2 }
                    ]}
                    activeOpacity={0.88}
                    onPress={() => handleOpenStage(stg.id)}
                  >
                    <View style={styles.cardInnerContent}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.numBadgePill}>
                          <Text style={styles.numBadgeText}>LESSON {stageNumFormatted}</Text>
                        </View>
                        <View style={styles.diffBadge}>
                          <Text style={styles.diffBadgeText}>{stg.category}</Text>
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
                            isActive && !isCompleted && { backgroundColor: '#7C3AED' }
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
});
