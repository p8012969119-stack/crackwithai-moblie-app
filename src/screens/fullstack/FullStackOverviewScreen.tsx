import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { curriculumApi } from '../../api/curriculumApi';
import { fullstackApi } from '../../api/fullstackApi';
import { Curriculum } from '../../types/curriculum';
import { FullStackCourseProgress } from '../../types/fullstack';
import { Meter, Notice, palette, ui } from '../../components/fullstack/CurriculumUI';
import { Icon } from '../../components/Icon';
import { useAuth } from '../../store/AuthContext';

export const FullStackOverviewScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [data, setData] = useState<Curriculum | null>(null);
  const [fsProgress, setFsProgress] = useState<FullStackCourseProgress | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      let active = true;
      setLoading(true);
      setError('');

      Promise.allSettled([
        curriculumApi.overview(controller.signal),
        fullstackApi.getFullStackProgress()
      ])
        .then(([currRes, fsRes]) => {
          if (!active) return;
          if (currRes.status === 'fulfilled') {
            setData(currRes.value);
          } else {
            setError(currRes.reason?.message || 'Failed to load curriculum overview');
          }
          if (fsRes.status === 'fulfilled') {
            setFsProgress(fsRes.value);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
        controller.abort();
      };
    }, [revision, user?._id])
  );

  const openModule = (courseSlug?: string) => {
    if (courseSlug) {
      navigation.navigate('HtmlCourse', { courseSlug });
    } else {
      navigation.navigate('HtmlCourse');
    }
  };

  const openWeek = (weekId: string) => navigation.navigate('CurriculumModule', { weekId });

  const handleComingSoon = (courseName: string) => {
    Alert.alert(
      courseName,
      `${courseName} course is coming soon.`
    );
  };

  const months =
    data?.months
      .map(month => ({
        ...month,
        modules: month.modules.filter(m =>
          `${m.title} ${m.topic} ${m.detailedContent.join(' ')}`.toLowerCase().includes(query.toLowerCase())
        )
      }))
      .filter(m => m.modules.length) || [];

  const modulesList = [
    {
      num: 1,
      name: 'HTML',
      desc: 'Semantic markup, forms, tables, media & accessibility',
      slug: 'html',
      key: 'html'
    },
    {
      num: 2,
      name: 'CSS',
      desc: 'Responsive layouts, Flexbox, CSS Grid & animations',
      slug: 'css',
      key: 'css'
    },
    {
      num: 3,
      name: 'JavaScript',
      desc: 'Modern ES6+, DOM manipulation & asynchronous logic',
      slug: 'javascript',
      key: 'javascript'
    },
    {
      num: 4,
      name: 'Node.js',
      desc: 'Server-side runtime, Event Loop, Buffer & File System',
      slug: 'nodejs',
      key: 'nodejs'
    },
    {
      num: 5,
      name: 'Express.js',
      desc: 'Fast backend framework, routing & middleware',
      slug: 'expressjs',
      key: 'expressjs'
    },
    {
      num: 6,
      name: 'MongoDB',
      desc: 'NoSQL database, Mongoose ODM, schemas & queries',
      slug: 'mongodb',
      key: 'mongodb'
    },
    {
      num: 7,
      name: 'REST API & Authentication',
      desc: 'RESTful API architecture, JWT tokens & security',
      slug: 'rest-api',
      key: 'rest-auth'
    },
    {
      num: 8,
      name: 'Final Full Stack Project',
      desc: 'Production capstone web app deployed end-to-end',
      slug: 'final-project',
      key: 'final-project'
    }
  ];

  const fullStackTechTags = [
    'HTML',
    'CSS',
    'JavaScript',
    'Node.js',
    'Express.js',
    'MongoDB',
    'REST API',
    'Authentication',
    'Final Project'
  ];

  return (
    <SafeAreaView style={ui.safe} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading && (!!data || !!fsProgress)}
            onRefresh={() => setRevision(x => x + 1)}
          />
        }
        contentContainerStyle={ui.page}
      >
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={ui.back}
        >
          <Text style={ui.backText}>‹ Back to dashboard</Text>
        </TouchableOpacity>

        {/* Learning Header */}
        <Text style={ui.eyebrow}>CRACKWITHAI / COURSES</Text>
        <Text style={ui.title}>LEARNING</Text>
        <Text style={[ui.body, { marginTop: 6, color: '#475569', fontSize: 14 }]}>
          Learn practical technology and AI skills with hands-on courses.
        </Text>

        {loading && !data && !fsProgress && (
          <ActivityIndicator style={{ margin: 36 }} color={palette.brand} size="large" />
        )}

        {error ? <Notice message={error} retry={() => setRevision(x => x + 1)} /> : null}

        {/* ==================================================
            COURSE 1: FULL STACK DEVELOPMENT (ACTIVE COURSE CARD)
            ================================================== */}
        <View style={styles.activeCourseCard}>
          {/* Top Header Row */}
          <View style={styles.courseHeaderRow}>
            <View style={styles.activeBadgeContainer}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>ACTIVE COURSE</Text>
            </View>
            <Text style={styles.courseProgressBadgeText}>
              {fsProgress ? `${fsProgress.overallPercentage}% Progress` : 'Active'}
            </Text>
          </View>

          <Text style={styles.courseTitle}>Full Stack Development</Text>
          <Text style={styles.courseDesc}>
            Master client-side, server-side, database engineering, and capstone deployment.
          </Text>

          {/* Tech Stack Pills */}
          <View style={styles.techTagsWrap}>
            {fullStackTechTags.map((tag, idx) => (
              <View key={idx} style={styles.techTagPill}>
                <Text style={styles.techTagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Certificate Banner / Progress Banner & 8-Module Checklist */}
          {fsProgress && (
            <View style={styles.fsCardInner}>
              {fsProgress.courseCompleted || fsProgress.hasCertificate ? (
                <View style={styles.eligibleBanner}>
                  <View style={styles.eligibleTop}>
                    <Icon name="award" size={24} color="#F59E0B" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eligibleTitle}>Certificate Available! 🎉</Text>
                      <Text style={styles.eligibleSub}>
                        You have passed 100% of all 8 Full Stack modules and capstone requirements.
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.claimCertBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('FullStackCertificate')}
                  >
                    <Icon name="award" size={16} color="#0B0F19" />
                    <Text style={styles.claimCertBtnText}>Get Your Certificate</Text>
                    <Icon name="arrow-right" size={14} color="#0B0F19" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.progressBanner}>
                  <View style={styles.progressHeaderRow}>
                    <Text style={styles.progressCardTitle}>Full Stack Course Progress</Text>
                    <Text style={styles.progressPercentText}>{fsProgress.overallPercentage}%</Text>
                  </View>
                  <Meter value={fsProgress.overallPercentage} />
                  <View style={styles.progressStatsRow}>
                    <Text style={styles.progressStatsText}>
                      {fsProgress.completedModules} of 8 modules finished
                    </Text>
                    <Text style={styles.progressStatsText}>
                      {fsProgress.completedLessons} / {fsProgress.totalLessons} lessons
                    </Text>
                  </View>
                </View>
              )}

              {/* 8-Module Course Checklist */}
              <Text style={styles.checklistTitle}>8-MODULE COURSE CHECKLIST</Text>
              <View style={styles.modulesContainer}>
                {modulesList.map(mod => {
                  const modProgress = fsProgress.modules?.find(
                    m => m.moduleNumber === mod.num || m.id === mod.key
                  );
                  const isCompleted = Boolean(modProgress?.isCompleted);
                  const inProgress = Boolean(
                    modProgress && modProgress.completedLessons > 0 && !isCompleted
                  );

                  return (
                    <TouchableOpacity
                      key={mod.num}
                      style={[styles.moduleRow, isCompleted && styles.moduleRowDone]}
                      activeOpacity={0.8}
                      onPress={() => openModule(mod.slug)}
                    >
                      <View
                        style={[
                          styles.moduleCheckWrap,
                          isCompleted && styles.moduleCheckDone,
                          inProgress && styles.moduleCheckProg
                        ]}
                      >
                        <Icon
                          name={isCompleted ? 'check' : inProgress ? 'play' : 'circle'}
                          size={13}
                          color={isCompleted ? '#10B981' : inProgress ? '#6366F1' : '#94A3B8'}
                        />
                      </View>
                      <View style={styles.moduleTextCol}>
                        <View style={styles.moduleHeadingRow}>
                          <Text style={styles.moduleNumTag}>MODULE {mod.num}</Text>
                          <View
                            style={[
                              styles.statusPill,
                              isCompleted
                                ? styles.statusPillDone
                                : inProgress
                                ? styles.statusPillProg
                                : styles.statusPillTodo
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                isCompleted
                                  ? styles.statusPillTextDone
                                  : inProgress
                                  ? styles.statusPillTextProg
                                  : styles.statusPillTextTodo
                              ]}
                            >
                              {isCompleted
                                ? 'Completed'
                                : inProgress
                                ? `${modProgress?.completedLessons}/${modProgress?.totalLessons} done`
                                : 'Ready'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.moduleTitleText}>{mod.name}</Text>
                        <Text style={styles.moduleDescText}>{mod.desc}</Text>
                      </View>
                      <Icon name="chevron-right" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quick Actions Footer */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.cardActionPrimary}
                  onPress={() => navigation.navigate('FullStackCertificate')}
                >
                  <Icon name="award" size={15} color="#FFFFFF" />
                  <Text style={styles.cardActionPrimaryText}>
                    {fsProgress.courseCompleted || fsProgress.hasCertificate
                      ? 'View Certificate'
                      : 'Check Certificate Eligibility'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cardActionSecondary}
                  onPress={() => navigation.navigate('CertificateVerification')}
                >
                  <Icon name="shield" size={15} color="#6366F1" />
                  <Text style={styles.cardActionSecondaryText}>Verify</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ==================================================
            COURSE 2: PROMPT ENGINEERING (COMING SOON CARD)
            ================================================== */}
        <TouchableOpacity
          style={styles.comingSoonCard}
          activeOpacity={0.85}
          onPress={() => handleComingSoon('Prompt Engineering')}
        >
          <View style={styles.courseHeaderRow}>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
            </View>
          </View>

          <Text style={styles.comingSoonTitle}>Prompt Engineering</Text>
          <Text style={styles.comingSoonDesc}>
            Learn how to write effective prompts and communicate better with AI systems.
          </Text>

          <View style={styles.comingSoonBtnContainer}>
            <TouchableOpacity
              style={styles.comingSoonBtn}
              activeOpacity={0.8}
              onPress={() => handleComingSoon('Prompt Engineering')}
            >
              <Icon name="clock" size={14} color="#64748B" />
              <Text style={styles.comingSoonBtnText}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* ==================================================
            COURSE 3: CONTEXT ENGINEERING (COMING SOON CARD)
            ================================================== */}
        <TouchableOpacity
          style={styles.comingSoonCard}
          activeOpacity={0.85}
          onPress={() => handleComingSoon('Context Engineering')}
        >
          <View style={styles.courseHeaderRow}>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
            </View>
          </View>

          <Text style={styles.comingSoonTitle}>Context Engineering</Text>
          <Text style={styles.comingSoonDesc}>
            Learn how to design and manage the context AI systems use to produce better results.
          </Text>

          <View style={styles.comingSoonBtnContainer}>
            <TouchableOpacity
              style={styles.comingSoonBtn}
              activeOpacity={0.8}
              onPress={() => handleComingSoon('Context Engineering')}
            >
              <Icon name="clock" size={14} color="#64748B" />
              <Text style={styles.comingSoonBtnText}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* ==================================================
            6-MONTH CURRICULUM TIMELINE & LESSON DIRECTORY
            ================================================== */}
        {data && (
          <View style={{ marginTop: 28 }}>
            <Text style={ui.eyebrow}>FULL STACK TIMELINE</Text>
            <Text style={[ui.heading, { fontSize: 20, marginBottom: 12 }]}>
              Weekly Learning Schedule
            </Text>

            <TextInput
              accessibilityLabel="Search curriculum modules"
              placeholder="Search HTML, CSS, React, MongoDB…"
              placeholderTextColor={palette.muted}
              value={query}
              onChangeText={setQuery}
              style={styles.search}
              clearButtonMode="while-editing"
            />

            {!months.length && <Text style={ui.body}>No modules match this search.</Text>}

            {months.map(month => (
              <View key={month._id} style={styles.month}>
                <Text style={ui.eyebrow}>MONTH {month.monthNumber}</Text>
                <Text style={ui.heading}>{month.title}</Text>
                {month.modules.map(module => (
                  <TouchableOpacity
                    key={module._id}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${module.title}, ${module.status}`}
                    onPress={() => openWeek(module._id)}
                    style={styles.module}
                  >
                    <View style={[ui.row, { justifyContent: 'space-between' }]}>
                      <Text style={styles.week}>
                        WEEK {module.weekNumber}
                        {module.weekEnd !== module.weekNumber ? `–${module.weekEnd}` : ''} ·{' '}
                        {module.estimatedTime}
                      </Text>
                      <Text
                        style={[
                          styles.status,
                          module.status === 'Completed' && { color: palette.green }
                        ]}
                      >
                        {module.status === 'Completed' ? '✓ ' : ''}
                        {module.status}
                      </Text>
                    </View>
                    <Text style={[ui.heading, { fontSize: 18, marginTop: 8 }]}>
                      {module.title} <Text style={{ color: palette.brand }}>›</Text>
                    </Text>
                    <Text style={[ui.body, { marginTop: 4 }]}>{module.topic}</Text>
                    <Text style={[ui.small, { marginTop: 6 }]}>
                      {module.detailedContent.join(' · ')}
                    </Text>
                    <Text style={[ui.small, { marginTop: 10, color: palette.ink }]}>
                      <Text style={{ fontWeight: '700' }}>Build: </Text>
                      {module.practicalProject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activeCourseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6366F1',
    padding: 18,
    marginVertical: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  courseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  activeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981'
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.6
  },
  courseProgressBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981'
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4
  },
  courseDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12
  },
  techTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16
  },
  techTagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  techTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155'
  },
  fsCardInner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 4
  },
  comingSoonCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginVertical: 8,
    opacity: 0.95
  },
  comingSoonBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1'
  },
  comingSoonBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4
  },
  comingSoonDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14
  },
  comingSoonBtnContainer: {
    alignItems: 'flex-start'
  },
  comingSoonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  comingSoonBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  fsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginVertical: 18
  },
  eligibleBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F59E0B',
    padding: 16,
    marginBottom: 16
  },
  eligibleTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 12
  },
  eligibleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2
  },
  eligibleSub: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16
  },
  claimCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 10
  },
  claimCertBtnText: {
    color: '#0B0F19',
    fontSize: 13,
    fontWeight: '800'
  },
  progressBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B'
  },
  progressPercentText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4F46E5'
  },
  progressStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  progressStatsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  modulesContainer: {
    gap: 8,
    marginBottom: 16
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10
  },
  moduleRowDone: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4'
  },
  moduleCheckWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  moduleCheckDone: {
    backgroundColor: '#DCFCE7'
  },
  moduleCheckProg: {
    backgroundColor: '#EEF2FF'
  },
  moduleTextCol: {
    flex: 1
  },
  moduleHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  moduleNumTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.5
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusPillDone: {
    backgroundColor: '#DCFCE7'
  },
  statusPillProg: {
    backgroundColor: '#EEF2FF'
  },
  statusPillTodo: {
    backgroundColor: '#F1F5F9'
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700'
  },
  statusPillTextDone: {
    color: '#16A34A'
  },
  statusPillTextProg: {
    color: '#4F46E5'
  },
  statusPillTextTodo: {
    color: '#94A3B8'
  },
  moduleTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  moduleDescText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10
  },
  cardActionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 10
  },
  cardActionPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  cardActionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  cardActionSecondaryText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700'
  },
  search: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: palette.ink,
    minHeight: 48,
    marginBottom: 16
  },
  month: {
    marginTop: 24
  },
  module: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: palette.line
  },
  week: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.muted,
    letterSpacing: 0.5
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.brand
  }
});
