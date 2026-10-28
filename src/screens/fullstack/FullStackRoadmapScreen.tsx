import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from '../../components/Icon';
import { FULLSTACK_TRACKS } from '../../data/fullstackHtmlData';

const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

const COURSE_LOGOS: Record<string, any> = {
  html: require('../../assets/courses/html.png'),
  css: require('../../assets/courses/css.png'),
  javascript: require('../../assets/courses/javascript.png'),
  nodejs: require('../../assets/courses/nodejs.png'),
  expressjs: require('../../assets/courses/expressjs.png'),
  mongodb: require('../../assets/courses/mongodb.png'),
  restapi: require('../../assets/courses/restapi.png'),
  auth: require('../../assets/courses/auth.png'),
  capstone: require('../../assets/courses/capstone.png'),
};

const AI_TRACKS = [
  {
    id: 'prompt',
    title: 'Prompt Engineering',
    description: 'Master 5 production prompt stages with structured system instructions, role framing, and constraint tuning.',
    image: require('../../assets/courses/prompt_engineering_logo.png'),
    badge: 'Interactive Studio',
    bgColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    textColor: '#581C87',
    buttonBg: '#7C3AED',
    route: 'PromptEngineering',
  },
  {
    id: 'context',
    title: 'Context Engineering',
    description: 'Learn memory window design, multi-turn state preservation, and grounding architectures for AI systems.',
    image: require('../../assets/courses/context_engineering_logo.png'),
    badge: 'Advanced RAG',
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    textColor: '#075985',
    buttonBg: '#0284C7',
    route: 'ContextEngineering',
  },
  {
    id: 'automation',
    title: 'AI Automation',
    description: 'Orchestrate autonomous agent pipelines, trigger automations, and connect LLMs to production tools.',
    image: require('../../assets/courses/ai_automation_logo.png'),
    badge: 'Production Agents',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#065F46',
    buttonBg: '#10B981',
    route: 'AIAutomation',
  },
];

