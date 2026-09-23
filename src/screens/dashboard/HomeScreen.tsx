import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../store/AuthContext';
import {aiApi} from '../../api/aiApi';
import {DashboardOverview} from '../../components/DashboardOverview';
import {DashboardTools} from '../../components/DashboardTools';
import { userApi } from '../../api/userApi';
import { DashboardData, AiTool } from '../../types';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { LoadingView } from '../../components/LoadingView';
import { ErrorState } from '../../components/ErrorState';
import {TrainingAssistant} from '../../components/TrainingAssistant';
import {CompletionBadge} from '../../components/CertificateMark';
import { FirstTimeLanguageModal } from '../../components/FirstTimeLanguageModal';
import { storage } from '../../services/storage';
import { Icon } from '../../components/Icon';
import { fullstackApi } from '../../api/fullstackApi';
import { FullStackCourseProgress } from '../../types/fullstack';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [fullstackProgress, setFullstackProgress] = useState<FullStackCourseProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tools, setTools] = useState<AiTool[]>([]);
  const [toolsError, setToolsError] = useState(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // One-time language selection state
  const [showFirstTimeLangModal, setShowFirstTimeLangModal] = useState<boolean>(false);

  useEffect(() => {
    const checkOneTimeLanguage = async () => {
      if (!user?._id) return;
      const key = `@crackwithai_lang_configured_${user._id}`;
      const configured = await storage.getItem(key);
      if (!configured) {
        setShowFirstTimeLangModal(true);
      }
    };
    void checkOneTimeLanguage();
  }, [user?._id]);

  const request = useRef<AbortController | null>(null);
  const fetchDashboard = useCallback(async () => {
    if (request.current) return;
    const controller = new AbortController(); request.current = controller;
    setLoading(true); setError(null);
    try {
      const [dashboard, toolResult, fsResult] = await Promise.allSettled([
        userApi.getDashboard(controller.signal),
        aiApi.getTools(controller.signal),
        fullstackApi.getFullStackProgress()
      ]);
      if (controller.signal.aborted) return;
      const response = dashboard.status === 'fulfilled' ? dashboard.value : await userApi.getDashboard();
      setToolsError(false);
      if (toolResult.status === 'fulfilled') setTools(toolResult.value.data);
      if (fsResult.status === 'fulfilled') setFullstackProgress(fsResult.value);
      if (controller.signal.aborted) return;
      setDashboardData(response.data);
    } catch {
      if (!controller.signal.aborted) {
        const fallback = await userApi.getDashboard();
        setDashboardData(fallback.data);
      }
    } finally {
      if (!controller.signal.aborted) {setLoading(false); setRefreshing(false); request.current = null;}
    }
  }, []);
  useFocusEffect(useCallback(() => {
    void fetchDashboard();
    return () => {request.current?.abort(); request.current = null;};
  }, [fetchDashboard]));

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading && !refreshing) {
    return <SafeAreaView style={styles.container} edges={['top']}><LoadingView message="Loading your dashboard…" /></SafeAreaView>;
  }

  if (error) {
    return <SafeAreaView style={styles.container} edges={['top']}><ErrorState message={error} onRetry={fetchDashboard} style={{flex: 1}} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive"
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile and saved tools remain available above the greeting. */}
        <View style={styles.topHeaderRow}>
          {/* Top Left Profile Avatar Button */}
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
            accessibilityLabel="Profile"
          >
            {user?.avatar || (user as any)?.profileImage ? (
              <Image
                source={{ uri: user?.avatar || (user as any)?.profileImage }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('../../assets/images/logo/crackwithai.png')}
                style={styles.avatarLogoImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>

          <View style={styles.headerRightControls}>
            {/* Certificate Button */}
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Certificates')} activeOpacity={0.75} accessibilityLabel="Certificates">
              <CompletionBadge size={26} />
            </TouchableOpacity>

            {/* Notification Bell */}
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Bookmarks')} activeOpacity={0.75}>
              <Icon name="bell" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.welcomeGreetingSection}>
          <Text style={styles.greetingTitle}>
            {dashboardData?.greeting || `Good morning 👋`}
          </Text>
          <Text style={styles.userSubName}>{user?.fullName || user?.name || 'Learner'}</Text>
        </View>

        {dashboardData && (
          <DashboardOverview
            data={dashboardData}
            onProfile={() => navigation.navigate('Profile')}
            onTools={() => navigation.navigate('ToolsTab')}
            onAI={() => navigation.navigate('AITab')}
          />
        )}

        {/* Full Stack Developer Track Hero & 8-Module Progress Card */}
        <View style={styles.fullstackHeroCard}>
          <View style={styles.fullstackHeroTop}>
            <View style={styles.fullstackBadge}>
              <View style={styles.fullstackPulseDot} />
              <Text style={styles.fullstackBadgeText}>LEARNING</Text>
            </View>
            <Text style={styles.fullstackLevelText}>
              {fullstackProgress?.completedModules ?? 0}/8 Modules
            </Text>
          </View>

          <Text style={styles.fullstackTitle}>Full Stack Web Development</Text>
          <Text style={styles.fullstackSubtitle}>
            Master HTML, CSS, JavaScript, Node.js, Express, MongoDB, REST APIs, Auth & Capstone.
          </Text>

          {/* Progress Bar & Counters */}
          <View style={styles.fsProgressContainer}>
            <View style={styles.fsProgressLabels}>
              <Text style={styles.fsProgressPercentText}>
                {fullstackProgress?.overallPercentage ?? 0}% Complete
              </Text>
              <Text style={styles.fsProgressLessonsText}>
                {fullstackProgress?.completedLessons ?? 0} / {fullstackProgress?.totalLessons || '–'} Lessons
              </Text>
            </View>
            <View style={styles.fsProgressBarTrack}>
              <View
                style={[
                  styles.fsProgressBarFill,
                  { width: `${fullstackProgress?.overallPercentage ?? 0}%` },
                  (fullstackProgress?.overallPercentage ?? 0) === 100 && { backgroundColor: '#10B981' }
                ]}
              />
            </View>
          </View>

          {/* 8-Module Checklist Preview */}
          <View style={styles.fsChecklistCard}>
            <Text style={styles.fsChecklistHeader}>CURRICULUM CHECKLIST</Text>
            {[
              { num: 1, name: 'HTML Fundamentals', slug: 'html', key: 'html' },
              { num: 2, name: 'CSS & Responsive Design', slug: 'css', key: 'css' },
              { num: 3, name: 'Modern JavaScript (ES6+)', slug: 'javascript', key: 'javascript' },
              { num: 4, name: 'Node.js Server Runtime', slug: 'nodejs', key: 'nodejs' },
              { num: 5, name: 'Express.js Framework', slug: 'expressjs', key: 'expressjs' },
              { num: 6, name: 'MongoDB & Mongoose ODM', slug: 'mongodb', key: 'mongodb' },
              { num: 7, name: 'REST API & Authentication', slug: 'rest-api', key: 'rest-auth' },
              { num: 8, name: 'Final Full Stack Capstone', slug: 'final-project', key: 'final-project' }
            ].map(m => {
              const modData = fullstackProgress?.modules?.find(
                item => item.moduleNumber === m.num || item.id === m.key
              );
              const isDone = Boolean(modData?.isCompleted);
              const inProg = Boolean(modData && modData.completedLessons > 0 && !isDone);

              return (
                <TouchableOpacity
                  key={m.num}
                  style={styles.fsChecklistItem}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate('FullStackOverview')}
                >
                  <View style={[styles.fsCheckIconWrap, isDone && styles.fsCheckIconWrapDone, inProg && styles.fsCheckIconWrapInProg]}>
                    <Icon
                      name={isDone ? 'check' : inProg ? 'play' : 'circle'}
                      size={11}
                      color={isDone ? '#10B981' : inProg ? '#818CF8' : '#64748B'}
                    />
                  </View>
                  <Text style={[styles.fsChecklistTitle, isDone && styles.fsChecklistTitleDone]}>
                    <Text style={styles.fsModuleNum}>M{m.num} · </Text>
                    {m.name}
                  </Text>
                  <Text style={[styles.fsModuleStatusBadge, isDone ? styles.fsStatusDone : inProg ? styles.fsStatusProg : styles.fsStatusTodo]}>
                    {isDone ? 'Done' : inProg ? `${modData?.completedLessons}/${modData?.totalLessons}` : 'Ready'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Celebratory Certificate State or Action Buttons */}
          {(fullstackProgress?.courseCompleted || fullstackProgress?.hasCertificate) ? (
            <View style={styles.fsCertCelebrationBox}>
              <View style={styles.fsCertCelebrationTop}>
                <Icon name="award" size={20} color="#F59E0B" />
                <Text style={styles.fsCertCelebrationTitle}>100% Curriculum Completed!</Text>
              </View>
              <Text style={styles.fsCertCelebrationDesc}>
                Your official Full Stack Web Development Certificate is ready and verified.
              </Text>
              <TouchableOpacity
                style={styles.fsCertClaimBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('FullStackCertificate')}
              >
                <Icon name="award" size={16} color="#0B0F19" />
                <Text style={styles.fsCertClaimBtnText}>View Verified Certificate</Text>
                <Icon name="arrow-right" size={14} color="#0B0F19" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fullstackButtonRow}>
              <TouchableOpacity
                style={styles.fullstackPrimaryBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('FullStackOverview')}
              >
                <Text style={styles.fullstackPrimaryBtnText}>Continue Course</Text>
                <Icon name="arrow-right" size={14} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.fullstackSecondaryBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('CertificateVerification')}
              >
                <Icon name="shield" size={14} color={COLORS.primary} />
                <Text style={styles.fullstackSecondaryBtnText}>Verify ID</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TrainingAssistant
          key={user?._id}
          onStartCourse={() => navigation.navigate('FullStackOverview')}
        />

        {/* The tools catalog always follows courses. */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Explore AI Tools</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ToolsTab')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {toolsError ? <TouchableOpacity accessibilityRole="button" onPress={fetchDashboard}><Text style={{color: COLORS.primary}}>Unable to load tools. Tap to retry.</Text></TouchableOpacity> : tools.length ? <DashboardTools tools={tools} open={screen => navigation.navigate(screen)} /> : <Text style={{color: COLORS.textSecondary}}>No AI tools available yet.</Text>}

        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      <FirstTimeLanguageModal
        visible={showFirstTimeLangModal}
        userId={user?._id}
        onComplete={() => setShowFirstTimeLangModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarLogoImage: {
    width: 32,
    height: 32,
  },
  welcomeGreetingSection: {
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  userSubName: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginRight: SPACING.xs,
  },
  streakText: {
    ...TYPOGRAPHY.captionBold,
    color: '#B45309',
    marginLeft: 4,
    fontSize: 13,
  },
  certHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  horizontalListPadding: {
    paddingRight: SPACING.md,
    gap: 12,
  },

  /* HORIZONTAL TOOL CARD STYLES */
  hToolCard: {
    width: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  hToolEmojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  hToolEmojiText: {
    fontSize: 22,
  },
  hToolTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  hToolDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
  hToolCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  hToolCtaText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* AUTO SCROLLING PRODUCT BANNERS STYLES */
  bannerCarouselWrapper: {
    marginBottom: 24,
  },
  productBannerCard: {
    width: 320,
    borderRadius: 20,
    padding: 18,
    marginRight: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerBadgeBox: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  bannerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  bannerTitleText: {
    fontSize: 17.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  bannerSubtitleText: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 18,
    marginBottom: 14,
  },
  bannerCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerCtaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bannerPaginationDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  bannerDot: {
    height: 6,
    borderRadius: 3,
  },
  bannerDotActive: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  bannerDotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },

  /* FULL STACK HERO CARD */
  fullstackHeroCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  fullstackHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fullstackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  fullstackPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  fullstackBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.6,
  },
  fullstackLevelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A5B4FC',
  },
  fullstackTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  fullstackSubtitle: {
    fontSize: 12,
    color: '#C7D2FE',
    lineHeight: 16,
    marginBottom: 12,
  },
  fullstackButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fullstackPrimaryBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  fullstackPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  fullstackSecondaryBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  fullstackSecondaryBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  fsProgressContainer: {
    marginVertical: 10,
  },
  fsProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fsProgressPercentText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '800',
  },
  fsProgressLessonsText: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '600',
  },
  fsProgressBarTrack: {
    height: 6,
    backgroundColor: '#312E81',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fsProgressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  fsChecklistCard: {
    backgroundColor: '#17153B',
    borderRadius: RADIUS.md,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#312E81',
  },
  fsChecklistHeader: {
    color: '#A5B4FC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  fsChecklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.1)',
  },
  fsCheckIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  fsCheckIconWrapDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  fsCheckIconWrapInProg: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
  },
  fsChecklistTitle: {
    flex: 1,
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '600',
  },
  fsChecklistTitleDone: {
    color: '#A7F3D0',
  },
  fsModuleNum: {
    color: '#818CF8',
    fontWeight: '700',
    fontSize: 11,
  },
  fsModuleStatusBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fsStatusDone: {
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  fsStatusProg: {
    color: '#818CF8',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  fsStatusTodo: {
    color: '#94A3B8',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  fsCertCelebrationBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D97706',
    marginTop: 4,
    alignItems: 'center',
  },
  fsCertCelebrationTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  fsCertCelebrationTitle: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '800',
  },
  fsCertCelebrationDesc: {
    color: '#FDE68A',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
  },
  fsCertClaimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: RADIUS.sm,
    width: '100%',
  },
  fsCertClaimBtnText: {
    color: '#0B0F19',
    fontSize: 13,
    fontWeight: '800',
  },
});
