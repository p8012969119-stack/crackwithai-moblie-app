import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { aiApi } from '../../api/aiApi';
import { copyToClipboard } from '../../utils/clipboard';

interface GeneratedCodeResult {
  id: string;
  prompt: string;
  language: string;
  action: string;
  code: string;
  explanation?: string;
  timestamp: string;
}

const ACTION_MODES = [
  { id: 'generate', label: 'Generate Code' },
  { id: 'fix', label: 'Fix Bug' },
  { id: 'refactor', label: 'Refactor' },
  { id: 'explain', label: 'Explain Code' },
];

const LANGUAGE_OPTIONS = [
  'React Native',
  'TypeScript',
  'JavaScript',
  'Python',
  'HTML / CSS',
  'Java',
  'SQL',
];

const QUICK_PRESETS = [
  { label: 'React Component', lang: 'React Native', action: 'generate', prompt: 'Build a reusable modern card component with active state toggle and styling' },
  { label: 'REST API Route', lang: 'TypeScript', action: 'generate', prompt: 'Create an Express.js TypeScript REST API router endpoint with validation' },
  { label: 'Fix Memory Leak', lang: 'JavaScript', action: 'fix', prompt: 'Find and fix memory leak in useEffect timer:\nuseEffect(() => { setInterval(fetchData, 1000); }, []);' },
  { label: 'JWT Middleware', lang: 'TypeScript', action: 'explain', prompt: 'Explain line by line how a JWT authentication middleware works in Express.js' },
];

