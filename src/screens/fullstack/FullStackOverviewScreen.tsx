import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../../components/Icon';

const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

interface CourseTrack {
  id: string;
  title: string;
  badge: string;
  description: string;
  image: any;
  bgColor: string;
  borderColor: string;
  textColor: string;
  buttonBg: string;
  buttonText: string;
  route: string;
}

const LEARNING_TRACKS: CourseTrack[] = [
  {
    id: 'fullstack',
    title: 'Full Stack Development',
    badge: '9 Modules · Roadmap',
    description: 'Master Frontend foundations (HTML, CSS, JS) to Backend APIs, Databases & Capstone.',
    image: require('../../assets/courses/fullstack_development_logo.png'),
    bgColor: '#F0F4FF',
    borderColor: '#C7D2FE',
    textColor: '#1E1B4B',
    buttonBg: '#4F46E5',
    buttonText: 'Explore Courses',
    route: 'FullStackRoadmap',
  },
  {
    id: 'prompt',
    title: 'Prompt Engineering',
    badge: 'Interactive Studio · 5 Stages',
    description: 'Master role framing, constraint tuning, and structured system instructions with AI evaluation.',
    image: require('../../assets/courses/prompt_engineering_logo.png'),
    bgColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    textColor: '#581C87',
    buttonBg: '#7C3AED',
    buttonText: 'Start Learning',
    route: 'PromptEngineering',
  },
  {
    id: 'context',
    title: 'Context Engineering',
    badge: 'Advanced RAG · Memory Design',
    description: 'Learn memory window design, multi-turn state preservation, and grounding architectures for AI.',
    image: require('../../assets/courses/context_engineering_logo.png'),
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    textColor: '#075985',
    buttonBg: '#0284C7',
    buttonText: 'Start Learning',
    route: 'ContextEngineering',
  },
  {
    id: 'automation',
    title: 'AI Automation',
    badge: 'Production Agents · Pipelines',
    description: 'Orchestrate autonomous agent pipelines, trigger automations, and connect LLMs to production tools.',
    image: require('../../assets/courses/ai_automation_logo.png'),
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#065F46',
    buttonBg: '#10B981',
    buttonText: 'Start Learning',
    route: 'AIAutomation',
  },
];

export const FullStackOverviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'HomeTab' });
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
          Learning
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER SECTION */}
        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>CRACKWITHAI / COURSES</Text>
          <Text style={styles.mainTitle}>Learning Tracks</Text>
          <Text style={styles.subtitle}>
            Learn practical technology and AI skills with hands-on courses.
          </Text>
        </View>

        {/* 4 LEARNING TRACK CARDS */}
        <View style={styles.trackList}>
          {LEARNING_TRACKS.map((track) => (
            <TouchableOpacity
              key={track.id}
              style={[
                styles.trackCard,
                {
                  backgroundColor: track.bgColor,
                  borderColor: track.borderColor,
                },
              ]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate(track.route)}
            >
              <View style={styles.cardInner}>
                <View style={styles.logoWrapper}>
                  <Image
                    source={track.image}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.cardContent}>
                  <View style={[styles.badgePill, { backgroundColor: track.borderColor }]}>
                    <Text style={[styles.badgeText, { color: track.textColor }]}>
                      {track.badge}
                    </Text>
                  </View>

                  <Text
                    style={[styles.trackTitle, { color: track.textColor }]}
                    numberOfLines={1}
                  >
                    {track.title}
                  </Text>

                  <Text style={styles.trackDesc} numberOfLines={2}>
                    {track.description}
                  </Text>

                  <View style={[styles.ctaButton, { backgroundColor: track.buttonBg }]}>
                    <Text style={styles.ctaButtonText}>{track.buttonText}</Text>
                    <Icon name="arrow-right" size={13} color="#FFFFFF" style={{ marginLeft: 5 }} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    padding: 18,
    paddingBottom: 40,
  },

  /* HEADER BLOCK */
  headerBlock: {
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5653FE',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  mainTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 19,
  },

  /* TRACK LIST */
  trackList: {
    gap: 16,
  },
  trackCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardInner: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  logoWrapper: {
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
    marginTop: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  trackTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 17,
    fontWeight: '800',
  },
  trackDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 17,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 6,
  },
  ctaButtonText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
