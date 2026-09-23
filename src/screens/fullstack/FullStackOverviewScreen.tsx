import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { FullStackCourseProgress } from '../../types/fullstack';
import { Meter, Notice, palette, ui } from '../../components/fullstack/CurriculumUI';
import { Icon } from '../../components/Icon';
import { useAuth } from '../../store/AuthContext';

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

  const openFullStackCourse = () => {
    navigation.navigate('HtmlCourse');
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
          onPress={openFullStackCourse}
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
            onPress={openFullStackCourse}
          >
            <Text style={styles.startBtnText}>Continue Learning</Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>

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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6
  },
  courseDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 14
  },
  progressContainer: {
    marginBottom: 16
  },
  progressSubtext: {
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
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6
  },
  comingSoonDesc: {
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
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  }
});
