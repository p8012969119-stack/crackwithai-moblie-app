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
import { HtmlCourse, HtmlModule, HtmlLesson, FullStackProgress, FullStackTrack } from '../../types/fullstack';
import { FALLBACK_HTML_COURSE, FULLSTACK_TRACKS, getCourseForTech } from '../../data/fullstackHtmlData';
import { Icon } from '../../components/Icon';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const FONT_FAMILY = Platform.OS === 'ios' ? 'System' : 'sans-serif';

export const HtmlCourseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [course, setCourse] = useState<HtmlCourse | null>(FALLBACK_HTML_COURSE);
  const [progress, setProgress] = useState<FullStackProgress | null>(null);
  
  // Step 1: null = Tech Stack Roadmap View
  // Step 2: string = Selected Technology View (e.g. 'html', 'css', 'javascript', etc.)
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'module-1': true,
    'css-mod-1': true,
    'js-mod-1': true,
    'node-mod-1': true,
    'exp-mod-1': true,
    'mongo-mod-1': true,
    'rest-mod-1': true,
    'cap-mod-1': true,
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

  const handleOpenPlayground = (initialCode?: string) => {
    navigation.navigate('HtmlPlayground', {
      initialCode: initialCode || undefined
    });
  };

  const completedSet = new Set(progress?.completedLessonIds || []);

  // Determine course data dynamically for the selected technology
  const activeCourse = selectedTech ? getCourseForTech(selectedTech) : (course || FALLBACK_HTML_COURSE);
  const activeTrack = FULLSTACK_TRACKS.find(t => t.id === selectedTech);

  const totalLessons = activeCourse?.totalLessons || 25;
  const completedLessons = progress?.completedCount || 0;
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Sort modules numerically by order (Module 1, Module 2, Module 3, Module 4)
  const sortedModules = React.useMemo(() => {
    if (!activeCourse?.modules) return [];
    return [...activeCourse.modules].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [activeCourse?.modules]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (selectedTech) {
              setSelectedTech(null); // Back to Tech Stack Roadmap
            } else {
              navigation.goBack();
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {selectedTech && activeTrack ? activeTrack.title : 'Full Stack Development'}
        </Text>
        <TouchableOpacity
          style={styles.playgroundIconBtn}
          onPress={() => handleOpenPlayground()}
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
        {/* ==================================================
            STEP 1: TECH STACK ROADMAP SELECTION VIEW
            (Shown when no specific technology is selected)
            ================================================== */}
        {!selectedTech && (
          <View>
            {/* Header Banner */}
            <View style={styles.roadmapHeaderBanner}>
              <View style={styles.badgeRow}>
                <View style={styles.trackPill}>
                  <Text style={styles.trackPillText}>FULL STACK ROADMAP</Text>
                </View>
                <View style={styles.levelPill}>
                  <Text style={styles.levelPillText}>8 Core Technologies</Text>
                </View>
              </View>

              <Text style={styles.roadmapTitle}>Technologies & Modules</Text>
              <Text style={styles.roadmapDesc}>
                Select any technology below to explore its tailored curriculum, interactive modules, and hands-on code practice.
              </Text>

              {/* Progress Summary Card */}
              <View style={styles.progressCard}>
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressStatusLabel}>Overall Learning Progress</Text>
                  <Text style={styles.progressPercent}>{completedLessons}/{totalLessons} ({percent}%)</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                </View>
              </View>

              {/* Interactive Playground CTA */}
              <TouchableOpacity
                style={styles.heroPlaygroundButton}
                activeOpacity={0.85}
                onPress={() => handleOpenPlayground()}
              >
                <Icon name="code" size={18} color="#FFFFFF" />
                <Text style={styles.heroPlaygroundButtonText}>Open Code Playground</Text>
                <Icon name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Section Heading */}
            <View style={styles.sectionHeadingWrap}>
              <Text style={styles.sectionHeadingTitle}>Select a Technology to Start</Text>
              <Text style={styles.sectionHeadingSub}>Tap any card to view its unique modules and lessons</Text>
            </View>

            {/* Tech Stack Cards Grid */}
            <View style={styles.techGrid}>
              {FULLSTACK_TRACKS.map((track: FullStackTrack) => {
                const isHtml = track.id === 'html';
                return (
                  <TouchableOpacity
                    key={track.id}
                    style={[styles.techCard, isHtml && styles.techCardActiveBorder]}
                    activeOpacity={0.88}
                    onPress={() => setSelectedTech(track.id)}
                  >
                    <View style={styles.techCardHeader}>
                      <View style={[styles.techIconWrap, isHtml && styles.techIconWrapActive]}>
                        <Icon name={track.icon as any || 'code'} size={22} color={isHtml ? '#4F46E5' : '#0F172A'} />
                      </View>
                      <View style={styles.techBadgeContainer}>
                        <Text style={[styles.techBadgeText, isHtml && styles.techBadgeTextActive]}>
                          {isHtml ? `${percent}% Completed` : track.badge}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.techCardTitle}>{track.title}</Text>
                    <Text style={styles.techCardSubtitle}>{track.subtitle}</Text>
                    <Text style={styles.techCardDesc} numberOfLines={2}>{track.description}</Text>

                    <View style={styles.techCardMetaRow}>
                      <View style={styles.techMetaItem}>
                        <Icon name="file-text" size={13} color="#64748B" />
                        <Text style={styles.techMetaText}>{track.lessonsCount} Lessons</Text>
                      </View>
                      <View style={styles.techMetaItem}>
                        <Icon name="book-open" size={13} color="#64748B" />
                        <Text style={styles.techMetaText}>{track.modulesCount} Modules</Text>
                      </View>
                      <View style={styles.techMetaItem}>
                        <Icon name="clock" size={13} color="#64748B" />
                        <Text style={styles.techMetaText}>{track.duration}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.exploreBtn, isHtml && styles.exploreBtnActive]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedTech(track.id)}
                    >
                      <Text style={[styles.exploreBtnText, isHtml && styles.exploreBtnTextActive]}>
                        Explore {track.title} Modules & Lessons
                      </Text>
                      <Icon name="arrow-right" size={15} color={isHtml ? '#FFFFFF' : '#4F46E5'} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ==================================================
            STEP 2: SELECTED TECHNOLOGY MODULES & LESSONS VIEW
            (Renders unique tailored content for HTML, CSS, JS, Node, Express, Mongo, REST API, Capstone)
            ================================================== */}
        {selectedTech && activeTrack && (
          <View>
            {/* Back Button Bar to Return to Tech Stack Roadmap */}
            <TouchableOpacity
              style={styles.backToRoadmapBar}
              activeOpacity={0.7}
              onPress={() => setSelectedTech(null)}
            >
              <Icon name="arrow-left" size={16} color="#4F46E5" />
              <Text style={styles.backToRoadmapText}>Back to All Full Stack Technologies</Text>
            </TouchableOpacity>

            {/* Selected Tech Hero Banner */}
            <View style={styles.heroBanner}>
              <View style={styles.badgeRow}>
                <View style={styles.trackPill}>
                  <Text style={styles.trackPillText}>{activeTrack.title.toUpperCase()} TRACK</Text>
                </View>
                <View style={styles.levelPill}>
                  <Text style={styles.levelPillText}>{activeTrack.level || 'Beginner to Advanced'}</Text>
                </View>
              </View>

              <Text style={styles.courseTitle}>{activeCourse.title}</Text>
              <Text style={styles.courseDescription}>{activeCourse.description}</Text>

              {/* Stats Bar */}
              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Icon name="file-text" size={14} color="#C7D2FE" />
                  <Text style={styles.metaChipText}>{activeCourse.totalLessons || activeTrack.lessonsCount} Lessons</Text>
                </View>
                <View style={styles.metaChip}>
                  <Icon name="book-open" size={14} color="#C7D2FE" />
                  <Text style={styles.metaChipText}>{activeCourse.modules?.length || activeTrack.modulesCount} Modules</Text>
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
                onPress={() => handleOpenPlayground()}
              >
                <Icon name="code" size={18} color="#FFFFFF" />
                <Text style={styles.heroPlaygroundButtonText}>Open Interactive {activeTrack.title} Playground</Text>
                <Icon name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Modules Section Header */}
            <View style={styles.curriculumHeader}>
              <Text style={styles.curriculumTitle}>{activeTrack.title} Curriculum & Modules</Text>
              <Text style={styles.curriculumSubtitle}>
                {activeCourse.modules?.length || 3} progressive modules from fundamental concepts to practical code
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
                  const firstLessonStarterCode = moduleLessons[0]?.starterCode;

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

                      {/* Module Inside Content: Practice Button & Lessons List */}
                      {isExpanded && (
                        <View style={styles.lessonsList}>
                          {/* Inside Module Hands-on Practice Button */}
                          <TouchableOpacity
                            style={styles.modulePracticeBtn}
                            activeOpacity={0.8}
                            onPress={() => handleOpenPlayground(firstLessonStarterCode)}
                          >
                            <Icon name="terminal" size={16} color="#4F46E5" />
                            <Text style={styles.modulePracticeBtnText}>
                              ⚡ Practice {module.title} Code
                            </Text>
                            <Icon name="arrow-right" size={14} color="#4F46E5" />
                          </TouchableOpacity>

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
  roadmapHeaderBanner: {
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
  roadmapTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 6,
    letterSpacing: -0.3
  },
  roadmapDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#C7D2FE',
    lineHeight: 19,
    marginBottom: SPACING.md
  },
  sectionHeadingWrap: {
    marginBottom: SPACING.md
  },
  sectionHeadingTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A'
  },
  sectionHeadingSub: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#64748B',
    marginTop: 4
  },
  techGrid: {
    gap: 16
  },
  techCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  techCardActiveBorder: {
    borderColor: '#6366F1'
  },
  techCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  techIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  techIconWrapActive: {
    backgroundColor: '#EEEDFF'
  },
  techBadgeContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  techBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B'
  },
  techBadgeTextActive: {
    color: '#10B981'
  },
  techCardTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2
  },
  techCardSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 8
  },
  techCardDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 14
  },
  techCardMetaRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16
  },
  techMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  techMetaText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EEEDFF',
    paddingVertical: 12,
    borderRadius: 12
  },
  exploreBtnActive: {
    backgroundColor: '#4F46E5'
  },
  exploreBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5'
  },
  exploreBtnTextActive: {
    color: '#FFFFFF'
  },
  backToRoadmapBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: SPACING.md
  },
  backToRoadmapText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5'
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
  modulePracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEDFF',
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#C7C5FF'
  },
  modulePracticeBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5'
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
