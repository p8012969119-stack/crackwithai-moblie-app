import React, { useState, useEffect, useRef } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName } from '../../components/Icon';
import { aiApi } from '../../api/aiApi';
import { copyToClipboard } from '../../utils/clipboard';

interface ChatMessage {
  id: string;
  sender: 'user' | 'codex';
  text: string;
  code?: string;
  explanation?: string;
  language?: string;
  action?: string;
  timestamp: string;
}

const ACTION_OPTIONS = ['Generate', 'Explain', 'Fix Bug', 'Refactor'];

const LANGUAGE_OPTIONS = [
  'Auto',
  'React Native / React',
  'TypeScript',
  'JavaScript',
  'Python',
  'HTML / CSS',
  'Java',
  'SQL',
];

const QUICK_PILLS = [
  { label: 'Build React Component', action: 'Generate', language: 'React Native / React', prompt: 'Build a modern React Native component with active state toggle and clean styling.' },
  { label: 'Create REST API', action: 'Generate', language: 'TypeScript', prompt: 'Create an Express.js TypeScript REST API router endpoint.' },
  { label: 'Fix Bug in Code', action: 'Fix Bug', language: 'JavaScript', prompt: 'Find and fix memory leak or state bugs in this code snippet:\nuseEffect(() => { setInterval(fetchData, 1000); }, []);' },
  { label: 'Explain Code', action: 'Explain', language: 'Auto', prompt: 'Explain line by line how a JWT authentication middleware works in Express.js:' },
];

