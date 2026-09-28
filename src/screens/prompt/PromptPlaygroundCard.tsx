import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated
} from 'react-native';
import { Icon } from '../../components/Icon';
import { WorkshopMessage } from '../../components/WorkshopMessage';
import { PromptEvaluationResult } from './PromptEvaluator';

interface PromptPlaygroundCardProps {
  taskTitle: string;
  taskInstruction: string;
  defaultPrompt?: string;
  samplePrompt?: string;
  onTestPrompt: (prompt: string) => Promise<PromptEvaluationResult>;
  onStagePassed?: () => void;
  isStageCompleted?: boolean;
  onOpenCoachChat?: () => void;
}

export const PromptPlaygroundCard: React.FC<PromptPlaygroundCardProps> = ({
  taskTitle,
  taskInstruction,
  defaultPrompt = '',
  samplePrompt = '',
  onTestPrompt,
  onStagePassed,
  isStageCompleted = false,
  onOpenCoachChat,
}) => {
  const [promptText, setPromptText] = useState(defaultPrompt);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<PromptEvaluationResult | null>(null);

  React.useEffect(() => {
    if (defaultPrompt) {
      setPromptText(defaultPrompt);
    }
  }, [defaultPrompt]);

  const handleTest = async () => {
    if (!promptText.trim() || testing) return;
    setTesting(true);
    try {
      const evaluation = await onTestPrompt(promptText.trim());
      setResult(evaluation);
      if (evaluation.isPassed && onStagePassed) {
        onStagePassed();
      }
    } finally {
      setTesting(false);
    }
  };

  const handleApplyImprovement = () => {
    if (result?.tryAdding) {
      // Remove enclosing quotes if any
      const cleaned = result.tryAdding.replace(/^"|"$/g, '');
      setPromptText(cleaned);
    }
  };

  const handleInsertSample = () => {
    if (samplePrompt) {
      setPromptText(samplePrompt);
    }
  };

  return (
    <View style={styles.playgroundContainer}>
      {/* Task Header */}
      <View style={styles.taskHeader}>
        <View style={styles.taskIconBadge}>
          <Text style={{ fontSize: 16 }}>🚀</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskTitle}>{taskTitle || 'Try It Yourself'}</Text>
          <Text style={styles.taskInstruction}>{taskInstruction}</Text>
        </View>
      </View>

      {/* Quick Helper Chips */}
      <View style={styles.helpersRow}>
        {samplePrompt ? (
          <TouchableOpacity
            style={styles.sampleChip}
            activeOpacity={0.7}
            onPress={handleInsertSample}
          >
            <Icon name="sparkles" size={12} color="#7C3AED" />
            <Text style={styles.sampleChipText}>Insert Sample Prompt</Text>
          </TouchableOpacity>
        ) : null}

        {promptText ? (
          <TouchableOpacity
            style={styles.clearChip}
            activeOpacity={0.7}
            onPress={() => setPromptText('')}
          >
            <Text style={styles.clearChipText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Input Area */}
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.textInput}
          value={promptText}
          onChangeText={setPromptText}
          placeholder="Write your prompt here... (e.g. You are a JavaScript teacher. Explain JavaScript to a beginner using 5 simple points...)"
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Test Button */}
      <TouchableOpacity
        style={[
          styles.testBtn,
          (!promptText.trim() || testing) && styles.testBtnDisabled,
        ]}
        activeOpacity={0.85}
        onPress={handleTest}
        disabled={!promptText.trim() || testing}
      >
        {testing ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.testBtnText}>AI Testing Your Prompt...</Text>
          </>
        ) : (
          <>
            <Icon name="play" size={15} color="#FFFFFF" />
            <Text style={styles.testBtnText}>Test My Prompt</Text>
          </>
        )}
      </TouchableOpacity>

      {/* ==================================================
          LIVE AI RESULTS & COACH ANALYSIS PLAYGROUND
          ================================================== */}
      {result && (
        <View style={styles.resultPlayground}>
          {/* User's Prompt Section */}
          <View style={styles.resultBox}>
            <View style={styles.resultBoxHeader}>
              <Icon name="terminal" size={14} color="#6D28D9" />
              <Text style={styles.resultBoxTitle}>Your Prompt</Text>
            </View>
            <Text style={styles.promptDisplay}>{result.prompt}</Text>
          </View>

          {/* Arrow Divider */}
          <View style={styles.arrowDivider}>
            <Icon name="chevron-down" size={18} color="#94A3B8" />
          </View>

          {/* AI Output Section */}
          <View style={[styles.resultBox, styles.aiResponseBox]}>
            <View style={styles.resultBoxHeader}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI Response</Text>
              </View>
              {result.model ? (
                <Text style={styles.modelTag}>{result.model}</Text>
              ) : null}
            </View>
            <View style={styles.aiContent}>
              <WorkshopMessage text={result.aiResponse} />
            </View>
          </View>

          {/* Arrow Divider */}
          <View style={styles.arrowDivider}>
            <Icon name="chevron-down" size={18} color="#94A3B8" />
          </View>

          {/* AI Coach Analysis Card */}
          <View style={styles.coachCard}>
            <View style={styles.coachCardHeader}>
              <View style={styles.coachBadge}>
                <Icon name="sparkles" size={15} color="#7C3AED" />
                <Text style={styles.coachBadgeTitle}>AI Coach</Text>
              </View>
              <View
                style={[
                  styles.scorePill,
                  result.isPassed ? styles.scorePillPassed : styles.scorePillWarn,
                ]}
              >
                <Text
                  style={[
                    styles.scoreText,
                    result.isPassed ? styles.scoreTextPassed : styles.scoreTextWarn,
                  ]}
                >
                  Prompt Score: {result.score}/100
                </Text>
              </View>
            </View>

            {/* What you did well */}
            {result.whatWentWell.length > 0 && (
              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackHeaderGood}>What you did well ✓</Text>
                {result.whatWentWell.map((item, idx) => (
                  <View key={`good-${idx}`} style={styles.feedbackItemRow}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.feedbackItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* What you can improve */}
            {result.whatToImprove.length > 0 && (
              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackHeaderWarn}>What you can improve</Text>
                {result.whatToImprove.map((item, idx) => (
                  <View key={`warn-${idx}`} style={styles.feedbackItemRow}>
                    <Text style={styles.warnIcon}>•</Text>
                    <Text style={styles.feedbackItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Try Adding Suggestion */}
            {result.tryAdding ? (
              <View style={styles.suggestionBox}>
                <Text style={styles.suggestionLabel}>Try adding:</Text>
                <Text style={styles.suggestionPrompt}>{result.tryAdding}</Text>

                <TouchableOpacity
                  style={styles.improveBtn}
                  activeOpacity={0.85}
                  onPress={handleApplyImprovement}
                >
                  <Icon name="refresh-cw" size={14} color="#7C3AED" />
                  <Text style={styles.improveBtnText}>Improve My Prompt</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Stage Passing Notice */}
            {result.isPassed && (
              <View style={styles.passedBanner}>
                <View style={styles.passedIconBox}>
                  <Icon name="check" size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.passedTitle}>Great Prompting! 🎉</Text>
                  <Text style={styles.passedDesc}>
                    Your prompt gave AI clear direction. This concept is now marked completed!
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  playgroundContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  taskIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  taskInstruction: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  helpersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  sampleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  clearChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  inputWrap: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    minHeight: 100,
    marginBottom: 14,
  },
  textInput: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#0F172A',
    padding: 0,
    textAlignVertical: 'top',
  },
  testBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  testBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  testBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultPlayground: {
    marginTop: 18,
    gap: 8,
  },
  arrowDivider: {
    alignItems: 'center',
    marginVertical: 4,
  },
  resultBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  aiResponseBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDD6FE',
    borderWidth: 1.5,
  },
  resultBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D28D9',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
    marginLeft: 6,
  },
  promptDisplay: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  aiBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C3AED',
    textTransform: 'uppercase',
  },
  modelTag: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  aiContent: {
    marginTop: 4,
  },
  coachCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    padding: 16,
    marginTop: 4,
  },
  coachCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  coachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coachBadgeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7C3AED',
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scorePillPassed: {
    backgroundColor: '#DCFCE7',
  },
  scorePillWarn: {
    backgroundColor: '#FEF3C7',
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '800',
  },
  scoreTextPassed: {
    color: '#15803D',
  },
  scoreTextWarn: {
    color: '#B45309',
  },
  feedbackSection: {
    marginBottom: 12,
  },
  feedbackHeaderGood: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
    marginBottom: 6,
  },
  feedbackHeaderWarn: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
    marginBottom: 6,
  },
  feedbackItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  checkIcon: {
    color: '#15803D',
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 18,
  },
  warnIcon: {
    color: '#B45309',
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 18,
  },
  feedbackItemText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    flex: 1,
  },
  suggestionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    padding: 12,
    marginTop: 6,
  },
  suggestionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  suggestionPrompt: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  improveBtn: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  improveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
  },
  passedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  passedIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  passedDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
});
