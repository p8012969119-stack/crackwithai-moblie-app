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
  StatusBar,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { HtmlCourse, HtmlModule, HtmlLesson, FullStackProgress } from '../../types/fullstack';
import { FALLBACK_HTML_COURSE, FULLSTACK_TRACKS } from '../../data/fullstackHtmlData';
import { Icon } from '../../components/Icon';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const FONT_FAMILY = Platform.OS === 'ios' ? 'System' : 'sans-serif';

export const HtmlCourseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [course, setCourse] = useState<HtmlCourse | null>(FALLBACK_HTML_COURSE);
  const [progress, setProgress] = useState<FullStackProgress | null>(null);
  const [selectedTech, setSelectedTech] = useState<string>('html');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'module-1': true,
    '0': true
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [courseData, progressData] = await Promise.all([
        fullstackApi.getHtmlCourse().catch(() => null),
        fullstackApi.getProgress().catch(() => null)
      ]);
      if (courseData && courseData.modules && courseData.modules.length > 0) {
        setCourse(courseData);
      }
      if (progressData) {
        setProgress(progressData);
      }

      // Expand first module by default
      const activeModules = courseData?.modules || course?.modules;
      if (activeModules?.length) {
        const firstModId = activeModules[0]._id || '0';
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

  // Sort modules cleanly by order (Module 1, Module 2, Module 3, Module 4)
  const sortedModules = React.useMemo(() => {
    if (!course?.modules) return [];
    return [...course.modules].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [course?.modules]);

  const activeTrack = FULLSTACK_TRACKS.find(t => t.id === selectedTech) || FULLSTACK_TRACKS[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Navigation Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>Full Stack Development</Text>
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
        {/* Horizontal Tech Stack Roadmap Selector */}
        <View style={styles.techTabsSection}>
          <Text style={styles.sectionHeaderLabel}>FULL STACK TECH ROADMAP</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.techTabsContainer}
          >
            {FULLSTACK_TRACKS.map(track => {
              const isSelected = track.id === selectedTech;
              return (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.techTabChip,
                    isSelected && styles.techTabChipActive
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedTech(track.id)}
                >
                  <Icon
                    name={track.icon as any || 'code'}
                    size={16}
                    color={isSelected ? '#FFFFFF' : '#4F46E5'}
                  />
                  <Text style={[styles.techTabText, isSelected && styles.techTabTextActive]}>
                    {track.title}
                  </Text>
                  {track.id === 'html' && (
                    <View style={[styles.activeDotBadge, isSelected && styles.activeDotBadgeSelected]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Hero Banner with Tech Card Details */}
        <View style={styles.heroBanner}>
          <View style={styles.badgeRow}>
            <View style={styles.trackPill}>
              <Text style={styles.trackPillText}>{activeTrack.title.toUpperCase()} TRACK</Text>
            </View>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>{activeTrack.level || 'Beginner to Advanced'}</Text>
            </View>
          </View>

          <Text style={styles.courseTitle}>{selectedTech === 'html' ? (course?.title || activeTrack.subtitle) : activeTrack.subtitle}</Text>
          <Text style={styles.courseDescription}>
            {selectedTech === 'html' ? (course?.description || activeTrack.description) : activeTrack.description}
          </Text>

          {/* Stats Bar */}
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Icon name="file-text" size={14} color="#C7D2FE" />
              <Text style={styles.metaChipText}>{activeTrack.lessonsCount} Lessons</Text>
            </View>
            <View style={styles.metaChip}>
              <Icon name="book-open" size={14} color="#C7D2FE" />
              <Text style={styles.metaChipText}>{activeTrack.modulesCount} Modules</Text>
            </View>
            <View style={styles.metaChip}>
              <Icon name="clock" size={14} color="#C7D2FE" />
              <Text style={styles.metaChipText}>{activeTrack.duration}</Text>
            </View>
          </View>

          {/* Progress Card */}
          {selectedTech === 'html' && (
            <View style={styles.progressCard}>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressStatusLabel}>Your Progress</Text>
                <Text style={styles.progressPercent}>{completedLessons}/{totalLessons} ({percent}%)</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
              </View>
            </View>
          )}

          {/* Quick Playground CTA */}
          <TouchableOpacity
            style={styles.heroPlaygroundButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('HtmlPlayground')}
          >
            <Icon name="code" size={18} color="#FFFFFF" />
            <Text style={styles.heroPlaygroundButtonText}>Open Interactive Playground</Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Modules Section Header */}
        <View style={styles.curriculumHeader}>
          <Text style={styles.curriculumTitle}>{activeTrack.title} Curriculum & Modules</Text>
          <Text style={styles.curriculumSubtitle}>
            {activeTrack.modulesCount} progressive modules from fundamental concepts to production code
          </Text>
        </View>

        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <View style={styles.modulesContainer}>
            {sortedModules.map((module: HtmlModule, modIndex: number) => {
              const moduleId = module._id || String(modIndex);
              const isExpanded = expandedModules[moduleId] ?? (modIndex === 0);
              const moduleLessons = module.lessons || [];
              const completedInModule = moduleLessons.filter(l => completedSet.has(l._id || l.id || '')).length;
              const moduleNum = module.order || modIndex + 1;

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
                        <Text style={styles.moduleBadgeText}>MOD {moduleNum}</Text>
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
                                <View style={styles.uncompletedNumberCircle}>
                                  <Text style={styles.lessonOrderText}>
                                    {lessonIdx + 1}
                                  </Text>
                                </View>
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
                                {lesson.description || 'Hands-on practice lesson & checkpoint'}
                              </Text>
                            </View>

                            <View style={styles.lessonArrow}>
                              <Icon name="chevron-right" size={16} color="#94A3B8" />
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F1F5F9'
  },
  topBarTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm
  },
  playgroundIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#EEEDFF'
  },
  container: {
    flex: 1
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  techTabsSection: {
    marginBottom: SPACING.lg
  },
  sectionHeaderLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 1.2,
    marginBottom: SPACING.xs + 2
  },
  techTabsContainer: {
    gap: 10,
    paddingVertical: 4
  },
  techTabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  techTabChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  techTabText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155'
  },
  techTabTextActive: {
    color: '#FFFFFF'
  },
  activeDotBadge: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981'
  },
  activeDotBadgeSelected: {
    backgroundColor: '#34D399'
  },
  heroBanner: {
    backgroundColor: '#1E1B4B',
    borderRadius: 22,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#433EFE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.xs + 2
  },
  trackPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#6366F1'
  },
  trackPillText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '800',
    color: '#A5B4FC',
    letterSpacing: 0.6
  },
  levelPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#10B981'
  },
  levelPillText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399'
  },
  courseTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 6,
    letterSpacing: -0.3
  },
  courseDescription: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#C7D2FE',
    lineHeight: 19,
    marginBottom: SPACING.md
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: SPACING.md
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  metaChipText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#E0E7FF',
    fontWeight: '600'
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  progressStatusLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '600',
    color: '#E0E7FF'
  },
  progressPercent: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399'
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4
  },
  heroPlaygroundButton: {
    backgroundColor: '#433EFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    elevation: 2
  },
  heroPlaygroundButtonText: {
    fontFamily: FONT_FAMILY,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  curriculumHeader: {
    marginBottom: SPACING.md
  },
  curriculumTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A'
  },
  curriculumSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18
  },
  loader: {
    marginTop: 40
  },
  modulesContainer: {
    gap: 16
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#FAFAFC'
  },
  moduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  moduleBadge: {
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  moduleBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '800',
    color: '#433EFE'
  },
  moduleHeaderTextWrap: {
    flex: 1
  },
  moduleTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A'
  },
  moduleSub: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#64748B',
    marginTop: 3
  },
  expandIcon: {
    paddingLeft: 8
  },
  lessonsList: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF'
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  lessonRowCompleted: {
    backgroundColor: '#F8FCF8'
  },
  lessonOrderBox: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  uncompletedNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lessonOrderText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B'
  },
  completedIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lessonInfo: {
    flex: 1
  },
  lessonTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A'
  },
  lessonTitleCompleted: {
    color: '#047857'
  },
  lessonDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  lessonArrow: {
    paddingLeft: 8
  }
});
