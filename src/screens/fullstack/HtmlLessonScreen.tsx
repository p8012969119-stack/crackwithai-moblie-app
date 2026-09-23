import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { HtmlLesson } from '../../types/fullstack';
import { FALLBACK_HTML_LESSONS } from '../../data/fullstackHtmlData';
import { Icon } from '../../components/Icon';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export const HtmlLessonScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { lessonId, lessonSlug } = route.params || {};

  const [currentId, setCurrentId] = useState<string>(lessonId || lessonSlug || 'introduction-to-html');
  const [lesson, setLesson] = useState<HtmlLesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const loadLesson = async (id: string) => {
    setLoading(true);
    try {
      const [lessonData, progressData] = await Promise.all([
        fullstackApi.getLesson(id),
        fullstackApi.getProgress()
      ]);

      if (lessonData) {
        setLesson(lessonData);
        const resolvedId = lessonData._id || lessonData.id || id;
        setIsCompleted((progressData.completedLessonIds || []).includes(resolvedId));
      }
    } catch (err) {
      console.warn('Failed to load lesson', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId || lessonSlug) {
      const target = lessonId || lessonSlug;
      setCurrentId(target);
      loadLesson(target);
    }
  }, [lessonId, lessonSlug]);

  const handleCopyCode = (code: string) => {
    Clipboard.setString(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchPlayground = () => {
    if (!lesson) return;
    navigation.navigate('HtmlPlayground', {
      lessonId: lesson._id || lesson.id,
      lessonTitle: lesson.title,
      starterCode: lesson.practiceTask?.starterCode || lesson.starterCode,
      practiceTask: lesson.practiceTask
    });
  };

  // Find previous and next lesson indices
  const allLessons = FALLBACK_HTML_LESSONS;
  const currentIndex = allLessons.findIndex(
    l => l._id === currentId || l.id === currentId || l.slug === currentId || (lesson && (l._id === lesson._id || l.slug === lesson.slug))
  );
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const scrollViewRef = React.useRef<ScrollView>(null);

  const navigateToSiblingLesson = (sibling: HtmlLesson) => {
    const targetId = sibling._id || sibling.id || '';
    if (targetId) {
      setCurrentId(targetId);
      loadLesson(targetId);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Loading Lesson...</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Lesson Not Found</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Could not load the requested lesson.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryBtnText}>Back to Curriculum</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarSubtitle} numberOfLines={1}>{lesson.moduleTitle || 'HTML Module'}</Text>
          <Text style={styles.topBarTitle} numberOfLines={1}>{lesson.title}</Text>
        </View>
        <View style={[styles.completeCheckBtn, isCompleted && styles.completeCheckBtnActive]}>
          <Icon name="check" size={16} color={isCompleted ? '#FFFFFF' : COLORS.textMuted} />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Header */}
        <View style={styles.lessonHeaderCard}>
          <View style={styles.lessonOrderPill}>
            <Text style={styles.lessonOrderPillText}>LESSON {currentIndex >= 0 ? currentIndex + 1 : lesson.order} OF 25</Text>
          </View>
          <Text style={styles.lessonHeaderTitle}>{lesson.title}</Text>
          {lesson.learningObjective && (
            <View style={styles.objectiveBox}>
              <View style={styles.objectiveHeaderRow}>
                <Icon name="sparkles" size={16} color={COLORS.primary} />
                <Text style={styles.objectiveHeaderTitle}>Learning Objective</Text>
              </View>
              <Text style={styles.objectiveText}>{lesson.learningObjective}</Text>
            </View>
          )}
        </View>

        {/* Concept Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <Icon name="book-open" size={18} color={COLORS.primary} />
            <Text style={styles.sectionHeading}>Core Concept</Text>
          </View>
          <Text style={styles.conceptBodyText}>{lesson.concept}</Text>
        </View>

        {/* Code Example Section */}
        {lesson.codeExample && (
          <View style={styles.sectionCard}>
            <View style={styles.exampleHeaderRow}>
              <View style={styles.sectionHeadingRow}>
                <Icon name="code" size={18} color={COLORS.primary} />
                <Text style={styles.sectionHeading}>Code Example</Text>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => handleCopyCode(lesson.codeExample || '')}
              >
                <Icon name="copy" size={14} color={COLORS.primary} />
                <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.codeSnippetBox}>
              <Text style={styles.codeText}>{lesson.codeExample}</Text>
            </View>

            {lesson.expectedOutput && (
              <View style={styles.expectedOutputBox}>
                <Text style={styles.expectedOutputTitle}>Expected Browser Output:</Text>
                <Text style={styles.expectedOutputText}>{lesson.expectedOutput}</Text>
              </View>
            )}
          </View>
        )}

        {/* Practice Task Section */}
        {lesson.practiceTask && (
          <View style={styles.taskCard}>
            <View style={styles.taskBadge}>
              <Text style={styles.taskBadgeText}>HANDS-ON PRACTICE TASK</Text>
            </View>

            <Text style={styles.taskTitle}>{lesson.practiceTask.title}</Text>
            <Text style={styles.taskDesc}>{lesson.practiceTask.description}</Text>

            {lesson.practiceTask.requirements && lesson.practiceTask.requirements.length > 0 && (
              <View style={styles.requirementsList}>
                <Text style={styles.requirementsHeader}>Requirements to satisfy:</Text>
                {lesson.practiceTask.requirements.map((req, rIdx) => (
                  <View key={rIdx} style={styles.requirementRow}>
                    <View style={styles.reqBullet} />
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Launch HTML Playground Button */}
            <TouchableOpacity
              style={styles.launchPlaygroundBtn}
              activeOpacity={0.85}
              onPress={handleLaunchPlayground}
            >
              <Icon name="code" size={18} color="#FFFFFF" />
              <Text style={styles.launchPlaygroundBtnText}>Try in HTML Playground</Text>
              <Icon name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Practice Completion Status Card */}
        <TouchableOpacity
          style={[styles.completeActionCard, isCompleted && styles.completeActionCardActive]}
          onPress={isCompleted ? undefined : handleLaunchPlayground}
          activeOpacity={isCompleted ? 1 : 0.8}
        >
          <View style={[styles.completeCheckIcon, isCompleted && styles.completeCheckIconActive]}>
            <Icon name="check" size={18} color={isCompleted ? '#FFFFFF' : COLORS.textMuted} />
          </View>
          <View style={styles.completeActionTextWrap}>
            <Text style={[styles.completeActionTitle, isCompleted && styles.completeActionTitleActive]}>
              {isCompleted ? 'Hands-on Practice Verified ✓' : 'Complete Practice to Finish Lesson'}
            </Text>
            <Text style={styles.completeActionSubtitle}>
              {isCompleted ? 'All requirements satisfied and progress saved' : 'Tap to open HTML Playground and submit your solution'}
            </Text>
          </View>
          {!isCompleted && <Icon name="chevron-right" size={16} color={COLORS.primary} />}
        </TouchableOpacity>


        {/* Sibling Lesson Navigation */}
        <View style={styles.bottomNavRow}>
          {prevLesson ? (
            <TouchableOpacity
              style={styles.siblingNavBtn}
              onPress={() => navigateToSiblingLesson(prevLesson)}
            >
              <Icon name="arrow-left" size={16} color={COLORS.textSecondary} />
              <View style={styles.siblingBtnTextWrap}>
                <Text style={styles.siblingBtnLabel}>PREVIOUS</Text>
                <Text style={styles.siblingBtnTitle} numberOfLines={1}>{prevLesson.title}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.siblingNavBtnEmpty} />
          )}

          {nextLesson ? (
            <TouchableOpacity
              style={[styles.siblingNavBtn, styles.siblingNavBtnNext]}
              onPress={() => navigateToSiblingLesson(nextLesson)}
            >
              <View style={[styles.siblingBtnTextWrap, { alignItems: 'flex-end' }]}>
                <Text style={styles.siblingBtnLabel}>NEXT LESSON</Text>
                <Text style={styles.siblingBtnTitle} numberOfLines={1}>{nextLesson.title}</Text>
              </View>
              <Icon name="arrow-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.siblingNavBtnEmpty} />
          )}
        </View>
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
    height: 54,
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
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.xs
  },
  topBarSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase'
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  completeCheckBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC'
  },
  completeCheckBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  container: {
    flex: 1
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.md
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  lessonHeaderCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small
  },
  lessonOrderPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs
  },
  lessonOrderPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5
  },
  lessonHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm
  },
  objectiveBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary
  },
  objectiveHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  objectiveHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary
  },
  objectiveText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.xs
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  conceptBodyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22
  },
  exampleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary
  },
  codeSnippetBox: {
    backgroundColor: '#0F172A',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginVertical: SPACING.xs
  },
  codeText: {
    fontFamily: 'Courier',
    fontSize: 12.5,
    color: '#38BDF8',
    lineHeight: 18
  },
  expectedOutputBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.xs
  },
  expectedOutputTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2
  },
  expectedOutputText: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  taskCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    ...SHADOWS.small
  },
  taskBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs
  },
  taskBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  taskDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm
  },
  requirementsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md
  },
  requirementsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 6
  },
  reqBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
    marginTop: 6
  },
  requirementText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17
  },
  launchPlaygroundBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 8
  },
  launchPlaygroundBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  completeActionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12
  },
  completeActionCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5'
  },
  completeCheckIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC'
  },
  completeCheckIconActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  completeActionTextWrap: {
    flex: 1
  },
  completeActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  completeActionTitleActive: {
    color: '#065F46'
  },
  completeActionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2
  },
  bottomNavRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs
  },
  siblingNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8
  },
  siblingNavBtnNext: {
    justifyContent: 'flex-end',
    borderColor: COLORS.primaryLight
  },
  siblingNavBtnEmpty: {
    flex: 1
  },
  siblingBtnTextWrap: {
    flex: 1
  },
  siblingBtnLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted
  },
  siblingBtnTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary
  }
});
