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
import { AI_AUTOMATION_MODULES, AI_AUTOMATION_STAGES } from './aiAutomationCourseData';

const FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';
const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

export const AIAutomationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [completedStageIds, setCompletedStageIds] = useState<number[]>([1]);
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [certificateModalVisible, setCertificateModalVisible] = useState<boolean>(false);
  const [earnedCertificate, setEarnedCertificate] = useState<Certificate | null>(null);

  const storageKey = `@crackwithai_automation_progress_${user?._id || 'guest'}`;

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
        const backendProgress = await fullstackApi.getProgress('ai-automation');
        if (backendProgress?.completedLessonIds?.length) {
          const count = Math.min(49, Math.max(1, backendProgress.completedLessonIds.length));
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
  const totalStages = AI_AUTOMATION_STAGES.length;
  const overallPercentage = Math.round((completedCount / totalStages) * 100);
  const isAllCompleted = completedCount >= totalStages;

  const handleOpenStage = (stageId: number) => {
    navigation.navigate('AIAutomationStageDetail', { stageId });
  };

  const handleViewCertificate = async () => {
    if (earnedCertificate) {
      setCertificateModalVisible(true);
      return;
    }
    try {
      const myCerts = await certificateApi.getMyCertificates();
      const automationCert = myCerts?.data?.find(
        (c: any) =>
          c.courseName?.toLowerCase().includes('automation') ||
          c.course?.title?.toLowerCase().includes('automation')
      );
      if (automationCert) {
        setEarnedCertificate(automationCert);
        setCertificateModalVisible(true);
        return;
      }
    } catch {}

    const certNumber = `CWA-AUTO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const certData: Certificate = {
      _id: `cert-auto-${Date.now()}`,
      user: user?._id || 'guest',
      course: 'ai-automation',
      certificateId: certNumber,
      certificateNumber: certNumber,
      verificationCode: certNumber,
      recipientName: user?.fullName || user?.name || 'AI Automation Specialist',
      userName: user?.fullName || user?.name || 'AI Automation Specialist',
      courseName: 'AI Automation Mastery',
      issueDate: new Date().toISOString(),
      issuedAt: new Date().toISOString(),
      percentage: 100,
      status: 'active',
    };
    setEarnedCertificate(certData);
    setCertificateModalVisible(true);
  };

  const selectedModule = AI_AUTOMATION_MODULES.find((m) => m.id === selectedModuleId);
  const moduleLessons = selectedModule
    ? AI_AUTOMATION_STAGES.filter((s) => selectedModule.stageIds.includes(s.id))
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
          {selectedModuleId === null ? 'AI Automation' : selectedModule?.title || 'Module Lessons'}
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
            colors={['#10B981']}
          />
        }
      >
        {/* VIEW 1: MODULE CARDS & HERO BANNER */}
        {selectedModuleId === null ? (
          <View style={styles.viewBlock}>
            {/* HERO OVERALL PROGRESS BANNER */}
            <View style={styles.heroProgressCard}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroTitle}>Great Progress! 🎉</Text>
                <Text style={styles.heroSubtitle}>Building Workflows & Agents.</Text>
              </View>

              <View style={styles.heroRightCircle}>
                <Text style={styles.circlePercentageText}>{overallPercentage}%</Text>
                <Text style={styles.circleSubLabel}>Overall Progress</Text>
              </View>
            </View>

            {/* SECTION HEADING */}
            <Text style={styles.sectionHeaderTitle}>Automation Modules</Text>

            {/* COMPACT WHITE MODULE CARDS */}
            <View style={styles.modulesStack}>
              {AI_AUTOMATION_MODULES.map((mod) => {
                const completedInModule = mod.stageIds.filter((id) =>
                  completedStageIds.includes(id)
                ).length;
                const modPercent = Math.round((completedInModule / mod.lessonCount) * 100);

                return (
                  <TouchableOpacity
                    key={`module-card-${mod.id}`}
                    style={styles.cleanWhiteCard}
                    activeOpacity={0.88}
                    onPress={() => setSelectedModuleId(mod.id)}
                  >
                    <View style={styles.cardMainRow}>
                      <View style={styles.logoSquareContainer}>
                        <Icon name={mod.icon as any} size={28} color="#10B981" />
                      </View>

                      <View style={styles.cardCenterBlock}>
                        <View style={styles.cardTitleRow}>
                          <Text style={styles.courseName}>{mod.title}</Text>
                          <Text style={styles.percentText}>{modPercent}%</Text>
                        </View>

                        <View style={styles.progressTrackBar}>
                          <View
                            style={[
                              styles.progressFillBar,
                              { width: `${Math.max(4, modPercent)}%` }
                            ]}
                          />
                        </View>
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
                      isActive && { borderColor: '#10B981', borderWidth: 2 }
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
                            isActive && !isCompleted && { backgroundColor: '#059669' }
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
    backgroundColor: '#F8FAFC'
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9'
  },
  topBarTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#0F172A',
    textAlign: 'center'
  },
  container: {
    flex: 1
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32
  },
  viewBlock: {
    flex: 1
  },
  heroProgressCard: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#FFFFFF',
    marginBottom: 4
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: FONT_FAMILY,
    color: '#D1FAE5'
  },
  heroRightCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  circlePercentageText: {
    fontSize: 18,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#FFFFFF'
  },
  circleSubLabel: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#E0E7FF',
    textAlign: 'center'
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#0F172A',
    marginBottom: 14
  },
  modulesStack: {
    gap: 12
  },
  cleanWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  logoSquareContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  cardCenterBlock: {
    flex: 1
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  courseName: {
    fontSize: 15,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#0F172A',
    flex: 1,
    marginRight: 8
  },
  percentText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#10B981'
  },
  progressTrackBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFillBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  startBtnPill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  startBtnPillText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#FFFFFF'
  },
  certBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8
  },
  certBtnText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#FFFFFF'
  },
  moduleBannerHeaderCard: {
    backgroundColor: '#059669',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16
  },
  modBannerTitle: {
    fontSize: 17,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#FFFFFF',
    marginBottom: 4
  },
  modBannerDesc: {
    fontSize: 13,
    fontFamily: FONT_FAMILY,
    color: '#D1FAE5'
  },
  lessonsStack: {
    gap: 12
  },
  colorLessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10
  },
  cardInnerContent: {
    flex: 1
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  numBadgePill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  numBadgeText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#065F46'
  },
  diffBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  diffBadgeText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY,
    color: '#475569'
  },
  stageTitleText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#0F172A',
    marginBottom: 4
  },
  stageSubtitleText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY,
    color: '#64748B',
    marginBottom: 12
  },
  lessonCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statusPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusPillText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#475569'
  }
});
