import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Icon } from '../../components/Icon';
import {
  PROMPT_MISTAKES,
  PROMPT_TECHNIQUES,
  REAL_WORLD_SCENARIOS,
  PromptMistake,
  PromptTechnique,
  RealWorldScenario,
} from './promptCourseData';

// ==================================================
// WIDGET 1: PROMPT BUILDER (STAGE 2)
// Formula: ROLE + TASK + CONTEXT + CONSTRAINTS + OUTPUT
// ==================================================
interface PromptBuilderWidgetProps {
  onBuildAndTest: (fullPrompt: string) => void;
}

export const PromptBuilderWidget: React.FC<PromptBuilderWidgetProps> = ({
  onBuildAndTest,
}) => {
  const [role, setRole] = useState('You are an experienced computer science teacher');
  const [task, setTask] = useState('Explain how API authentication works');
  const [context, setContext] = useState('The learner knows basic JavaScript but is new to JWT tokens');
  const [constraints, setConstraints] = useState('Keep it under 150 words and use simple analogies');
  const [outputFormat, setOutputFormat] = useState('3 clear numbered points + 1 real-world example');

  const handleApplyPreset = (type: 'tutor' | 'resume' | 'support') => {
    if (type === 'tutor') {
      setRole('You are an experienced JavaScript educator');
      setTask('Explain the difference between synchronous and asynchronous code');
      setContext('The audience is high school students learning programming');
      setConstraints('Keep it under 120 words and use a restaurant kitchen analogy');
      setOutputFormat('3 simple bullet points');
    } else if (type === 'resume') {
      setRole('Act as an Executive Tech Resume Coach');
      setTask('Write a powerful 3-sentence summary for a Full Stack Developer');
      setContext('Candidate has 2 years of experience with React, Node.js, and MongoDB');
      setConstraints('Focus on quantifiable impact, clean tone, zero buzzwords');
      setOutputFormat('Markdown bullet points with highlighted action verbs');
    } else {
      setRole('Act as a Customer Support Specialist');
      setTask('Respond to a user reporting an app crash during checkout');
      setContext('User is frustrated, order was not completed');
      setConstraints('Empathetic, reassuring, concise under 80 words');
      setOutputFormat('Formal email response with clear apology & resolution steps');
    }
  };

  const handleAssemblePrompt = () => {
    const combined = [
      role ? `[ROLE] ${role.trim()}` : '',
      task ? `[TASK] ${task.trim()}` : '',
      context ? `[CONTEXT] ${context.trim()}` : '',
      constraints ? `[CONSTRAINTS] ${constraints.trim()}` : '',
      outputFormat ? `[OUTPUT] ${outputFormat.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    onBuildAndTest(combined);
  };

  return (
    <View style={styles.builderCard}>
      {/* Formula Display Banner */}
      <View style={styles.formulaBanner}>
        <Text style={styles.formulaTitle}>THE PROMPT FORMULA</Text>
        <Text style={styles.formulaEquation}>
          ROLE + TASK + CONTEXT + CONSTRAINTS + OUTPUT
        </Text>
      </View>

      {/* Preset Buttons */}
      <View style={styles.presetsRow}>
        <Text style={styles.presetsLabel}>Try Presets:</Text>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => handleApplyPreset('tutor')}
        >
          <Text style={styles.presetChipText}>Coding Tutor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => handleApplyPreset('resume')}
        >
          <Text style={styles.presetChipText}>Resume Coach</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => handleApplyPreset('support')}
        >
          <Text style={styles.presetChipText}>Support Rep</Text>
        </TouchableOpacity>
      </View>

      {/* 5 Input Fields */}
      <View style={styles.inputStack}>
        {/* 1. Role */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>1. Role (Who should AI act as?)</Text>
          <TextInput
            style={styles.fieldInput}
            value={role}
            onChangeText={setRole}
            placeholder="e.g. You are an experienced senior educator"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* 2. Task */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>2. Task (What should AI do?)</Text>
          <TextInput
            style={styles.fieldInput}
            value={task}
            onChangeText={setTask}
            placeholder="e.g. Explain how API authentication works"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* 3. Context */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>3. Context (What info does AI need?)</Text>
          <TextInput
            style={styles.fieldInput}
            value={context}
            onChangeText={setContext}
            placeholder="e.g. The reader knows basic JavaScript but is new to JWT"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* 4. Constraints */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>4. Constraints (What rules to follow?)</Text>
          <TextInput
            style={styles.fieldInput}
            value={constraints}
            onChangeText={setConstraints}
            placeholder="e.g. Keep under 150 words and use simple analogies"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* 5. Output Format */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>5. Output (How should result look?)</Text>
          <TextInput
            style={styles.fieldInput}
            value={outputFormat}
            onChangeText={setOutputFormat}
            placeholder="e.g. 5 bullet points + 1 real-world example"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* Assemble Button */}
      <TouchableOpacity
        style={styles.assembleBtn}
        activeOpacity={0.85}
        onPress={handleAssemblePrompt}
      >
        <Icon name="sparkles" size={16} color="#FFFFFF" />
        <Text style={styles.assembleBtnText}>Generate My Prompt & Test</Text>
      </TouchableOpacity>
    </View>
  );
};

// ==================================================
// WIDGET 2: AVOID MISTAKES EXPLORER (STAGE 3)
// ==================================================
interface PromptMistakesWidgetProps {
  onTryMistakeFix: (prompt: string) => void;
}

export const PromptMistakesWidget: React.FC<PromptMistakesWidgetProps> = ({
  onTryMistakeFix,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const mistake: PromptMistake = PROMPT_MISTAKES[selectedIdx] || PROMPT_MISTAKES[0];

  return (
    <View style={styles.mistakesCard}>
      {/* Tab Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mistakesTabs}
      >
        {PROMPT_MISTAKES.map((m, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <TouchableOpacity
              key={`m-${m.id}`}
              style={[
                styles.mistakeTabPill,
                isSelected && styles.mistakeTabPillActive,
              ]}
              onPress={() => setSelectedIdx(idx)}
            >
              <Text
                style={[
                  styles.mistakeTabText,
                  isSelected && styles.mistakeTabTextActive,
                ]}
              >
                Mistake {m.id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Mistake Detail */}
      <View style={styles.mistakeBody}>
        <Text style={styles.mistakeTitle}>{mistake.title}</Text>
        <Text style={styles.mistakeSummary}>{mistake.summary}</Text>

        {/* Bad Prompt Box */}
        <View style={styles.badBox}>
          <View style={styles.boxTagBad}>
            <Text style={styles.boxTagBadText}>❌ Bad Prompt</Text>
          </View>
          <Text style={styles.badPromptText}>"{mistake.badPrompt}"</Text>
          <Text style={styles.whyBadText}>
            <Text style={{ fontWeight: '700' }}>Why it fails: </Text>
            {mistake.whyBad}
          </Text>
        </View>

        {/* Better Prompt Box */}
        <View style={styles.goodBox}>
          <View style={styles.boxTagGood}>
            <Text style={styles.boxTagGoodText}>✅ Better Prompt</Text>
          </View>
          <Text style={styles.goodPromptText}>"{mistake.betterPrompt}"</Text>
        </View>

        {/* Try It CTA */}
        <TouchableOpacity
          style={styles.tryFixBtn}
          activeOpacity={0.85}
          onPress={() => onTryMistakeFix(mistake.tryPrompt)}
        >
          <Icon name="play" size={14} color="#7C3AED" />
          <Text style={styles.tryFixBtnText}>Try Improved Prompt in Coach</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ==================================================
// WIDGET 3: TECHNIQUES SELECTOR (STAGE 4)
// ==================================================
interface PromptTechniquesWidgetProps {
  onTestTechnique: (prompt: string) => void;
}

export const PromptTechniquesWidget: React.FC<PromptTechniquesWidgetProps> = ({
  onTestTechnique,
}) => {
  const [selectedId, setSelectedId] = useState('zero-shot');
  const tech =
    PROMPT_TECHNIQUES.find((t) => t.id === selectedId) || PROMPT_TECHNIQUES[0];

  return (
    <View style={styles.techniquesCard}>
      {/* Horizontal Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.techTabsScroll}
      >
        {PROMPT_TECHNIQUES.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.techTab, isSelected && styles.techTabActive]}
              onPress={() => setSelectedId(item.id)}
            >
              <Text
                style={[
                  styles.techTabText,
                  isSelected && styles.techTabTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Technique Card */}
      <View style={styles.techContent}>
        <View style={styles.techHeaderRow}>
          <View style={styles.techBadge}>
            <Text style={styles.techBadgeText}>{tech.tag}</Text>
          </View>
          <Text style={styles.techTitle}>{tech.name}</Text>
        </View>

        <Text style={styles.techExplanation}>{tech.explanation}</Text>

        {/* Code Example Preview */}
        <View style={styles.exampleBox}>
          <Text style={styles.exampleLabel}>Interactive Example:</Text>
          <Text style={styles.exampleCode}>{tech.example}</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.techActionBtn}
          activeOpacity={0.85}
          onPress={() => onTestTechnique(tech.starterPrompt)}
        >
          <Icon name="sparkles" size={14} color="#FFFFFF" />
          <Text style={styles.techActionBtnText}>
            See Example → Try It → Get AI Feedback
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ==================================================
// WIDGET 4: REAL-WORLD SCENARIOS (STAGE 6)
// ==================================================
interface PromptScenariosWidgetProps {
  onSelectScenario: (scenario: RealWorldScenario) => void;
}

export const PromptScenariosWidget: React.FC<PromptScenariosWidgetProps> = ({
  onSelectScenario,
}) => {
  return (
    <View style={styles.scenariosWrap}>
      <Text style={styles.scenariosSectionTitle}>
        Use Prompt Engineering in Real Life
      </Text>
      <Text style={styles.scenariosSectionSub}>
        Tap any card to load a real-world workplace challenge into the AI Coach:
      </Text>

      <View style={styles.scenariosGrid}>
        {REAL_WORLD_SCENARIOS.map((scenario) => (
          <TouchableOpacity
            key={scenario.id}
            style={styles.scenarioCard}
            activeOpacity={0.8}
            onPress={() => onSelectScenario(scenario)}
          >
            <View style={styles.scenarioIconBox}>
              <Icon name={scenario.icon as any} size={18} color="#7C3AED" />
            </View>
            <Text style={styles.scenarioTitle}>{scenario.title}</Text>
            <Text style={styles.scenarioDesc} numberOfLines={2}>
              {scenario.taskDescription}
            </Text>
            <View style={styles.tryCardLink}>
              <Text style={styles.tryCardLinkText}>Start Challenge</Text>
              <Icon name="arrow-right" size={12} color="#7C3AED" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ==================================================
// WIDGET 5: FINAL CHALLENGE CAPSTONE (STAGE 8)
// ==================================================
interface PromptFinalChallengeWidgetProps {
  onStartCapstone: (prompt: string) => void;
}

export const PromptFinalChallengeWidget: React.FC<PromptFinalChallengeWidgetProps> = ({
  onStartCapstone,
}) => {
  const capstoneSample = `Act as an AI Customer Support Specialist for CrackWithAI.
Respond warmly and professionally to customer queries.
Use ONLY the provided policy information:
- Policy: Subscriptions can be canceled anytime from Settings > Billing.
- Refunds: Eligible within 7 days of initial purchase.
- Support hours: Mon-Fri 9am to 6pm EST.

If the customer's question lacks required details (like email or order ID), politely ask for clarification.
Return your response structured in 3 sections:
1. Warm Greeting & Summary
2. Action Taken / Direct Answer
3. Next Steps / Follow Up

Do not make guarantees beyond the official policy.`;

  return (
    <View style={styles.capstoneCard}>
      <View style={styles.capstoneHeader}>
        <View style={styles.capstoneBadge}>
          <Text style={{ fontSize: 18 }}>🚀</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.capstoneTitle}>Build Your Own AI Prompt</Text>
          <Text style={styles.capstoneSub}>
            Final Capstone: Production Customer Support Assistant
          </Text>
        </View>
      </View>

      <View style={styles.problemBox}>
        <Text style={styles.problemLabel}>The Real-World Challenge:</Text>
        <Text style={styles.problemText}>
          You are building an AI customer support assistant. Create a prompt that makes
          the AI respond professionally, use only the provided customer information,
          return structured information, and ask for clarification when required
          information is missing.
        </Text>
      </View>

      {/* 5-Criteria Rubric Checklist */}
      <View style={styles.rubricBox}>
        <Text style={styles.rubricTitle}>AI Evaluation Criteria (Must Pass All 5):</Text>
        <View style={styles.rubricItem}>
          <Text style={styles.rubricIcon}>✓</Text>
          <Text style={styles.rubricText}>
            <Text style={{ fontWeight: '700' }}>Role: </Text>Warm, professional support persona
          </Text>
        </View>
        <View style={styles.rubricItem}>
          <Text style={styles.rubricIcon}>✓</Text>
          <Text style={styles.rubricText}>
            <Text style={{ fontWeight: '700' }}>Task: </Text>Resolve customer policy questions
          </Text>
        </View>
        <View style={styles.rubricItem}>
          <Text style={styles.rubricIcon}>✓</Text>
          <Text style={styles.rubricText}>
            <Text style={{ fontWeight: '700' }}>Context: </Text>Ground in provided policies only
          </Text>
        </View>
        <View style={styles.rubricItem}>
          <Text style={styles.rubricIcon}>✓</Text>
          <Text style={styles.rubricText}>
            <Text style={{ fontWeight: '700' }}>Constraints: </Text>Ask clarification if info missing; no false guarantees
          </Text>
        </View>
        <View style={styles.rubricItem}>
          <Text style={styles.rubricIcon}>✓</Text>
          <Text style={styles.rubricText}>
            <Text style={{ fontWeight: '700' }}>Output Format: </Text>Structured 3-part response template
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.capstoneBtn}
        activeOpacity={0.85}
        onPress={() => onStartCapstone(capstoneSample)}
      >
        <Icon name="award" size={16} color="#FFFFFF" />
        <Text style={styles.capstoneBtnText}>Load Capstone & Test with AI</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Builder Styles
  builderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formulaBanner: {
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 14,
  },
  formulaTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 1,
    marginBottom: 4,
  },
  formulaEquation: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4C1D95',
    textAlign: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  presetsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  inputStack: {
    gap: 12,
    marginBottom: 16,
  },
  fieldBlock: {},
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },
  fieldInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  assembleBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  assembleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Mistakes Styles
  mistakesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  mistakesTabs: {
    gap: 8,
    paddingBottom: 12,
  },
  mistakeTabPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  mistakeTabPillActive: {
    backgroundColor: '#7C3AED',
  },
  mistakeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  mistakeTabTextActive: {
    color: '#FFFFFF',
  },
  mistakeBody: {
    gap: 10,
  },
  mistakeTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  mistakeSummary: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  badBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  boxTagBad: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  boxTagBadText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  badPromptText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#991B1B',
    marginBottom: 6,
  },
  whyBadText: {
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 16,
  },
  goodBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  boxTagGood: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  boxTagGoodText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  goodPromptText: {
    fontSize: 13,
    color: '#14532D',
    lineHeight: 18,
  },
  tryFixBtn: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  tryFixBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
  },

  // Techniques Styles
  techniquesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  techTabsScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  techTab: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  techTabActive: {
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  techTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  techTabTextActive: {
    color: '#7C3AED',
  },
  techContent: {
    gap: 10,
  },
  techHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  techBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  techBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    textTransform: 'uppercase',
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  techExplanation: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  exampleBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exampleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  exampleCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1E293B',
    lineHeight: 18,
  },
  techActionBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  techActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Scenarios Styles
  scenariosWrap: {
    marginVertical: 14,
  },
  scenariosSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  scenariosSectionSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  scenariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  scenarioCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  scenarioIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scenarioTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  scenarioDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 10,
  },
  tryCardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tryCardLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },

  // Capstone Styles
  capstoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  capstoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  capstoneBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capstoneTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  capstoneSub: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
    marginTop: 2,
  },
  problemBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  problemLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  problemText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  rubricBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 8,
    marginBottom: 16,
  },
  rubricTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6D28D9',
    marginBottom: 4,
  },
  rubricItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  rubricIcon: {
    color: '#15803D',
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 18,
  },
  rubricText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
    lineHeight: 18,
  },
  capstoneBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  capstoneBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
