import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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

export const PromptEngineeringScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [completedStageIds, setCompletedStageIds] = useState<number[]>([1]);
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
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
          const count = Math.min(8, Math.max(1, Math.ceil((backendProgress.completedLessonIds.length / 25) * 8)));
          const stageList = Array.from({ length: count }, (_, i) => i + 1);
          setCompletedStageIds((prev) => Array.from(new Set([...prev, ...stageList])));
        }
      } catch {}
    } catch {} finally {
      setLoading(false);
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
        {/* Back Button */}
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>‹ Back to dashboard</Text>
        </TouchableOpacity>

        {/* Page Header */}
        <Text style={styles.eyebrow}>CRACKWITHAI / COURSES</Text>
        <Text style={styles.title}>PROMPT ENGINEERING</Text>
        <Text style={styles.subtitle}>
          Master practical AI prompting with 12 guided interactive lessons.
        </Text>

        {/* Minimal Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>
              {isAllCompleted ? 'Course Completed 🎉' : 'Guided Learning Journey'}
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
          ) : (
            <TouchableOpacity
              style={styles.continueBtn}
              activeOpacity={0.85}
              onPress={() => handleOpenStage(activeStageId)}
            >
              <Text style={styles.continueBtnText}>
                {completedCount === 0 ? 'Start Lesson 1' : `Continue Lesson ${activeStageId}`}
              </Text>
              <Icon name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Guided Learning Journey Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeadingTitle}>Guided Learning Journey</Text>
          <Text style={styles.sectionHeadingSub}>12 Interactive Lessons · Tap any lesson to start</Text>
        </View>

        {/* 12 Stage Cards Stack */}
        <View style={styles.stageCardsStack}>
          {PROMPT_STAGES.map((stg) => {
            const isCompleted = completedStageIds.includes(stg.id);
            const isActive = activeStageId === stg.id;
            const stageNumFormatted = stg.id < 10 ? `0${stg.id}` : `${stg.id}`;

            const badgeBg =
              stg.difficulty === 'Beginner'
                ? '#DCFCE7'
                : stg.difficulty === 'Intermediate'
                ? '#DBEAFE'
                : '#EDE9FE';
            const badgeTextColor =
              stg.difficulty === 'Beginner'
                ? '#059669'
                : stg.difficulty === 'Intermediate'
                ? '#1D4ED8'
                : '#6D28D9';

            return (
              <TouchableOpacity
                key={`stage-${stg.id}`}
                style={[
                  styles.stageCard,
                  isActive && styles.stageCardActive,
                  isCompleted && styles.stageCardCompleted
                ]}
                activeOpacity={0.88}
                onPress={() => handleOpenStage(stg.id)}
              >
                {/* Number Circle Badge */}
                <View style={[
                  styles.numCircle,
                  isCompleted && styles.numCircleCompleted,
                  isActive && !isCompleted && styles.numCircleActive
                ]}>
                  {isCompleted ? (
                    <Icon name="check" size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={[
                      styles.numCircleText,
                      isActive && styles.numCircleTextActive
                    ]}>
                      {stageNumFormatted}
                    </Text>
                  )}
                </View>

                {/* Stage Info */}
                <View style={styles.stageInfoBox}>
                  <View style={styles.stageMetaRow}>
                    <View style={[styles.diffBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.diffBadgeText, { color: badgeTextColor }]}>
                        {stg.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.stageBadgeTag}>{stg.category}</Text>
                  </View>
                  <Text style={styles.stageTitleText}>{stg.title}</Text>
                  <Text style={styles.stageSubtitleText} numberOfLines={2}>{stg.subtitle}</Text>
                </View>

                {/* Action Arrow */}
                <View style={styles.stageRightCol}>
                  <View style={[
                    styles.statusPill,
                    isCompleted && styles.statusPillCompleted,
                    isActive && !isCompleted && styles.statusPillActive
                  ]}>
                    <Text style={[
                      styles.statusPillText,
                      isCompleted && styles.statusPillTextCompleted,
                      isActive && !isCompleted && styles.statusPillTextActive
                    ]}>
                      {isCompleted ? 'Done' : isActive ? 'Active' : 'Start'}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={18} color="#94A3B8" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
    marginBottom: 20,
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#5653FE',
    padding: 20,
    marginBottom: 24,
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
    fontSize: 16,
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
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5653FE',
    borderRadius: 4,
  },
  progressSub: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 14,
  },
  continueBtn: {
    backgroundColor: '#5653FE',
    borderRadius: 9999,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  certBtn: {
    backgroundColor: '#059669',
    borderRadius: 9999,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  certBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    marginBottom: 14,
  },
  sectionHeadingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionHeadingSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  stageCardsStack: {
    gap: 14,
  },
  stageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stageCardActive: {
    borderColor: '#5653FE',
    borderWidth: 1.5,
    backgroundColor: '#FAF9FF',
  },
  stageCardCompleted: {
    borderColor: '#CBD5E1',
  },
  numCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  numCircleActive: {
    backgroundColor: '#EEEDFF',
  },
  numCircleCompleted: {
    backgroundColor: '#10B981',
  },
  numCircleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  numCircleTextActive: {
    color: '#5653FE',
  },
  stageInfoBox: {
    flex: 1,
    paddingRight: 8,
  },
  stageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
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
  stageBadgeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  stageBadgeSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
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
  stageRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  statusPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillActive: {
    backgroundColor: '#EEEDFF',
  },
  statusPillCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  statusPillTextActive: {
    color: '#5653FE',
  },
  statusPillTextCompleted: {
    color: '#047857',
  }
});
