import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  Image
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { FullStackCourseProgress } from '../../types/fullstack';
import { FULLSTACK_TRACKS } from '../../data/fullstackHtmlData';
import { Icon } from '../../components/Icon';
import { COLORS } from '../../constants/theme';

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

const FONT_REGULAR = Platform.OS === 'android' ? 'Poppins-Regular' : 'System';
const FONT_MEDIUM = Platform.OS === 'android' ? 'Poppins-Medium' : 'System';
const FONT_SEMIBOLD = Platform.OS === 'android' ? 'Poppins-SemiBold' : 'System';
const FONT_BOLD = Platform.OS === 'android' ? 'Poppins-Bold' : 'System';

export interface CourseTheme {
  bg: string;
  border: string;
  accent: string;
  logoBg: string;
  metaBg: string;
  metaText: string;
  buttonBg: string;
  buttonText: string;
}

export const COURSE_THEMES: Record<string, CourseTheme> = {
  html: {
    bg: '#FFF8F0',
    border: '#FFD8B5',
    accent: '#EA580C', // Vibrant HTML Orange
    logoBg: '#FFEAD5',
    metaBg: '#FFEDD5',
    metaText: '#9A3412',
    buttonBg: '#EA580C',
    buttonText: '#FFFFFF',
  },
  css: {
    bg: '#F0F9FF',
    border: '#BAE6FD',
    accent: '#0284C7', // CSS Blue
    logoBg: '#E0F2FE',
    metaBg: '#E0F2FE',
    metaText: '#075985',
    buttonBg: '#0284C7',
    buttonText: '#FFFFFF',
  },
  javascript: {
    bg: '#FEFCE8',
    border: '#FEF08A',
    accent: '#D97706', // JS Amber/Yellow
    logoBg: '#FEF3C7',
    metaBg: '#FEF3C7',
    metaText: '#92400E',
    buttonBg: '#D97706',
    buttonText: '#FFFFFF',
  },
  nodejs: {
    bg: '#F0FDF4',
    border: '#BBF7D0',
    accent: '#16A34A', // Node Green
    logoBg: '#DCFCE7',
    metaBg: '#DCFCE7',
    metaText: '#166534',
    buttonBg: '#16A34A',
    buttonText: '#FFFFFF',
  },
  expressjs: {
    bg: '#F8FAFC',
    border: '#CBD5E1',
    accent: '#475569', // Express Slate
    logoBg: '#E2E8F0',
    metaBg: '#E2E8F0',
    metaText: '#1E293B',
    buttonBg: '#334155',
    buttonText: '#FFFFFF',
  },
  mongodb: {
    bg: '#ECFDF5',
    border: '#A7F3D0',
    accent: '#059669', // Mongo Emerald
    logoBg: '#D1FAE5',
    metaBg: '#D1FAE5',
    metaText: '#065F46',
    buttonBg: '#059669',
    buttonText: '#FFFFFF',
  },
  restapi: {
    bg: '#F5F3FF',
    border: '#DDD6FE',
    accent: '#7C3AED', // REST Violet
    logoBg: '#EDE9FE',
    metaBg: '#EDE9FE',
    metaText: '#5B21B6',
    buttonBg: '#7C3AED',
    buttonText: '#FFFFFF',
  },
  auth: {
    bg: '#FFF1F2',
    border: '#FECDD3',
    accent: '#E11D48', // Auth Rose
    logoBg: '#FFE4E6',
    metaBg: '#FFE4E6',
    metaText: '#9F1239',
    buttonBg: '#E11D48',
    buttonText: '#FFFFFF',
  },
  capstone: {
    bg: '#EEF2FF',
    border: '#C7D2FE',
    accent: '#4F46E5', // Capstone Indigo
    logoBg: '#E0E7FF',
    metaBg: '#E0E7FF',
    metaText: '#3730A3',
    buttonBg: '#4F46E5',
    buttonText: '#FFFFFF',
  },
};

const DEFAULT_THEME: CourseTheme = {
  bg: '#F8FAFC',
  border: '#E2E8F0',
  accent: '#6366F1',
  logoBg: '#EEF2FF',
  metaBg: '#F1F5F9',
  metaText: '#475569',
  buttonBg: '#6366F1',
  buttonText: '#FFFFFF',
};

