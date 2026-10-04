import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../../components/Icon';

const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

interface CourseCardData {
  id: string;
  title: string;
  image: any;
  bgColor: string;
  borderColor: string;
  textColor: string;
  buttonBg: string;
  buttonText: string;
  route: string;
}

const COURSES: CourseCardData[] = [
  {
    id: 'fullstack',
    title: 'Full Stack Development',
    image: require('../../assets/courses/fullstack_development_logo.png'),
    bgColor: '#F0F4FF',
    borderColor: '#C7D2FE',
    textColor: '#1E1B4B',
    buttonBg: '#4F46E5',
    buttonText: '#FFFFFF',
    route: 'FullStackRoadmap',
  },
  {
    id: 'prompt',
    title: 'Prompt Engineering',
    image: require('../../assets/courses/prompt_engineering_logo.png'),
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#2E1065',
    buttonBg: '#7C3AED',
    buttonText: '#FFFFFF',
    route: 'PromptEngineering',
  },
  {
    id: 'context',
    title: 'Context Engineering',
    image: require('../../assets/courses/context_engineering_logo.png'),
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    textColor: '#0C4A6E',
    buttonBg: '#0284C7',
    buttonText: '#FFFFFF',
    route: 'ContextEngineering',
  },
  {
    id: 'automation',
    title: 'AI Automation',
    image: require('../../assets/courses/ai_automation_logo.png'),
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#064E3B',
    buttonBg: '#10B981',
    buttonText: '#FFFFFF',
    route: 'AIAutomation',
  },
];

export const FullStackOverviewScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP HEADER */}
      <View style={styles.topBar}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
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
        {/* SECTION HEADING */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Learning Tracks</Text>
        </View>

        {/* 4 UNIQUE PREMIUM COURSE CARDS */}
        <View style={styles.coursesList}>
          {COURSES.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={[
                styles.courseCard,
                {
                  backgroundColor: course.bgColor,
                  borderColor: course.borderColor,
                },
              ]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate(course.route)}
            >
              <View style={styles.cardInner}>
                <View style={styles.logoWrapper}>
                  <Image
                    source={course.image}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.cardContent}>
                  <Text
                    style={[styles.courseTitle, { color: course.textColor }]}
                    numberOfLines={2}
                  >
                    {course.title}
                  </Text>

                  <View style={[styles.ctaButton, { backgroundColor: course.buttonBg }]}>
                    <Text style={[styles.ctaButtonText, { color: course.buttonText }]}>
                      Start Learning
                    </Text>
                    <Icon name="arrow-right" size={13} color={course.buttonText} style={{ marginLeft: 5 }} />
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
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* COURSES LIST */
  coursesList: {
    gap: 16,
  },
  courseCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 10,
  },
  courseTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  ctaButtonText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '800',
  },
});
