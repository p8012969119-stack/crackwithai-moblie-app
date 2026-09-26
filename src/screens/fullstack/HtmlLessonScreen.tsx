import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { HtmlLesson } from '../../types/fullstack';
import { getFallbackLessonById, getCourseForTech } from '../../data/fullstackHtmlData';
import {
  validateHtml,
  verifyPracticeTask,
  HtmlValidationResult,
  PracticeVerificationResult
} from '../../utils/htmlValidator';
import { Icon } from '../../components/Icon';
import { COLORS } from '../../constants/theme';

const FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';
const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

// Helper to wrap HTML with clean responsive styling for live browser simulation
const buildPreviewHtml = (rawHtml: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 16px;
      margin: 0;
      color: #0F172A;
      background-color: #FFFFFF;
      line-height: 1.5;
    }
    h1, h2, h3, h4, h5, h6 { color: #1E293B; margin-top: 14px; margin-bottom: 8px; font-weight: 700; }
    h1 { font-size: 24px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; }
    h2 { font-size: 20px; }
    h3 { font-size: 16px; }
    p { margin-top: 0; margin-bottom: 12px; font-size: 14px; color: #334155; }
    ul, ol { margin: 8px 0 12px 20px; padding: 0; }
    li { margin-bottom: 4px; font-size: 14px; color: #334155; }
    a { color: #4F46E5; text-decoration: underline; }
    img { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #E2E8F0; }
    table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 13px; }
    th, td { border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; }
    th { background-color: #F1F5F9; color: #0F172A; font-weight: 700; }
    form { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin: 14px 0; }
    label { display: block; font-weight: 600; margin-top: 8px; margin-bottom: 4px; font-size: 13px; color: #1E293B; }
    input, select, textarea {
      width: 100%;
      font-family: inherit;
      font-size: 14px;
      padding: 8px 10px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      margin-bottom: 8px;
      background-color: #FFFFFF;
      box-sizing: border-box;
    }
    input[type="submit"], button {
      background-color: #4F46E5;
      color: #FFFFFF;
      border: none;
      padding: 9px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      margin-top: 8px;
      width: auto;
    }
  </style>
</head>
<body>
  ${rawHtml || '<p style="color: #94A3B8; font-style: italic;">(Output is empty. Write your HTML code in the editor above.)</p>'}
</body>
</html>`;
};

export const HtmlLessonScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { lessonId, lessonSlug, selectedTech } = route.params || {};

  const activeTech = (selectedTech || 'html').toLowerCase();
  const targetId = lessonId || lessonSlug || 'introduction-to-html';
  const initialFallback = getFallbackLessonById(targetId) || null;

  const [currentId, setCurrentId] = useState<string>(targetId);
  const [lesson, setLesson] = useState<HtmlLesson | null>(initialFallback);
  const [loading, setLoading] = useState<boolean>(!initialFallback);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Embedded Practice States
  const [userCode, setUserCode] = useState<string>('');
  const [activePracticeTab, setActivePracticeTab] = useState<'editor' | 'preview' | 'target'>('editor');
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Validation and Error Checking States
  const [validationResult, setValidationResult] = useState<HtmlValidationResult | null>(null);
  const [taskResult, setTaskResult] = useState<PracticeVerificationResult | null>(null);
  const [showErrorCard, setShowErrorCard] = useState<boolean>(false);
  const [showRefSolution, setShowRefSolution] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const loadLesson = useCallback(async (id: string) => {
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
        fullstackApi.getLesson(id, activeTech).catch(() => null),
        fullstackApi.getProgress(activeTech).catch(() => ({ completedLessonIds: [] }))
      ]);

      const resolved = lessonData || fallback;
      if (resolved) {
        setLesson(resolved);
        const resolvedId = resolved._id || resolved.id || resolved.slug || id;
        const completedIds: string[] = progressData?.completedLessonIds || [];
        const isDone = completedIds.includes(resolvedId) || (resolved.slug ? completedIds.includes(resolved.slug) : false);
        setIsCompleted(isDone);

        const starter = resolved.practiceTask?.starterCode || resolved.starterCode || '';
        setUserCode(starter);

        // Pre-evaluate task requirements
        if (resolved.practiceTask) {
          setTaskResult(verifyPracticeTask(starter, resolved.practiceTask));
        }
      }
    } catch (err) {
      console.warn('Failed to load lesson from database', err);
    } finally {
      setLoading(false);
    }
  }, [activeTech]);

  useEffect(() => {
    if (lessonId || lessonSlug) {
      const id = lessonId || lessonSlug;
      setCurrentId(id);
      loadLesson(id);
    }
  }, [lessonId, lessonSlug, loadLesson]);

  const handleCopy = (text: string, isRef = false) => {
    Clipboard.setString(text);
    if (isRef) {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleResetCode = () => {
    if (!lesson) return;
    const starter = lesson.practiceTask?.starterCode || lesson.starterCode || '';
    setUserCode(starter);
    setValidationResult(null);
    setTaskResult(null);
    setShowErrorCard(false);
    setSubmissionFeedback(null);
  };

  // Check Code for Errors & Mistakes (syntax + task requirements)
  const handleCheckCode = () => {
    const syntaxCheck = validateHtml(userCode);
    setValidationResult(syntaxCheck);

    let taskCheck: PracticeVerificationResult | null = null;
    if (lesson?.practiceTask) {
      taskCheck = verifyPracticeTask(userCode, lesson.practiceTask);
      setTaskResult(taskCheck);
    }

    setShowErrorCard(true);
  };

  // Quick HTML tag snippet insertion
  const handleInsertSnippet = (snippet: string) => {
    setUserCode(prev => prev + '\n' + snippet);
  };

  const handleSubmitSolution = async () => {
    if (!lesson) return;
    setSubmitting(true);
    setSubmissionFeedback(null);

    try {
      // 1. Run Structural Check
      const syntaxCheck = validateHtml(userCode);
      setValidationResult(syntaxCheck);

      if (!syntaxCheck.isValid && syntaxCheck.errors.length > 0) {
        setShowErrorCard(true);
        setSubmissionFeedback({
          type: 'error',
          message: `Fix the ${syntaxCheck.errors.length} syntax error(s) below before submitting.`
        });
        setSubmitting(false);
        return;
      }

      // 2. Run Task Requirements Check
      if (lesson.practiceTask) {
        const taskCheck = verifyPracticeTask(userCode, lesson.practiceTask);
        setTaskResult(taskCheck);

        if (!taskCheck.allPassed) {
          setShowErrorCard(true);
          const missing = taskCheck.checks.filter(c => !c.passed).length;
          setSubmissionFeedback({
            type: 'error',
            message: `${missing} requirement(s) not satisfied. Check requirements checklist below.`
          });
          setSubmitting(false);
          return;
        }
      }

      // 3. Save Progress to Database via API
      const lessonResolvedId = lesson._id || lesson.id || lesson.slug || currentId;
      await fullstackApi.completeLesson(lessonResolvedId, activeTech, userCode).catch(() => null);

      setIsCompleted(true);
      setShowErrorCard(false);
      setSubmissionFeedback({
        type: 'success',
        message: '✓ Perfect! Your code passed all checks and progress is saved.'
      });
    } catch (err: any) {
      setSubmissionFeedback({
        type: 'error',
        message: err?.message || 'Failed to submit practice. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Sibling Lessons Lookup (in the current technology track only)
  const activeCourse = useMemo(() => getCourseForTech(activeTech), [activeTech]);
  const techLessons = useMemo(() => activeCourse.modules.flatMap(m => m.lessons), [activeCourse]);

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
      setValidationResult(null);
      setTaskResult(null);
      setShowErrorCard(false);
      setActivePracticeTab('editor');
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
          <View style={{ width: 40 }} />
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
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Could not load the requested lesson.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryBtnText}>Back to Course</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const referenceCode = lesson.practiceTask?.referenceExample || lesson.practiceTask?.referenceCode || lesson.codeExample || '';
  const expectedOutputHtml = lesson.practiceTask?.referenceExample || lesson.codeExample || `<p>${lesson.expectedOutput || 'Output display'}</p>`;
  const syntaxErrorsCount = validationResult?.errors?.length || 0;
  const isSyntaxClean = validationResult && syntaxErrorsCount === 0;
  const isTaskPassing = taskResult?.allPassed;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.topBarSubtitle} numberOfLines={1}>
            {lesson.moduleTitle || `${activeTech.toUpperCase()} Course`}
          </Text>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {lesson.title}
          </Text>
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
            <Text style={styles.lessonOrderPillText}>
              LESSON {currentIndex >= 0 ? currentIndex + 1 : lesson.order} OF {techLessons.length || 25}
            </Text>
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

        {/* Core Concept Explanation */}
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
                onPress={() => handleCopy(lesson.codeExample || '', false)}
              >
                <Icon name="copy" size={14} color="#4F46E5" />
                <Text style={styles.copyBtnText}>{copiedCode ? 'Copied!' : 'Copy Code'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.codeSnippetBox}>
              <Text style={styles.codeText}>{lesson.codeExample}</Text>
            </View>

            {lesson.expectedOutput && (
              <View style={styles.expectedOutputBox}>
                <Text style={styles.expectedOutputTitle}>Expected Output:</Text>
                <Text style={styles.expectedOutputText}>{lesson.expectedOutput}</Text>
              </View>
            )}
          </View>
        )}

        {/* ==================================================
            EMBEDDED PRACTICE WORKSPACE (INSIDE LESSON)
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

          <Text style={styles.taskTitle}>
            {lesson.practiceTask?.title || `Practice: ${lesson.title}`}
          </Text>
          <Text style={styles.taskDesc}>
            {lesson.practiceTask?.description || 'Apply what you learned by writing the required HTML code.'}
          </Text>

          {/* Task Requirements Checklist */}
          {lesson.practiceTask?.requirements && lesson.practiceTask.requirements.length > 0 && (
            <View style={styles.requirementsList}>
              <Text style={styles.requirementsHeader}>Task Requirements:</Text>
              {lesson.practiceTask.requirements.map((req, rIdx) => {
                const checkState = taskResult?.checks?.[rIdx];
                const isPassed = checkState?.passed;

                return (
                  <View key={rIdx} style={styles.requirementRow}>
                    <View style={[styles.reqCheckCircle, isPassed && styles.reqCheckCirclePassed]}>
                      <Icon name="check" size={10} color={isPassed ? '#FFFFFF' : '#94A3B8'} />
                    </View>
                    <Text style={[styles.requirementText, isPassed && styles.requirementTextPassed]}>
                      {req}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Reference Code Toggle (Solution Reference) */}
          {referenceCode ? (
            <View style={styles.refSolutionContainer}>
              <TouchableOpacity
                style={styles.refSolutionToggleBar}
                activeOpacity={0.75}
                onPress={() => setShowRefSolution(prev => !prev)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="eye" size={14} color="#4F46E5" />
                  <Text style={styles.refSolutionToggleText}>
                    {showRefSolution ? 'Hide Reference Code' : 'View Reference Code (Solution Guide)'}
                  </Text>
                </View>
                <Icon name={showRefSolution ? 'arrow-up' : 'chevron-down'} size={16} color="#4F46E5" />
              </TouchableOpacity>

              {showRefSolution && (
                <View style={styles.refSolutionBody}>
                  <View style={styles.refSolutionHeader}>
                    <Text style={styles.refSolutionLabel}>REFERENCE IMPLEMENTATION</Text>
                    <TouchableOpacity
                      style={styles.copyRefBtn}
                      onPress={() => handleCopy(referenceCode, true)}
                    >
                      <Icon name="copy" size={12} color="#FFFFFF" />
                      <Text style={styles.copyRefBtnText}>{copiedRef ? 'Copied!' : 'Copy'}</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={styles.refCodeText}>{referenceCode}</Text>
                  </ScrollView>
                </View>
              )}
            </View>
          ) : null}

          {/* Practice Segmented Tabs: Editor | Live Preview | Expected Target */}
          <View style={styles.practiceTabBar}>
            <TouchableOpacity
              style={[styles.practiceTab, activePracticeTab === 'editor' && styles.practiceTabActive]}
              onPress={() => setActivePracticeTab('editor')}
            >
              <Icon
                name="code"
                size={14}
                color={activePracticeTab === 'editor' ? '#4F46E5' : '#64748B'}
              />
              <Text style={[styles.practiceTabText, activePracticeTab === 'editor' && styles.practiceTabTextActive]}>
                Code Editor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.practiceTab, activePracticeTab === 'preview' && styles.practiceTabActive]}
              onPress={() => setActivePracticeTab('preview')}
            >
              <Icon
                name="eye"
                size={14}
                color={activePracticeTab === 'preview' ? '#4F46E5' : '#64748B'}
              />
              <Text style={[styles.practiceTabText, activePracticeTab === 'preview' && styles.practiceTabTextActive]}>
                Live Preview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.practiceTab, activePracticeTab === 'target' && styles.practiceTabActive]}
              onPress={() => setActivePracticeTab('target')}
            >
              <Icon
                name="layout"
                size={14}
                color={activePracticeTab === 'target' ? '#4F46E5' : '#64748B'}
              />
              <Text style={[styles.practiceTabText, activePracticeTab === 'target' && styles.practiceTabTextActive]}>
                Visual Target
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: CODE EDITOR */}
          {activePracticeTab === 'editor' && (
            <View>
              {/* Quick HTML Tag Insertion Bar */}
              <View style={styles.tagToolbar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagToolbarScroll}>
                  {[
                    '<h1></h1>',
                    '<p></p>',
                    '<a href="#"></a>',
                    '<strong></strong>',
                    '<ul>\n  <li></li>\n</ul>',
                    '<li></li>',
                    '<table border="1">\n  <tr><th></th></tr>\n  <tr><td></td></tr>\n</table>',
                    '<form>\n  <label></label>\n  <input type="text" />\n  <button type="submit">Submit</button>\n</form>',
                    '<input type="text" />',
                    '<button></button>',
                    '<img src="" alt="" />'
                  ].map((tag, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.tagButton}
                      onPress={() => handleInsertSnippet(tag)}
                    >
                      <Text style={styles.tagButtonText}>{tag.split(/[\s\n>]/)[0]}&gt;</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Code TextInput */}
              <View style={styles.editorBox}>
                <TextInput
                  style={styles.codeInput}
                  multiline
                  value={userCode}
                  onChangeText={(text) => {
                    setUserCode(text);
                    if (submissionFeedback) setSubmissionFeedback(null);
                  }}
                  placeholder="Write your HTML code here..."
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  textAlignVertical="top"
                />
              </View>
            </View>
          )}

          {/* TAB 2: LIVE PREVIEW (WEBVIEW RENDERING USER CODE) */}
          {activePracticeTab === 'preview' && (
            <View style={styles.browserFrame}>
              <View style={styles.browserHeader}>
                <View style={styles.browserDotsRow}>
                  <View style={[styles.browserDot, { backgroundColor: '#EF4444' }]} />
                  <View style={[styles.browserDot, { backgroundColor: '#F59E0B' }]} />
                  <View style={[styles.browserDot, { backgroundColor: '#10B981' }]} />
                </View>
                <View style={styles.browserUrlBar}>
                  <Icon name="globe" size={11} color="#64748B" />
                  <Text style={styles.browserUrlText}>http://localhost:5001/preview.html</Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshIconBtn}
                  onPress={() => setUserCode(prev => prev)}
                >
                  <Icon name="refresh-cw" size={12} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.webviewContainer}>
                <WebView
                  originWhitelist={['*']}
                  source={{ html: buildPreviewHtml(userCode) }}
                  style={styles.webview}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                />
              </View>
            </View>
          )}

          {/* TAB 3: VISUAL TARGET (REFERENCE IMAGE / WEBVIEW RENDERING EXPECTED OUTPUT) */}
          {activePracticeTab === 'target' && (
            <View style={styles.browserFrame}>
              <View style={[styles.browserHeader, { backgroundColor: '#EEF2FF' }]}>
                <View style={styles.browserDotsRow}>
                  <View style={[styles.browserDot, { backgroundColor: '#EF4444' }]} />
                  <View style={[styles.browserDot, { backgroundColor: '#F59E0B' }]} />
                  <View style={[styles.browserDot, { backgroundColor: '#10B981' }]} />
                </View>
                <View style={[styles.browserUrlBar, { backgroundColor: '#FFFFFF' }]}>
                  <Icon name="check-circle" size={11} color="#4F46E5" />
                  <Text style={[styles.browserUrlText, { color: '#4F46E5', fontWeight: '700' }]}>
                    Expected Visual Target
                  </Text>
                </View>
              </View>

              <View style={styles.webviewContainer}>
                <WebView
                  originWhitelist={['*']}
                  source={{ html: buildPreviewHtml(expectedOutputHtml) }}
                  style={styles.webview}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                />
              </View>

              <View style={styles.targetExplainBox}>
                <Icon name="info" size={14} color="#4F46E5" />
                <Text style={styles.targetExplainText}>
                  {lesson.practiceTask?.expectedOutput || lesson.expectedOutput || 'Your code should render this visual layout.'}
                </Text>
              </View>
            </View>
          )}

          {/* Code Inspection & Error Checking Card */}
          {showErrorCard && (
            <View style={styles.checkInspectorCard}>
              <View style={styles.inspectorHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon
                    name={syntaxErrorsCount > 0 ? 'alert-circle' : isTaskPassing ? 'check-circle' : 'info'}
                    size={16}
                    color={syntaxErrorsCount > 0 ? '#DC2626' : isTaskPassing ? '#10B981' : '#F59E0B'}
                  />
                  <Text style={styles.inspectorTitle}>
                    {syntaxErrorsCount > 0
                      ? `${syntaxErrorsCount} Syntax Issue(s) Detected`
                      : isTaskPassing
                      ? 'All Checks Passed!'
                      : 'Code Analysis'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowErrorCard(false)}>
                  <Icon name="x-circle" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Syntax Errors List */}
              {syntaxErrorsCount > 0 ? (
                <View style={styles.errorList}>
                  {validationResult?.errors.map((err, eIdx) => (
                    <View key={eIdx} style={styles.errorItemBox}>
                      <Text style={styles.errorProblemText}>
                        • Line {err.line || 1}: {err.problem}
                      </Text>
                      <Text style={styles.errorSuggestionText}>
                        Tip: {err.suggestion}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : isSyntaxClean ? (
                <View style={styles.cleanSyntaxNotice}>
                  <Text style={styles.cleanSyntaxText}>
                    ✓ HTML tag structure and syntax are properly formatted.
                  </Text>
                </View>
              ) : null}

              {/* Task Requirements Status */}
              {taskResult && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.reqSummaryText}>{taskResult.feedback}</Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons Row: Check Code | Run Preview | Submit */}
          <View style={styles.actionButtonsRow}>
            {/* Check Code Button */}
            <TouchableOpacity
              style={styles.checkCodeBtn}
              activeOpacity={0.8}
              onPress={handleCheckCode}
            >
              <Icon name="search" size={15} color="#4F46E5" />
              <Text style={styles.checkCodeBtnText}>Check Code</Text>
            </TouchableOpacity>

            {/* Run / Preview Toggle Button */}
            <TouchableOpacity
              style={styles.previewToggleBtn}
              activeOpacity={0.8}
              onPress={() => setActivePracticeTab(activePracticeTab === 'preview' ? 'editor' : 'preview')}
            >
              <Icon
                name={activePracticeTab === 'preview' ? 'code' : 'eye'}
                size={15}
                color="#0F172A"
              />
              <Text style={styles.previewToggleBtnText}>
                {activePracticeTab === 'preview' ? 'Editor' : 'Preview'}
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
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
                  <Icon name="check" size={15} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Submission Feedback Message Banner */}
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

        {/* Lesson Completion Status Card */}
        <View style={[styles.completionStatusCard, isCompleted && styles.completionStatusCardActive]}>
          <View style={[styles.completionStatusIcon, isCompleted && styles.completionStatusIconActive]}>
            <Icon name="check" size={18} color={isCompleted ? '#FFFFFF' : '#94A3B8'} />
          </View>
          <View style={styles.completionStatusTextWrap}>
            <Text style={[styles.completionStatusTitle, isCompleted && styles.completionStatusTitleActive]}>
              {isCompleted ? 'Lesson Completed ✓' : 'Practice in Progress'}
            </Text>
            <Text style={styles.completionStatusSub}>
              {isCompleted
                ? 'Your practice solution was verified and saved to the database.'
                : 'Write your code, check for errors, and submit to finish this lesson.'}
            </Text>
          </View>
        </View>

        {/* Bottom Sibling Lesson Navigation */}
        <View style={styles.bottomNavRow}>
          {prevLesson ? (
            <TouchableOpacity
              style={styles.siblingNavBtn}
              onPress={() => navigateToSiblingLesson(prevLesson)}
            >
              <Icon name="arrow-left" size={15} color="#64748B" />
              <Text style={styles.siblingNavText} numberOfLines={1}>Previous</Text>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}

          {nextLesson ? (
            <TouchableOpacity
              style={[styles.siblingNavBtn, styles.siblingNavBtnNext]}
              onPress={() => navigateToSiblingLesson(nextLesson)}
            >
              <Text style={[styles.siblingNavText, styles.siblingNavTextNext]} numberOfLines={1}>Next Lesson</Text>
              <Icon name="arrow-right" size={15} color="#4F46E5" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.siblingNavBtn, styles.siblingNavBtnNext]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.siblingNavText, styles.siblingNavTextNext]}>Back to Course</Text>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9'
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10
  },
  topBarSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5
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
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
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
    padding: 24
  },
  emptyText: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    color: '#64748B',
    marginBottom: 16
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10
  },
  primaryBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  lessonHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  lessonOrderPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8
  },
  lessonOrderPillText: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.5
  },
  lessonHeaderTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10
  },
  objectiveBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5'
  },
  objectiveHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  objectiveHeaderTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5'
  },
  objectiveText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  sectionHeading: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A'
  },
  conceptBodyText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#334155',
    lineHeight: 20
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
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  copyBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5'
  },
  codeSnippetBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 18
  },
  expectedOutputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  expectedOutputTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 2
  },
  expectedOutputText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#0F172A',
    lineHeight: 16
  },
  practiceSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#6366F1'
  },
  practiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  taskBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  taskBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  resetBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    color: '#64748B'
  },
  taskTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4
  },
  taskDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12
  },
  requirementsList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14
  },
  requirementsHeader: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6
  },
  reqCheckCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  reqCheckCirclePassed: {
    backgroundColor: '#10B981'
  },
  requirementText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#475569',
    flex: 1,
    lineHeight: 18
  },
  requirementTextPassed: {
    color: '#047857',
    fontWeight: '600'
  },
  refSolutionContainer: {
    marginBottom: 14,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    overflow: 'hidden'
  },
  refSolutionToggleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10
  },
  refSolutionToggleText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5'
  },
  refSolutionBody: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#C7D2FE'
  },
  refSolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  refSolutionLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8'
  },
  copyRefBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  copyRefBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  refCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#38BDF8',
    lineHeight: 18
  },
  practiceTabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10
  },
  practiceTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8
  },
  practiceTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  practiceTabText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  practiceTabTextActive: {
    color: '#4F46E5',
    fontWeight: '700'
  },
  tagToolbar: {
    marginBottom: 8
  },
  tagToolbarScroll: {
    gap: 6
  },
  tagButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  tagButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '700'
  },
  editorBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    minHeight: 160,
    marginBottom: 12
  },
  codeInput: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    color: '#F8FAFC',
    minHeight: 150,
    padding: 0
  },
  browserFrame: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    marginBottom: 12
  },
  browserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8
  },
  browserDotsRow: {
    flexDirection: 'row',
    gap: 4
  },
  browserDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  browserUrlBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  browserUrlText: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    color: '#64748B'
  },
  refreshIconBtn: {
    padding: 2
  },
  webviewContainer: {
    height: 200,
    backgroundColor: '#FFFFFF'
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  targetExplainBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  targetExplainText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    color: '#475569',
    flex: 1
  },
  checkInspectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12
  },
  inspectorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  inspectorTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A'
  },
  errorList: {
    gap: 6
  },
  errorItemBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444'
  },
  errorProblemText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600'
  },
  errorSuggestionText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 2
  },
  cleanSyntaxNotice: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981'
  },
  cleanSyntaxText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#047857',
    fontWeight: '600'
  },
  reqSummaryText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    color: '#475569'
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  checkCodeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  checkCodeBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5'
  },
  previewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  previewToggleBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A'
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingVertical: 11,
    borderRadius: 10
  },
  submitBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginTop: 6
  },
  feedbackSuccess: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  feedbackText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    flex: 1
  },
  feedbackTextSuccess: {
    color: '#047857'
  },
  feedbackTextError: {
    color: '#B91C1C'
  },
  completionStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12
  },
  completionStatusCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4'
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
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B'
  },
  completionStatusTitleActive: {
    color: '#047857'
  },
  completionStatusSub: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  siblingNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  siblingNavBtnNext: {
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF'
  },
  siblingNavText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B'
  },
  siblingNavTextNext: {
    color: '#4F46E5',
    fontWeight: '700'
  }
});
