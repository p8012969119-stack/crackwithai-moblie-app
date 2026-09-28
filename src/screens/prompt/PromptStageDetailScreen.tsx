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
import { useAuth } from '../../store/AuthContext';
import { fullstackApi } from '../../api/fullstackApi';
import { storage } from '../../services/storage';
import { Icon } from '../../components/Icon';
import { COLORS } from '../../constants/theme';
import { PROMPT_STAGES, PromptStage } from './promptCourseData';
import { PromptEvaluator, PromptEvaluationResult } from './PromptEvaluator';
import {
  PromptBuilderWidget,
  PromptMistakesWidget,
  PromptTechniquesWidget,
  PromptScenariosWidget,
  PromptFinalChallengeWidget,
} from './PromptStageWidgets';

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
  const [evaluation, setEvaluation] = useState<PromptEvaluationResult | null>(null);
  const [showErrorCard, setShowErrorCard] = useState<boolean>(false);
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const currentStage: PromptStage =
    PROMPT_STAGES.find((s) => s.id === currentStageId) || PROMPT_STAGES[0];

  const getDefaultPromptForStage = useCallback((id: number) => {
    switch (id) {
      case 1:
        return 'You are a JavaScript teacher. Explain JavaScript to a beginner using 5 simple points and one real-world example.';
      case 2:
        return '[ROLE] You are an experienced computer science teacher\n\n[TASK] Explain how API authentication works\n\n[CONTEXT] The learner knows basic JavaScript but is new to JWT tokens\n\n[CONSTRAINTS] Keep it under 150 words and use simple analogies\n\n[OUTPUT] 3 clear numbered points + 1 real-world example';
      case 3:
        return 'You are a tech journalist. Write a concise 200-word overview of Generative AI for high school students, using a smartphone assistant analogy.';
      case 4:
        return "Classify the sentiment of this review into [Positive, Neutral, Negative]: 'The app is okay, but loading takes a bit too long.'";
      case 5:
        return 'You are a Technical Writer. Explain what an API is to a non-technical project manager. Use a restaurant waiter analogy and keep it under 100 words in 3 bullet points.';
      case 6:
        return 'Act as an Executive Workplace Communications Coach. Draft a polite and professional email to my engineering manager requesting 3 days of personal leave from Oct 12 to 14. Mention that my pending PRs will be handed over to a teammate.';
      case 7:
        return "You are a Fact-Checking Assistant. Answer questions using ONLY the text below. If not in the text, say 'I cannot find that in the documentation.'\n\nTEXT: CrackWithAI offers courses in Full Stack Web Development and Prompt Engineering.\n\nQUESTION: Does CrackWithAI teach Quantum Machine Learning?";
      case 8:
        return `Act as an AI Customer Support Specialist for CrackWithAI.
Respond warmly and professionally to customer queries.
Use ONLY the provided policy information:
- Subscriptions can be canceled anytime from Settings > Billing.
- Refunds are eligible within 7 days of purchase.

If the request lacks required details, ask for clarification.
Return your response in 3 structured sections:
1. Warm Greeting & Summary
2. Detailed Policy Steps
3. Helpful Next Steps`;
      default:
        return 'Write a clear structured prompt for the AI assistant.';
    }
  }, []);

  useEffect(() => {
    setPromptText(getDefaultPromptForStage(currentStageId));
    setEvaluation(null);
    setShowErrorCard(false);
    setSubmissionFeedback(null);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStageId, getDefaultPromptForStage]);

  const handleInsertSnippet = (snippet: string) => {
    setPromptText(prev => {
      const trimmed = prev.trimEnd();
      return trimmed ? `${trimmed}\n${snippet}` : snippet;
    });
  };

  const handleCheckPrompt = async () => {
    if (!promptText.trim()) {
      setSubmissionFeedback({ type: 'error', message: 'Please write your prompt before testing.' });
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

      // Save progress
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
      const nextId = Math.min(8, currentStageId + 1);
      await storage.setItem(storageKey, JSON.stringify({
        completedStageIds: updated,
        activeStageId: nextId,
        updatedAt: new Date().toISOString()
      }));

      // Sync backend
      await fullstackApi.completeLesson(currentStage.slug, 'prompt-engineering', promptText).catch(() => null);

      setSubmissionFeedback({
        type: 'success',
        message: `🎉 Stage ${currentStageId} Passed! Score: ${result.score}%. Progress saved.`
      });
    } catch (err: any) {
      setSubmissionFeedback({
        type: 'error',
        message: err?.message || 'Failed to submit stage. Please try again.'
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
  const isLastStage = currentStageId >= 8;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Classic Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.topBarEyebrow}>STAGE {currentStageId} OF 8</Text>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {currentStage.title}
          </Text>
        </View>

        <View style={styles.topBarRight}>
          <View style={styles.stageTagPill}>
            <Text style={styles.stageTagPillText}>{currentStage.badge}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Stage Overview Banner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroTagBadge}>
              <Text style={styles.heroTagBadgeText}>{currentStage.tag}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{currentStage.title}</Text>
          <Text style={styles.heroSubtitle}>{currentStage.subtitle}</Text>
          <Text style={styles.heroDesc}>{currentStage.description}</Text>
        </View>

        {/* Stage 1: Comparison */}
        {currentStageId === 1 && (
          <View style={styles.cardContainer}>
            <Text style={styles.sectionHeading}>Prompt Comparison</Text>
            <View style={styles.compBoxBad}>
              <Text style={styles.compTagBad}>❌ Vague Prompt</Text>
              <Text style={styles.compPromptText}>"Tell me about JavaScript."</Text>
            </View>
            <View style={styles.compBoxGood}>
              <Text style={styles.compTagGood}>✅ Precise Prompt</Text>
              <Text style={styles.compPromptText}>
                "You are a JavaScript teacher. Explain JavaScript to a beginner using 5 simple points and one real-world example."
              </Text>
            </View>
          </View>
        )}

        {/* Stage 2: Prompt Builder */}
        {currentStageId === 2 && (
          <PromptBuilderWidget
            onBuildAndTest={(assembled) => {
              setPromptText(assembled);
            }}
          />
        )}

        {/* Stage 3: Avoid Mistakes */}
        {currentStageId === 3 && (
          <PromptMistakesWidget
            onTryMistakeFix={(fixed) => {
              setPromptText(fixed);
            }}
          />
        )}

        {/* Stage 4: Prompting Techniques */}
        {currentStageId === 4 && (
          <PromptTechniquesWidget
            onTestTechnique={(techPrompt) => {
              setPromptText(techPrompt);
            }}
          />
        )}

        {/* Stage 6: Real-World Scenarios */}
        {currentStageId === 6 && (
          <PromptScenariosWidget
            onSelectScenario={(scen) => {
              setPromptText(scen.starterPrompt);
            }}
          />
        )}

        {/* Stage 8: Capstone Challenge */}
        {currentStageId === 8 && (
          <PromptFinalChallengeWidget
            onStartCapstone={(capPrompt) => {
              setPromptText(capPrompt);
            }}
          />
        )}

        {/* Practice Workspace Card */}
        <View style={styles.workspaceCard}>
          <View style={styles.workspaceHeaderRow}>
            <View style={styles.workspaceTitleRow}>
              <Icon name="terminal" size={18} color="#5653FE" />
              <Text style={styles.workspaceTitle}>Practice Workspace</Text>
            </View>
            <TouchableOpacity onPress={() => setPromptText('')} style={styles.resetBtn}>
              <Icon name="refresh-cw" size={13} color="#64748B" />
              <Text style={styles.resetBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>

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
              placeholder="Write your prompt here... e.g. [ROLE] Act as a Senior UX Engineer..."
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
              style={styles.refBtn}
              activeOpacity={0.8}
              onPress={() => setShowReferenceModal(true)}
            >
              <Icon name="file-text" size={15} color="#334155" />
              <Text style={styles.refBtnText}>Reference</Text>
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
                  <Text style={styles.submitBtnText}>Submit</Text>
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
                  {evaluation.isPassed ? `Score: ${evaluation.score}/100 — Passed!` : `Needs Improvement (${evaluation.score}/100)`}
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
              <Text style={styles.navSiblingText}>Previous Stage</Text>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}

          {!isLastStage ? (
            <TouchableOpacity
              style={styles.navNextBtn}
              onPress={() => setCurrentStageId(prev => Math.min(8, prev + 1))}
            >
              <Text style={styles.navNextText}>Next Stage</Text>
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
                <Text style={styles.codeText}>{getDefaultPromptForStage(currentStageId)}</Text>
              </View>

              <Text style={styles.modalSub}>Expected AI Response Format:</Text>
              <View style={[styles.codeSnippetBox, { backgroundColor: '#F8FAFC' }]}>
                <Text style={styles.codeText}>
                  AI generates a structured, role-aligned, and boundary-constrained response.
                </Text>
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
    width: 36,
    alignItems: 'flex-end',
  },
  stageTagPill: {
    backgroundColor: '#EEEDFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stageTagPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5653FE',
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
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5653FE',
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  compBoxBad: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  compTagBad: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E11D48',
    marginBottom: 4,
  },
  compBoxGood: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  compTagGood: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 4,
  },
  compPromptText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
  },
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
    marginBottom: 12,
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
    gap: 8,
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
    borderRadius: 10,
    paddingVertical: 12,
  },
  checkBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5653FE',
  },
  refBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 12,
  },
  refBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#5653FE',
    borderRadius: 10,
    paddingVertical: 12,
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
