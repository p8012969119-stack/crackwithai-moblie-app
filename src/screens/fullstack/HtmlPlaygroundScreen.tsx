import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { validateHtml, verifyPracticeTask, HtmlValidationResult, PracticeVerificationResult } from '../../utils/htmlValidator';
import { PracticeTask } from '../../types/fullstack';
import { Icon } from '../../components/Icon';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const DEFAULT_STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HTML Playground</title>
</head>
<body>
  <h1>Welcome to CrackWithAI Playground</h1>
  <p>Write your HTML code here and click <strong>Run</strong> to see the live output!</p>
  
  <div class="card">
    <h3>Start Experimenting</h3>
    <p>Try adding headings, lists, tables, images, and forms.</p>
    <button type="button">Click Me</button>
  </div>
</body>
</html>`;

export const HtmlPlaygroundScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { lessonId, lessonTitle, starterCode, practiceTask } = route.params || {};

  const initialCode = starterCode || DEFAULT_STARTER_HTML;
  const [code, setCode] = useState<string>(initialCode);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'checks' | 'task'>('editor');
  const [renderedHtml, setRenderedHtml] = useState<string>(initialCode);
  const [validationResult, setValidationResult] = useState<HtmlValidationResult | null>(null);
  const [taskResult, setTaskResult] = useState<PracticeVerificationResult | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const inputRef = useRef<TextInput>(null);

  // Load saved code on mount if available
  useEffect(() => {
    const loadSaved = async () => {
      if (lessonId) {
        try {
          const saved = await fullstackApi.getSavedCode(lessonId);
          if (saved && saved.trim()) {
            setCode(saved);
            setRenderedHtml(saved);
          }
        } catch {
          // ignore
        }
      }
    };
    loadSaved();
  }, [lessonId]);

  // Initial validation & task check
  useEffect(() => {
    const res = validateHtml(code);
    setValidationResult(res);
    if (practiceTask) {
      setTaskResult(verifyPracticeTask(code, practiceTask));
    }
  }, []);

  const handleRun = () => {
    setRenderedHtml(code);
    const val = validateHtml(code);
    setValidationResult(val);
    if (practiceTask) {
      setTaskResult(verifyPracticeTask(code, practiceTask));
    }
    setActiveTab('preview');
  };

  const handleCheckHtml = () => {
    const val = validateHtml(code);
    setValidationResult(val);
    if (practiceTask) {
      setTaskResult(verifyPracticeTask(code, practiceTask));
    }
    setActiveTab('checks');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fullstackApi.saveCode(lessonId || 'general', code, lessonTitle || 'HTML Playground');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch {
      Alert.alert('Save Failed', 'Could not save your code. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Code?',
      'This will replace your current code with the original starter code.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setCode(initialCode);
            setRenderedHtml(initialCode);
            setValidationResult(validateHtml(initialCode));
            if (practiceTask) {
              setTaskResult(verifyPracticeTask(initialCode, practiceTask));
            }
          }
        }
      ]
    );
  };

  const handleCopy = () => {
    Clipboard.setString(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertTag = (tag: string) => {
    setCode(prev => {
      return prev + tag;
    });
  };

  const buildPreviewHtml = (rawHtml: string) => {
    return `<!DOCTYPE html>
