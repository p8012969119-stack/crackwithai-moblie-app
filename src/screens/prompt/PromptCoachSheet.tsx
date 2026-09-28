import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Share,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { WorkshopThinking } from '../../components/WorkshopThinking';
import { WorkshopMessage } from '../../components/WorkshopMessage';
import { speechRecognition } from '../../services/speechRecognition';
import { PromptEvaluator } from './PromptEvaluator';

export interface CoachMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface PromptCoachSheetProps {
  visible: boolean;
  onClose: () => void;
  currentStageTitle: string;
  activePrompt?: string;
  onApplyPromptToInput?: (prompt: string) => void;
}

const QUICK_CHIPS = [
  'Explain this concept',
  'Give me an example',
  'Why is my prompt bad?',
  'How to improve this?',
  'Give me a challenge',
  'What is few-shot prompting?',
];

export const PromptCoachSheet: React.FC<PromptCoachSheetProps> = ({
  visible,
  onClose,
  currentStageTitle,
  activePrompt,
  onApplyPromptToInput,
}) => {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 Hi! I am your **AI Prompt Coach**.\n\nI'm here to help you master communicating with AI. We are currently on **${currentStageTitle}**.\n\nYou can ask me to explain concepts, audit your prompts, suggest improvements, or give you personalized practice challenges!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, visible]);

  // Voice speech listener
  useEffect(() => {
    const sub = speechRecognition.subscribe((event) => {
      if (event.text) {
        setInputText((prev) => (prev ? `${prev} ${event.text}` : event.text || ''));
      }
      if (event.final) {
        setIsListening(false);
      }
      if (event.error) {
        setIsListening(false);
      }
    });
    return () => {
      sub.remove();
    };
  }, []);

  const handleToggleVoice = async () => {
    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      await speechRecognition.start();
    } catch {
      setIsListening(false);
      Alert.alert('Microphone', 'Voice recognition is unavailable on this device. Please type your message.');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    Keyboard.dismiss();
    setInputText('');

    const userMsg: CoachMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const reply = await PromptEvaluator.askCoachAdvice(
        query,
        currentStageTitle,
        activePrompt
      );

      const aiMsg: CoachMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: CoachMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "I couldn't reach the AI service at the moment, but remember: always give the AI a clear role, strict format, and context!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.sheetContainer} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.coachAvatarBox}>
              <Icon name="sparkles" size={20} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.coachTitle}>AI Prompt Coach</Text>
              <Text style={styles.stageIndicator} numberOfLines={1}>
                {currentStageTitle}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="x-circle" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Suggestion Chips */}
        <View style={styles.chipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {QUICK_CHIPS.map((chip, index) => (
              <TouchableOpacity
                key={`chip-${index}`}
                style={styles.chipPill}
                activeOpacity={0.7}
                onPress={() => handleSendMessage(chip)}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  isAi ? styles.wrapperAi : styles.wrapperUser,
                ]}
              >
                {isAi && (
                  <View style={styles.miniAvatar}>
                    <Icon name="bot" size={14} color="#7C3AED" />
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isAi ? styles.bubbleAi : styles.bubbleUser,
                  ]}
                >
                  {isAi ? (
                    <WorkshopMessage text={msg.text} />
                  ) : (
                    <Text style={styles.userText}>{msg.text}</Text>
                  )}
                  <Text
                    style={[
                      styles.timestampText,
                      isAi ? styles.timeAi : styles.timeUser,
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View style={styles.typingBox}>
              <WorkshopThinking animate={true} />
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[styles.micBtn, isListening && styles.micBtnActive]}
              onPress={handleToggleVoice}
              accessibilityLabel="Microphone input"
            >
              <Icon
                name="mic"
                size={18}
                color={isListening ? '#FFFFFF' : '#7C3AED'}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.inputField}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask your Prompt Coach anything..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={800}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!inputText.trim() || isTyping) && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="arrow-up" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  coachAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  stageIndicator: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  chipsContainer: {
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  messagesScroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  messagesContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 24,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  wrapperAi: {
    justifyContent: 'flex-start',
  },
  wrapperUser: {
    justifyContent: 'flex-end',
  },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleAi: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  timeAi: {
    color: '#94A3B8',
  },
  timeUser: {
    color: '#DDD6FE',
  },
  typingBox: {
    paddingLeft: 34,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnActive: {
    backgroundColor: '#EF4444',
  },
  inputField: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
