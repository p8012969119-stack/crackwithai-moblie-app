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

const FONT_FAMILY = Platform.OS === 'android' ? 'Roboto' : 'System';
const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'Roboto' : 'System';

// Self-closing / void elements in HTML
const VOID_OR_SELF_CLOSING_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype'
]);

// Quick HTML Elements for the toolbar
const QUICK_ELEMENTS = [
  { label: '<h1>', snippet: '<h1>Heading</h1>' },
  { label: '<p>', snippet: '<p>Paragraph text</p>' },
  { label: '<a>', snippet: '<a href="#">Link</a>' },
  { label: '<img>', snippet: '<img src="https://picsum.photos/200" alt="Image" />' },
  { label: '<button>', snippet: '<button>Click Me</button>' },
  { label: '<ul>', snippet: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>' },
  { label: '<li>', snippet: '<li>List item</li>' },
  { label: '<div>', snippet: '<div>\n  <p>Content</p>\n</div>' },
  { label: '<form>', snippet: '<form>\n  <input type="text" placeholder="Name" />\n  <button type="submit">Submit</button>\n</form>' },
  { label: '<input>', snippet: '<input type="text" placeholder="Enter text" />' },
  { label: '<table>', snippet: '<table border="1">\n  <tr>\n    <th>Name</th>\n    <th>Role</th>\n  </tr>\n  <tr>\n    <td>Alex</td>\n    <td>Developer</td>\n  </tr>\n</table>' }
];

/**
 * Auto-closes HTML tags when typing '>'
 * Example: user types '<p' then '>' -> inserts '</p>' so it becomes '<p></p>'
 */
export const autoCloseHtmlTag = (
  newText: string,
  oldText: string
): { updatedText: string; cursorOffset: number | null } => {
  if (newText.length !== oldText.length + 1) {
    return { updatedText: newText, cursorOffset: null };
  }

  let diffIndex = -1;
  for (let i = 0; i < newText.length; i++) {
    if (newText[i] !== oldText[i]) {
      diffIndex = i;
      break;
    }
  }

  if (diffIndex === -1 || newText[diffIndex] !== '>') {
    return { updatedText: newText, cursorOffset: null };
  }

  const textBefore = newText.slice(0, diffIndex + 1);
  const textAfter = newText.slice(diffIndex + 1);

  const tagMatch = textBefore.match(/<([a-zA-Z][a-zA-Z0-9\-]*)(?:\s+[^<>]*)?>$/);
  if (!tagMatch) {
    return { updatedText: newText, cursorOffset: null };
  }

  const tagName = tagMatch[1].toLowerCase();

  if (VOID_OR_SELF_CLOSING_TAGS.has(tagName) || textBefore.endsWith('/>')) {
    return { updatedText: newText, cursorOffset: null };
  }

  const closingTag = `</${tagName}>`;

  if (textAfter.startsWith(closingTag)) {
    return { updatedText: newText, cursorOffset: null };
  }

  const updatedText = textBefore + closingTag + textAfter;
  const cursorOffset = diffIndex + 1;

  return { updatedText, cursorOffset };
};

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
      padding: 14px;
      margin: 0;
      color: #0F172A;
      background-color: #FFFFFF;
      line-height: 1.5;
    }
    h1, h2, h3, h4, h5, h6 { color: #1E293B; margin-top: 10px; margin-bottom: 6px; font-weight: 700; }
    h1 { font-size: 22px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; }
    h2 { font-size: 18px; }
    h3 { font-size: 15px; }
    p { margin-top: 0; margin-bottom: 10px; font-size: 14px; color: #334155; }
    ul, ol { margin: 6px 0 10px 20px; padding: 0; }
    li { margin-bottom: 4px; font-size: 14px; color: #334155; }
    a { color: #5653fe; text-decoration: underline; }
    img { max-width: 100%; height: auto; border-radius: 6px; border: 1px solid #E2E8F0; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 13px; }
    th, td { border: 1px solid #CBD5E1; padding: 6px 8px; text-align: left; }
    th { background-color: #F1F5F9; color: #0F172A; font-weight: 700; }
    form { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin: 10px 0; }
    label { display: block; font-weight: 600; margin-top: 6px; margin-bottom: 4px; font-size: 12px; color: #1E293B; }
    input, select, textarea {
      width: 100%;
      font-family: inherit;
      font-size: 13px;
      padding: 7px 9px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      margin-bottom: 6px;
      background-color: #FFFFFF;
      box-sizing: border-box;
    }
    input[type="submit"], button {
      background-color: #5653fe;
      color: #FFFFFF;
      border: none;
      padding: 8px 14px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      margin-top: 6px;
      width: auto;
    }
  </style>
</head>
<body>
  ${rawHtml || '<p style="color: #94A3B8; font-style: italic;">(Output is empty. Write your HTML code in the editor.)</p>'}
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

  // Embedded Practice States
  const [userCode, setUserCode] = useState<string>(''); // Starts empty as requested
  const [cursorSelection, setCursorSelection] = useState<{ start: number; end: number } | undefined>(undefined);
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);
  const [showReference, setShowReference] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Validation and Error Checking States
  const [validationResult, setValidationResult] = useState<HtmlValidationResult | null>(null);
  const [taskResult, setTaskResult] = useState<PracticeVerificationResult | null>(null);
  const [showErrorCard, setShowErrorCard] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const loadLesson = useCallback(async (id: string) => {
    const fallback = getFallbackLessonById(id);
    if (fallback) {
      setLesson(fallback);
      setUserCode(''); // Empty editor start
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
        setUserCode(''); // Empty editor start
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

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetCode = () => {
    setUserCode('');
    setValidationResult(null);
    setTaskResult(null);
    setShowErrorCard(false);
    setSubmissionFeedback(null);
    setShowLivePreview(false);
  };

  // Check Code for Errors & Mistakes
  const handleCheckCode = () => {
    const syntaxCheck = validateHtml(userCode);
    setValidationResult(syntaxCheck);

    if (lesson?.practiceTask) {
      const taskCheck = verifyPracticeTask(userCode, lesson.practiceTask);
      setTaskResult(taskCheck);
    }

    setShowErrorCard(true);
  };

  // Handle typing with Auto-Closing HTML Tags
  const handleCodeChange = (text: string) => {
    const { updatedText, cursorOffset } = autoCloseHtmlTag(text, userCode);
    setUserCode(updatedText);

    if (cursorOffset !== null) {
      setCursorSelection({ start: cursorOffset, end: cursorOffset });
      setTimeout(() => {
        setCursorSelection(undefined);
      }, 50);
    }

    if (submissionFeedback) setSubmissionFeedback(null);
  };

  // Quick HTML element tag insertion
  const handleInsertTag = (tagSnippet: string) => {
    setUserCode(prev => {
      const trimmed = prev.trimEnd();
      return trimmed ? `${trimmed}\n${tagSnippet}` : tagSnippet;
    });
    if (showLivePreview) {
      setShowLivePreview(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!lesson) return;
    setSubmitting(true);
    setSubmissionFeedback(null);

    try {
      // 1. Run Structural Syntax Check
      const syntaxCheck = validateHtml(userCode);
      setValidationResult(syntaxCheck);

      if (!syntaxCheck.isValid && syntaxCheck.errors.length > 0) {
        setShowErrorCard(true);
        setSubmissionFeedback({
          type: 'error',
          message: `Fix the ${syntaxCheck.errors.length} syntax error(s) before submitting.`
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
            message: `${missing} requirement(s) not met. Tap Check Code to view details.`
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

  // Sibling Lessons Lookup
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
      setShowLivePreview(false);
      setShowReference(false);
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

  const syntaxErrorsCount = validationResult?.errors?.length || 0;

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
        {/* ==================================================
            1. LESSON HEADING CARD
            ================================================== */}
        <View style={styles.lessonHeaderCard}>
          <View style={styles.lessonOrderPill}>
            <Text style={styles.lessonOrderPillText}>
              LESSON {currentIndex >= 0 ? currentIndex + 1 : lesson.order} OF {techLessons.length || 25}
            </Text>
          </View>
          <Text style={styles.lessonHeaderTitle}>{lesson.title}</Text>
          {lesson.learningObjective ? (
            <Text style={styles.lessonSubtitleText}>{lesson.learningObjective}</Text>
          ) : lesson.description ? (
            <Text style={styles.lessonSubtitleText}>{lesson.description}</Text>
          ) : null}
        </View>

        {/* ==================================================
            2. CORE CONCEPT CARD
            ================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.iconContainer}>
              <Icon name="book-open" size={18} color="#5653fe" />
            </View>
            <Text style={styles.sectionHeading}>Core Concept</Text>
          </View>
          <Text style={styles.conceptBodyText}>{lesson.concept}</Text>
        </View>

        {/* ==================================================
            3. PRACTICE & WORKSPACE SECTION
            ================================================== */}
        <View style={styles.practiceSectionCard}>
          <View style={styles.practiceHeaderRow}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.iconContainer}>
                <Icon name="terminal" size={18} color="#5653fe" />
              </View>
              <Text style={styles.sectionHeading}>Practice</Text>
            </View>
            <TouchableOpacity onPress={handleResetCode} style={styles.resetBtn}>
              <Icon name="refresh-cw" size={13} color="#64748B" />
              <Text style={styles.resetBtnText}>Reset Code</Text>
            </TouchableOpacity>
          </View>

          {lesson.practiceTask?.description ? (
            <Text style={styles.taskDescText}>
              {lesson.practiceTask.description}
            </Text>
          ) : null}

          {/* ==================================================
              COLLAPSIBLE REFERENCE CODE & OUTPUT BUTTON
              ================================================== */}
          {lesson.codeExample ? (
            <View style={styles.referenceWrapper}>
              <TouchableOpacity
                style={styles.referenceToggleBtn}
                onPress={() => setShowReference(prev => !prev)}
                activeOpacity={0.8}
              >
                <View style={styles.referenceToggleLeft}>
                  <Icon name="file-text" size={16} color="#5653fe" />
                  <Text style={styles.referenceToggleBtnText}>
                    {showReference ? 'Hide Reference Code & Output' : '💡 View Reference Code & Output'}
                  </Text>
                </View>
                <Icon name={showReference ? 'chevron-down' : 'chevron-right'} size={16} color="#5653fe" />
              </TouchableOpacity>

              {showReference && (
                <View style={styles.referenceContentBox}>
                  <View style={styles.exampleHeaderRow}>
                    <Text style={styles.referenceSubheading}>Reference Code Example</Text>
                    <TouchableOpacity
                      style={styles.copyBtn}
                      onPress={() => handleCopy(lesson.codeExample || '')}
                    >
                      <Icon name="copy" size={14} color="#5653fe" />
                      <Text style={styles.copyBtnText}>{copiedCode ? 'Copied!' : 'Copy Code'}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.codeSnippetBox}>
                    <Text style={styles.codeText}>{lesson.codeExample}</Text>
                  </View>

                  <Text style={styles.referenceSubheading}>Reference Output Preview</Text>
                  <View style={styles.exampleOutputWrap}>
                    <View style={styles.exampleOutputHeader}>
                      <View style={styles.browserDotsMini}>
                        <View style={[styles.dotMini, { backgroundColor: '#EF4444' }]} />
                        <View style={[styles.dotMini, { backgroundColor: '#F59E0B' }]} />
                        <View style={[styles.dotMini, { backgroundColor: '#10B981' }]} />
                      </View>
                      <Text style={styles.exampleOutputLabel}>Output Preview</Text>
                    </View>
                    <View style={styles.exampleWebviewBox} pointerEvents="none">
                      <WebView
                        originWhitelist={['*']}
                        source={{ html: buildPreviewHtml(lesson.codeExample) }}
                        style={styles.exampleWebview}
                        scrollEnabled={false}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          ) : null}

          {/* Quick Elements Tags Toolbar */}
          <View style={styles.tagToolbarWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagToolbarScroll}>
              {QUICK_ELEMENTS.map((elem, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.tagButton}
                  onPress={() => handleInsertTag(elem.snippet)}
                >
                  <Text style={styles.tagButtonText}>{elem.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* MAIN EDITOR OR LIVE PREVIEW WORKSPACE */}
          {!showLivePreview ? (
            <View style={styles.editorBox}>
              <TextInput
                style={styles.codeInput}
                multiline
                value={userCode}
                onChangeText={handleCodeChange}
                selection={cursorSelection}
                onSelectionChange={(e) => setCursorSelection(e.nativeEvent.selection)}
                placeholder="Write your HTML code here..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                textAlignVertical="top"
              />
            </View>
          ) : (
            <View style={styles.browserFrame}>
              <View style={styles.browserHeader}>
                <View style={styles.browserDotsRow}>
                  <View style={[styles.browserDot, { backgroundColor: '#EF4444' }]} />
                  <View style={[styles.browserDot, { backgroundColor: '#F59E0B' }]} />
                  <View style={[styles.browserDot, { backgroundColor: '#10B981' }]} />
                </View>
                <View style={styles.browserUrlBar}>
                  <Icon name="globe" size={11} color="#64748B" />
                  <Text style={styles.browserUrlText}>http://localhost/preview.html</Text>
                </View>
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

          {/* Error / Checks Inspector Card */}
          {showErrorCard && (
            <View style={[styles.checkInspectorCard, syntaxErrorsCount > 0 ? styles.checkInspectorError : styles.checkInspectorSuccess]}>
              <View style={styles.inspectorHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Icon
                    name={syntaxErrorsCount > 0 ? 'alert-circle' : 'check-circle'}
                    size={16}
                    color={syntaxErrorsCount > 0 ? '#DC2626' : '#059669'}
                  />
                  <Text style={[styles.inspectorTitle, { color: syntaxErrorsCount > 0 ? '#DC2626' : '#059669' }]}>
                    {syntaxErrorsCount > 0
                      ? `${syntaxErrorsCount} Syntax Error(s) Found`
                      : 'Checks Passed! No syntax errors.'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowErrorCard(false)}>
                  <Icon name="x-circle" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              {syntaxErrorsCount > 0 && validationResult?.errors && (
                <View style={styles.errorList}>
                  {validationResult.errors.map((err, eIdx) => (
                    <View key={eIdx} style={styles.errorItemBox}>
                      <Text style={styles.errorProblemText}>
                        Line {err.line || 1}: {err.problem}
                      </Text>
                      {err.suggestion ? (
                        <Text style={styles.errorSuggestionText}>
                          Tip: {err.suggestion}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Action Buttons: Check Code | Preview / Editor | Submit */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.checkCodeBtn}
              activeOpacity={0.8}
              onPress={handleCheckCode}
            >
              <Icon name="search" size={15} color="#5653fe" />
              <Text style={styles.checkCodeBtnText}>Check Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.previewToggleBtn}
              activeOpacity={0.8}
              onPress={() => setShowLivePreview(prev => !prev)}
            >
              <Icon
                name={showLivePreview ? 'code' : 'eye'}
                size={15}
                color="#0F172A"
              />
              <Text style={styles.previewToggleBtnText}>
                {showLivePreview ? 'Editor' : 'Preview'}
              </Text>
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
                  <Icon name="check" size={15} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Submission Feedback Banner */}
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
              <Icon name="arrow-right" size={15} color="#5653fe" />
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
    backgroundColor: '#5653fe',
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
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8
  },
  lessonOrderPillText: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '800',
    color: '#5653fe',
    letterSpacing: 0.5
  },
  lessonHeaderTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6
  },
  lessonSubtitleText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19
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
    gap: 8
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EEEDFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionHeading: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  conceptBodyText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 21,
    marginTop: 10
  },
  referenceWrapper: {
    marginBottom: 12
  },
  referenceToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7C5FF'
  },
  referenceToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  referenceToggleBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '700',
    color: '#5653fe'
  },
  referenceContentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  referenceSubheading: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 4
  },
  exampleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  copyBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: '#5653fe'
  },
  codeSnippetBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12.5,
    color: '#E2E8F0',
    lineHeight: 19
  },
  exampleOutputWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  exampleOutputHeader: {
    height: 30,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  browserDotsMini: {
    flexDirection: 'row',
    gap: 4
  },
  dotMini: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  exampleOutputLabel: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  exampleWebviewBox: {
    height: 120,
    backgroundColor: '#FFFFFF'
  },
  exampleWebview: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  practiceSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#5653fe'
  },
  practiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
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
  taskDescText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10
  },
  tagToolbarWrap: {
    marginBottom: 10
  },
  tagToolbarScroll: {
    gap: 6
  },
  tagButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  tagButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11.5,
    color: '#5653fe',
    fontWeight: '700'
  },
  editorBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    minHeight: 180,
    marginBottom: 12
  },
  codeInput: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    color: '#F8FAFC',
    minHeight: 170,
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
  webviewContainer: {
    height: 220,
    backgroundColor: '#FFFFFF'
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  checkInspectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 12
  },
  checkInspectorError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2'
  },
  checkInspectorSuccess: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4'
  },
  inspectorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  inspectorTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '700'
  },
  errorList: {
    gap: 6,
    marginTop: 4
  },
  errorItemBox: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#EEEDFF',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7C5FF'
  },
  checkCodeBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '700',
    color: '#5653fe'
  },
  previewToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
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
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 4
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
    borderColor: '#C7C5FF',
    backgroundColor: '#EEEDFF'
  },
  siblingNavText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B'
  },
  siblingNavTextNext: {
    color: '#5653fe',
    fontWeight: '700'
  }
});
