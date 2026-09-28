import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { HtmlCourse, HtmlModule, HtmlLesson, FullStackProgress } from '../../types/fullstack';
import { getCourseForTech, FULLSTACK_TRACKS } from '../../data/fullstackHtmlData';
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

// Course Dynamic Brand Theme Colors
const TECH_BRAND_COLORS: Record<string, { bg: string; border: string; text: string; pillBg: string; pillText: string; accent: string }> = {
  html: { bg: '#FFF4ED', border: '#FFD8C2', text: '#9A3412', pillBg: '#FFEDD5', pillText: '#C2410C', accent: '#EA580C' },
  css: { bg: '#F0F6FF', border: '#BAE6FD', text: '#1E40AF', pillBg: '#DBEAFE', pillText: '#1E40AF', accent: '#2563EB' },
  javascript: { bg: '#FEFCE8', border: '#FDE68A', text: '#92400E', pillBg: '#FEF3C7', pillText: '#B45309', accent: '#D97706' },
  nodejs: { bg: '#F0FDF4', border: '#A7F3D0', text: '#065F46', pillBg: '#DCFCE7', pillText: '#047857', accent: '#059669' },
  expressjs: { bg: '#ECFDF5', border: '#6EE7B7', text: '#065F46', pillBg: '#D1FAE5', pillText: '#047857', accent: '#059669' },
  mongodb: { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', pillBg: '#DCFCE7', pillText: '#047857', accent: '#059669' },
  restapi: { bg: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6', pillBg: '#EDE9FE', pillText: '#6D28D9', accent: '#7C3AED' },
  auth: { bg: '#FFF1F2', border: '#FECDD3', text: '#9F1239', pillBg: '#FFE4E6', pillText: '#BE123C', accent: '#E11D48' },
  capstone: { bg: '#FAF5FF', border: '#E9D5FF', text: '#6B21A8', pillBg: '#F3E8FF', pillText: '#7E22CE', accent: '#9333EA' },
  prompt: { bg: '#FAF5FF', border: '#DDD6FE', text: '#5B21B6', pillBg: '#EDE9FE', pillText: '#6D28D9', accent: '#7C3AED' },
  'prompt-engineering': { bg: '#FAF5FF', border: '#DDD6FE', text: '#5B21B6', pillBg: '#EDE9FE', pillText: '#6D28D9', accent: '#7C3AED' },
};

const DEFAULT_BRAND_COLOR = { bg: '#FFF4ED', border: '#FFD8C2', text: '#9A3412', pillBg: '#FFEDD5', pillText: '#C2410C', accent: '#EA580C' };

// Omit invalid font strings on Android to prevent system cursive theme fallback
const FONT_FAMILY = Platform.OS === 'android' ? undefined : 'System';

export const HtmlCourseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Dynamic technology parameter, defaults strictly to 'html'
  const tech = (route.params?.tech || route.params?.courseSlug || 'html').toLowerCase();
  const activeTrack = useMemo(() => {
    return FULLSTACK_TRACKS.find(t => t.id === tech) || FULLSTACK_TRACKS[0];
  }, [tech]);

  const brandColor = useMemo(() => {
    return TECH_BRAND_COLORS[tech] || DEFAULT_BRAND_COLOR;
  }, [tech]);

  const [course, setCourse] = useState<HtmlCourse | null>(null);
  const [progress, setProgress] = useState<FullStackProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Expanded state for accordion modules
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    '0': true,
    'module-1': true,
    'mod-0': true
  });

  const loadData = useCallback(async () => {
    try {
      const [courseData, progressData] = await Promise.all([
        (tech === 'html' ? fullstackApi.getHtmlCourse() : fullstackApi.getCourse(tech)).catch(() => null),
        fullstackApi.getProgress(tech).catch(() => null)
      ]);

      if (courseData && courseData.modules && courseData.modules.length > 0) {
        setCourse(courseData);
      } else {
        setCourse(getCourseForTech(tech));
      }

      if (progressData) {
        setProgress(progressData);
      }

      // Default expand the first module
      const targetCourse = courseData || getCourseForTech(tech);
      if (targetCourse?.modules?.length) {
        const firstId = targetCourse.modules[0]._id || targetCourse.modules[0].id || '0';
        setExpandedModules(prev => ({ ...prev, [firstId]: true }));
      }
    } catch (err) {
      console.warn('Failed to load course details from database, applying fallback', err);
      setCourse(getCourseForTech(tech));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tech]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleOpenLesson = (lesson: HtmlLesson) => {
    navigation.navigate('HtmlLesson', {
      lessonId: lesson._id || lesson.id,
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      selectedTech: tech
    });
  };

  const completedSet = useMemo(() => {
    return new Set(progress?.completedLessonIds || []);
  }, [progress?.completedLessonIds]);

  const activeCourse = course || getCourseForTech(tech);
  const sortedModules = useMemo(() => {
    if (!activeCourse?.modules) return [];
    return [...activeCourse.modules].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [activeCourse?.modules]);

  const allLessons = useMemo(() => {
    return sortedModules.flatMap(m => m.lessons || []);
  }, [sortedModules]);

  const totalLessonsCount = activeCourse?.totalLessons || allLessons.length || activeTrack.lessonsCount || 25;
  const completedLessonsCount = allLessons.filter(l => completedSet.has(l._id || l.id || l.slug || '')).length;
  const percent = totalLessonsCount > 0 ? Math.min(100, Math.round((completedLessonsCount / totalLessonsCount) * 100)) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

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
          {activeCourse?.title || `${activeTrack.title} Course`}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brandColor.accent]} />}
      >
        {/* ==================================================
            HERO CARD (DYNAMIC COURSE BRAND BACKGROUND COLOR)
            ================================================== */}
        <View style={[styles.courseHeroBanner, { backgroundColor: brandColor.bg, borderColor: brandColor.border }]}>
          <View style={styles.heroTopRow}>
            {COURSE_LOGOS[tech] ? (
              <View style={styles.courseHeroLogoBox}>
                <Image
                  source={COURSE_LOGOS[tech]}
                  style={styles.courseHeroLogo}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={[styles.courseHeroLogoBox, { backgroundColor: brandColor.pillBg }]}>
                <Icon name="sparkles" size={26} color={brandColor.accent} />
              </View>
            )}
            <View style={styles.heroTopContent}>
              <View style={styles.badgeRow}>
                <View style={[styles.trackPill, { backgroundColor: brandColor.pillBg }]}>
                  <Text style={[styles.trackPillText, { color: brandColor.pillText }]}>
                    {activeTrack.title.toUpperCase()} COURSE
                  </Text>
                </View>
                <View style={styles.levelPill}>
                  <Text style={styles.levelPillText}>
                    {activeCourse?.level ? `${activeCourse.level.toUpperCase()} LEVEL` : 'PRACTICAL'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.courseTitle, { color: brandColor.text }]}>
                {activeCourse?.title || `${activeTrack.title} — Fundamentals`}
              </Text>
            </View>
          </View>

          <Text style={[styles.courseDesc, { color: brandColor.text, opacity: 0.9 }]}>
            {activeCourse?.description || activeTrack.description}
          </Text>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressStatusLabel}>Course Progress</Text>
              <Text style={styles.progressPercent}>
                {completedLessonsCount} / {totalLessonsCount} Lessons ({percent}%)
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.max(4, percent)}%`, backgroundColor: '#10B981' }]} />
            </View>
          </View>
        </View>

        {/* Modules Section Header */}
        <View style={styles.sectionHeadingWrap}>
          <Text style={styles.sectionHeadingTitle}>Course Curriculum</Text>
          <Text style={styles.sectionHeadingSub}>
            {sortedModules.length} Modules · {totalLessonsCount} Hands-On Lessons with Embedded Practice
          </Text>
        </View>

        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={brandColor.accent} style={styles.loader} />
        ) : (
          <View style={styles.modulesContainer}>
            {sortedModules.map((module: HtmlModule, modIndex: number) => {
              const moduleId = module._id || module.id || `mod-${modIndex}`;
              const isExpanded = expandedModules[moduleId] ?? (modIndex === 0);
              const moduleLessons = module.lessons || [];
              const completedInModule = moduleLessons.filter(l => completedSet.has(l._id || l.id || l.slug || '')).length;
              const moduleNum = module.order || modIndex + 1;

              return (
                <View key={`mod-${tech}-${modIndex}-${moduleId}`} style={styles.moduleCard}>
                  {/* Module Header (Accordion Toggle) */}
                  <TouchableOpacity
                    style={styles.moduleHeader}
                    activeOpacity={0.7}
                    onPress={() => toggleModule(moduleId)}
                  >
                    <View style={styles.moduleHeaderLeft}>
                      <View style={[styles.moduleBadge, { backgroundColor: brandColor.pillBg, borderColor: brandColor.border }]}>
                        <Text style={[styles.moduleBadgeText, { color: brandColor.pillText }]}>MOD {moduleNum}</Text>
                      </View>
                      <View style={styles.moduleHeaderTextWrap}>
                        <Text style={styles.moduleTitle}>{module.title}</Text>
                        <Text style={styles.moduleSub}>
                          {completedInModule}/{moduleLessons.length} Lessons Completed
                        </Text>
                      </View>
                    </View>
                    <View style={styles.expandIcon}>
                      <Icon
                        name={isExpanded ? 'chevron-down' : 'chevron-right'}
                        size={20}
                        color="#64748B"
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Module Inside Content: Lessons List */}
                  {isExpanded && (
                    <View style={styles.lessonsList}>
                      {moduleLessons.map((lesson: HtmlLesson, lessonIdx: number) => {
                        const lessonId = lesson._id || lesson.id || lesson.slug || `les-${lessonIdx}`;
                        const isCompleted = completedSet.has(lessonId) || completedSet.has(lesson.slug);
                        const lessonNum = lesson.order || lessonIdx + 1;

                        return (
                          <TouchableOpacity
                            key={`les-${tech}-${lessonIdx}-${lessonId}`}
                            style={[styles.lessonRow, isCompleted && styles.lessonRowCompleted]}
                            activeOpacity={0.75}
                            onPress={() => handleOpenLesson(lesson)}
                          >
                            <View style={styles.lessonRowLeft}>
                              <View style={[styles.lessonNumCircle, isCompleted && styles.lessonNumCircleCompleted]}>
                                {isCompleted ? (
                                  <Icon name="check" size={13} color="#FFFFFF" />
                                ) : (
                                  <Text style={styles.lessonNumText}>{lessonNum}</Text>
                                )}
                              </View>
                              <View style={styles.lessonTextWrap}>
                                <Text style={[styles.lessonTitle, isCompleted && styles.lessonTitleCompleted]}>
                                  {lesson.title}
                                </Text>
                                <Text style={styles.lessonDesc} numberOfLines={2}>
                                  {lesson.learningObjective || lesson.description || 'Hands-on practice & core concepts.'}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.lessonRowRight}>
                              <View style={[
                                styles.startBadgePill,
                                isCompleted ? styles.startBadgeCompleted : { backgroundColor: brandColor.pillBg }
                              ]}>
                                <Text style={[
                                  styles.startBadgeText,
                                  isCompleted ? styles.startBadgeTextCompleted : { color: brandColor.pillText }
                                ]}>
                                  {isCompleted ? 'Done' : 'Start'}
                                </Text>
                                <Icon
                                  name={isCompleted ? 'check' : 'arrow-right'}
                                  size={12}
                                  color={isCompleted ? '#10B981' : brandColor.pillText}
                                />
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
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
    backgroundColor: '#F8FAFC'
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9'
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  courseHeroBanner: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10
  },
  courseHeroLogoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    padding: 6
  },
  courseHeroLogo: {
    width: 44,
    height: 44
  },
  heroTopContent: {
    flex: 1
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  trackPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  trackPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  levelPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  levelPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569'
  },
  courseTitle: {
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 27
  },
  courseDesc: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 16
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  progressStatusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B'
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981'
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  sectionHeadingWrap: {
    marginBottom: 14
  },
  sectionHeadingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4
  },
  sectionHeadingSub: {
    fontSize: 12,
    color: '#64748B'
  },
  loader: {
    marginVertical: 30
  },
  modulesContainer: {
    gap: 14
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF'
  },
  moduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  moduleBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1
  },
  moduleBadgeText: {
    fontSize: 10.5,
    fontWeight: '800'
  },
  moduleHeaderTextWrap: {
    flex: 1
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2
  },
  moduleSub: {
    fontSize: 11.5,
    color: '#64748B'
  },
  expandIcon: {
    marginLeft: 8
  },
  lessonsList: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFCFF'
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  lessonRowCompleted: {
    backgroundColor: '#F0FDF4'
  },
  lessonRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12
  },
  lessonNumCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  lessonNumCircleCompleted: {
    backgroundColor: '#10B981'
  },
  lessonNumText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B'
  },
  lessonTextWrap: {
    flex: 1,
    paddingRight: 8
  },
  lessonTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3
  },
  lessonTitleCompleted: {
    color: '#047857'
  },
  lessonDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16.5
  },
  lessonRowRight: {
    alignItems: 'flex-end'
  },
  startBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999
  },
  startBadgeCompleted: {
    backgroundColor: '#DCFCE7'
  },
  startBadgeText: {
    fontSize: 11.5,
    fontWeight: '800'
  },
  startBadgeTextCompleted: {
    color: '#10B981'
  }
});