export const AICodeGeneratorScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [prompt, setPrompt] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('React Native');
  const [selectedAction, setSelectedAction] = useState('generate');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [results, setResults] = useState<GeneratedCodeResult[]>([]);

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

  useEffect(() => {
    if (results.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [results, generating]);

  const handleVoiceInput = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const voicePrompts = [
        'Build a responsive React Native user profile card with avatar and badges',
        'Create an Express REST API endpoint with JWT verification and error handling',
        'Find and fix state update memory leaks in this React Native component',
        'Write a Python utility function to process and validate user email records',
      ];
      const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
      setPrompt(randomPrompt);
    }, 1800);
  };

  const handleInsertSample = () => {
    setPrompt(
      `// Sample component to review or optimize\nconst Header = ({ title }) => {\n  return <View><Text>{title}</Text></View>;\n};`
    );
  };

  const handleGenerateCode = async (overridePrompt?: string) => {
    const activePrompt = (overridePrompt || prompt).trim();
    if (!activePrompt) {
      Alert.alert('Required Input', 'Please describe your coding task or paste code to fix/refactor.');
      return;
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setGenerating(true);

    try {
      const res = await aiApi.generateCode(activePrompt, {
        language: selectedLanguage,
        action: selectedAction,
        framework: selectedLanguage === 'React Native' ? 'React Native' : undefined,
      });

      const newItem: GeneratedCodeResult = {
        id: `code_${Date.now()}`,
        prompt: activePrompt,
        language: selectedLanguage,
        action: selectedAction,
        code: res.data?.code || '// Code generated successfully',
        explanation: res.data?.explanation,
        timestamp: nowStr,
      };

      setResults((prev) => [...prev, newItem]);
    } catch (err) {
      console.warn('[AICodeGeneratorScreen] Error generating code:', err);
    } finally {
      setGenerating(false);
    }
  };

  const getActionButtonText = () => {
    if (generating) return 'Generating Code...';
    switch (selectedAction) {
      case 'fix':
        return 'Fix Bug in Code';
      case 'refactor':
        return 'Refactor Code';
      case 'explain':
        return 'Explain Code Logic';
      default:
        return 'Generate Code';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleGoBack} activeOpacity={0.7}>
          <Text style={styles.headerBtnText} numberOfLines={1}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>AI Code Generator</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            setPrompt('');
            setResults([]);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.headerBtnText} numberOfLines={1}>Reset</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollArea}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* QUICK PRESETS ROW */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Quick Code Presets</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
              {QUICK_PRESETS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetPill}
                  onPress={() => {
                    setSelectedLanguage(p.lang);
                    setSelectedAction(p.action);
                    setPrompt(p.prompt);
                    handleGenerateCode(p.prompt);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.presetPillText} numberOfLines={1}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* INPUT FORM CARD */}
          <View style={styles.inputCard}>
            {/* ACTION MODE SELECTOR */}
            <Text style={styles.controlLabel}>Select Action Mode</Text>
            <View style={styles.actionModesRow}>
              {ACTION_MODES.map((mode) => {
                const isSelected = selectedAction === mode.id;
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.actionModeBtn, isSelected && styles.actionModeBtnActive]}
                    onPress={() => setSelectedAction(mode.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.actionModeBtnText, isSelected && styles.actionModeBtnTextActive]} numberOfLines={1}>
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* PROGRAMMING LANGUAGE SELECTOR */}
            <Text style={[styles.controlLabel, { marginTop: 12 }]}>Target Language</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlPillsRow}>
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = selectedLanguage === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.langPill, isSelected && styles.langPillActive]}
                    onPress={() => setSelectedLanguage(lang)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.langPillText, isSelected && styles.langPillTextActive]} numberOfLines={1}>
                      {lang}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* PROMPT / CODE INPUT AREA */}
            <View style={styles.promptHeaderRow}>
              <Text style={[styles.controlLabel, { marginTop: 12, marginBottom: 0 }]}>
                {selectedAction === 'fix' || selectedAction === 'refactor' ? 'Code Snippet to Analyze' : 'Code Requirements'}
              </Text>
              <View style={styles.promptHelperActions}>
                <TouchableOpacity style={styles.helperBtn} onPress={handleInsertSample} activeOpacity={0.7}>
                  <Text style={styles.helperBtnText} numberOfLines={1}>Insert Sample</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.helperBtn, isRecordingVoice && styles.helperBtnActive]}
                  onPress={handleVoiceInput}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.helperBtnText, isRecordingVoice && styles.helperBtnTextActive]} numberOfLines={1}>
                    {isRecordingVoice ? 'Listening...' : 'Voice Input'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextInput
              style={styles.codePromptInput}
              multiline
              numberOfLines={4}
              placeholder={
                selectedAction === 'fix'
                  ? 'Paste your buggy code snippet here to detect and resolve errors...'
                  : selectedAction === 'refactor'
                  ? 'Paste code here to optimize architecture, modularity, and readability...'
                  : 'Describe what you want to build in detail (e.g. auth modal, api controller, custom hook)...'
              }
              placeholderTextColor="#94A3B8"
              value={prompt}
              onChangeText={setPrompt}
            />

            {/* GENERATE ACTION BUTTON - TEXT ONLY, NO ICONS */}
            <TouchableOpacity
              style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
              onPress={() => handleGenerateCode()}
              disabled={generating}
              activeOpacity={0.85}
            >
              {generating ? (
                <View style={styles.btnLoadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.generateBtnText} numberOfLines={1}>Synthesizing Code Solution...</Text>
                </View>
              ) : (
                <Text style={styles.generateBtnText} numberOfLines={1}>{getActionButtonText()}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* GENERATED RESULTS */}
          {results.length > 0 && (
            <View style={styles.outputSection}>
              <Text style={styles.outputSectionTitle}>Generated Code Solutions</Text>
              {results.map((item) => (
                <View key={item.id} style={styles.codeCard}>
                  {/* CARD HEADER */}
                  <View style={styles.codeCardHeader}>
                    <View style={styles.badgeRow}>
                      <View style={styles.langBadge}>
                        <Text style={styles.langBadgeText} numberOfLines={1}>{item.language}</Text>
                      </View>
                      <View style={styles.actionBadge}>
                        <Text style={styles.actionBadgeText} numberOfLines={1}>{item.action.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.timestampText} numberOfLines={1}>{item.timestamp}</Text>
                  </View>

                  <Text style={styles.requestSummary} numberOfLines={2}>
                    Task: {item.prompt}
                  </Text>

                  {/* MONOSPACE CODE DISPLAY */}
                  <View style={styles.codeContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                      <Text style={styles.codeText}>{item.code}</Text>
                    </ScrollView>
                  </View>

                  {/* EXPLANATION BLOCK */}
                  {item.explanation ? (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationTitle} numberOfLines={1}>Logic Overview</Text>
                      <Text style={styles.explanationText}>{item.explanation}</Text>
                    </View>
                  ) : null}

                  {/* ACTION BUTTONS ROW - TEXT ONLY, NO ICONS */}
                  <View style={styles.codeActionsRow}>
                    <TouchableOpacity
                      style={styles.actionBtnOutline}
                      onPress={() => copyToClipboard(item.code, 'Code')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionBtnOutlineText} numberOfLines={1}>Copy Code</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnFilled}
                      onPress={() => {
                        copyToClipboard(item.code, 'Code');
                        Alert.alert('Code Copied', 'Code snippet copied to clipboard ready for your editor!');
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.actionBtnFilledText} numberOfLines={1}>Use in Workspace</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnSecondary}
                      onPress={() => setResults((prev) => prev.filter((r) => r.id !== item.id))}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionBtnSecondaryText} numberOfLines={1}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  /* PRESETS */
  sectionBlock: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetsRow: {
    gap: 8,
    paddingRight: 8,
  },
  presetPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  presetPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },

  /* INPUT CARD */
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  actionModesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionModeBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionModeBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  actionModeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  actionModeBtnTextActive: {
    color: '#4F46E5',
  },

  controlPillsRow: {
    gap: 8,
    paddingRight: 8,
  },
  langPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  langPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  langPillTextActive: {
    color: '#4F46E5',
  },

  promptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  promptHelperActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helperBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  helperBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  helperBtnTextActive: {
    color: '#EF4444',
  },

  codePromptInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#0F172A',
    minHeight: 88,
    textAlignVertical: 'top',
  },

  generateBtn: {
    backgroundColor: '#0F172A',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  generateBtnDisabled: {
    backgroundColor: '#64748B',
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  /* OUTPUT SECTION */
  outputSection: {
    gap: 14,
  },
  outputSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  codeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  langBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  actionBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  timestampText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  requestSummary: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  codeContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12.5,
    color: '#38BDF8',
    lineHeight: 18,
  },
  explanationBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },

  codeActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnOutline: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  actionBtnFilled: {
    flex: 1.2,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBtnFilledText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  actionBtnSecondary: {
    flex: 0.8,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
});
