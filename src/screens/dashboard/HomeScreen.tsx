import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../store/AuthContext';
import { aiApi } from '../../api/aiApi';
import { userApi } from '../../api/userApi';
import { fullstackApi } from '../../api/fullstackApi';
import { DashboardData, AiTool } from '../../types';
import { FullStackCourseProgress } from '../../types/fullstack';
import { LoadingView } from '../../components/LoadingView';
import { ErrorState } from '../../components/ErrorState';
import { FirstTimeLanguageModal } from '../../components/FirstTimeLanguageModal';
import { QuickMenuModal } from '../../components/QuickMenuModal';
import { storage } from '../../services/storage';
import { Icon } from '../../components/Icon';
import { LaptopTechIllustration } from '../../components/LaptopTechIllustration';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SANS_SERIF_FONT = Platform.OS === 'android' ? 'Roboto' : undefined;
const BANNER_HEIGHT = (SCREEN_WIDTH - 40) * (538 / 1024);

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [fullstackProgress, setFullstackProgress] = useState<FullStackCourseProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tools, setTools] = useState<AiTool[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFirstTimeLangModal, setShowFirstTimeLangModal] = useState<boolean>(false);
  const [showQuickMenu, setShowQuickMenu] = useState<boolean>(false);

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
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    try {
      const [dashboard, toolResult, fsResult] = await Promise.allSettled([
        userApi.getDashboard(controller.signal),
        aiApi.getTools(controller.signal),
        fullstackApi.getFullStackProgress(),
      ]);
      if (controller.signal.aborted) return;
      if (dashboard.status === 'fulfilled') setDashboardData(dashboard.value.data);
      if (toolResult.status === 'fulfilled') setTools(toolResult.value.data);
      if (fsResult.status === 'fulfilled') setFullstackProgress(fsResult.value);
    } catch {
      if (!controller.signal.aborted) {
        const fallback = await userApi.getDashboard();
        setDashboardData(fallback.data);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
        request.current = null;
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchDashboard();
      return () => {
        request.current?.abort();
        request.current = null;
      };
    }, [fetchDashboard])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingView message="Loading your dashboard..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ErrorState message={error} onRetry={fetchDashboard} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const rawName = user?.fullName || user?.name || 'Prakash';
  const firstName = rawName.split(' ')[0];

  const progressPercent = typeof fullstackProgress?.overallPercentage === 'number'
    ? Math.min(100, Math.max(0, fullstackProgress.overallPercentage))
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5653FE" />}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER ROW WITH SPACING & 3-LINE HAMBURGER MENU BUTTON */}
          <View style={styles.headerRow}>
            <View style={styles.greetingTextCol}>
              <Text style={styles.greetingTitle}>Hi, {firstName} 👋</Text>
              <Text style={styles.greetingSubtitle}>Ready to learn something new today?</Text>
            </View>

            {/* 3-Line Hamburger Menu Button */}
            <TouchableOpacity
              style={styles.hamburgerMenuCircle}
              activeOpacity={0.8}
              onPress={() => setShowQuickMenu(true)}
              accessibilityLabel="Quick Menu"
            >
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </TouchableOpacity>
          </View>

          {/* AI STUDY ASSISTANT HERO CARD */}
          <View style={styles.heroCardContainer}>
            <View style={styles.heroLeftCol}>
              <Text style={styles.heroTitle}>AI Study Assistant</Text>
              <Text style={styles.heroSubtitle}>Ask anything. Get instant help.</Text>

              {/* REAL INTERACTIVE BUTTON FOR USER */}
              <TouchableOpacity
                style={styles.heroCtaBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AITab')}
                accessibilityLabel="Chat with AI"
              >
                <Text style={styles.heroCtaBtnText}>Chat with AI  ➔</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.heroRightCol}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('AITab')}
            >
              <Image
                source={require('../../assets/dashboard/ai_boy_avatar.png')}
                style={styles.heroAvatarImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* CONTINUE LEARNING SECTION */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('FullStackOverview')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.continueCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('FullStackOverview')}
          >
            <View style={styles.continueLeftCol}>
              <Text style={styles.continueCourseTitle}>
                Full Stack Development{'\n'}with AI
              </Text>

              {/* Real Progress Bar & Percentage */}
              <View style={styles.progressRow}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progressPercent}%`,
                        minWidth: progressPercent > 0 ? 8 : 0,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressPercentText}>{progressPercent}%</Text>
              </View>
            </View>

            <View style={styles.continueRightCol}>
              <LaptopTechIllustration size={92} />
            </View>
          </TouchableOpacity>

          {/* EXPLORE COURSES SECTION (PROPORTIONAL LARGER CARDS) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Explore Courses</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('FullStackRoadmap')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursesHorizontalRow}
          >
            {/* COURSE CARD 1: JavaScript for Beginners */}
            <TouchableOpacity
              style={styles.largeCourseCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('HtmlCourse', { tech: 'javascript' })}
            >
              <View style={[styles.courseIconBox, styles.jsIconBox]}>
                <Text style={styles.jsLogoText}>JS</Text>
              </View>
              <Text style={styles.courseTitleText} numberOfLines={2}>
                JavaScript{'\n'}for Beginners
              </Text>
              <Text style={styles.courseLessonCountText}>12 Lessons</Text>
              <View style={styles.courseCtaChip}>
                <Text style={styles.courseCtaChipText}>Start ➔</Text>
              </View>
            </TouchableOpacity>

            {/* COURSE CARD 2: React.js Zero to Hero */}
            <TouchableOpacity
              style={styles.largeCourseCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('FullStackRoadmap')}
            >
              <View style={[styles.courseIconBox, styles.reactIconBox]}>
                <Text style={styles.reactAtomSymbol}>⚛</Text>
              </View>
              <Text style={styles.courseTitleText} numberOfLines={2}>
                React.js{'\n'}Zero to Hero
              </Text>
              <Text style={styles.courseLessonCountText}>18 Lessons</Text>
              <View style={styles.courseCtaChip}>
                <Text style={styles.courseCtaChipText}>Start ➔</Text>
              </View>
            </TouchableOpacity>

            {/* COURSE CARD 3: Node.js Essentials */}
            <TouchableOpacity
              style={styles.largeCourseCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('HtmlCourse', { tech: 'nodejs' })}
            >
              <View style={[styles.courseIconBox, styles.nodeIconBox]}>
                <Text style={styles.nodeLogoSymbol}>⬢</Text>
              </View>
              <Text style={styles.courseTitleText} numberOfLines={2}>
                Node.js{'\n'}Essentials
              </Text>
              <Text style={styles.courseLessonCountText}>14 Lessons</Text>
              <View style={styles.courseCtaChip}>
                <Text style={styles.courseCtaChipText}>Start ➔</Text>
              </View>
            </TouchableOpacity>

            {/* COURSE CARD 4: HTML & Web Basics */}
            <TouchableOpacity
              style={styles.largeCourseCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('HtmlCourse', { tech: 'html' })}
            >
              <View style={[styles.courseIconBox, styles.htmlIconBox]}>
                <Text style={styles.htmlLogoSymbol}>HTML5</Text>
              </View>
              <Text style={styles.courseTitleText} numberOfLines={2}>
                HTML5 & Web{'\n'}Fundamentals
              </Text>
              <Text style={styles.courseLessonCountText}>10 Lessons</Text>
              <View style={styles.courseCtaChip}>
                <Text style={styles.courseCtaChipText}>Start ➔</Text>
              </View>
            </TouchableOpacity>

            {/* COURSE CARD 5: MongoDB & Database */}
            <TouchableOpacity
              style={styles.largeCourseCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('HtmlCourse', { tech: 'mongodb' })}
            >
              <View style={[styles.courseIconBox, styles.mongoIconBox]}>
                <Text style={styles.mongoLogoSymbol}>🍃</Text>
              </View>
              <Text style={styles.courseTitleText} numberOfLines={2}>
                MongoDB &{'\n'}Database ODM
              </Text>
              <Text style={styles.courseLessonCountText}>16 Lessons</Text>
              <View style={styles.courseCtaChip}>
                <Text style={styles.courseCtaChipText}>Start ➔</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* AI TOOLS SECTION (MATCHING CARD LENGTH & NEAT DESIGN) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Explore AI Tools</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ToolsTab')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursesHorizontalRow}
          >
            {/* TOOL CARD 1: AI Code Generator */}
            <TouchableOpacity
              style={styles.largeCourseCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AICodeGenerator')}
            >
              <View style={[styles.courseIconBox, styles.toolIconCode]}>
                <Icon name="code" size={22} color="#4F46E5" />
              </View>
              <Text style={styles.courseTitleText} numberOfLines={2}>
                AI Code{'\n'}Generator
              </Text>
              <Text style={styles.courseLessonCountText}>Code & Debug</Text>
              <View style={[styles.courseCtaChip, styles.toolCtaChip]}>
                <Text style={styles.toolCtaChipText}>Try Tool ➔</Text>
              </View>
            </TouchableOpacity>

            {/* TOOL CARD 2: AI Image Generator */}
            <TouchableOpacity
              style={styles.largeCourseCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AIImageGenerator')}
            >
              <View style={[styles.courseIconBox, styles.toolIconImage]}>
                <Icon name="image" size={22} color="#DB2777" />
              </View>
              <Text style={styles.courseTitleText} numberOfLines={2}>
                AI Image{'\n'}Generator
              </Text>
              <Text style={styles.courseLessonCountText}>Create Art</Text>
              <View style={[styles.courseCtaChip, styles.toolCtaChip]}>
                <Text style={styles.toolCtaChipText}>Try Tool ➔</Text>
              </View>
            </TouchableOpacity>

            {/* TOOL CARD 3: AI Email Writer */}
            <TouchableOpacity
              style={styles.largeCourseCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AIEmailWriter')}
            >
              <View style={[styles.courseIconBox, styles.toolIconEmail]}>
                <Icon name="mail" size={22} color="#D97706" />
              </View>
              <Text style={styles.courseTitleText} numberOfLines={2}>
                AI Email{'\n'}Writer
              </Text>
              <Text style={styles.courseLessonCountText}>Draft Emails</Text>
              <View style={[styles.courseCtaChip, styles.toolCtaChip]}>
                <Text style={styles.toolCtaChipText}>Try Tool ➔</Text>
              </View>
            </TouchableOpacity>

            {/* TOOL CARD 4: AI Voice Generator */}
            <TouchableOpacity
              style={styles.largeCourseCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AIVoiceGenerator')}
            >
              <View style={[styles.courseIconBox, styles.toolIconVoice]}>
                <Icon name="mic" size={22} color="#059669" />
              </View>
              <Text style={styles.courseTitleText} numberOfLines={2}>
                AI Voice{'\n'}Generator
              </Text>
              <Text style={styles.courseLessonCountText}>Text Speech</Text>
              <View style={[styles.courseCtaChip, styles.toolCtaChip]}>
                <Text style={styles.toolCtaChipText}>Try Tool ➔</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* FULL-WIDTH EXPLORE ALL COURSES CTA BUTTON */}
          <TouchableOpacity
            style={styles.exploreAllBtn}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('FullStackRoadmap')}
          >
            <Text style={styles.exploreAllBtnText}>Explore All Courses  ➔</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* QUICK HAMBURGER MENU MODAL */}
      <QuickMenuModal
        visible={showQuickMenu}
        onClose={() => setShowQuickMenu(false)}
        onNavigate={(screenName) => navigation.navigate(screenName)}
      />

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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },

  /* HEADER ROW WITH EXTRA SPACING */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  greetingTextCol: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
    marginTop: 4,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },

  /* 3-Line Hamburger Menu Button */
  hamburgerMenuCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  hamburgerLine: {
    width: 18,
    height: 2.2,
    backgroundColor: '#0F172A',
    borderRadius: 1.1,
  },

  /* AI STUDY ASSISTANT HERO CARD */
  heroCardContainer: {
    width: '100%',
    backgroundColor: '#0A0738',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
    overflow: 'hidden',
  },
  heroLeftCol: {
    flex: 1,
    paddingRight: 6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: '#C7D2FE',
    lineHeight: 18,
    marginBottom: 18,
    fontWeight: '400',
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  heroCtaBtn: {
    backgroundColor: '#5653FE',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 22,
    alignSelf: 'flex-start',
    shadowColor: '#5653FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  heroCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  heroRightCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarImage: {
    width: 135,
    height: 130,
  },

  /* SECTION HEADERS */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5653FE',
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },

  /* CONTINUE LEARNING CARD */
  continueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  continueLeftCol: {
    flex: 1,
    paddingRight: 10,
  },
  continueCourseTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 16,
    letterSpacing: -0.2,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarTrack: {
    flex: 1,
    height: 9,
    backgroundColor: '#EEF2FF',
    borderRadius: 4.5,
    overflow: 'hidden',
    maxWidth: 140,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5653FE',
    borderRadius: 4.5,
  },
  progressPercentText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 10,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  continueRightCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* EXPLORE COURSES & AI TOOLS HORIZONTAL CARDS (LARGER, NEAT & PROPORTIONAL) */
  coursesHorizontalRow: {
    paddingRight: 10,
    gap: 14,
    marginBottom: 26,
  },
  largeCourseCard: {
    width: 145,
    minHeight: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: 'space-between',
  },
  courseIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  jsIconBox: {
    backgroundColor: '#F7DF1E',
  },
  jsLogoText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#000000',
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  reactIconBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  reactAtomSymbol: {
    fontSize: 26,
    color: '#00D8FF',
  },
  nodeIconBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  nodeLogoSymbol: {
    fontSize: 24,
    color: '#339933',
  },
  htmlIconBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  htmlLogoSymbol: {
    fontSize: 12,
    fontWeight: '900',
    color: '#E34F26',
  },
  mongoIconBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  mongoLogoSymbol: {
    fontSize: 22,
  },

  /* Tool Icon Styling */
  toolIconCode: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  toolIconImage: {
    backgroundColor: '#FCE7F3',
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  toolIconEmail: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  toolIconVoice: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  courseTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 4,
    letterSpacing: -0.2,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  courseLessonCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 10,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  courseCtaChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  courseCtaChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#5653FE',
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  toolCtaChip: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  toolCtaChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4F46E5',
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },

  /* FULL-WIDTH EXPLORE ALL COURSES BUTTON */
  exploreAllBtn: {
    backgroundColor: '#5653FE',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5653FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  exploreAllBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
});
