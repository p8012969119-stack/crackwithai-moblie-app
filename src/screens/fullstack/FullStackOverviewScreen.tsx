import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { FullStackCourseProgress } from '../../types/fullstack';
import { Meter, Notice, palette, ui } from '../../components/fullstack/CurriculumUI';
import { Icon } from '../../components/Icon';
import { useAuth } from '../../store/AuthContext';

import { FULLSTACK_TRACKS } from '../../data/fullstackHtmlData';

const FONT_FAMILY = Platform.OS === 'ios' ? 'System' : 'sans-serif';

export const FullStackOverviewScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [fsProgress, setFsProgress] = useState<FullStackCourseProgress | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError('');

      fullstackApi.getFullStackProgress()
        .then(res => {
          if (active) setFsProgress(res);
        })
        .catch(err => {
          if (active) setError(err?.message || 'Failed to load course progress');
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [revision, user?._id])
  );

  const openFullStackCourse = (techId: string = 'html') => {
    navigation.navigate('HtmlCourse', { tech: techId });
  };

  const handleComingSoon = (courseName: string) => {
    Alert.alert(
      courseName,
      `${courseName} course is coming soon.`
    );
  };

  return (
    <SafeAreaView style={ui.safe} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading && !fsProgress}
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
        <Text style={[ui.body, { marginTop: 6, color: '#475569', fontSize: 14, marginBottom: 18 }]}>
          Learn practical technology and AI skills with hands-on courses.
        </Text>

        {loading && !fsProgress && (
          <ActivityIndicator style={{ margin: 36 }} color={palette.brand} size="large" />
        )}

        {error ? <Notice message={error} retry={() => setRevision(x => x + 1)} /> : null}

        {/* ==================================================
            COURSE 1: FULL STACK DEVELOPMENT (ACTIVE CARD)
            ================================================== */}
        <TouchableOpacity
          style={styles.activeCourseCard}
          activeOpacity={0.9}
          onPress={() => openFullStackCourse('html')}
        >
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

          {fsProgress && (
            <View style={styles.progressContainer}>
              <Meter value={fsProgress.overallPercentage} />
              <Text style={styles.progressSubtext}>
                {fsProgress.completedModules} of 8 modules finished ({fsProgress.completedLessons}/{fsProgress.totalLessons} lessons)
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.startBtnPrimary}
            activeOpacity={0.85}
            onPress={() => openFullStackCourse('html')}
          >
            <Text style={styles.startBtnText}>Start / Continue HTML Course</Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ==================================================
            FULL STACK INDIVIDUAL TRACKS (SEPARATE COURSES)
            ================================================== */}
        <View style={styles.tracksSectionHeader}>
          <Text style={styles.tracksSectionTitle}>Full Stack Technology Tracks</Text>
          <Text style={styles.tracksSectionSub}>Tap any technology to open its isolated modules & lessons</Text>
        </View>

        <View style={styles.tracksContainer}>
          {FULLSTACK_TRACKS.map(track => (
            <TouchableOpacity
              key={track.id}
              style={styles.trackCardItem}
              activeOpacity={0.8}
              onPress={() => openFullStackCourse(track.id)}
            >
              <View style={styles.trackCardIconWrap}>
                <Icon name={track.icon as any || 'code'} size={20} color="#4F46E5" />
              </View>
              <View style={styles.trackCardBody}>
                <View style={styles.trackCardTopRow}>
                  <Text style={styles.trackCardTitle}>{track.title}</Text>
                  <View style={styles.trackLessonsBadge}>
                    <Text style={styles.trackLessonsBadgeText}>{track.lessonsCount || 20} Lessons</Text>
                  </View>
                </View>
                <Text style={styles.trackCardSub} numberOfLines={1}>{track.subtitle || track.description}</Text>
              </View>
              <Icon name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activeCourseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#6366F1',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4
  },
  courseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
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
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.6
  },
  courseProgressBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981'
  },
  courseTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6
  },
  courseDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 14
  },
  progressContainer: {
    marginBottom: 16
  },
  progressSubtext: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 6
  },
  startBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12
  },
  startBtnText: {
    fontFamily: FONT_FAMILY,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  comingSoonCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 16,
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
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6
  },
  comingSoonTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6
  },
  comingSoonDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 16
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
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  tracksSectionHeader: {
    marginTop: 8,
    marginBottom: 12
  },
  tracksSectionTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4
  },
  tracksSectionSub: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#64748B'
  },
  tracksContainer: {
    gap: 10,
    marginBottom: 24
  },
  trackCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12
  },
  trackCardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  trackCardBody: {
    flex: 1
  },
  trackCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  trackCardTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A'
  },
  trackLessonsBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  trackLessonsBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '700',
    color: '#475569'
  },
  trackCardSub: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#64748B'
  }
});
