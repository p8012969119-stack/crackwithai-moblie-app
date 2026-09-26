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

// Omit invalid font strings on Android to prevent system cursive theme fallback
const FONT_FAMILY = Platform.OS === 'android' ? undefined : 'System';

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

  const handleComingSoon = (courseName: string) => {
    Alert.alert(
      courseName,
      `${courseName} course is coming soon.`
    );
  };

  return (
    <SafeAreaView style={[ui.safe, { backgroundColor: '#F8FAFC' }]} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading && !fsProgress}
            onRefresh={() => setRevision(x => x + 1)}
          />
        }
        contentContainerStyle={[ui.page, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={ui.back}
        >
          <Text style={[ui.backText, { color: '#5653FE', fontWeight: '700' }]}>‹ Back to dashboard</Text>
        </TouchableOpacity>

        {/* Learning Header */}
        <Text style={[ui.eyebrow, { color: '#5653FE', fontWeight: '800', letterSpacing: 1.2 }]}>CRACKWITHAI / COURSES</Text>
        <Text style={[ui.title, { color: '#0F172A', fontWeight: '800' }]}>LEARNING</Text>
        <Text style={[ui.body, { marginTop: 6, color: '#475569', fontSize: 14, marginBottom: 20 }]}>
          Learn practical technology and AI skills with hands-on courses.
        </Text>

        {loading && !fsProgress && (
          <ActivityIndicator style={{ margin: 36 }} color="#5653FE" size="large" />
        )}

        {error ? <Notice message={error} retry={() => setRevision(x => x + 1)} /> : null}

        {/* ==================================================
            CARD 1: FULL STACK DEVELOPMENT (ACTIVE CURRICULUM CARD)
            ================================================== */}
        <TouchableOpacity
          style={styles.activeCourseCard}
          activeOpacity={0.92}
          onPress={() => navigation.navigate('FullStackRoadmap')}
        >
          <View style={styles.courseHeaderRow}>
            <View style={styles.activeBadgeContainer}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>ACTIVE CURRICULUM</Text>
            </View>
            <Text style={styles.courseProgressBadgeText}>
              {fsProgress ? `${fsProgress.overallPercentage}% Progress` : 'Active'}
            </Text>
          </View>

          <View style={styles.cardTitleRow}>
            <View style={[styles.cardIconBadge, { backgroundColor: '#EEEDFF' }]}>
              <Icon name="code" size={20} color="#5653FE" />
            </View>
            <Text style={styles.courseTitle}>Full Stack Development</Text>
          </View>

          <Text style={styles.courseDesc}>
            Master 9 sequential technologies: HTML, CSS, JavaScript, Node.js, Express, MongoDB, REST API, Authentication & Capstone.
          </Text>

          {fsProgress && (
            <View style={styles.progressContainer}>
              <Meter value={fsProgress.overallPercentage} />
              <Text style={styles.progressSubtext}>
                {fsProgress.completedModules} of 9 courses finished ({fsProgress.completedLessons}/{fsProgress.totalLessons} lessons)
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.startBtnPillPrimary}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FullStackRoadmap')}
          >
            <Text style={styles.startBtnPillText}>Explore Curriculum Courses</Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ==================================================
            CARD 2: PROMPT ENGINEERING (VIBRANT LAVENDER CARD)
            ================================================== */}
        <TouchableOpacity
          style={styles.promptCard}
          activeOpacity={0.88}
          onPress={() => handleComingSoon('Prompt Engineering')}
        >
          <View style={styles.courseHeaderRow}>
            <View style={styles.promptBadge}>
              <Icon name="sparkles" size={12} color="#6D28D9" />
              <Text style={styles.promptBadgeText}>COMING SOON</Text>
            </View>
          </View>

          <View style={styles.cardTitleRow}>
            <View style={[styles.cardIconBadge, { backgroundColor: '#EDE9FE' }]}>
              <Icon name="sparkles" size={18} color="#7C3AED" />
            </View>
            <Text style={styles.promptTitle}>Prompt Engineering</Text>
          </View>

          <Text style={styles.promptDesc}>
            Master the art and science of prompt crafting, system instructions, and LLM reasoning patterns.
          </Text>

          <TouchableOpacity
            style={styles.promptBtnPill}
            activeOpacity={0.85}
            onPress={() => handleComingSoon('Prompt Engineering')}
          >
            <Icon name="clock" size={14} color="#FFFFFF" />
            <Text style={styles.promptBtnPillText}>Coming Soon</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ==================================================
            CARD 3: CONTEXT ENGINEERING (VIBRANT TEAL/BLUE CARD)
            ================================================== */}
        <TouchableOpacity
          style={styles.contextCard}
          activeOpacity={0.88}
          onPress={() => handleComingSoon('Context Engineering')}
        >
          <View style={styles.courseHeaderRow}>
            <View style={styles.contextBadge}>
              <Icon name="database" size={12} color="#0369A1" />
              <Text style={styles.contextBadgeText}>COMING SOON</Text>
            </View>
          </View>

          <View style={styles.cardTitleRow}>
            <View style={[styles.cardIconBadge, { backgroundColor: '#E0F2FE' }]}>
              <Icon name="database" size={18} color="#0284C7" />
            </View>
            <Text style={styles.contextTitle}>Context Engineering</Text>
          </View>

          <Text style={styles.contextDesc}>
            Learn context window optimization, dynamic retrieval-augmented generation (RAG), and agentic memory structures.
          </Text>

          <TouchableOpacity
            style={styles.contextBtnPill}
            activeOpacity={0.85}
            onPress={() => handleComingSoon('Context Engineering')}
          >
            <Icon name="clock" size={14} color="#FFFFFF" />
            <Text style={styles.contextBtnPillText}>Coming Soon</Text>
          </TouchableOpacity>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activeCourseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#5653FE',
    padding: 20,
    marginBottom: 18,
    shadowColor: '#5653FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4
  },
  courseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  activeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
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
    color: '#5653FE',
    letterSpacing: 0.6
  },
  courseProgressBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981'
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  cardIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  courseTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1
  },
  courseDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19.5,
    marginBottom: 16
  },
  progressContainer: {
    marginBottom: 18
  },
  progressSubtext: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 6
  },
  startBtnPillPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#5653FE',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 9999,
    shadowColor: '#5653FE',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  startBtnPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },

  /* PROMPT ENGINEERING CARD (SOFT VIBRANT PURPLE TINT) */
  promptCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    padding: 20,
    marginBottom: 18,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  promptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999
  },
  promptBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.6
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4C1D95',
    flex: 1
  },
  promptDesc: {
    fontSize: 13,
    color: '#5B21B6',
    lineHeight: 19.5,
    marginBottom: 16
  },
  promptBtnPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9999,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  promptBtnPillText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF'
  },

  /* CONTEXT ENGINEERING CARD (SOFT VIBRANT CYAN/BLUE TINT) */
  contextCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    padding: 20,
    marginBottom: 18,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999
  },
  contextBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: 0.6
  },
  contextTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0C4A6E',
    flex: 1
  },
  contextDesc: {
    fontSize: 13,
    color: '#0369A1',
    lineHeight: 19.5,
    marginBottom: 16
  },
  contextBtnPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9999,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  contextBtnPillText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});
