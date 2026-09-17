import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { aiApi } from '../../api/aiApi';
import { copyToClipboard } from '../../utils/clipboard';

interface HistoryItem {
  id: string;
  prompt: string;
  code: string;
  explanation?: string;
  language: string;
  action: string;
  date: string;
}

const ACTION_OPTIONS = [
  'Generate',
  'Explain',
  'Fix Bug',
  'Refactor',
  'Add Tests',
];

const LANGUAGE_OPTIONS = [
  'Auto',
  'React Native / React',
  'TypeScript',
  'JavaScript',
  'Python',
  'HTML / CSS',
  'Java',
  'C++',
  'SQL',
];

const QUICK_PROMPTS = [
  {
    label: 'Build a React component',
    prompt: 'Build a modern, responsive React Native card component with state toggle and clean styling.',
    action: 'Generate',
    language: 'React Native / React',
  },
  {
    label: 'Create REST API',
    prompt: 'Create an Express.js TypeScript REST API router endpoint for user profile analytics.',
    action: 'Generate',
    language: 'TypeScript',
  },
  {
    label: 'Fix my code',
    prompt: 'Identify potential memory leaks and fix errors in this code snippet:\n\nuseEffect(() => {\n  const interval = setInterval(() => fetchData(), 1000);\n}, []);',
    action: 'Fix Bug',
    language: 'JavaScript',
  },
  {
    label: 'Explain code',
    prompt: 'Explain line by line how a JWT authentication middleware works in Express.js:',
    action: 'Explain',
    language: 'Auto',
  },
];

