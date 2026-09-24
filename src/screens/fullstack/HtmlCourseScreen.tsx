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
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';
const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

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
    'auth-mod-1': true,
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
      lessonTitle: lesson.title,
      selectedTech: selectedTech || 'html'
    });
  };

  const completedSet = new Set(progress?.completedLessonIds || []);

  // Determine course data dynamically for the selected technology
  const activeCourse = selectedTech ? getCourseForTech(selectedTech) : (course || FALLBACK_HTML_COURSE);
  const activeTrack = FULLSTACK_TRACKS.find(t => t.id === selectedTech);

  const totalLessonsCount = activeCourse?.totalLessons || 25;
  const completedCountForActive = Array.from(completedSet).length;
  const activePercent = totalLessonsCount > 0 ? Math.round((completedCountForActive / totalLessonsCount) * 100) : 0;

  // Sort modules numerically by order
  const sortedModules = React.useMemo(() => {
    if (!activeCourse?.modules) return [];
    return [...activeCourse.modules].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [activeCourse?.modules]);

  // Compute technology statuses across the 9 sequential tracks
  const tracksWithStatus = React.useMemo(() => {
    let previousCompleted = true; // HTML (Track 1) unlocked by default

    return FULLSTACK_TRACKS.map((track: FullStackTrack, index: number) => {
      const techCourse = getCourseForTech(track.id);
      const techLessons = techCourse.modules.flatMap(m => m.lessons);
      const totalTechLessons = techLessons.length || track.lessonsCount || 10;
      const completedTechLessons = techLessons.filter(l => completedSet.has(l._id || l.id || '')).length;
      
      const percent = totalTechLessons > 0 ? Math.round((completedTechLessons / totalTechLessons) * 100) : 0;
      const isCompleted = percent === 100;
      const isInProgress = percent > 0 && percent < 100;

      let techStatus: 'completed' | 'in_progress' | 'available' | 'locked' = 'locked';

      if (isCompleted) {
        techStatus = 'completed';
      } else if (isInProgress) {
        techStatus = 'in_progress';
      } else if (previousCompleted || index === 0) {
        techStatus = 'available';
      } else {
        techStatus = 'locked';
      }

      // Track N unlocks track N+1 if at least started or completed
      if (isCompleted || isInProgress || index === 0) {
        previousCompleted = true;
      }

      return {
        ...track,
        completedTechLessons,
        totalTechLessons,
        percent,
        techStatus
      };
    });
  }, [completedSet]);

  const totalCompletedTracks = tracksWithStatus.filter(t => t.techStatus === 'completed').length;
  const overallRoadmapPercent = Math.round((totalCompletedTracks / FULLSTACK_TRACKS.length) * 100);

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
          {selectedTech && activeTrack ? `${activeTrack.title} Modules` : 'Full Stack Roadmap'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* ==================================================
            STEP 1: TECH STACK ROADMAP SELECTION VIEW
            (9 Technologies in exact sequence)
            ================================================== */}
        {!selectedTech && (
          <View>
            {/* Header Summary Card */}
            <View style={styles.roadmapHeaderBanner}>
              <View style={styles.badgeRow}>
                <View style={styles.trackPill}>
                  <Text style={styles.trackPillText}>FULL STACK ROADMAP</Text>
                </View>
                <View style={styles.levelPill}>
                  <Text style={styles.levelPillText}>9 Sequential Technologies</Text>
                </View>
              </View>

              <Text style={styles.roadmapTitle}>Full Stack Learning Journey</Text>
              <Text style={styles.roadmapDesc}>
                Follow the 9-stage full stack sequence from HTML foundations to final capstone project deployment.
              </Text>

              {/* Progress Summary Card */}
              <View style={styles.progressCard}>
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressStatusLabel}>Roadmap Progress</Text>
                  <Text style={styles.progressPercent}>{totalCompletedTracks} / 9 Technologies ({overallRoadmapPercent}%)</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${Math.max(4, overallRoadmapPercent)}%` }]} />
                </View>
              </View>
            </View>

            {/* Section Heading */}
            <View style={styles.sectionHeadingWrap}>
              <Text style={styles.sectionHeadingTitle}>Technology Sequence</Text>
              <Text style={styles.sectionHeadingSub}>Select any unlocked technology below to access its modules & lessons</Text>
            </View>

            {/* 9 Technology Cards */}
            <View style={styles.techGrid}>
              {tracksWithStatus.map((track) => {
                const isLocked = track.techStatus === 'locked';
                const isCompleted = track.techStatus === 'completed';
                const isInProgress = track.techStatus === 'in_progress';

                return (
                  <TouchableOpacity
                    key={track.id}
                    style={[
                      styles.techCard,
                      isInProgress && styles.techCardInProgressBorder,
                      isCompleted && styles.techCardCompletedBorder,
                      isLocked && styles.techCardLocked
                    ]}
                    activeOpacity={isLocked ? 0.9 : 0.85}
                    onPress={() => {
                      if (!isLocked) {
                        setSelectedTech(track.id);
                      }
                    }}
                  >
                    <View style={styles.techCardHeader}>
                      <View style={[styles.techIconWrap, isCompleted && styles.techIconWrapCompleted]}>
                        <Icon
                          name={track.icon as any || 'code'}
                          size={22}
                          color={isLocked ? '#94A3B8' : isCompleted ? '#10B981' : '#4F46E5'}
                        />
                      </View>

                      {/* Status Badge */}
                      <View style={styles.statusBadgeWrap}>
                        {isCompleted && (
                          <View style={styles.badgeCompleted}>
                            <Icon name="check" size={12} color="#047857" />
                            <Text style={styles.badgeCompletedText}>Completed</Text>
                          </View>
                        )}
                        {isInProgress && (
                          <View style={styles.badgeInProgress}>
                            <Text style={styles.badgeInProgressText}>{track.percent}% Progress</Text>
                          </View>
                        )}
                        {track.techStatus === 'available' && (
                          <View style={styles.badgeAvailable}>
                            <Text style={styles.badgeAvailableText}>{track.badge}</Text>
                          </View>
                        )}
                        {isLocked && (
                          <View style={styles.badgeLocked}>
                            <Icon name="lock" size={12} color="#64748B" />
                            <Text style={styles.badgeLockedText}>Locked</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Text style={[styles.techCardTitle, isLocked && styles.textMuted]}>{track.title}</Text>
                    <Text style={styles.techCardSubtitle}>{track.subtitle}</Text>
                    <Text style={styles.techCardDesc} numberOfLines={2}>{track.description}</Text>

                    {/* Meta Info */}
                    <View style={styles.techCardMetaRow}>
                      <View style={styles.techMetaItem}>
                        <Icon name="file-text" size={13} color="#64748B" />
                        <Text style={styles.techMetaText}>{track.totalTechLessons} Lessons</Text>
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

                    {/* Progress Bar inside Card */}
                    <View style={styles.cardProgressTrack}>
                      <View
                        style={[
                          styles.cardProgressFill,
                          { width: `${track.percent}%` },
                          isCompleted && { backgroundColor: '#10B981' }
                        ]}
                      />
                    </View>

                    {/* Action Button */}
                    <View style={{ marginTop: 14 }}>
                      {isCompleted && (
                        <View style={styles.btnCompleted}>
                          <Icon name="check" size={15} color="#047857" />
                          <Text style={styles.btnCompletedText}>Review {track.title} Modules</Text>
                        </View>
                      )}
                      {isInProgress && (
                        <View style={styles.btnPrimary}>
                          <Text style={styles.btnPrimaryText}>Continue Learning</Text>
                          <Icon name="arrow-right" size={15} color="#FFFFFF" />
                        </View>
                      )}
                      {track.techStatus === 'available' && (
                        <View style={styles.btnOutline}>
                          <Text style={styles.btnOutlineText}>Start {track.title} Course</Text>
                          <Icon name="arrow-right" size={15} color="#4F46E5" />
                        </View>
                      )}
                      {isLocked && (
                        <View style={styles.btnLocked}>
                          <Icon name="lock" size={14} color="#94A3B8" />
                          <Text style={styles.btnLockedText}>Complete prior track to unlock</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ==================================================
            STEP 2: SELECTED TECHNOLOGY MODULES & LESSONS VIEW
            (Renders unique modules for HTML, CSS, JS, Node, Express, Mongo, REST API, Auth, Capstone)
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
              <Text style={styles.backToRoadmapText}>Back to Full Stack Roadmap</Text>
            </TouchableOpacity>

            {/* Compact Header for Selected Tech */}
            <View style={styles.compactHeaderCard}>
              <View style={styles.compactHeaderRow}>
                <View style={styles.compactIconCircle}>
                  <Icon name={activeTrack.icon as any || 'code'} size={24} color="#4F46E5" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.compactHeaderTitle}>{activeTrack.title} Course</Text>
                  <Text style={styles.compactHeaderSub}>
                    {activeCourse.modules?.length || activeTrack.modulesCount} Progressive Modules · {activeCourse.totalLessons || activeTrack.lessonsCount} Lessons
                  </Text>
                </View>
              </View>

              {/* Technology Progress Meter */}
              <View style={{ marginTop: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontFamily: FONT_FAMILY, fontSize: 12, color: '#64748B' }}>Course Progress</Text>
                  <Text style={{ fontFamily: FONT_FAMILY_MEDIUM, fontSize: 12, color: '#10B981', fontWeight: '700' }}>
                    {activePercent}% Completed
                  </Text>
                </View>
                <View style={styles.cardProgressTrack}>
                  <View style={[styles.cardProgressFill, { width: `${activePercent}%`, backgroundColor: '#10B981' }]} />
                </View>
              </View>
            </View>

            {/* Loading Spinner */}
            {loading && !refreshing ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
              <View style={styles.modulesContainer}>
                {sortedModules.map((module: HtmlModule, modIndex: number) => {
                  const moduleId = module._id || module.id || `mod-${modIndex}`;
                  const isExpanded = expandedModules[moduleId] ?? (modIndex === 0);
                  const moduleLessons = module.lessons || [];
                  const completedInModule = moduleLessons.filter(l => completedSet.has(l._id || l.id || '')).length;
                  const moduleNum = module.order || modIndex + 1;

                  return (
                    <View key={`mod-${selectedTech}-${modIndex}-${moduleId}`} style={styles.moduleCard}>
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

                      {/* Module Inside Content: Lessons List */}
                      {isExpanded && (
                        <View style={styles.lessonsList}>
                          {moduleLessons.map((lesson: HtmlLesson, lessonIdx: number) => {
                            const lessonId = lesson._id || lesson.id || `les-${lessonIdx}`;
                            const isCompleted = completedSet.has(lessonId);

                            return (
                              <TouchableOpacity
                                key={`les-${selectedTech}-${modIndex}-${lessonIdx}-${lessonId}`}
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
                                    {lesson.description || 'Learn core concepts and complete hands-on practice'}
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
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm
  },
  container: {
    flex: 1
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  roadmapHeaderBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  trackPill: {
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#C7C5FF'
  },
  trackPillText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
    letterSpacing: 0.6
  },
  levelPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  levelPillText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '700',
    color: '#047857'
  },
  roadmapTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
    marginBottom: 6,
    letterSpacing: -0.3
  },
  roadmapDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: SPACING.md
  },
  progressCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  progressStatusLabel: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155'
  },
  progressPercent: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981'
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4
  },
  sectionHeadingWrap: {
    marginBottom: SPACING.md
  },
  sectionHeadingTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 19,
    fontWeight: '700',
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
    padding: 18,
    elevation: 2
  },
  techCardInProgressBorder: {
    borderColor: '#4F46E5'
  },
  techCardCompletedBorder: {
    borderColor: '#10B981'
  },
  techCardLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.85
  },
  techCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  techIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEEDFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  techIconWrapCompleted: {
    backgroundColor: '#ECFDF5'
  },
  statusBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  badgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  badgeCompletedText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '700',
    color: '#047857'
  },
  badgeInProgress: {
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7C5FF'
  },
  badgeInProgressText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5'
  },
  badgeAvailable: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1'
  },
  badgeAvailableText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569'
  },
  badgeLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeLockedText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B'
  },
  techCardTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2
  },
  techCardSubtitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 6
  },
  techCardDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 12
  },
  textMuted: {
    color: '#64748B'
  },
  techCardMetaRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12
  },
  techMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  techMetaText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  cardProgressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden'
  },
  cardProgressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3
  },
  btnCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  btnCompletedText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    color: '#047857'
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12
  },
  btnPrimaryText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEEDFF',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7C5FF'
  },
  btnOutlineText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5'
  },
  btnLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12
  },
  btnLockedText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8'
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
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5'
  },
  compactHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.md,
    elevation: 2
  },
  compactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  compactIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEEDFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  compactHeaderTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },
  compactHeaderSub: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
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
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '800',
    color: '#433EFE'
  },
  moduleHeaderTextWrap: {
    flex: 1
  },
  moduleTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
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
    fontFamily: FONT_FAMILY_MEDIUM,
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
    fontFamily: FONT_FAMILY_MEDIUM,
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
