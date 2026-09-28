import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../store/AuthContext';
import { storage } from '../../services/storage';
import { fullstackApi } from '../../api/fullstackApi';
import { certificateApi } from '../../api/certificateApi';
import { Certificate } from '../../types';
import { Icon } from '../../components/Icon';
import { CertificateModal } from '../../components/CertificateModal';
import { PromptHeroBanner } from './PromptHeroBanner';
import { PromptPlaygroundCard } from './PromptPlaygroundCard';
import { PromptCoachSheet } from './PromptCoachSheet';
import {
  PromptBuilderWidget,
  PromptMistakesWidget,
  PromptTechniquesWidget,
  PromptScenariosWidget,
  PromptFinalChallengeWidget,
} from './PromptStageWidgets';
import {
  PROMPT_STAGES,
  PROMPT_MISTAKES,
  PROMPT_TECHNIQUES,
  REAL_WORLD_SCENARIOS,
  PromptStage,
  RealWorldScenario,
} from './promptCourseData';
import { PromptEvaluator, PromptEvaluationResult } from './PromptEvaluator';

export const PromptEngineeringScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [completedStageIds, setCompletedStageIds] = useState<number[]>([1]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePlaygroundPrompt, setActivePlaygroundPrompt] = useState<string>('');

  // Coach sheet state
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [activePromptForCoach, setActivePromptForCoach] = useState('');

  // Certificate modal state
  const [certificateModalVisible, setCertificateModalVisible] = useState(false);
  const [earnedCertificate, setEarnedCertificate] = useState<Certificate | null>(null);

  // Scroll ref to smoothly scroll to interactive areas
  const scrollViewRef = useRef<ScrollView>(null);
  const playgroundRef = useRef<View>(null);

  const storageKey = `@crackwithai_prompt_progress_${user?._id || 'guest'}`;

  // Load progress from local storage & backend
  const loadProgress = useCallback(async () => {
    try {
      const stored = await storage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.completedStageIds) && parsed.completedStageIds.length > 0) {
          setCompletedStageIds(parsed.completedStageIds);
          if (parsed.activeStageId) {
            setActiveStageId(parsed.activeStageId);
          }
        }
      }

      // Sync with backend course progress if available
      try {
        const backendProgress = await fullstackApi.getProgress('prompt-engineering');
        if (backendProgress?.completedLessonIds?.length) {
          // Map backend completed lessons count to stages
          const count = Math.min(8, Math.max(1, Math.ceil((backendProgress.completedLessonIds.length / 25) * 8)));
          const stageList = Array.from({ length: count }, (_, i) => i + 1);
          setCompletedStageIds((prev) => Array.from(new Set([...prev, ...stageList])));
        }
      } catch {
        // Backend optional sync fallback
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storageKey]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const saveProgress = async (newCompleted: number[], nextActiveId?: number) => {
    setCompletedStageIds(newCompleted);
    if (nextActiveId) {
      setActiveStageId(nextActiveId);
    }
    const payload = {
      completedStageIds: newCompleted,
      activeStageId: nextActiveId || activeStageId,
      updatedAt: new Date().toISOString(),
    };
    await storage.setItem(storageKey, JSON.stringify(payload));

    // Also sync to backend completion endpoint
    try {
      const lessonSlugs = [
        'what-is-generative-ai',
        'what-is-a-prompt',
        'prompt-engineering-fundamentals',
        'advanced-prompt-engineering',
        'real-world-prompt-engineering',
        'final-prompt-engineering-project',
      ];
      const targetSlug = lessonSlugs[Math.min(lessonSlugs.length - 1, newCompleted.length - 1)];
      await fullstackApi.completeLesson(targetSlug, 'prompt-engineering');
    } catch {
      // Backend progress sync notice
    }
  };

  const handleStagePassed = (passedStageId: number) => {
    const updated = Array.from(new Set([...completedStageIds, passedStageId]));
    const nextStage = Math.min(8, passedStageId + 1);
    saveProgress(updated, nextStage);

    if (updated.length >= 8) {
      // Completed full course!
      handleCourseCompleted();
    }
  };

  const handleCourseCompleted = async () => {
    const certNumber = `CWA-PROMPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const certData: Certificate = {
      _id: `cert-prompt-${Date.now()}`,
      user: user?._id || 'guest',
      course: 'prompt-engineering',
      certificateId: certNumber,
      certificateNumber: certNumber,
      verificationCode: certNumber,
      recipientName: user?.fullName || user?.name || 'AI Prompt Engineer',
      userName: user?.fullName || user?.name || 'AI Prompt Engineer',
      courseName: 'Prompt Engineering Mastery',
      issueDate: new Date().toISOString(),
      issuedAt: new Date().toISOString(),
      percentage: 100,
      status: 'active',
    };
    setEarnedCertificate(certData);
    setCertificateModalVisible(true);

    // Trigger backend certificate registration
    try {
      await certificateApi.issueCertificate('prompt-engineering');
    } catch {
      // Backend issue fallback
    }
  };

  const handleViewCertificate = async () => {
    if (earnedCertificate) {
      setCertificateModalVisible(true);
      return;
    }

    try {
      const myCerts = await certificateApi.getMyCertificates();
      const promptCert = myCerts?.data?.find(
        (c: any) =>
          c.courseName?.toLowerCase().includes('prompt') ||
          c.course?.title?.toLowerCase().includes('prompt')
      );
      if (promptCert) {
        setEarnedCertificate(promptCert);
        setCertificateModalVisible(true);
        return;
      }
    } catch {}

    // Fallback generate certificate
    handleCourseCompleted();
  };

  const currentStage =
    PROMPT_STAGES.find((s) => s.id === activeStageId) || PROMPT_STAGES[0];
  const isAllCompleted = completedStageIds.length >= 8;

  const scrollToPlayground = () => {
    scrollViewRef.current?.scrollTo({ y: 380, animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Bar Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('MainTabs');
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.topBarTitleBox}>
          <Text style={styles.topBarEyebrow}>CRACKWITHAI</Text>
          <Text style={styles.topBarTitle}>Prompt Engineering</Text>
        </View>

        <TouchableOpacity
          style={styles.coachTopBtn}
          onPress={() => setIsCoachOpen(true)}
          accessibilityLabel="Open AI Coach"
        >
          <Icon name="sparkles" size={17} color="#7C3AED" />
          <Text style={styles.coachTopBtnText}>Coach</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProgress();
            }}
            colors={['#7C3AED']}
          />
        }
      >
        {/* ==================================================
            1. HERO SECTION (ATTRACTIVE, CLEAR, INTERACTIVE)
            ================================================== */}
        <PromptHeroBanner
          completedCount={completedStageIds.length}
          totalStages={PROMPT_STAGES.length}
          currentStageId={activeStageId}
          onPressPrimaryAction={scrollToPlayground}
          isAllCompleted={isAllCompleted}
          onViewCertificate={handleViewCertificate}
        />

        {/* ==================================================
            GUIDED JOURNEY STAGE SELECTOR (NOT A MODULE LIST!)
            ================================================== */}
        <View style={styles.stageSelectorContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Guided Learning Journey</Text>
            <Text style={styles.sectionSub}>8 Interactive Stages</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stageTabsScroll}
          >
            {PROMPT_STAGES.map((stg) => {
              const isActive = activeStageId === stg.id;
              const isCompleted = completedStageIds.includes(stg.id);

              return (
                <TouchableOpacity
                  key={`stg-${stg.id}`}
                  style={[
                    styles.stageTabPill,
                    isActive && styles.stageTabPillActive,
                    isCompleted && !isActive && styles.stageTabPillCompleted,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setActiveStageId(stg.id);
                    setActivePlaygroundPrompt('');
                  }}
                >
                  <View
                    style={[
                      styles.stageNumCircle,
                      isActive && styles.stageNumCircleActive,
                      isCompleted && styles.stageNumCircleCompleted,
                    ]}
                  >
                    {isCompleted ? (
                      <Icon name="check" size={11} color="#FFFFFF" />
                    ) : (
                      <Text
                        style={[
                          styles.stageNumText,
                          isActive && styles.stageNumTextActive,
                        ]}
                      >
                        {stg.id}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stageTabText,
                      isActive && styles.stageTabTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {stg.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ==================================================
            CURRENT ACTIVE STAGE CONTENT
            ================================================== */}
        <View style={styles.stageContentCard}>
          <View style={styles.stageBadgeRow}>
            <View style={styles.stageTag}>
              <Text style={styles.stageTagText}>{currentStage.tag}</Text>
            </View>
            <Text style={styles.stageBadgeLabel}>{currentStage.badge}</Text>
          </View>

          <Text style={styles.stageMainTitle}>{currentStage.title}</Text>
          <Text style={styles.stageSubTitle}>{currentStage.subtitle}</Text>
          <Text style={styles.stageDescription}>{currentStage.description}</Text>

          {/* ==================================================
              STAGE 1: WHAT IS PROMPT ENGINEERING?
              (Visual Comparison + Try It Yourself)
              ================================================== */}
          {activeStageId === 1 && (
            <View style={styles.stageSectionWrap}>
              {/* Concept Card */}
              <View style={styles.conceptHighlightBox}>
                <Text style={styles.conceptQuote}>
                  "Prompt Engineering is the skill of giving AI clear instructions so
                  it can produce the kind of result you actually want."
                </Text>
              </View>

              {/* Side-by-side / Stacked Visual Comparison */}
              <View style={styles.comparisonWrap}>
                <Text style={styles.comparisonHeader}>See The Difference:</Text>

                {/* Vague Prompt */}
                <View style={styles.vagueCard}>
                  <View style={styles.compPillBad}>
                    <Text style={styles.compPillBadText}>❌ Vague Prompt</Text>
                  </View>
                  <Text style={styles.promptQuote}>"Tell me about JavaScript."</Text>
                </View>

                {/* Better Prompt */}
                <View style={styles.betterCard}>
                  <View style={styles.compPillGood}>
                    <Text style={styles.compPillGoodText}>✅ Better Prompt</Text>
                  </View>
                  <Text style={styles.promptQuote}>
                    "You are a JavaScript teacher. Explain JavaScript to a beginner
                    using 5 simple points and one real-world example."
                  </Text>
                </View>

                {/* Why is the second prompt better? */}
                <View style={styles.whyBetterCard}>
                  <Text style={styles.whyBetterTitle}>
                    Why is the second prompt better?
                  </Text>
                  <View style={styles.whyPoint}>
                    <View style={styles.whyIconCircle}>
                      <Icon name="check" size={11} color="#7C3AED" />
                    </View>
                    <Text style={styles.whyPointText}>
                      <Text style={{ fontWeight: '700' }}>It gives AI a role </Text>
                      (patient teacher persona).
                    </Text>
                  </View>

                  <View style={styles.whyPoint}>
                    <View style={styles.whyIconCircle}>
                      <Icon name="check" size={11} color="#7C3AED" />
                    </View>
                    <Text style={styles.whyPointText}>
                      <Text style={{ fontWeight: '700' }}>It explains the task </Text>
                      (explain core concepts).
                    </Text>
                  </View>

                  <View style={styles.whyPoint}>
                    <View style={styles.whyIconCircle}>
                      <Icon name="check" size={11} color="#7C3AED" />
                    </View>
                    <Text style={styles.whyPointText}>
                      <Text style={{ fontWeight: '700' }}>It identifies the audience </Text>
                      (beginner level).
                    </Text>
                  </View>

                  <View style={styles.whyPoint}>
                    <View style={styles.whyIconCircle}>
                      <Icon name="check" size={11} color="#7C3AED" />
                    </View>
                    <Text style={styles.whyPointText}>
                      <Text style={{ fontWeight: '700' }}>It defines the output </Text>
                      (5 simple points + 1 real-world example).
                    </Text>
                  </View>
                </View>
              </View>

              {/* Try It Yourself Card for Stage 1 */}
              <PromptPlaygroundCard
                taskTitle="Try It Yourself 🚀"
                taskInstruction="Ask AI to explain JavaScript to a beginner."
                samplePrompt="You are a JavaScript teacher. Explain JavaScript to a beginner using 5 simple points and one real-world example."
                defaultPrompt="You are a JavaScript teacher. Explain JavaScript to a beginner using 5 simple points and one real-world example."
                onTestPrompt={(prompt) => {
                  setActivePromptForCoach(prompt);
                  return PromptEvaluator.evaluatePrompt(prompt, 1);
                }}
                onStagePassed={() => handleStagePassed(1)}
                isStageCompleted={completedStageIds.includes(1)}
                onOpenCoachChat={() => setIsCoachOpen(true)}
              />
            </View>
          )}

          {/* ==================================================
              STAGE 2: THE 5-ELEMENT PROMPT FORMULA
              (Interactive Prompt Builder)
              ================================================== */}
          {activeStageId === 2 && (
            <View style={styles.stageSectionWrap}>
              <PromptBuilderWidget
                onBuildAndTest={(assembledPrompt) => {
                  setActivePromptForCoach(assembledPrompt);
                  setActivePlaygroundPrompt(assembledPrompt);
                  scrollToPlayground();
                }}
              />

              <PromptPlaygroundCard
                taskTitle="Test Your Built Prompt 🚀"
                taskInstruction="Review or edit your assembled prompt below and test how the AI model executes it."
                defaultPrompt={activePlaygroundPrompt || "[ROLE] You are an experienced computer science teacher\n\n[TASK] Explain how API authentication works\n\n[CONTEXT] The learner knows basic JavaScript but is new to JWT tokens\n\n[CONSTRAINTS] Keep it under 150 words and use simple analogies\n\n[OUTPUT] 3 clear numbered points + 1 real-world example"}
                onTestPrompt={(prompt) => {
                  setActivePromptForCoach(prompt);
                  return PromptEvaluator.evaluatePrompt(prompt, 2);
                }}
                onStagePassed={() => handleStagePassed(2)}
                isStageCompleted={completedStageIds.includes(2)}
                onOpenCoachChat={() => setIsCoachOpen(true)}
              />
            </View>
          )}

          {/* ==================================================
              STAGE 3: AVOID THESE 5 COMMON MISTAKES
              ================================================== */}
          {activeStageId === 3 && (
            <View style={styles.stageSectionWrap}>
              <PromptMistakesWidget
                onTryMistakeFix={(fixedPrompt) => {
                  setActivePromptForCoach(fixedPrompt);
                  setActivePlaygroundPrompt(fixedPrompt);
                  scrollToPlayground();
                }}
              />

              <PromptPlaygroundCard
                taskTitle="Test Your Mistake Fix 🚀"
                taskInstruction="Refactor this prompt to remove ambiguity, add constraints, and test with the AI Coach."
                defaultPrompt={activePlaygroundPrompt || "You are a tech journalist. Write a concise 200-word overview of Generative AI for high school students, using a smartphone assistant analogy."}
                onTestPrompt={(prompt) => {
                  setActivePromptForCoach(prompt);
                  return PromptEvaluator.evaluatePrompt(prompt, 3);
                }}
                onStagePassed={() => handleStagePassed(3)}
                isStageCompleted={completedStageIds.includes(3)}
                onOpenCoachChat={() => setIsCoachOpen(true)}
              />
            </View>
          )}

          {/* ==================================================
              STAGE 4: PROMPTING TECHNIQUES
              ================================================== */}
          {activeStageId === 4 && (
            <View style={styles.stageSectionWrap}>
              <PromptTechniquesWidget
                onTestTechnique={(techniquePrompt) => {
                  setActivePromptForCoach(techniquePrompt);
                  setActivePlaygroundPrompt(techniquePrompt);
                  scrollToPlayground();
                }}
              />

              <PromptPlaygroundCard
                taskTitle="Practice Technique with AI 🚀"
                taskInstruction="Test Zero-Shot, Few-Shot, or Role prompting and receive instant coach feedback."
                defaultPrompt={activePlaygroundPrompt || "Classify the sentiment of this review into [Positive, Neutral, Negative]: 'The app is okay, but loading takes a bit too long.'"}
                onTestPrompt={(prompt) => {
                  setActivePromptForCoach(prompt);
                  return PromptEvaluator.evaluatePrompt(prompt, 4);
                }}
                onStagePassed={() => handleStagePassed(4)}
                isStageCompleted={completedStageIds.includes(4)}
                onOpenCoachChat={() => setIsCoachOpen(true)}
              />
            </View>
          )}

          {/* ==================================================
              STAGE 5: ITERATIVE PROMPTING LOOP
              ================================================== */}
          {activeStageId === 5 && (
            <View style={styles.stageSectionWrap}>
              <View style={styles.iterativeLoopBox}>
                <Text style={styles.loopTitle}>The 5-Step Iterative Cycle</Text>
                <View style={styles.loopRow}>
                  <Text style={styles.loopPill}>Prompt</Text>
                  <Text style={styles.loopArrow}>→</Text>
                  <Text style={styles.loopPill}>Response</Text>
                  <Text style={styles.loopArrow}>→</Text>
                  <Text style={styles.loopPill}>Review</Text>
                  <Text style={styles.loopArrow}>→</Text>
                  <Text style={styles.loopPill}>Improve</Text>
                  <Text style={styles.loopArrow}>→</Text>
                  <Text style={styles.loopPillActive}>Test Again</Text>
                </View>
                <Text style={styles.loopDesc}>
                  Prompting is an active conversation. Critique the output and refine your prompt.
                </Text>
              </View>

              <PromptPlaygroundCard
                taskTitle="Iterative Refinement Exercise 🚀"
                taskInstruction="Test this prompt, inspect the AI Coach review, click 'Improve My Prompt', and test again to complete Stage 5!"
                defaultPrompt={activePlaygroundPrompt || "You are a Technical Writer. Explain what an API is to a non-technical project manager. Use a restaurant waiter analogy and keep it under 100 words in 3 bullet points."}
                onTestPrompt={(prompt) => {
                  setActivePromptForCoach(prompt);
                  return PromptEvaluator.evaluatePrompt(prompt, 5);
                }}
                onStagePassed={() => handleStagePassed(5)}
                isStageCompleted={completedStageIds.includes(5)}
                onOpenCoachChat={() => setIsCoachOpen(true)}
              />
            </View>
          )}

          {/* ==================================================
              STAGE 6: REAL-WORLD PROMPT CHALLENGES
              ================================================== */}
          {activeStageId === 6 && (
            <View style={styles.stageSectionWrap}>
              <PromptScenariosWidget
                onSelectScenario={(scen: RealWorldScenario) => {
                  setActivePromptForCoach(scen.starterPrompt);
                  setActivePlaygroundPrompt(scen.starterPrompt);
                  scrollToPlayground();
                }}
              />

              <PromptPlaygroundCard
                taskTitle="Solve Real-World Challenge 🚀"
                taskInstruction="Write and refine a prompt for one of the real-world categories above."
                defaultPrompt={activePlaygroundPrompt || "Act as an Executive Workplace Communications Coach. Draft a polite and professional email to my engineering manager requesting 3 days of personal leave from Oct 12 to 14. Mention that my pending PRs will be handed over to a teammate."}
                onTestPrompt={(prompt) => {
                  setActivePromptForCoach(prompt);
                  return PromptEvaluator.evaluatePrompt(prompt, 6);
                }}
                onStagePassed={() => handleStagePassed(6)}
                isStageCompleted={completedStageIds.includes(6)}
                onOpenCoachChat={() => setIsCoachOpen(true)}
              />
            </View>
          )}

          {/* ==================================================
              STAGE 7: DEBUGGING & GUARDRAILS
              ================================================== */}
          {activeStageId === 7 && (
            <View style={styles.stageSectionWrap}>
              <View style={styles.guardrailsBox}>
                <Text style={styles.guardrailsTitle}>
                  Preventing AI Hallucinations
                </Text>
                <Text style={styles.guardrailsText}>
                  To prevent AI from making up facts, always use{' '}
                  <Text style={{ fontWeight: '700' }}>Strict Grounding</Text> and{' '}
                  <Text style={{ fontWeight: '700' }}>Negative Constraints</Text>:
                </Text>
                <View style={styles.guardrailsChecklist}>
                  <Text style={styles.guardrailBullet}>
                    • "Answer using ONLY the provided text below."
                  </Text>
                  <Text style={styles.guardrailBullet}>
                    • "If the answer is not contained in the text, respond: 'Information not available'."
                  </Text>
                  <Text style={styles.guardrailBullet}>
                    • "Do NOT speculate or extrapolate beyond the provided facts."
                  </Text>
                </View>
              </View>

              <PromptPlaygroundCard
                taskTitle="Debug & Guardrail Challenge 🚀"
                taskInstruction="Test this grounded prompt that strictly guards against hallucinated answers."
                defaultPrompt="You are an Fact-Checking Assistant. Answer questions using ONLY the text below. If not in the text, say 'I cannot find that in the documentation.'\n\nTEXT: CrackWithAI offers courses in Full Stack Web Development and Prompt Engineering. All users receive certificates upon completing practical milestones.\n\nQUESTION: Does CrackWithAI teach Quantum Machine Learning?"
                onTestPrompt={(prompt) => {
                  setActivePromptForCoach(prompt);
                  return PromptEvaluator.evaluatePrompt(prompt, 7);
                }}
                onStagePassed={() => handleStagePassed(7)}
                isStageCompleted={completedStageIds.includes(7)}
                onOpenCoachChat={() => setIsCoachOpen(true)}
              />
            </View>
          )}

          {/* ==================================================
              STAGE 8: FINAL CAPSTONE CHALLENGE
              ================================================== */}
          {activeStageId === 8 && (
            <View style={styles.stageSectionWrap}>
              <PromptFinalChallengeWidget
                onStartCapstone={(prompt) => {
                  setActivePromptForCoach(prompt);
                  scrollToPlayground();
                }}
              />

              <PromptPlaygroundCard
                taskTitle="Final Capstone Challenge 🚀"
                taskInstruction="Score 80%+ across all 5 evaluation criteria to pass the Final Challenge and unlock your Official Certificate!"
                defaultPrompt={`Act as an AI Customer Support Specialist for CrackWithAI.
Respond warmly and professionally to customer queries.
Use ONLY the provided policy information:
- Subscriptions can be canceled anytime from Settings > Billing.
- Refunds are eligible within 7 days of initial purchase.
- Support hours are Mon-Fri 9am to 6pm EST.

If the customer's request lacks required details (like email or order ID), politely ask for clarification.
Return your response structured in 3 sections:
1. Warm Greeting & Summary
2. Action Taken / Direct Answer
3. Next Steps / Follow Up

Do not make guarantees beyond the official policy.`}
                onTestPrompt={(prompt) => {
                  setActivePromptForCoach(prompt);
                  return PromptEvaluator.evaluatePrompt(prompt, 8);
                }}
                onStagePassed={() => handleStagePassed(8)}
                isStageCompleted={completedStageIds.includes(8)}
                onOpenCoachChat={() => setIsCoachOpen(true)}
              />
            </View>
          )}
        </View>

        {/* Certificate Modal View */}
        <CertificateModal
          visible={certificateModalVisible}
          certificate={earnedCertificate}
          onClose={() => setCertificateModalVisible(false)}
        />
      </ScrollView>

      {/* Floating Action Button for Integrated AI Coach Chat */}
      <TouchableOpacity
        style={styles.floatingCoachBtn}
        activeOpacity={0.88}
        onPress={() => setIsCoachOpen(true)}
        accessibilityLabel="Ask AI Coach"
      >
        <Icon name="sparkles" size={20} color="#FFFFFF" />
        <Text style={styles.floatingCoachBtnText}>Ask Coach</Text>
      </TouchableOpacity>

      {/* Integrated AI Coach Chat Sheet */}
      <PromptCoachSheet
        visible={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        currentStageTitle={currentStage.title}
        activePrompt={activePromptForCoach}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  topBarTitleBox: {
    alignItems: 'center',
  },
  topBarEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 1,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  coachTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  coachTopBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  stageSelectorContainer: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '700',
  },
  stageTabsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  stageTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stageTabPillActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#7C3AED',
    borderWidth: 1.5,
  },
  stageTabPillCompleted: {
    borderColor: '#CBD5E1',
  },
  stageNumCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageNumCircleActive: {
    backgroundColor: '#7C3AED',
  },
  stageNumCircleCompleted: {
    backgroundColor: '#10B981',
  },
  stageNumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stageNumTextActive: {
    color: '#FFFFFF',
  },
  stageTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  stageTabTextActive: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  stageContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  stageBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stageTag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stageTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    textTransform: 'uppercase',
  },
  stageBadgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stageMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  stageSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 8,
  },
  stageDescription: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  stageSectionWrap: {
    gap: 12,
  },
  conceptHighlightBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
    marginVertical: 4,
  },
  conceptQuote: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#4C1D95',
    fontWeight: '600',
  },
  comparisonWrap: {
    gap: 10,
    marginVertical: 10,
  },
  comparisonHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  vagueCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  betterCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  compPillBad: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  compPillBadText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  compPillGood: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  compPillGoodText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  promptQuote: {
    fontSize: 13.5,
    color: '#1E293B',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  whyBetterCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginTop: 6,
  },
  whyBetterTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  whyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whyIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyPointText: {
    fontSize: 12.5,
    color: '#334155',
    flex: 1,
  },
  iterativeLoopBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 10,
  },
  loopTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5B21B6',
  },
  loopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  loopPill: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D28D9',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  loopPillActive: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  loopArrow: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  loopDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  guardrailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  guardrailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  guardrailsText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  guardrailsChecklist: {
    gap: 4,
    marginTop: 4,
  },
  guardrailBullet: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  floatingCoachBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#7C3AED',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingCoachBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