<html>
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
    h1, h2, h3, h4, h5, h6 { color: #1E293B; margin-top: 14px; margin-bottom: 8px; }
    p { margin-top: 0; margin-bottom: 12px; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    th, td { border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; }
    th { background-color: #F8FAFC; }
    form { margin: 12px 0; }
    label { display: block; font-weight: 600; margin-top: 8px; margin-bottom: 4px; font-size: 13px; }
    input, select, textarea {
      width: 100%;
      font-family: inherit;
      font-size: 14px;
      padding: 8px 10px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      margin-bottom: 8px;
      box-sizing: border-box;
    }
    input[type="checkbox"], input[type="radio"] {
      width: auto;
      margin-right: 6px;
      display: inline-block;
    }
    button, input[type="submit"], input[type="button"] {
      background-color: #5653FE;
      color: #FFFFFF;
      border: none;
      padding: 9px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      display: inline-block;
      margin-top: 6px;
    }
    img { max-width: 100%; height: auto; border-radius: 6px; }
    ul, ol { padding-left: 20px; margin: 8px 0; }
    li { margin-bottom: 4px; }
    mark { background-color: #FEF08A; padding: 2px 4px; border-radius: 2px; }
  </style>
</head>
<body>
  ${rawHtml}
</body>
</html>`;
  };

  // Calculate lines for line-number gutter
  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 1);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const errorCount = validationResult?.errors?.length || 0;
  const warningCount = validationResult?.warnings?.length || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarTitleWrap}>
          <Text style={styles.topBarSubtitle}>CrackWithAI Playground</Text>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {lessonTitle || 'HTML Playground'}
          </Text>
        </View>

        <View style={styles.topRightActions}>
          <TouchableOpacity
            style={styles.iconActionBtn}
            onPress={handleCopy}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon name="copy" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconActionBtn}
            onPress={handleReset}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon name="refresh-cw" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Icon name="file-text" size={14} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Primary Action Controls Bar */}
      <View style={styles.controlBar}>
        <TouchableOpacity
          style={styles.runButton}
          activeOpacity={0.8}
          onPress={handleRun}
        >
          <Icon name="play" size={15} color="#FFFFFF" />
          <Text style={styles.runButtonText}>Run</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.checkButton, errorCount > 0 && styles.checkButtonAlert]}
          activeOpacity={0.8}
          onPress={handleCheckHtml}
        >
          <Icon name="search" size={15} color={errorCount > 0 ? '#EF4444' : COLORS.primary} />
          <Text style={[styles.checkButtonText, errorCount > 0 && styles.checkButtonTextAlert]}>
            Check HTML {errorCount > 0 ? `(${errorCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Segmented View Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'editor' && styles.tabItemActive]}
          onPress={() => setActiveTab('editor')}
        >
          <Icon
            name="code"
            size={14}
            color={activeTab === 'editor' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabItemText, activeTab === 'editor' && styles.tabItemTextActive]}>
            Code Editor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'preview' && styles.tabItemActive]}
          onPress={() => {
            setRenderedHtml(code);
            setActiveTab('preview');
          }}
        >
          <Icon
            name="eye"
            size={14}
            color={activeTab === 'preview' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabItemText, activeTab === 'preview' && styles.tabItemTextActive]}>
            Live Output
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'checks' && styles.tabItemActive]}
          onPress={() => {
            const val = validateHtml(code);
            setValidationResult(val);
            setActiveTab('checks');
          }}
        >
          <Icon
            name={errorCount > 0 ? 'alert-circle' : 'check-circle'}
            size={14}
            color={
              activeTab === 'checks'
                ? errorCount > 0
                  ? '#EF4444'
                  : COLORS.primary
                : errorCount > 0
                ? '#EF4444'
                : COLORS.textMuted
            }
          />
          <Text
            style={[
              styles.tabItemText,
              activeTab === 'checks' && styles.tabItemTextActive,
              errorCount > 0 && { color: '#EF4444' }
            ]}
          >
            Checks {errorCount > 0 ? `(${errorCount})` : ''}
          </Text>
        </TouchableOpacity>

        {practiceTask && (
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'task' && styles.tabItemActive]}
            onPress={() => {
              setTaskResult(verifyPracticeTask(code, practiceTask));
              setActiveTab('task');
            }}
          >
            <Icon
              name="award"
              size={14}
              color={activeTab === 'task' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === 'task' && styles.tabItemTextActive]}>
              Task
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Save Notification Toast */}
      {saveToast && (
        <View style={styles.toastBanner}>
          <Icon name="check-circle" size={14} color="#10B981" />
          <Text style={styles.toastText}>Your HTML code was successfully saved!</Text>
        </View>
      )}

      {/* Content based on Active Tab */}
      <View style={styles.mainArea}>
        {/* TAB 1: CODE EDITOR */}
        {activeTab === 'editor' && (
          <KeyboardAvoidingView
            style={styles.editorFlex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
          >
            <ScrollView
              style={styles.codeEditorContainer}
              contentContainerStyle={styles.codeEditorScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.editorRow}>
                {/* Line Numbers Gutter */}
                <View style={styles.gutter}>
                  {lineNumbers.map(n => (
                    <Text key={n} style={styles.gutterText}>{n}</Text>
                  ))}
                </View>

                {/* Text Editor Input */}
                <TextInput
                  ref={inputRef}
                  style={styles.textEditor}
                  value={code}
                  onChangeText={setCode}
                  multiline
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  keyboardType="default"
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Quick HTML Tag Insertion Toolbar */}
            <View style={styles.quickTagToolbar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickTagsScroll}
                keyboardShouldPersistTaps="always"
              >
                {[
                  '<h1></h1>',
                  '<p></p>',
                  '<a></a>',
                  '<div></div>',
                  '<img src="" alt="" />',
                  '<ul>\n  <li></li>\n</ul>',
                  '<li></li>',
                  '<table>\n  <tr><th></th></tr>\n  <tr><td></td></tr>\n</table>',
                  '<form>\n  \n</form>',
                  '<input type="text" />',
                  '<button></button>',
                  '<label></label>',
                  'class=""',
                  'id=""',
                  '<!--  -->',
                  '  '
                ].map((tagSnippet, tIdx) => {
                  const label = tagSnippet === '  ' ? 'Tab' : tagSnippet.split('>')[0] + '>';
                  return (
                    <TouchableOpacity
                      key={tIdx}
                      style={styles.tagChip}
                      onPress={() => handleInsertTag(tagSnippet)}
                    >
                      <Text style={styles.tagChipText}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* TAB 2: LIVE PREVIEW (Sandboxed WebView) */}
        {activeTab === 'preview' && (
          <View style={styles.previewContainer}>
            <View style={styles.previewSubHeader}>
              <View style={styles.previewBadge}>
                <View style={styles.greenPulse} />
                <Text style={styles.previewBadgeText}>LIVE SANDBOX</Text>
              </View>
              <TouchableOpacity
                style={styles.refreshPreviewBtn}
                onPress={() => setRenderedHtml(code)}
              >
                <Icon name="refresh-cw" size={13} color={COLORS.primary} />
                <Text style={styles.refreshPreviewText}>Refresh View</Text>
              </TouchableOpacity>
            </View>

            <WebView
              originWhitelist={['*']}
              source={{ html: buildPreviewHtml(renderedHtml) }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
        )}

        {/* TAB 3: CODE CHECKS & VALIDATION */}
        {activeTab === 'checks' && (
          <ScrollView
            style={styles.checksContainer}
            contentContainerStyle={styles.checksScrollContent}
          >
            {/* Header Summary Card */}
            <View
              style={[
                styles.summaryCard,
                errorCount === 0 ? styles.summaryCardSuccess : styles.summaryCardDanger
              ]}
            >
              <View style={styles.summaryTop}>
                <Icon
                  name={errorCount === 0 ? 'check-circle' : 'alert-circle'}
                  size={20}
                  color={errorCount === 0 ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.summaryTitle,
                    errorCount === 0 ? styles.summaryTitleSuccess : styles.summaryTitleDanger
                  ]}
                >
                  {errorCount === 0 ? 'HTML Structure Valid' : `${errorCount} Issues Detected`}
                </Text>
              </View>
              <Text style={styles.summaryBody}>
                {validationResult?.summary || 'No issues found.'}
              </Text>
            </View>

            {/* List of Detected Errors */}
            {validationResult?.errors && validationResult.errors.length > 0 && (
              <View style={styles.issuesSection}>
                <Text style={styles.issuesSectionTitle}>Structural & Syntax Errors</Text>
                {validationResult.errors.map((err, eIdx) => (
                  <View key={eIdx} style={styles.issueCard}>
                    <View style={styles.issueHeader}>
                      {err.line && (
                        <View style={styles.linePill}>
                          <Text style={styles.linePillText}>LINE {err.line}</Text>
                        </View>
                      )}
                      {err.tag && (
                        <View style={styles.tagPill}>
                          <Text style={styles.tagPillText}>&lt;{err.tag}&gt;</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.issueProblem}>{err.problem}</Text>
                    {err.suggestion && (
                      <View style={styles.suggestionBox}>
                        <Text style={styles.suggestionLabel}>Suggestion:</Text>
                        <Text style={styles.suggestionText}>{err.suggestion}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* List of Warnings */}
            {validationResult?.warnings && validationResult.warnings.length > 0 && (
              <View style={styles.issuesSection}>
                <Text style={styles.issuesSectionTitle}>Best Practice Suggestions</Text>
                {validationResult.warnings.map((warn, wIdx) => (
                  <View key={wIdx} style={[styles.issueCard, styles.warningCard]}>
                    <View style={styles.issueHeader}>
                      {warn.line && (
                        <View style={[styles.linePill, { backgroundColor: '#FEF3C7' }]}>
                          <Text style={[styles.linePillText, { color: '#B45309' }]}>LINE {warn.line}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.issueProblem}>{warn.problem}</Text>
                    {warn.suggestion && (
                      <View style={styles.suggestionBox}>
                        <Text style={styles.suggestionText}>{warn.suggestion}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {errorCount === 0 && (
              <View style={styles.cleanStateBox}>
                <Text style={styles.cleanStateEmoji}>🎉</Text>
                <Text style={styles.cleanStateTitle}>Your HTML is Looking Sharp!</Text>
                <Text style={styles.cleanStateDesc}>
                  All tags are properly opened, nested, and closed. Tap "Live Output" to view your webpage in action.
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* TAB 4: PRACTICE TASK CHECKLIST */}
        {activeTab === 'task' && practiceTask && (
          <ScrollView
            style={styles.taskTabContainer}
            contentContainerStyle={styles.taskTabScrollContent}
          >
            <View style={styles.taskInfoBox}>
              <View style={styles.taskPill}>
                <Text style={styles.taskPillText}>LESSON PRACTICE TASK</Text>
              </View>
              <Text style={styles.taskTabTitle}>{practiceTask.title}</Text>
              <Text style={styles.taskTabDesc}>{practiceTask.description}</Text>
            </View>

            {/* Requirements Checklist with Live Status */}
            <View style={styles.checklistCard}>
              <Text style={styles.checklistTitle}>Task Requirements</Text>
              {(taskResult?.checks || []).map((chk, cIdx) => (
                <View key={cIdx} style={styles.checkItemRow}>
                  <View
                    style={[
                      styles.checkStatusBox,
                      chk.passed ? styles.checkStatusBoxPassed : styles.checkStatusBoxPending
                    ]}
                  >
                    <Icon
                      name={chk.passed ? 'check' : 'x-circle'}
                      size={14}
                      color={chk.passed ? '#FFFFFF' : COLORS.textMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.checkItemText,
                      chk.passed && styles.checkItemTextPassed
                    ]}
                  >
                    {chk.description}
                  </Text>
                </View>
              ))}
            </View>

            {/* Feedback & Completion CTA */}
            <View
              style={[
                styles.feedbackCard,
                taskResult?.allPassed ? styles.feedbackCardPassed : styles.feedbackCardPending
              ]}
            >
              <Text
                style={[
                  styles.feedbackText,
                  taskResult?.allPassed && styles.feedbackTextPassed
                ]}
              >
                {taskResult?.feedback}
              </Text>

              {taskResult?.allPassed && lessonId && (
                <TouchableOpacity
                  style={styles.completeLessonBtn}
                  onPress={async () => {
                    try {
                      await fullstackApi.completeLesson(lessonId, undefined, code);
                      Alert.alert('Lesson complete', 'The server verified your practice and saved your progress.');
                    } catch (error: any) {
                      Alert.alert('Practice not saved', error.message || 'Please check your code and retry.');
                    }
                  }}
                >
                  <Icon name="award" size={16} color="#FFFFFF" />
                  <Text style={styles.completeLessonBtnText}>Mark Lesson Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  topBar: {
    height: 52,
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
  topBarTitleWrap: {
    flex: 1,
    marginHorizontal: SPACING.xs
  },
  topBarSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase'
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.separator,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    gap: 4
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  controlBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.card,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  runButton: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    gap: 6
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  checkButton: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    gap: 6
  },
  checkButtonAlert: {
    backgroundColor: '#FEE2E2'
  },
  checkButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700'
  },
  checkButtonTextAlert: {
    color: '#EF4444'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFC',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary,
    backgroundColor: '#FFFFFF'
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  tabItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700'
  },
  toastBanner: {
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0'
  },
  toastText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600'
  },
  mainArea: {
    flex: 1
  },
  editorFlex: {
    flex: 1
  },
  codeEditorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  codeEditorScrollContent: {
    paddingVertical: SPACING.sm
  },
  editorRow: {
    flexDirection: 'row',
    minHeight: Dimensions.get('window').height * 0.5,
    backgroundColor: '#FFFFFF'
  },
  gutter: {
    width: 36,
    paddingRight: 6,
    alignItems: 'flex-end',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'ios' ? 0 : 2
  },
  gutterText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    lineHeight: 20,
    color: '#64748B'
  },
  textEditor: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12.5,
    lineHeight: 20,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 40
  },
  quickTagToolbar: {
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 6
  },
  quickTagsScroll: {
    paddingHorizontal: SPACING.sm,
    gap: 6
  },
  tagChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.xs
  },
  tagChipText: {
    color: '#4F46E5',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: '700'
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  previewSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981'
  },
  previewBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5
  },
  refreshPreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  refreshPreviewText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  checksContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  checksScrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  summaryCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1
  },
  summaryCardSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  summaryCardDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  summaryTitleSuccess: {
    color: '#065F46'
  },
  summaryTitleDanger: {
    color: '#991B1B'
  },
  summaryBody: {
    fontSize: 13,
    color: COLORS.textSecondary
  },
  issuesSection: {
    marginBottom: SPACING.md
  },
  issuesSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },
  issueCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small
  },
  warningCard: {
    borderLeftColor: '#F59E0B'
  },
  issueHeader: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6
  },
  linePill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  linePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B91C1C'
  },
  tagPill: {
    backgroundColor: COLORS.separator,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  issueProblem: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: 6
  },
  suggestionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.xs,
    padding: 8,
    marginTop: 4
  },
  suggestionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2
  },
  suggestionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic'
  },
  cleanStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: SPACING.lg
  },
  cleanStateEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm
  },
  cleanStateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center'
  },
  cleanStateDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18
  },
  taskTabContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  taskTabScrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  taskInfoBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small
  },
  taskPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs
  },
  taskPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5
  },
  taskTabTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  taskTabDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18
  },
  checklistCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10
  },
  checkStatusBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkStatusBoxPassed: {
    backgroundColor: '#10B981'
  },
  checkStatusBoxPending: {
    backgroundColor: COLORS.separator
  },
  checkItemText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary
  },
  checkItemTextPassed: {
    color: '#065F46',
    fontWeight: '600'
  },
  feedbackCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center'
  },
  feedbackCardPassed: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  feedbackCardPending: {
    backgroundColor: '#F8FAFC'
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs
  },
  feedbackTextPassed: {
    color: '#065F46'
  },
  completeLessonBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
    marginTop: 6
  },
  completeLessonBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});