export const FullStackRoadmapScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [fsProgress, setFsProgress] = useState<FullStackCourseProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadProgress = useCallback(async () => {
    try {
      const data = await fullstackApi.getFullStackProgress().catch(() => null);
      if (data) {
        setFsProgress(data);
      }
    } catch (err) {
      console.warn('Failed to load Full Stack progress', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProgress();
  };

  const handleOpenCourse = (techId: string) => {
    navigation.navigate('HtmlCourse', { tech: techId });
  };

  const completedModules = fsProgress?.completedModules || 0;
  const overallPercentage = fsProgress?.overallPercentage || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          Curriculum Courses
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Section Heading & Overall Progress */}
        <View style={styles.sectionHeaderWrap}>
          <View style={styles.sectionHeaderTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Curriculum Courses</Text>
              <Text style={styles.sectionSubtitle}>
                9 Sequential Courses • {completedModules} of 9 finished
              </Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{overallPercentage}%</Text>
            </View>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${Math.max(4, overallPercentage)}%` }]} />
          </View>
        </View>

        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.coursesList}>
            {FULLSTACK_TRACKS.map((track) => {
              const theme = COURSE_THEMES[track.id] || DEFAULT_THEME;
              return (
                <View
                  key={track.id}
                  style={[
                    styles.courseCard,
                    {
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  {/* Top Header: Logo + Title + Tagline */}
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.courseIconBox, { borderColor: theme.border }]}>
                      {COURSE_LOGOS[track.id] ? (
                        <Image
                          source={COURSE_LOGOS[track.id]}
                          style={styles.courseLogoImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <Icon name={(track.icon as any) || 'code'} size={24} color={theme.accent} />
                      )}
                    </View>

                    <View style={styles.cardHeaderCenter}>
                      <Text style={styles.courseName}>{track.title}</Text>
                      <Text style={[styles.courseSubtitle, { color: theme.accent }]}>
                        {track.subtitle}
                      </Text>
                    </View>
                  </View>

                  {/* Metadata Chips: Modules, Lessons, Hours */}
                  <View style={styles.metaRow}>
                    <View style={[styles.metaChip, { backgroundColor: theme.metaBg, borderColor: theme.border }]}>
                      <Icon name="book-open" size={13} color={theme.metaText} />
                      <Text style={[styles.metaChipText, { color: theme.metaText }]}>
                        {track.modulesCount || 4} Modules
                      </Text>
                    </View>
                    <View style={[styles.metaChip, { backgroundColor: theme.metaBg, borderColor: theme.border }]}>
                      <Icon name="file-text" size={13} color={theme.metaText} />
                      <Text style={[styles.metaChipText, { color: theme.metaText }]}>
                        {track.lessonsCount || 20} Lessons
                      </Text>
                    </View>
                    <View style={[styles.metaChip, { backgroundColor: theme.metaBg, borderColor: theme.border }]}>
                      <Icon name="clock" size={13} color={theme.metaText} />
                      <Text style={[styles.metaChipText, { color: theme.metaText }]}>
                        {track.duration || '4 hours'}
                      </Text>
                    </View>
                  </View>

                  {/* Filled Custom Colored Action Button */}
                  <TouchableOpacity
                    style={[styles.ctaButton, { backgroundColor: theme.buttonBg }]}
                    onPress={() => handleOpenCourse(track.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.ctaButtonText, { color: theme.buttonText }]}>
                      Start {track.title} Course
                    </Text>
                    <Icon name="arrow-right" size={16} color={theme.buttonText} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    fontFamily: FONT_BOLD,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONT_BOLD,
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 13,
    color: '#64748B',
  },
  progressBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  progressBadgeText: {
    fontFamily: FONT_BOLD,
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  coursesList: {
    gap: 16,
  },
  courseCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  courseIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    padding: 4,
  },
  courseLogoImage: {
    width: 40,
    height: 40,
  },
  cardHeaderCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  courseName: {
    fontFamily: FONT_BOLD,
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  courseSubtitle: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 13,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metaChipText: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 12,
    fontWeight: '600',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaButtonText: {
    fontFamily: FONT_BOLD,
    fontSize: 14,
    fontWeight: '700',
  },
});

