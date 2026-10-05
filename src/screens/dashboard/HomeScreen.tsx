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

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [fullstackProgress, setFullstackProgress] = useState<FullStackCourseProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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
        try {
          const fallback = await userApi.getDashboard();
          setDashboardData(fallback.data);
        } catch (e) {}
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

          {/* EXPLORE COURSES SECTION */}
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
            {/* COURSE CARD 1: JavaScript (Vibrant Golden Yellow #FCD34D) */}
            <TouchableOpacity
              style={[styles.pastelCard, { backgroundColor: '#FCD34D' }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('HtmlCourse', { tech: 'javascript' })}
            >
              <View style={styles.cardHeaderArea}>
                <Image
                  source={require('../../assets/tool-logos/javascript.png')}
                  style={styles.officialBrandLogoImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.cardBodyContent}>
                <Text style={styles.pastelCardTitle} numberOfLines={2}>
                  JavaScript for Beginners
                </Text>
                <Text style={styles.pastelCardSubtitle} numberOfLines={2}>
                  Master modern ES6+, DOM manipulation & async code.
                </Text>

                <View style={styles.darkPillButton}>
                  <Text style={styles.darkPillButtonText}>Start Course ↗</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* COURSE CARD 2: CSS3 & Layouts (Vibrant Electric Sky Blue #38BDF8) */}
            <TouchableOpacity
              style={[styles.pastelCard, { backgroundColor: '#38BDF8' }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('HtmlCourse', { tech: 'css' })}
            >
              <View style={styles.cardHeaderArea}>
                <Image
                  source={require('../../assets/tool-logos/css.png')}
                  style={styles.officialBrandLogoImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.cardBodyContent}>
                <Text style={styles.pastelCardTitle} numberOfLines={2}>
                  CSS3 & Web Layouts
                </Text>
                <Text style={styles.pastelCardSubtitle} numberOfLines={2}>
                  Flexbox, CSS Grid, animations & responsive design.
                </Text>

                <View style={styles.darkPillButton}>
                  <Text style={styles.darkPillButtonText}>Start Course ↗</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* COURSE CARD 3: Node.js (Vibrant Node Green #4ADE80) */}
            <TouchableOpacity
              style={[styles.pastelCard, { backgroundColor: '#4ADE80' }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('HtmlCourse', { tech: 'nodejs' })}
            >
              <View style={styles.cardHeaderArea}>
                <Image
                  source={require('../../assets/tool-logos/node.png')}
                  style={styles.officialBrandLogoImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.cardBodyContent}>
                <Text style={styles.pastelCardTitle} numberOfLines={2}>
                  Node.js Backend
                </Text>
                <Text style={styles.pastelCardSubtitle} numberOfLines={2}>
                  Create scalable REST APIs & Express servers.
                </Text>

                <View style={styles.darkPillButton}>
                  <Text style={styles.darkPillButtonText}>Start Course ↗</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* COURSE CARD 4: HTML5 (Vibrant Coral Orange #FB923C) */}
            <TouchableOpacity
              style={[styles.pastelCard, { backgroundColor: '#FB923C' }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('HtmlCourse', { tech: 'html' })}
            >
              <View style={styles.cardHeaderArea}>
                <Image
                  source={require('../../assets/tool-logos/html.png')}
                  style={styles.officialBrandLogoImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.cardBodyContent}>
                <Text style={styles.pastelCardTitle} numberOfLines={2}>
                  HTML5 & Web Basics
                </Text>
                <Text style={styles.pastelCardSubtitle} numberOfLines={2}>
                  Learn semantic tags & web document layouts.
                </Text>

                <View style={styles.darkPillButton}>
                  <Text style={styles.darkPillButtonText}>Start Course ↗</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* COURSE CARD 5: MongoDB (Vibrant Emerald Mint #34D399) */}
            <TouchableOpacity
              style={[styles.pastelCard, { backgroundColor: '#34D399' }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('HtmlCourse', { tech: 'mongodb' })}
            >
              <View style={styles.cardHeaderArea}>
                <Image
                  source={require('../../assets/tool-logos/mongodb.png')}
                  style={styles.officialBrandLogoImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.cardBodyContent}>
                <Text style={styles.pastelCardTitle} numberOfLines={2}>
                  MongoDB & Databases
                </Text>
                <Text style={styles.pastelCardSubtitle} numberOfLines={2}>
                  NoSQL database modeling & Mongoose ODM.
                </Text>

                <View style={styles.darkPillButton}>
                  <Text style={styles.darkPillButtonText}>Start Course ↗</Text>
                </View>
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

          {/* AI TOOLS SECTION */}
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
            {/* TOOL CARD 1: AI Code Generator (Vibrant Bright Violet #C084FC) */}
            <TouchableOpacity
              style={[styles.toolPastelCard, { backgroundColor: '#C084FC' }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('AICodeGenerator')}
            >
              <View style={styles.toolCardImageContainer}>
                <Image
                  source={require('../../assets/tools/ai_code_tool_cover.jpg')}
                  style={styles.toolCardCoverImage}
                  resizeMode="cover"
                />
                <View style={styles.toolCardBadge}>
                  <Text style={styles.toolCardBadgeText}>AI CODING</Text>
                </View>
              </View>

              <View style={styles.toolCardBodyContent}>
                <Text style={styles.pastelCardTitle} numberOfLines={1}>
                  AI Code Generator
                </Text>
                <Text style={styles.pastelCardSubtitle} numberOfLines={2}>
                  Generate, refactor & debug code in seconds.
                </Text>

                <View style={styles.darkPillButton}>
                  <Text style={styles.darkPillButtonText}>Try Tool ↗</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* TOOL CARD 2: AI Image Generator (Vibrant Magenta Pink #F472B6) */}
            <TouchableOpacity
              style={[styles.toolPastelCard, { backgroundColor: '#F472B6' }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('AIImageGenerator')}
            >
              <View style={styles.toolCardImageContainer}>
                <Image
                  source={require('../../assets/tools/ai_image_tool_cover.jpg')}
                  style={styles.toolCardCoverImage}
                  resizeMode="cover"
                />
                <View style={styles.toolCardBadge}>
                  <Text style={styles.toolCardBadgeText}>AI ART</Text>
                </View>
              </View>

              <View style={styles.toolCardBodyContent}>
                <Text style={styles.pastelCardTitle} numberOfLines={1}>
                  AI Image Generator
                </Text>
                <Text style={styles.pastelCardSubtitle} numberOfLines={2}>
                  Create photorealistic AI graphics & art.
                </Text>

                <View style={styles.darkPillButton}>
                  <Text style={styles.darkPillButtonText}>Try Tool ↗</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* TOOL CARD 3: AI Email Writer (Vibrant Warm Amber Gold #FBBF24) */}
            <TouchableOpacity
              style={[styles.toolPastelCard, { backgroundColor: '#FBBF24' }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('AIEmailWriter')}
            >
              <View style={styles.toolCardImageContainer}>
                <Image
                  source={require('../../assets/tools/ai_email_tool_cover.jpg')}
                  style={styles.toolCardCoverImage}
                  resizeMode="cover"
                />
                <View style={styles.toolCardBadge}>
                  <Text style={styles.toolCardBadgeText}>AI WRITING</Text>
                </View>
              </View>

              <View style={styles.toolCardBodyContent}>
                <Text style={styles.pastelCardTitle} numberOfLines={1}>
                  AI Email Writer
                </Text>
                <Text style={styles.pastelCardSubtitle} numberOfLines={2}>
                  Draft professional emails & replies effortlessly.
                </Text>

                <View style={styles.darkPillButton}>
                  <Text style={styles.darkPillButtonText}>Try Tool ↗</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* TOOL CARD 4: AI Voice Generator (Vibrant Turquoise Teal #2DD4BF) */}
            <TouchableOpacity
              style={[styles.toolPastelCard, { backgroundColor: '#2DD4BF' }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('AIVoiceGenerator')}
            >
              <View style={styles.toolCardImageContainer}>
                <Image
                  source={require('../../assets/tools/ai_voice_tool_cover.jpg')}
                  style={styles.toolCardCoverImage}
                  resizeMode="cover"
                />
                <View style={styles.toolCardBadge}>
                  <Text style={styles.toolCardBadgeText}>AI VOICE</Text>
                </View>
              </View>

              <View style={styles.toolCardBodyContent}>
                <Text style={styles.pastelCardTitle} numberOfLines={1}>
                  AI Voice Generator
                </Text>
                <Text style={styles.pastelCardSubtitle} numberOfLines={2}>
                  Convert text scripts into natural AI voice audio.
                </Text>

                <View style={styles.darkPillButton}>
                  <Text style={styles.darkPillButtonText}>Try Tool ↗</Text>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* FULL-WIDTH EXPLORE ALL AI TOOLS CTA BUTTON */}
          <TouchableOpacity
            style={[styles.exploreAllBtn, styles.exploreAllToolsBtn]}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('ToolsTab')}
          >
            <Text style={styles.exploreAllBtnText}>Explore All AI Tools  ➔</Text>
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
    marginBottom: 26,
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
    marginBottom: 28,
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
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
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

  /* COMPACT PASTEL CARDS WITH PROMINENT LOGOS */
  coursesHorizontalRow: {
    paddingRight: 10,
    gap: 14,
    marginBottom: 18,
  },
  pastelCard: {
    width: 200,
    minHeight: 235,
    borderRadius: 22,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  toolPastelCard: {
    width: 215,
    minHeight: 285,
    borderRadius: 22,
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  toolCardImageContainer: {
    width: '100%',
    height: 125,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    marginBottom: 10,
  },
  toolCardCoverImage: {
    width: '100%',
    height: '100%',
  },
  toolCardBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  toolCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  toolCardBodyContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeaderArea: {
    height: 60,
    justifyContent: 'center',
    marginBottom: 6,
  },
  officialBrandLogoImage: {
    width: 48,
    height: 48,
  },
  jsBadgeText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -1,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  cssBadgeText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  nodeSymbolIcon: {
    fontSize: 34,
    color: '#4ADE80',
    marginBottom: -4,
  },
  nodeBadgeSubText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4ADE80',
    letterSpacing: 0.5,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  htmlBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  mongoLeafIcon: {
    fontSize: 34,
  },
  codeIconSymbol: {
    fontSize: 28,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: -1,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  toolEmojiSymbol: {
    fontSize: 34,
  },
  cardBodyContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  pastelCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 4,
    lineHeight: 20,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  pastelCardSubtitle: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#334155',
    lineHeight: 15,
    marginBottom: 10,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },
  darkPillButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    alignSelf: 'flex-start',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 3,
  },
  darkPillButtonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: -0.1,
    fontFamily: SANS_SERIF_FONT,
    fontStyle: 'normal',
  },

  /* FULL-WIDTH CTA BUTTONS */
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
    marginBottom: 26,
  },
  exploreAllToolsBtn: {
    backgroundColor: '#433EFE',
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