export const FullStackRoadmapScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialTab = route.params?.tab === 'ai' ? 'ai' : 'fullstack';
  const [activeTab, setActiveTab] = useState<'fullstack' | 'ai'>(initialTab);

  const handleOpenCourse = (techId: string) => {
    navigation.navigate('HtmlCourse', { tech: techId });
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'FullStackTab' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP HEADER */}
      <View style={styles.topBar}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={handleGoBack}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          Explore Courses
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* SEGMENTED TAB SWITCHER */}
        <View style={styles.tabSwitcherContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'fullstack' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('fullstack')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'fullstack' && styles.tabButtonTextActive]}>
              💻 Full Stack ({FULLSTACK_TRACKS.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'ai' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('ai')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'ai' && styles.tabButtonTextActive]}>
              🤖 AI Specializations ({AI_TRACKS.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* =========================================================
            TAB 1: FULL STACK DEVELOPMENT (ALL 9 COURSES DIRECTLY)
            ========================================================= */}
        {activeTab === 'fullstack' && (
          <View style={styles.sectionArea}>
            {/* HERO BANNER */}
            <View style={styles.heroBanner}>
              <View style={styles.heroTextCol}>
                <View style={styles.heroBadgePill}>
                  <Text style={styles.heroBadgeText}>COMPLETE ROADMAP</Text>
                </View>
                <Text style={styles.heroTitle}>Full Stack Development</Text>
                <Text style={styles.heroSubtitle}>
                  From Frontend foundations (HTML, CSS, JS) to Backend APIs, Databases & Security.
                </Text>
              </View>
              <View style={styles.heroStatsBadge}>
                <Text style={styles.heroStatsNumber}>{FULLSTACK_TRACKS.length}</Text>
                <Text style={styles.heroStatsLabel}>Courses</Text>
              </View>
            </View>

            {/* LIST OF ALL 9 FULL STACK COURSES */}
            <View style={styles.coursesList}>
              {FULLSTACK_TRACKS.map((track, idx) => {
                const logo = COURSE_LOGOS[track.id];
                return (
                  <TouchableOpacity
                    key={track.id}
                    style={styles.courseItemCard}
                    activeOpacity={0.88}
                    onPress={() => handleOpenCourse(track.id)}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.logoSquare}>
                        {logo ? (
                          <Image
                            source={logo}
                            style={styles.courseLogo}
                            resizeMode="contain"
                          />
                        ) : (
                          <Icon name="code" size={26} color="#4F46E5" />
                        )}
                      </View>

                      <View style={styles.cardMetaBlock}>
                        <View style={styles.badgeRow}>
                          <View style={styles.trackIndexBadge}>
                            <Text style={styles.trackIndexText}>TRACK {idx + 1}</Text>
                          </View>
                          <Text style={styles.trackLevelText}>
                            {track.level || 'Beginner'} · {track.lessonsCount || 20} Lessons
                          </Text>
                        </View>
                        <Text style={styles.courseTitle}>{track.title}</Text>
                      </View>
                    </View>

                    <Text style={styles.courseDescription} numberOfLines={2}>
                      {track.description}
                    </Text>

                    <View style={styles.cardFooterRow}>
                      <Text style={styles.durationText}>
                        ⏱️ {track.duration || '3 hours'}
                      </Text>

                      <TouchableOpacity
                        style={styles.startBtnPill}
                        activeOpacity={0.85}
                        onPress={() => handleOpenCourse(track.id)}
                      >
                        <Text style={styles.startBtnText}>Start Course</Text>
                        <Icon name="arrow-right" size={13} color="#FFFFFF" style={{ marginLeft: 5 }} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* =========================================================
            TAB 2: AI SPECIALIZATIONS (PROMPT, CONTEXT, AUTOMATION)
            ========================================================= */}
        {activeTab === 'ai' && (
          <View style={styles.sectionArea}>
            <View style={styles.aiTracksList}>
              {AI_TRACKS.map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.aiCard,
                    {
                      backgroundColor: track.bgColor,
                      borderColor: track.borderColor,
                    },
                  ]}
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate(track.route)}
                >
                  <View style={styles.aiCardInner}>
                    <View style={styles.aiLogoWrapper}>
                      <Image
                        source={track.image}
                        style={styles.aiLogoImage}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.aiCardContent}>
                      <View style={[styles.aiPillBadge, { backgroundColor: track.borderColor }]}>
                        <Text style={[styles.aiPillText, { color: track.textColor }]}>
                          {track.badge}
                        </Text>
                      </View>
                      <Text style={[styles.aiTrackTitle, { color: track.textColor }]}>
                        {track.title}
                      </Text>
                      <Text style={styles.aiTrackDesc} numberOfLines={2}>
                        {track.description}
                      </Text>

                      <View style={[styles.aiCtaBtn, { backgroundColor: track.buttonBg }]}>
                        <Text style={styles.aiCtaText}>Start Learning</Text>
                        <Icon name="arrow-right" size={13} color="#FFFFFF" style={{ marginLeft: 5 }} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  topBarTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  /* TAB SWITCHER */
  tabSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  sectionArea: {
    gap: 14,
  },

  /* HERO BANNER */
  heroBanner: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  heroBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
  },
  heroStatsBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroStatsNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroStatsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.9,
  },

  /* COURSES LIST */
  coursesList: {
    gap: 12,
  },
  courseItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  logoSquare: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  courseLogo: {
    width: '100%',
    height: '100%',
  },
  cardMetaBlock: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  trackIndexBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trackIndexText: {
    color: '#4F46E5',
    fontSize: 9.5,
    fontWeight: '800',
  },
  trackLevelText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  courseDescription: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  durationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  startBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* AI TRACKS */
  aiTracksList: {
    gap: 14,
  },
  aiCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  aiCardInner: {
    flexDirection: 'row',
    gap: 14,
  },
  aiLogoWrapper: {
    width: 68,
    height: 68,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  aiLogoImage: {
    width: '100%',
    height: '100%',
  },
  aiCardContent: {
    flex: 1,
    gap: 6,
  },
  aiPillBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  aiTrackTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 17,
    fontWeight: '800',
  },
  aiTrackDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  aiCtaBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 4,
  },
  aiCtaText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
