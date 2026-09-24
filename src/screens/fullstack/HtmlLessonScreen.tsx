import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { HtmlLesson } from '../../types/fullstack';
import { getFallbackLessonById, getCourseForTech } from '../../data/fullstackHtmlData';
import { verifyPracticeTask, PracticeVerificationResult } from '../../utils/htmlValidator';
import { Icon } from '../../components/Icon';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';
const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

export const HtmlLessonScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { lessonId, lessonSlug, selectedTech } = route.params || {};

  const targetId = lessonId || lessonSlug || 'introduction-to-html';
  const initialFallback = getFallbackLessonById(targetId) || null;

  const [currentId, setCurrentId] = useState<string>(targetId);
  const [lesson, setLesson] = useState<HtmlLesson | null>(initialFallback);
  const [loading, setLoading] = useState<boolean>(!initialFallback);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Embedded Practice States
  const [userCode, setUserCode] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<PracticeVerificationResult | null>(null);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const loadLesson = async (id: string) => {
    const fallback = getFallbackLessonById(id);
    if (fallback) {
      setLesson(fallback);
      const starter = fallback.practiceTask?.starterCode || fallback.starterCode || '';
      setUserCode(starter);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const [lessonData, progressData] = await Promise.all([
        fullstackApi.getLesson(id).catch(() => null),
        fullstackApi.getProgress().catch(() => ({ completedLessonIds: [] }))
      ]);

      const resolvedLesson = lessonData || fallback;
      if (resolvedLesson) {
        setLesson(resolvedLesson);
        const resolvedId = resolvedLesson._id || resolvedLesson.id || id;
        const completedIds: string[] = progressData?.completedLessonIds || [];
        const completed = completedIds.includes(resolvedId);
        setIsCompleted(completed);

        const starter = resolvedLesson.practiceTask?.starterCode || resolvedLesson.starterCode || '';
        setUserCode(starter);

        if (resolvedLesson.practiceTask) {
          setVerificationResult(verifyPracticeTask(starter, resolvedLesson.practiceTask));
        }
      }
    } catch (err) {
      console.warn('Failed to load lesson', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId || lessonSlug) {
      const id = lessonId || lessonSlug;
      setCurrentId(id);
      loadLesson(id);
    }
  }, [lessonId, lessonSlug]);

  const handleCopyCode = (code: string) => {
    Clipboard.setString(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = () => {
    setShowPreview(prev => !prev);
    if (lesson?.practiceTask) {
      const res = verifyPracticeTask(userCode, lesson.practiceTask);
      setVerificationResult(res);
    }
  };

  const handleResetCode = () => {
    if (!lesson) return;
    const starter = lesson.practiceTask?.starterCode || lesson.starterCode || '';
    setUserCode(starter);
    setSubmissionFeedback(null);
    if (lesson.practiceTask) {
      setVerificationResult(verifyPracticeTask(starter, lesson.practiceTask));
    }
  };

  const handleSubmitSolution = async () => {
    if (!lesson) return;
    setSubmitting(true);
    setSubmissionFeedback(null);

    try {
      // 1. Practice Verification Check
      if (lesson.practiceTask) {
        const result = verifyPracticeTask(userCode, lesson.practiceTask);
        setVerificationResult(result);

        if (!result.allPassed) {
          const missingCount = result.checks.filter(c => !c.passed).length;
          setSubmissionFeedback({
            type: 'error',
            message: `Practice verification failed. ${missingCount} requirement(s) missing. Review instructions above.`
          });
          setSubmitting(false);
          return;
        }
      }

      // 2. Save Progress to Backend API
      const lessonResolvedId = lesson._id || lesson.id || currentId;
      await fullstackApi.completeLesson(lessonResolvedId, userCode).catch(() => null);

      setIsCompleted(true);
      setSubmissionFeedback({
        type: 'success',
        message: '✓ Practice Passed! Lesson completed successfully.'
      });
    } catch (err: any) {
      setSubmissionFeedback({
        type: 'error',
        message: err?.message || 'Could not submit solution. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Sibling Lessons Lookup
  const activeTechId = selectedTech || 'html';
  const activeCourse = getCourseForTech(activeTechId);
  const techLessons = activeCourse.modules.flatMap(m => m.lessons);

  const currentIndex = techLessons.findIndex(
    l => l._id === currentId || l.id === currentId || l.slug === currentId || (lesson && (l._id === lesson._id || l.slug === lesson.slug))
  );

  const prevLesson = currentIndex > 0 ? techLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < techLessons.length - 1 ? techLessons[currentIndex + 1] : null;

  const navigateToSiblingLesson = (sibling: HtmlLesson) => {
    const target = sibling._id || sibling.id || sibling.slug || '';
    if (target) {
      setCurrentId(target);
      setSubmissionFeedback(null);
      setShowPreview(false);
      loadLesson(target);
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
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Bar Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarSubtitle} numberOfLines={1}>{lesson.moduleTitle || `${activeTechId.toUpperCase()} Module`}</Text>
          <Text style={styles.topBarTitle} numberOfLines={1}>{lesson.title}</Text>
        </View>
        <View style={[styles.completeCheckBtn, isCompleted && styles.completeCheckBtnActive]}>
          <Icon name="check" size={16} color={isCompleted ? '#FFFFFF' : '#94A3B8'} />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Header Card */}
        <View style={styles.lessonHeaderCard}>
          <View style={styles.lessonOrderPill}>
            <Text style={styles.lessonOrderPillText}>LESSON {currentIndex >= 0 ? currentIndex + 1 : lesson.order} OF {techLessons.length || 25}</Text>
          </View>
          <Text style={styles.lessonHeaderTitle}>{lesson.title}</Text>
          {lesson.learningObjective && (
            <View style={styles.objectiveBox}>
              <View style={styles.objectiveHeaderRow}>
                <Icon name="sparkles" size={16} color="#4F46E5" />
                <Text style={styles.objectiveHeaderTitle}>Learning Objective</Text>
              </View>
              <Text style={styles.objectiveText}>{lesson.learningObjective}</Text>
            </View>
          )}
        </View>

        {/* Concept Explanation Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <Icon name="book-open" size={18} color="#4F46E5" />
            <Text style={styles.sectionHeading}>Core Concept</Text>
          </View>
          <Text style={styles.conceptBodyText}>{lesson.concept}</Text>
        </View>

        {/* Code Example Section */}
        {lesson.codeExample && (
          <View style={styles.sectionCard}>
            <View style={styles.exampleHeaderRow}>
              <View style={styles.sectionHeadingRow}>
                <Icon name="code" size={18} color="#4F46E5" />
                <Text style={styles.sectionHeading}>Code Example</Text>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => handleCopyCode(lesson.codeExample || '')}
              >
                <Icon name="copy" size={14} color="#4F46E5" />
                <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.codeSnippetBox}>
              <Text style={styles.codeText}>{lesson.codeExample}</Text>
            </View>

            {lesson.expectedOutput && (
              <View style={styles.expectedOutputBox}>
                <Text style={styles.expectedOutputTitle}>Expected Output Result:</Text>
                <Text style={styles.expectedOutputText}>{lesson.expectedOutput}</Text>
              </View>
            )}
          </View>
        )}

        {/* ==================================================
            EMBEDDED PRACTICE SECTION (INSIDE THE LESSON)
            ================================================== */}
        <View style={styles.practiceSectionCard}>
          <View style={styles.practiceHeaderRow}>
            <View style={styles.taskBadge}>
              <Text style={styles.taskBadgeText}>LESSON PRACTICE TASK</Text>
            </View>
            <TouchableOpacity onPress={handleResetCode} style={styles.resetBtn}>
              <Icon name="refresh-cw" size={13} color="#64748B" />
              <Text style={styles.resetBtnText}>Reset Code</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.taskTitle}>{lesson.practiceTask?.title || `Practice ${lesson.title}`}</Text>
          <Text style={styles.taskDesc}>{lesson.practiceTask?.description || 'Apply what you just learned by completing the required code below.'}</Text>

          {/* Requirements Checklist */}
          {lesson.practiceTask?.requirements && lesson.practiceTask.requirements.length > 0 && (
            <View style={styles.requirementsList}>
              <Text style={styles.requirementsHeader}>Task Requirements:</Text>
              {lesson.practiceTask.requirements.map((req, rIdx) => {
                const checkState = verificationResult?.checks[rIdx];
                const isPassed = checkState?.passed;

                return (
                  <View key={rIdx} style={styles.requirementRow}>
                    <View style={[styles.reqCheckCircle, isPassed && styles.reqCheckCirclePassed]}>
                      <Icon name="check" size={10} color={isPassed ? '#FFFFFF' : '#94A3B8'} />
                    </View>
                    <Text style={[styles.requirementText, isPassed && styles.requirementTextPassed]}>{req}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Interactive Code Editor */}
          <View style={styles.editorContainer}>
            <View style={styles.editorHeader}>
              <Text style={styles.editorHeaderTitle}>Code Editor</Text>
              <Text style={styles.editorHeaderLang}>{activeTechId.toUpperCase()}</Text>
            </View>

            <TextInput
              style={styles.codeInput}
              multiline
              value={userCode}
              onChangeText={(text) => {
                setUserCode(text);
                if (submissionFeedback) setSubmissionFeedback(null);
              }}
              placeholder="Write your code here..."
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Action Buttons Row: Run & Submit */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.runBtn}
              activeOpacity={0.8}
              onPress={handleRunCode}
            >
              <Icon name={showPreview ? 'eye-off' : 'eye'} size={16} color="#4F46E5" />
              <Text style={styles.runBtnText}>{showPreview ? 'Hide Preview' : 'Run & Preview'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              activeOpacity={0.85}
              disabled={submitting}
              onPress={handleSubmitSolution}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit Practice</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Collapsible Live Preview Container */}
          {showPreview && (
            <View style={styles.previewBox}>
              <Text style={styles.previewHeaderTitle}>Live Output Preview:</Text>
              <View style={styles.previewContentBox}>
                <Text style={styles.previewContentText}>{userCode || '(No code output to display)'}</Text>
              </View>
            </View>
          )}

          {/* Submission Feedback Message */}
          {submissionFeedback && (
            <View
              style={[
                styles.feedbackBox,
                submissionFeedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError
              ]}
            >
              <Icon
                name={submissionFeedback.type === 'success' ? 'check-circle' : 'alert-circle'}
                size={18}
                color={submissionFeedback.type === 'success' ? '#047857' : '#DC2626'}
              />
              <Text
                style={[
                  styles.feedbackText,
                  submissionFeedback.type === 'success' ? styles.feedbackTextSuccess : styles.feedbackTextError
                ]}
              >
                {submissionFeedback.message}
              </Text>
            </View>
          )}
        </View>

        {/* Lesson Completion Card */}
        <View style={[styles.completionStatusCard, isCompleted && styles.completionStatusCardActive]}>
          <View style={[styles.completionStatusIcon, isCompleted && styles.completionStatusIconActive]}>
            <Icon name="check" size={18} color={isCompleted ? '#FFFFFF' : '#94A3B8'} />
          </View>
          <View style={styles.completionStatusTextWrap}>
            <Text style={[styles.completionStatusTitle, isCompleted && styles.completionStatusTitleActive]}>
              {isCompleted ? 'Lesson Completed ✓' : 'Complete Practice to Advance'}
            </Text>
            <Text style={styles.completionStatusSub}>
              {isCompleted ? 'Your practice solution was verified and progress saved.' : 'Submit your code solution above to complete this lesson.'}
            </Text>
          </View>
        </View>

        {/* Sibling Lesson Navigation Buttons */}
        <View style={styles.bottomNavRow}>
          {prevLesson ? (
            <TouchableOpacity
              style={styles.siblingNavBtn}
              onPress={() => navigateToSiblingLesson(prevLesson)}
            >
              <Icon name="arrow-left" size={16} color="#64748B" />
              <View style={styles.siblingBtnTextWrap}>
                <Text style={styles.siblingBtnLabel}>PREVIOUS LESSON</Text>
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
              <Icon name="arrow-right" size={16} color="#4F46E5" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.siblingNavBtn, styles.siblingNavBtnNext]}
              onPress={() => navigation.goBack()}
            >
              <View style={[styles.siblingBtnTextWrap, { alignItems: 'flex-end' }]}>
                <Text style={styles.siblingBtnLabel}>MODULE COMPLETE</Text>
                <Text style={styles.siblingBtnTitle} numberOfLines={1}>Back to Roadmap</Text>
              </View>
              <Icon name="arrow-right" size={16} color="#4F46E5" />
            </TouchableOpacity>
          )}
        </View>
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
    paddingHorizontal: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F1F5F9'
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.xs
  },
  topBarSubtitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase'
  },
  topBarTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A'
  },
  completeCheckBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  completeCheckBtnActive: {
    backgroundColor: '#10B981'
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
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12
  },
  primaryBtnText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#FFFFFF',
    fontWeight: '700'
  },
  lessonHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2
  },
  lessonOrderPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: 8
  },
  lessonOrderPillText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5'
  },
  lessonHeaderTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10
  },
  objectiveBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  objectiveHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  objectiveHeaderTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5'
  },
  objectiveText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  sectionHeading: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  conceptBodyText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: '#334155',
    lineHeight: 21
  },
  exampleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  copyBtnText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5'
  },
  codeSnippetBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#38BDF8',
    lineHeight: 20
  },
  expectedOutputBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  expectedOutputTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4
  },
  expectedOutputText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#0F172A'
  },
  practiceSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: '#6366F1',
    elevation: 3
  },
  practiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  taskBadge: {
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7C5FF'
  },
  taskBadgeText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5'
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  resetBtnText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    color: '#64748B'
  },
  taskTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4
  },
  taskDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12
  },
  requirementsList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  requirementsHeader: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  reqCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  reqCheckCirclePassed: {
    backgroundColor: '#10B981'
  },
  requirementText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#475569'
  },
  requirementTextPassed: {
    color: '#047857',
    fontWeight: '600'
  },
  editorContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#334155',
    marginBottom: 14
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  editorHeaderTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8'
  },
  editorHeaderLang: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8'
  },
  codeInput: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    padding: 14,
    minHeight: 140,
    textAlignVertical: 'top'
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10
  },
  runBtn: {
    flex: 1,
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
  runBtnText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5'
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12
  },
  submitBtnText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  previewBox: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  previewHeaderTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6
  },
  previewContentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1'
  },
  previewContentText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#0F172A'
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 10
  },
  feedbackSuccess: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  feedbackText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    flex: 1
  },
  feedbackTextSuccess: {
    color: '#047857',
    fontWeight: '700'
  },
  feedbackTextError: {
    color: '#B91C1C',
    fontWeight: '600'
  },
  completionStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12
  },
  completionStatusCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981'
  },
  completionStatusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  completionStatusIconActive: {
    backgroundColor: '#10B981'
  },
  completionStatusTextWrap: {
    flex: 1
  },
  completionStatusTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B'
  },
  completionStatusTitleActive: {
    color: '#047857'
  },
  completionStatusSub: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 6
  },
  siblingNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10
  },
  siblingNavBtnNext: {
    borderColor: '#EEEDFF',
    backgroundColor: '#FFFFFF'
  },
  siblingNavBtnEmpty: {
    flex: 1
  },
  siblingBtnTextWrap: {
    flex: 1
  },
  siblingBtnLabel: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B'
  },
  siblingBtnTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2
  }
});