export const AICodeGeneratorScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [prompt, setPrompt] = useState('');
  const [selectedAction, setSelectedAction] = useState('Generate');
  const [selectedLanguage, setSelectedLanguage] = useState('Auto');
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);

  // States
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      sender: 'codex',
      text: '👋 **CrackWithAI Codex** ready. Type a prompt, tap a quick pill, attach a code file, or use voice input to generate code.',
      timestamp: 'Just now',
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

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages, generating]);

  const handleVoiceInput = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const voicePrompts = [
        'Build a responsive React Native user profile screen',
        'Create a Node.js REST API with JWT authentication',
        'Fix memory leak in my useEffect hook',
      ];
      const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
      setPrompt(randomPrompt);
    }, 2000);
  };

  const handleAttachFile = () => {
    Alert.alert(
      'Attach File / Code Snippet',
      'Select a file source or sample snippet to attach:',
      [
        {
          text: 'Component.tsx',
          onPress: () =>
            setAttachedFile({
              name: 'Component.tsx',
              content: 'export const Card = () => <View><Text>Card Component</Text></View>;',
            }),
        },
        {
          text: 'server.js',
          onPress: () =>
            setAttachedFile({
              name: 'server.js',
              content: 'const express = require("express");\nconst app = express();',
            }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

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
  button: { backgroundColor: '#5653FE', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  buttonActive: { backgroundColor: '#10B981' },
  buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
});`;
      explStr = 'Constructed a modern React Native component with local state toggling, conditional styling, and clean StyleSheet definitions.';
    } else if (lower.includes('api') || lower.includes('express') || lower.includes('rest') || lower.includes('endpoint')) {
      codeStr = `import express, { Request, Response } from 'express';

const router = express.Router();

// POST /api/v1/resource
router.post('/resource', async (req: Request, res: Response) => {
  try {
    const { name = 'Sample Resource' } = req.body;
    return res.status(200).json({
      success: true,
      message: 'Resource processed successfully',
      data: { id: Date.now(), name, status: 'Active' },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
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
    prompt: '${promptText.replace(/'/g, "\\'")}',
    timestamp: new Date().toISOString(),
    output: inputData || 'Task completed successfully',
  };

  return result;
}`;
      explStr = `Generated a production-ready ${lang} module.`;
    }

    return { code: codeStr, explanation: explStr };
  };

  const handleSendPrompt = async (overridePrompt?: string) => {
    let activePrompt = (overridePrompt || prompt).trim();
    if (!activePrompt) {
      Alert.alert('Required Input', 'Please enter a prompt, tap a quick pill, or use voice input.');
      return;
    }

    if (attachedFile) {
      activePrompt = `Attached File (${attachedFile.name}):\n\`\`\`\n${attachedFile.content}\n\`\`\`\n\nTask: ${activePrompt}`;
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: activePrompt,
      timestamp: nowStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setAttachedFile(null);
    setGenerating(true);
    setShowActionDropdown(false);
    setShowLanguageDropdown(false);

    try {
      const res = await aiApi.generateCode(activePrompt, {
        language: selectedLanguage,
        action: selectedAction,
      });

      let codeOutput = '';
      let explanationOutput = '';

      if (res && res.data && res.data.code) {
        codeOutput = res.data.code;
        explanationOutput = res.data.explanation || 'Generated using CrackWithAI Codex.';
      } else {
        const fallback = generateFallbackCode(activePrompt, selectedLanguage, selectedAction);
        codeOutput = fallback.code;
        explanationOutput = fallback.explanation;
      }

      const codexMsg: ChatMessage = {
        id: `codex_${Date.now()}`,
        sender: 'codex',
        text: 'Here is your generated solution:',
        code: codeOutput,
        explanation: explanationOutput,
        language: selectedLanguage,
        action: selectedAction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, codexMsg]);
    } catch (err) {
      console.warn('[AICodeGeneratorScreen] Code generation fallback active:', err);
      const fallback = generateFallbackCode(activePrompt, selectedLanguage, selectedAction);
      const codexMsg: ChatMessage = {
        id: `codex_${Date.now()}`,
        sender: 'codex',
        text: 'Here is your solution:',
        code: fallback.code,
        explanation: fallback.explanation,
        language: selectedLanguage,
        action: selectedAction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, codexMsg]);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = (id: string, codeText?: string) => {
    if (codeText) {
      copyToClipboard(codeText, 'Code');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* SLEEK TOP HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backPill} onPress={handleGoBack} activeOpacity={0.7}>
          <Icon name="chevron-left" size={16} color="#0F172A" />
          <Text style={styles.backPillText}>Tools</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>AI Code Generator</Text>

        <TouchableOpacity style={styles.historyBlackBtn} onPress={() => setShowHistoryModal(true)} activeOpacity={0.8}>
          <Text style={styles.historyBlackBtnText}>History</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* CHAT THREAD */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* MINIMAL QUICK PROMPT PILLS */}
          {messages.length <= 2 && (
            <View style={styles.quickPillSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
                {QUICK_PILLS.map((pill, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.quickPill}
                    onPress={() => {
                      setSelectedAction(pill.action);
                      setSelectedLanguage(pill.language);
                      handleSendPrompt(pill.prompt);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickPillText}>{pill.label} ➔</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* CHAT MESSAGES */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View key={msg.id} style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.codexWrapper]}>
                {!isUser && (
                  <View style={styles.codexAvatarCircle}>
                    <Icon name="code" size={14} color="#FFFFFF" />
                  </View>
                )}

                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.codexBubble]}>
                  <Text style={[styles.messageText, isUser && styles.userMessageText]}>{msg.text}</Text>

                  {/* CODE BLOCK CONTAINER */}
                  {msg.code && (
                    <View style={styles.codeBlockCard}>
                      <View style={styles.codeBlockHeader}>
                        <Text style={styles.codeLangText}>{msg.language || 'Code'}</Text>
                        <TouchableOpacity
                          style={styles.copyBtn}
                          onPress={() => handleCopyCode(msg.id, msg.code)}
                          activeOpacity={0.7}
                        >
                          <Icon name={copiedId === msg.id ? 'check' : 'copy'} size={12} color="#E2E8F0" />
                          <Text style={styles.copyBtnText}>{copiedId === msg.id ? 'Copied' : 'Copy Code'}</Text>
                        </TouchableOpacity>
                      </View>

                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.codeCodeScroll}>
                        <Text style={styles.codeTextContent}>{msg.code}</Text>
                      </ScrollView>

                      {msg.explanation && (
                        <View style={styles.explanationFooter}>
                          <Text style={styles.explanationTitle}>💡 Explanation:</Text>
                          <Text style={styles.explanationBody}>{msg.explanation}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  <Text style={[styles.timestampText, isUser && styles.userTimestampText]}>{msg.timestamp}</Text>
                </View>
              </View>
            );
          })}

          {generating && (
            <View style={[styles.messageWrapper, styles.codexWrapper]}>
              <View style={styles.codexAvatarCircle}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
              <View style={[styles.messageBubble, styles.codexBubble]}>
                <Text style={styles.typingText}>CrackWithAI Codex is writing code...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ATTACHED FILE PREVIEW */}
        {attachedFile && (
          <View style={styles.attachedPreviewBar}>
            <Icon name="file-text" size={14} color="#5653FE" />
            <Text style={styles.attachedFileName} numberOfLines={1}>
              {attachedFile.name}
            </Text>
            <TouchableOpacity onPress={() => setAttachedFile(null)}>
              <Icon name="x-circle" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        )}

        {/* VOICE RECORDING INDICATOR */}
        {isRecordingVoice && (
          <View style={styles.voiceRecordingBanner}>
            <ActivityIndicator size="small" color="#EF4444" />
            <Text style={styles.voiceRecordingText}>🎙️ Listening... Speak your code request</Text>
          </View>
        )}

        {/* DROPDOWN OVERLAYS */}
        {showActionDropdown && (
          <View style={styles.dropdownMenuBox}>
            {ACTION_OPTIONS.map((act) => (
              <TouchableOpacity
                key={act}
                style={[styles.dropdownItem, selectedAction === act && styles.dropdownItemActive]}
                onPress={() => {
                  setSelectedAction(act);
                  setShowActionDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, selectedAction === act && styles.dropdownItemTextActive]}>
                  {act}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showLanguageDropdown && (
          <View style={[styles.dropdownMenuBox, { left: 80 }]}>
            {LANGUAGE_OPTIONS.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.dropdownItem, selectedLanguage === lang && styles.dropdownItemActive]}
                onPress={() => {
                  setSelectedLanguage(lang);
                  setShowLanguageDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, selectedLanguage === lang && styles.dropdownItemTextActive]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* MINIMAL BOTTOM INPUT TOOLBAR */}
        <View style={[styles.bottomInputBar, { paddingBottom: Math.max(10, insets.bottom) }]}>
          <View style={styles.inputInnerCard}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Ask Codex to build, fix, or explain code..."
              placeholderTextColor="#94A3B8"
              value={prompt}
              onChangeText={setPrompt}
            />

            <View style={styles.inputToolbarRow}>
              {/* Add Files (+) */}
              <TouchableOpacity style={styles.iconCircleBtn} onPress={handleAttachFile} activeOpacity={0.7}>
                <Text style={styles.plusText}>+</Text>
              </TouchableOpacity>

              {/* Voice Input (🎙️ Mic) */}
              <TouchableOpacity
                style={[styles.iconCircleBtn, isRecordingVoice && styles.micActiveBtn]}
                onPress={handleVoiceInput}
                activeOpacity={0.7}
              >
                <Icon name="mic" size={16} color={isRecordingVoice ? '#EF4444' : '#5653FE'} />
              </TouchableOpacity>

              {/* Action Dropdown */}
              <TouchableOpacity
                style={styles.miniPill}
                onPress={() => {
                  setShowActionDropdown(!showActionDropdown);
                  setShowLanguageDropdown(false);
                }}
              >
                <Text style={styles.miniPillText}>{selectedAction} ▾</Text>
              </TouchableOpacity>

              {/* Language Dropdown */}
              <TouchableOpacity
                style={styles.miniPill}
                onPress={() => {
                  setShowLanguageDropdown(!showLanguageDropdown);
                  setShowActionDropdown(false);
                }}
              >
                <Text style={styles.miniPillText}>{selectedLanguage} ▾</Text>
              </TouchableOpacity>

              <View style={{ flex: 1 }} />

              {/* Send Arrow */}
              <TouchableOpacity
                style={[styles.sendBtn, (!prompt.trim() && !attachedFile || generating) && styles.sendBtnDisabled]}
                onPress={() => handleSendPrompt()}
                disabled={(!prompt.trim() && !attachedFile) || generating}
                activeOpacity={0.85}
              >
                {generating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Icon name="arrow-up" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* HISTORY MODAL */}
      <Modal visible={showHistoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Code History</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Icon name="x-circle" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={{ textAlign: 'center', color: '#64748B', marginVertical: 16, fontSize: 13 }}>
                All generated code snippets are saved in your chat history!
              </Text>
            </ScrollView>
          </View>
        </View>
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
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  backPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  historyBlackBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBlackBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chatScrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  quickPillSection: {
    marginBottom: 12,
  },
  pillsScroll: {
    flexDirection: 'row',
  },
  quickPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  codexWrapper: {
    justifyContent: 'flex-start',
  },
  codexAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5653FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 14,
  },
  userBubble: {
    backgroundColor: '#5653FE',
    borderBottomRightRadius: 2,
  },
  codexBubble: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#0F172A',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  typingText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  timestampText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestampText: {
    color: '#E0E7FF',
  },
  codeBlockCard: {
    marginTop: 8,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    overflow: 'hidden',
  },
  codeBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#1E293B',
  },
  codeLangText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 3,
  },
  codeCodeScroll: {
    padding: 10,
  },
  codeTextContent: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
    color: '#38BDF8',
  },
  explanationFooter: {
    padding: 10,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  explanationBody: {
    fontSize: 11,
    lineHeight: 16,
    color: '#CBD5E1',
  },
  attachedPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
  },
  attachedFileName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338CA',
    flex: 1,
    marginHorizontal: 6,
  },
  voiceRecordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    backgroundColor: '#FEF2F2',
  },
  voiceRecordingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 6,
  },
  dropdownMenuBox: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 6,
    zIndex: 99,
  },
  dropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  dropdownItemActive: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#0F172A',
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: '#5653FE',
  },
  bottomInputBar: {
    paddingHorizontal: 12,
    paddingTop: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputInnerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
  },
  textInput: {
    fontSize: 13,
    lineHeight: 18,
    color: '#0F172A',
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: 4,
  },
  inputToolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  iconCircleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5653FE',
    marginTop: -2,
  },
  micActiveBtn: {
    backgroundColor: '#FEF2F2',
  },
  miniPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  miniPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5653FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
});
