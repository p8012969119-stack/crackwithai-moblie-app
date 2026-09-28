import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useAuth } from '../../store/AuthContext';
import { fullstackApi } from '../../api/fullstackApi';
import { storage } from '../../services/storage';
import { Icon } from '../../components/Icon';
import { PROMPT_STAGES, PromptStage } from './promptCourseData';
import { PromptEvaluator, PromptEvaluationResult } from './PromptEvaluator';

const FONT_FAMILY = Platform.OS === 'android' ? undefined : 'System';

const QUICK_SNIPPETS = [
  { label: '[Role]', snippet: '[ROLE] You are an experienced senior software specialist.\n' },
  { label: '[Task]', snippet: '[TASK] Clearly define your target goal or transformation.\n' },
  { label: '[Context]', snippet: '[CONTEXT] The target audience is beginners with basic tech background.\n' },
  { label: '[Constraint]', snippet: '[CONSTRAINT] Keep response under 120 words. Use bullet points.\n' },
  { label: '[Format: JSON]', snippet: '[FORMAT] Return output formatted strictly as a JSON object.' },
];

export const PromptStageDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const stageIdParam = route.params?.stageId || 1;
  const [currentStageId, setCurrentStageId] = useState<number>(Number(stageIdParam));
  const [promptText, setPromptText] = useState<string>('');
  const [testing, setTesting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<PromptEvaluationResult | null>(null);
  const [showErrorCard, setShowErrorCard] = useState<boolean>(false);
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const currentStage: PromptStage =
    PROMPT_STAGES.find((s) => s.id === currentStageId) || PROMPT_STAGES[0];

  useEffect(() => {
    const initialText = currentStage.engineered_prompt || currentStage.starterCode || '';
    setPromptText(initialText);
    setEvaluation(null);
    setShowErrorCard(false);
    setSubmissionFeedback(null);
    setCopied(false);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStageId, currentStage]);

  const handleCopyPrompt = () => {
    if (currentStage?.engineered_prompt) {
      Clipboard.setString(currentStage.engineered_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsertSnippet = (snippet: string) => {
    setPromptText(prev => {
      const trimmed = prev.trimEnd();
      return trimmed ? `${trimmed}\n${snippet}` : snippet;
    });
  };

  const handleCheckPrompt = async () => {
    if (!promptText.trim()) {
      setSubmissionFeedback({ type: 'error', message: 'Please write or edit your prompt before testing.' });
      return;
    }
    setTesting(true);
    try {
      const result = await PromptEvaluator.evaluatePrompt(promptText.trim(), currentStageId);
      setEvaluation(result);
      setShowErrorCard(true);
      setSubmissionFeedback(null);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmitStage = async () => {
    if (!promptText.trim()) {
      setSubmissionFeedback({ type: 'error', message: 'Write your prompt in the editor before submitting.' });
      return;
    }
    setSubmitting(true);
    setSubmissionFeedback(null);

    try {
      const result = await PromptEvaluator.evaluatePrompt(promptText.trim(), currentStageId);
      setEvaluation(result);
      setShowErrorCard(true);

      if (result.score < 50) {
        setSubmissionFeedback({
          type: 'error',
          message: 'Prompt quality score is too low. Review suggestions and try again.'
        });
        setSubmitting(false);
        return;
      }

      // Save progress locally
      const storageKey = `@crackwithai_prompt_progress_${user?._id || 'guest'}`;
      const stored = await storage.getItem(storageKey);
      let completedList: number[] = [1];
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.completedStageIds)) {
            completedList = parsed.completedStageIds;
          }
        } catch {}
      }

      const updated = Array.from(new Set([...completedList, currentStageId]));
      const nextId = Math.min(12, currentStageId + 1);
      await storage.setItem(storageKey, JSON.stringify({
        completedStageIds: updated,
        activeStageId: nextId,
        updatedAt: new Date().toISOString()
      }));

      // Sync backend
      await fullstackApi.completeLesson(currentStage.slug, 'prompt-engineering', promptText).catch(() => null);

      setSubmissionFeedback({
        type: 'success',
        message: `🎉 Lesson ${currentStageId} Completed! Score: ${result.score}%. Progress saved.`
      });
    } catch (err: any) {
      setSubmissionFeedback({
        type: 'error',
        message: err?.message || 'Failed to complete lesson. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyImprovement = () => {
    if (evaluation?.tryAdding) {
      const cleaned = evaluation.tryAdding.replace(/^"|"$/g, '');
      setPromptText(cleaned);
    }
  };

  const isFirstStage = currentStageId <= 1;
  const isLastStage = currentStageId >= 12;

  const badgeBg =
    currentStage.difficulty === 'Beginner'
      ? '#DCFCE7'
      : currentStage.difficulty === 'Intermediate'
      ? '#DBEAFE'
      : '#EDE9FE';
  const badgeTextColor =
    currentStage.difficulty === 'Beginner'
      ? '#059669'
      : currentStage.difficulty === 'Intermediate'
      ? '#1D4ED8'
      : '#6D28D9';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.topBarEyebrow}>LESSON {currentStageId} OF 12</Text>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {currentStage.title}
          </Text>
        </View>

        <View style={styles.topBarRight}>
          <View style={[styles.stageTagPill, { backgroundColor: badgeBg }]}>
            <Text style={[styles.stageTagPillText, { color: badgeTextColor }]}>
              {currentStage.difficulty}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Overview Banner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroTagBadge}>
              <Text style={styles.heroTagBadgeText}>{currentStage.category}</Text>
            </View>
            <Text style={styles.heroBadgeNum}>{currentStage.badge}</Text>
          </View>
          <Text style={styles.heroTitle}>{currentStage.title}</Text>
          <Text style={styles.heroConceptText}>Concept: {currentStage.concept}</Text>
          <Text style={styles.heroDesc}>{currentStage.explanation}</Text>
        </View>

        {/* 1. User's Raw Idea (Muted Gray Container) */}
        <View style={styles.rawIdeaContainer}>
          <View style={styles.rawIdeaHeaderRow}>
            <Icon name="user" size={15} color="#475569" />
            <Text style={styles.rawIdeaHeaderTitle}>USER'S RAW IDEA</Text>
          </View>
          <Text style={styles.rawIdeaText}>"{currentStage.user_raw_idea}"</Text>
        </View>

        {/* 2. Engineered Perfect Prompt (Distinct Highlighted Code Card) */}
        <View style={styles.engineeredPromptCard}>
          <View style={styles.engineeredHeaderRow}>
            <Icon name="sparkles" size={15} color="#38BDF8" />
            <Text style={styles.engineeredHeaderTitle}>ENGINEERED PERFECT PROMPT</Text>
          </View>
          <Text style={styles.engineeredPromptText}>{currentStage.engineered_prompt}</Text>
        </View>

        {/* 3. Large Thumb-Friendly Copy Prompt Button */}
        <TouchableOpacity
          style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
          activeOpacity={0.85}
          onPress={handleCopyPrompt}
        >
          <Icon name={copied ? 'check' : 'copy'} size={18} color="#FFFFFF" />
          <Text style={styles.copyBtnText}>
            {copied ? 'Copied to Clipboard! ✓' : 'Copy Prompt to Clipboard'}
          </Text>
        </TouchableOpacity>

        {/* 4. Why It Works Highlight Box */}
        <View style={styles.whyItWorksCard}>
          <View style={styles.whyHeaderRow}>
            <Icon name="award" size={16} color="#D97706" />
            <Text style={styles.whyHeaderTitle}>WHY IT WORKS</Text>
          </View>
          <Text style={styles.whyText}>{currentStage.why_it_works}</Text>
        </View>

        {/* 5. Interactive Practice Workspace */}
        <View style={styles.workspaceCard}>
          <View style={styles.workspaceHeaderRow}>
            <View style={styles.workspaceTitleRow}>
              <Icon name="terminal" size={18} color="#5653FE" />
              <Text style={styles.workspaceTitle}>Practice & AI Evaluation</Text>
            </View>
            <TouchableOpacity
              onPress={() => setPromptText(currentStage.engineered_prompt)}
              style={styles.resetBtn}
            >
              <Icon name="refresh-cw" size={13} color="#64748B" />
              <Text style={styles.resetBtnText}>Reset Prompt</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.workspaceSub}>
            Edit or experiment with the prompt below, then check quality or mark lesson complete.
          </Text>

          {/* Quick Snippet Toolbar */}
          <View style={styles.snippetToolbarWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.snippetScroll}>
              {QUICK_SNIPPETS.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.snippetPill}
                  onPress={() => handleInsertSnippet(item.snippet)}
                >
                  <Text style={styles.snippetPillText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Text Area */}
          <View style={styles.editorBox}>
            <TextInput
              style={styles.textInput}
              multiline
              value={promptText}
              onChangeText={setPromptText}
              placeholder="Write your prompt here..."
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
              textAlignVertical="top"
            />
          </View>

          {/* Action Control Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.checkBtn}
              activeOpacity={0.8}
              onPress={handleCheckPrompt}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator size="small" color="#5653FE" />
              ) : (
                <>
                  <Icon name="search" size={15} color="#5653FE" />
                  <Text style={styles.checkBtnText}>Check Prompt</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              activeOpacity={0.85}
              disabled={submitting}
              onPress={handleSubmitStage}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check" size={15} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Mark Complete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Feedback Card */}
          {showErrorCard && evaluation && (
            <View style={[styles.evaluationCard, evaluation.isPassed ? styles.evalSuccess : styles.evalWarn]}>
              <View style={styles.evalHeaderRow}>
                <Icon
                  name={evaluation.isPassed ? 'check-circle' : 'alert-circle'}
                  size={16}
                  color={evaluation.isPassed ? '#059669' : '#DC2626'}
                />
                <Text style={[styles.evalTitle, { color: evaluation.isPassed ? '#059669' : '#DC2626' }]}>
                  {evaluation.isPassed ? `Score: ${evaluation.score}/100 — Excellent!` : `Score: ${evaluation.score}/100 — Needs Tuning`}
                </Text>
              </View>

              {evaluation.whatWentWell?.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.evalSubheading}>✓ Strengths:</Text>
                  {evaluation.whatWentWell.map((w, idx) => (
                    <Text key={idx} style={styles.evalItemGood}>• {w}</Text>
                  ))}
                </View>
              )}

              {evaluation.whatToImprove?.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.evalSubheadingWarn}>💡 Suggestions:</Text>
                  {evaluation.whatToImprove.map((imp, idx) => (
                    <Text key={idx} style={styles.evalItemWarn}>• {imp}</Text>
                  ))}
                </View>
              )}

              {evaluation.tryAdding ? (
                <TouchableOpacity style={styles.applyImproveBtn} onPress={handleApplyImprovement}>
                  <Icon name="refresh-cw" size={13} color="#5653FE" />
                  <Text style={styles.applyImproveBtnText}>Apply Suggested Improvement</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {/* Feedback Banner */}
          {submissionFeedback && (
            <View style={[styles.bannerBox, submissionFeedback.type === 'success' ? styles.bannerSuccess : styles.bannerError]}>
              <Icon
                name={submissionFeedback.type === 'success' ? 'check-circle' : 'alert-circle'}
                size={16}
                color={submissionFeedback.type === 'success' ? '#047857' : '#DC2626'}
              />
              <Text style={[styles.bannerText, { color: submissionFeedback.type === 'success' ? '#047857' : '#DC2626' }]}>
                {submissionFeedback.message}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Navigation Row */}
        <View style={styles.bottomNavRow}>
          {!isFirstStage ? (
            <TouchableOpacity
              style={styles.navSiblingBtn}
              onPress={() => setCurrentStageId(prev => Math.max(1, prev - 1))}
            >
              <Icon name="arrow-left" size={15} color="#64748B" />
              <Text style={styles.navSiblingText}>Previous Lesson</Text>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}

          {!isLastStage ? (
            <TouchableOpacity
              style={styles.navNextBtn}
              onPress={() => setCurrentStageId(prev => Math.min(12, prev + 1))}
            >
              <Text style={styles.navNextText}>Next Lesson</Text>
              <Icon name="arrow-right" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navNextBtn, { backgroundColor: '#059669' }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.navNextText}>Back to Journey</Text>
              <Icon name="check" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Reference Modal */}
      <Modal
        visible={showReferenceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReferenceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reference Prompt & Expected AI Output</Text>
              <TouchableOpacity onPress={() => setShowReferenceModal(false)}>
                <Icon name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSub}>Reference Prompt:</Text>
              <View style={styles.codeSnippetBox}>
                <Text style={styles.codeText}>{currentStage.engineered_prompt}</Text>
              </View>

              <Text style={styles.modalSub}>Expected Output:</Text>
              <View style={[styles.codeSnippetBox, { backgroundColor: '#F8FAFC' }]}>
                <Text style={styles.codeText}>{currentStage.practiceTask?.expectedOutput}</Text>
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseDoneBtn}
              onPress={() => setShowReferenceModal(false)}
            >
              <Text style={styles.modalCloseDoneText}>Close Reference</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    alignItems: 'center',
    flex: 1,
  },
  topBarEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5653FE',
    letterSpacing: 1,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  topBarRight: {
    alignItems: 'flex-end',
  },
  stageTagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stageTagPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroTagBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5653FE',
  },
  heroBadgeNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  heroConceptText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5653FE',
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },

  /* 1. User Raw Idea Card */
  rawIdeaContainer: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  rawIdeaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  rawIdeaHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
  },
  rawIdeaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  /* 2. Engineered Prompt Card */
  engineeredPromptCard: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  engineeredHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  engineeredHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1,
  },
  engineeredPromptText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#F8FAFC',
    lineHeight: 21,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  /* 3. Large Thumb-Friendly Copy Prompt Button */
  copyBtn: {
    backgroundColor: '#5653FE',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    shadowColor: '#5653FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  copyBtnSuccess: {
    backgroundColor: '#059669',
  },
  copyBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  /* 4. Why It Works Card */
  whyItWorksCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  whyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  whyHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.8,
  },
  whyText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#78350F',
    lineHeight: 20,
  },

  /* 5. Workspace Card */
  workspaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#5653FE',
    marginBottom: 16,
  },
  workspaceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  workspaceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workspaceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  workspaceSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 17,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  snippetToolbarWrap: {
    marginBottom: 10,
  },
  snippetScroll: {
    gap: 8,
  },
  snippetPill: {
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  snippetPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5653FE',
  },
  editorBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    minHeight: 120,
    marginBottom: 14,
  },
  textInput: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 19,
    fontFamily: FONT_FAMILY,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  checkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEEDFF',
    borderWidth: 1,
    borderColor: '#C7C5FF',
    borderRadius: 12,
    paddingVertical: 14,
  },
  checkBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5653FE',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#5653FE',
    borderRadius: 12,
    paddingVertical: 14,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  evaluationCard: {
    marginTop: 14,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  evalSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
  },
  evalWarn: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  evalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  evalTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  evalSubheading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  evalSubheadingWarn: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  evalItemGood: {
    fontSize: 12,
    color: '#065F46',
    marginLeft: 8,
    marginTop: 2,
  },
  evalItemWarn: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 8,
    marginTop: 2,
  },
  applyImproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  applyImproveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5653FE',
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
  },
  bannerSuccess: {
    backgroundColor: '#DCFCE7',
  },
  bannerError: {
    backgroundColor: '#FEE2E2',
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  bottomNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  navSiblingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 14,
  },
  navSiblingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  navNextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
  },
  navNextText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    marginBottom: 16,
  },
  modalSub: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 6,
  },
  codeSnippetBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  codeText: {
    fontSize: 12,
    color: '#0F172A',
    lineHeight: 18,
    fontFamily: FONT_FAMILY,
  },
  modalCloseDoneBtn: {
    backgroundColor: '#5653FE',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseDoneText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  }
});