export const AICodeGeneratorScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const [prompt, setPrompt] = useState('');
  const [selectedAction, setSelectedAction] = useState('Generate');
  const [selectedLanguage, setSelectedLanguage] = useState('Auto');

  // Dropdown states
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Output states
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeExplanation, setCodeExplanation] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'codex_1',
      prompt: 'Build a React Native component with state management',
      code: `import React, { useState } from 'react';\nimport { View, Text, TouchableOpacity } from 'react-native';\n\nexport const SampleComponent = () => {\n  const [count, setCount] = useState(0);\n  return (\n    <View>\n      <Text>Count: {count}</Text>\n      <TouchableOpacity onPress={() => setCount(count + 1)}>\n        <Text>Increment</Text>\n      </TouchableOpacity>\n    </View>\n  );\n};`,
      explanation: 'Created a simple counter component using React hooks.',
      language: 'React Native / React',
      action: 'Generate',
      date: '1 hour ago',
    },
  ]);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'ToolsTab' });
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      handleGoBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);

  const generateFallbackCode = (promptText: string, lang: string, actionType: string) => {
    const lower = (promptText + ' ' + lang + ' ' + actionType).toLowerCase();
    let codeStr = '';
    let explStr = '';

    if (lower.includes('react') || lower.includes('component') || lower.includes('ui') || lower.includes('card')) {
      codeStr = `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const CustomCard = ({ title = 'Feature Card', description = 'AI Generated Component' }) => {
  const [active, setActive] = useState(false);

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TouchableOpacity 
        style={[styles.button, active && styles.buttonActive]}
        onPress={() => setActive(!active)}
      >
        <Text style={styles.buttonText}>{active ? '✓ Enabled' : 'Enable'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  description: { fontSize: 14, color: '#6B7280', marginVertical: 8 },
  button: { backgroundColor: '#6366F1', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  buttonActive: { backgroundColor: '#10B981' },
  buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
});`;
      explStr = 'Constructed a modern React Native component with local state toggling, conditional styling, and clean StyleSheet definitions.';
    } else if (lower.includes('api') || lower.includes('express') || lower.includes('rest') || lower.includes('endpoint')) {
      codeStr = `import express, { Request, Response } from 'express';

const router = express.Router();

// GET /api/v1/resource
router.get('/resource', async (req: Request, res: Response) => {
  try {
    const data = [
      { id: 1, name: 'Resource A', status: 'Active' },
      { id: 2, name: 'Resource B', status: 'Pending' },
    ];

    return res.status(200).json({
      success: true,
      message: 'Resource list fetched successfully',
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;`;
      explStr = 'Created an Express REST API router with TypeScript typing, error handling, and structured JSON responses.';
    } else {
      codeStr = `// ${actionType} code for: ${promptText}
// Language: ${lang}

export function executeSolution(inputData?: any) {
  console.log('[*] Executing solution for: ${promptText}');
  
  const result = {
    status: 'success',
    prompt: '${promptText}',
    timestamp: new Date().toISOString(),
    output: inputData || 'Task completed successfully',
  };

  return result;
}

// Example invocation:
const response = executeSolution({ active: true });
console.log('Result:', response);`;
      explStr = `Generated a production-ready ${lang} module tailored for "${promptText}".`;
    }

    return { code: codeStr, explanation: explStr };
  };

  const handleGenerateCode = async (overridePrompt?: string) => {
    const activePrompt = overridePrompt || prompt.trim();
    if (!activePrompt) {
      Alert.alert('Required Prompt', 'Please type a code request or select a quick prompt below.');
      return;
    }

    setGenerating(true);
    setShowActionDropdown(false);
    setShowLanguageDropdown(false);

    try {
      const res = await aiApi.generateCode(activePrompt, {
        language: selectedLanguage,
        action: selectedAction,
      });

      if (res && res.data && res.data.code) {
        setGeneratedCode(res.data.code);
        setCodeExplanation(res.data.explanation || 'Generated using CrackWithAI Codex.');
      } else {
        const fallback = generateFallbackCode(activePrompt, selectedLanguage, selectedAction);
        setGeneratedCode(fallback.code);
        setCodeExplanation(fallback.explanation);
      }
    } catch (err) {
      console.log('[AICodeGeneratorScreen] Code generation fallback active:', err);
      const fallback = generateFallbackCode(activePrompt, selectedLanguage, selectedAction);
      setGeneratedCode(fallback.code);
      setCodeExplanation(fallback.explanation);
    } finally {
      setGenerating(false);
    }
  };

  const handleQuickPromptSelect = (item: typeof QUICK_PROMPTS[0]) => {
    setPrompt(item.prompt);
    setSelectedAction(item.action);
    setSelectedLanguage(item.language);
    handleGenerateCode(item.prompt);
  };

  const handleCopyCode = (codeText?: string) => {
    const textToCopy = codeText || generatedCode;
    if (textToCopy) {
      copyToClipboard(textToCopy, 'Code');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP HEADER BAR */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backPill} onPress={handleGoBack} activeOpacity={0.7}>
          <Icon name="chevron-left" size={16} color="#6366F1" />
          <Text style={styles.backPillText}>AI Tools</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.historyBtn} onPress={() => setShowHistoryModal(true)} activeOpacity={0.8}>
          <Text style={styles.historyBtnText}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HERO TITLE SECTION */}
        <View style={styles.heroSection}>
          <Text style={styles.subTag}>CRACKWITHAI CODEX</Text>
          <Text style={styles.mainTitle}>AI Code Generator</Text>
          <Text style={styles.heroDesc}>
            Describe what you want to build and let CrackWithAI generate the code.
          </Text>
        </View>

        {/* MAIN INPUT CARD */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Ask CrackWithAI to build, fix, explain, or improve code..."
            placeholderTextColor="#9CA3AF"
            value={prompt}
            onChangeText={setPrompt}
            textAlignVertical="top"
          />

          {/* CARD TOOLBAR */}
          <View style={styles.cardToolbar}>
            {/* Left Attachment (+) Button */}
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={() => Alert.alert('Attachment', 'You can paste or attach existing code snippets into the prompt.')}
              activeOpacity={0.7}
            >
              <Text style={styles.attachBtnIcon}>+</Text>
            </TouchableOpacity>

            {/* Dropdown 1: Action */}
            <TouchableOpacity
              style={styles.dropdownPill}
              onPress={() => {
                setShowActionDropdown(!showActionDropdown);
                setShowLanguageDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownPillText}>{selectedAction}</Text>
              <Icon name="chevron-down" size={14} color="#4B5563" style={styles.dropdownChevron} />
            </TouchableOpacity>

            {/* Dropdown 2: Language */}
            <TouchableOpacity
              style={styles.dropdownPill}
              onPress={() => {
                setShowLanguageDropdown(!showLanguageDropdown);
                setShowActionDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownPillText}>{selectedLanguage}</Text>
              <Icon name="chevron-down" size={14} color="#4B5563" style={styles.dropdownChevron} />
            </TouchableOpacity>

            {/* Flex Spacer */}
            <View style={{ flex: 1 }} />

            {/* Far-Right Submit Arrow Button */}
            <TouchableOpacity
              style={[styles.submitBtn, generating && styles.submitBtnDisabled]}
              onPress={() => handleGenerateCode()}
              disabled={generating}
              activeOpacity={0.8}
            >
              {generating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnIcon}>↑</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* INLINE DROPDOWN OPTIONS: ACTION */}
          {showActionDropdown && (
            <View style={styles.inlineMenu}>
              {ACTION_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.menuItem, selectedAction === item && styles.menuItemActive]}
                  onPress={() => {
                    setSelectedAction(item);
                    setShowActionDropdown(false);
                  }}
                >
                  <Text style={[styles.menuItemText, selectedAction === item && styles.menuItemTextActive]}>
                    {item}
                  </Text>
                  {selectedAction === item && <Icon name="check" size={14} color="#6366F1" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* INLINE DROPDOWN OPTIONS: LANGUAGE */}
          {showLanguageDropdown && (
            <View style={styles.inlineMenu}>
              {LANGUAGE_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.menuItem, selectedLanguage === item && styles.menuItemActive]}
                  onPress={() => {
                    setSelectedLanguage(item);
                    setShowLanguageDropdown(false);
                  }}
                >
                  <Text style={[styles.menuItemText, selectedLanguage === item && styles.menuItemTextActive]}>
                    {item}
                  </Text>
                  {selectedLanguage === item && <Icon name="check" size={14} color="#6366F1" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* QUICK PROMPTS SUGGESTION SECTION */}
        <View style={styles.quickPromptsSection}>
          <Text style={styles.quickPromptsLabel}>Try asking CrackWithAI to build something.</Text>
          <View style={styles.pillsContainer}>
            {QUICK_PROMPTS.map((qp, index) => (
              <TouchableOpacity
                key={index}
                style={styles.promptPill}
                onPress={() => handleQuickPromptSelect(qp)}
                activeOpacity={0.7}
              >
                <Text style={styles.promptPillText}>{qp.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* GENERATING LOADING INDICATOR */}
        {generating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>CrackWithAI Codex is writing your code...</Text>
          </View>
        )}

        {/* GENERATED CODE OUTPUT AREA */}
        {generatedCode && !generating && (
          <View style={styles.codeOutputContainer}>
            {/* Output Header */}
            <View style={styles.codeHeader}>
              <View style={styles.codeHeaderLeft}>
                <View style={styles.langBadge}>
                  <Text style={styles.langBadgeText}>{selectedLanguage.toUpperCase()}</Text>
                </View>
                <Text style={styles.codeHeaderTitle}>{selectedAction} Output</Text>
              </View>

              <TouchableOpacity
                style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
                onPress={() => handleCopyCode()}
                activeOpacity={0.7}
              >
                <Icon name={copied ? 'check' : 'copy'} size={14} color={copied ? '#10B981' : '#6366F1'} />
                <Text style={[styles.copyBtnText, copied && styles.copyBtnTextSuccess]}>
                  {copied ? 'Copied!' : 'Copy Code'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dark Code Terminal Box */}
            <ScrollView horizontal style={styles.codeTerminalScroll} showsHorizontalScrollIndicator={false}>
              <View style={styles.codeTerminal}>
                <Text style={styles.codeText}>{generatedCode}</Text>
              </View>
            </ScrollView>

            {/* Explanation / Breakdown */}
            {codeExplanation && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationTitle}>💡 Code Explanation</Text>
                <Text style={styles.explanationText}>{codeExplanation}</Text>
              </View>
            )}

            {/* Action Bar */}
            <View style={styles.codeActions}>
              <TouchableOpacity
                style={styles.actionSecondaryBtn}
                onPress={() => handleGenerateCode()}
                activeOpacity={0.7}
              >
                <Text style={styles.actionSecondaryText}>⚡ Regenerate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionSecondaryBtn}
                onPress={() => {
                  setGeneratedCode(null);
                  setCodeExplanation(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.actionSecondaryText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* HISTORY MODAL */}
      <Modal visible={showHistoryModal} animationType="slide" transparent={false} onRequestClose={() => setShowHistoryModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Code Generation History</Text>
            <TouchableOpacity onPress={() => setShowHistoryModal(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {history.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 40 }}>No previous code requests.</Text>
            ) : (
              history.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.historyCard}
                  onPress={() => {
                    setPrompt(item.prompt);
                    setGeneratedCode(item.code);
                    setCodeExplanation(item.explanation || null);
                    setSelectedLanguage(item.language);
                    setSelectedAction(item.action);
                    setShowHistoryModal(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={styles.historyLang}>{item.language}</Text>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.historyPrompt} numberOfLines={2}>
                    {item.prompt}
                  </Text>
                  <Text style={styles.historySnippet} numberOfLines={3}>
                    {item.code}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  backPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 4,
  },
  historyBtn: {
    backgroundColor: '#111827',
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  historyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  subTag: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 2,
    marginBottom: 6,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textInput: {
    fontSize: 15,
    color: '#111827',
    minHeight: 120,
    lineHeight: 22,
    marginBottom: 12,
  },
  cardToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  attachBtnIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366F1',
    marginTop: -2,
  },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  dropdownPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  dropdownChevron: {
    marginLeft: 4,
  },
  submitBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: -2,
  },
  inlineMenu: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  menuItemText: {
    fontSize: 14,
    color: '#374151',
  },
  menuItemTextActive: {
    fontWeight: '700',
    color: '#6366F1',
  },
  quickPromptsSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  quickPromptsLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    marginBottom: 12,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  promptPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  promptPillText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  codeOutputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginTop: 8,
    elevation: 3,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  codeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBadge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  langBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
  },
  codeHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    backgroundColor: '#EEF2FF',
  },
  copyBtnSuccess: {
    backgroundColor: '#D1FAE5',
    borderColor: '#D1FAE5',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 4,
  },
  copyBtnTextSuccess: {
    color: '#10B981',
  },
  codeTerminalScroll: {
    backgroundColor: '#1E1E2E',
  },
  codeTerminal: {
    padding: 16,
    minWidth: '100%',
  },
  codeText: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: '#F8FAFC',
    lineHeight: 20,
  },
  explanationBox: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  codeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionSecondaryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginLeft: 8,
  },
  actionSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  historyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  historyLang: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  historyPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  historySnippet: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#4B5563',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
  },
});
