import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { HtmlCourse, HtmlModule, HtmlLesson, FullStackProgress } from '../../types/fullstack';
import { Icon } from '../../components/Icon';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export const HtmlCourseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [course, setCourse] = useState<HtmlCourse | null>(null);
  const [progress, setProgress] = useState<FullStackProgress | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'module-1': true,
    '0': true
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [courseData, progressData] = await Promise.all([
        fullstackApi.getHtmlCourse(),
        fullstackApi.getProgress()
      ]);
      setCourse(courseData);
      setProgress(progressData);

      // Expand first module by default
      if (courseData?.modules?.length) {
        const firstModId = courseData.modules[0]._id || '0';
        setExpandedModules(prev => ({ ...prev, [firstModId]: true }));
      }
    } catch (err) {
      console.warn('Failed to load HTML course details', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
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
      lessonTitle: lesson.title
    });
  };

  const completedSet = new Set(progress?.completedLessonIds || []);
  const totalLessons = course?.totalLessons || 25;
  const completedLessons = progress?.completedCount || 0;
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Navigation Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>HTML Course</Text>
        <TouchableOpacity
          style={styles.playgroundIconBtn}
          onPress={() => navigation.navigate('HtmlPlayground')}
        >
          <Icon name="code" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Course Header Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.badgeRow}>
            <View style={styles.trackPill}>
              <Text style={styles.trackPillText}>FULL STACK TRACK 01</Text>
            </View>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>Beginner</Text>
            </View>
          </View>

          <Text style={styles.courseTitle}>{course?.title || 'HTML — From Beginner to Practical'}</Text>
          <Text style={styles.courseDescription}>
            {course?.description || 'Learn HTML step by step and build real webpages using CrackWithAI HTML Playground.'}
          </Text>

          {/* Stats Bar */}
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Icon name="file-text" size={14} color="#C7D2FE" />
              <Text style={styles.metaChipText}>25 Lessons</Text>
            </View>
            <View style={styles.metaChip}>
              <Icon name="book-open" size={14} color="#C7D2FE" />
              <Text style={styles.metaChipText}>4 Modules</Text>
            </View>
            <View style={styles.metaChip}>
              <Icon name="clock" size={14} color="#C7D2FE" />
              <Text style={styles.metaChipText}>~3 Hours</Text>
            </View>
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressStatusLabel}>Your Progress</Text>
              <Text style={styles.progressPercent}>{completedLessons}/{totalLessons} ({percent}%)</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
            </View>
          </View>

          {/* Quick Playground CTA */}
          <TouchableOpacity
            style={styles.heroPlaygroundButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('HtmlPlayground')}
          >
            <Icon name="code" size={18} color="#FFFFFF" />
            <Text style={styles.heroPlaygroundButtonText}>Open HTML Playground</Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Modules Section Header */}
        <View style={styles.curriculumHeader}>
          <Text style={styles.curriculumTitle}>Course Curriculum</Text>
          <Text style={styles.curriculumSubtitle}>
            4 progressive modules from syntax basics to practical landing pages
          </Text>
        </View>

        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <View style={styles.modulesContainer}>
            {course?.modules?.map((module: HtmlModule, modIndex: number) => {
              const moduleId = module._id || String(modIndex);
              const isExpanded = expandedModules[moduleId] ?? (modIndex === 0);
              const moduleLessons = module.lessons || [];
              const completedInModule = moduleLessons.filter(l => completedSet.has(l._id || l.id || '')).length;

              return (
                <View key={moduleId} style={styles.moduleCard}>
                  {/* Module Header (Accordion Toggle) */}
                  <TouchableOpacity
                    style={styles.moduleHeader}
                    activeOpacity={0.7}
                    onPress={() => toggleModule(moduleId)}
                  >
                    <View style={styles.moduleHeaderLeft}>
                      <View style={styles.moduleBadge}>
                        <Text style={styles.moduleBadgeText}>MOD {module.order || modIndex + 1}</Text>
                      </View>
                      <View style={styles.moduleHeaderTextWrap}>
                        <Text style={styles.moduleTitle}>{module.title}</Text>
                        <Text style={styles.moduleSub}>
                          {completedInModule}/{moduleLessons.length} Completed
                        </Text>
                      </View>
                    </View>
                    <View style={styles.expandIcon}>
                      <Icon
                        name={isExpanded ? 'chevron-down' : 'chevron-right'}
                        size={18}
                        color={COLORS.textSecondary}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Lessons List when Expanded */}
                  {isExpanded && (
                    <View style={styles.lessonsList}>
                      {moduleLessons.map((lesson: HtmlLesson, lessonIdx: number) => {
                        const lessonId = lesson._id || lesson.id || '';
                        const isCompleted = completedSet.has(lessonId);

                        return (
                          <TouchableOpacity
                            key={lessonId}
                            style={[
                              styles.lessonRow,
                              isCompleted && styles.lessonRowCompleted
                            ]}
                            activeOpacity={0.75}
                            onPress={() => handleOpenLesson(lesson)}
                          >
                            <View style={styles.lessonOrderBox}>
                              {isCompleted ? (
                                <View style={styles.completedIconCircle}>
                                  <Icon name="check" size={12} color="#FFFFFF" />
                                </View>
                              ) : (
                                <Text style={styles.lessonOrderText}>
                                  {modIndex + 1}.{lesson.order || lessonIdx + 1}
                                </Text>
                              )}
                            </View>

                            <View style={styles.lessonInfo}>
                              <Text
                                style={[
                                  styles.lessonTitle,
                                  isCompleted && styles.lessonTitleCompleted
                                ]}
                                numberOfLines={1}
                              >
                                {lesson.title}
                              </Text>
                              <Text style={styles.lessonDesc} numberOfLines={1}>
                                {lesson.description || 'Hands-on HTML concept & practice'}
                              </Text>
                            </View>

                            <View style={styles.lessonArrow}>
                              <Icon name="chevron-right" size={16} color={COLORS.textMuted} />
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
    backgroundColor: COLORS.background
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm
  },
  playgroundIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight
  },
  container: {
    flex: 1
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  heroBanner: {
    backgroundColor: '#1E1B4B',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.xs
  },
  trackPill: {
    backgroundColor: 'rgba(86, 83, 254, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#6366F1'
  },
  trackPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A5B4FC',
    letterSpacing: 0.6
  },
  levelPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#10B981'
  },
  levelPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399'
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
    marginBottom: 6,
    letterSpacing: -0.3
  },
  courseDescription: {
    fontSize: 13,
    color: '#C7D2FE',
    lineHeight: 18,
    marginBottom: SPACING.md
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.md
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  metaChipText: {
    fontSize: 12,
    color: '#E0E7FF',
    fontWeight: '500'
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  progressStatusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E0E7FF'
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399'
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4
  },
  heroPlaygroundButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 8
  },
  heroPlaygroundButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  curriculumHeader: {
    marginBottom: SPACING.md
  },
  curriculumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  curriculumSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  loader: {
    marginTop: 40
  },
  modulesContainer: {
    gap: SPACING.sm
  },
  moduleCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.small
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: '#FAFAFC'
  },
  moduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10
  },
  moduleBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  moduleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary
  },
  moduleHeaderTextWrap: {
    flex: 1
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  moduleSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2
  },
  expandIcon: {
    paddingLeft: 8
  },
  lessonsList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator
  },
  lessonRowCompleted: {
    backgroundColor: '#F9FCF9'
  },
  lessonOrderBox: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  lessonOrderText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  completedIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lessonInfo: {
    flex: 1
  },
  lessonTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  lessonTitleCompleted: {
    color: '#065F46'
  },
  lessonDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2
  },
  lessonArrow: {
    paddingLeft: 8
  }
});
