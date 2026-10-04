import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Image,
  Animated,
  AccessibilityInfo,
  AppState,
  Keyboard,
  Easing,
  LayoutAnimation
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {aiApi, WorkspaceModel} from '../../api/aiApi';
import {ApiError} from '../../api/client';
import {useAuth} from '../../store/AuthContext';
import {storage} from '../../services/storage';
import {speechRecognition} from '../../services/speechRecognition';
import {copyToClipboard} from '../../utils/clipboard';
import {WorkshopThinking} from '../../components/WorkshopThinking';
import {WorkshopMessage} from '../../components/WorkshopMessage';
import {Icon} from '../../components/Icon';

interface ChatMessage {id: string; sender: 'user' | 'ai'; text: string; model?: string}
interface Conversation {id: string; title: string; messages: ChatMessage[]; modelId: string; updatedAt: string}
type Props = {route?: {params?: {initialPrompt?: string}}; navigation: {navigate: (screen: string) => void; goBack: () => void}};

const readHistory = (raw: string | null): Conversation[] => {
  try {
    const data: unknown = JSON.parse(raw || '[]');
    return Array.isArray(data) ? data.filter((c): c is Conversation => c && typeof c.id === 'string' && typeof c.title === 'string' && Array.isArray(c.messages) && c.messages.every((m: ChatMessage) => typeof m.id === 'string' && typeof m.text === 'string' && ['user', 'ai'].includes(m.sender))).slice(0, 20) : [];
  } catch {
    return [];
  }
};

const FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';
const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

const getModelBrand = (modelId: string = '', provider: string = '', name: string = '') => {
  const key = `${modelId} ${provider} ${name}`.toLowerCase();
  if (key.includes('gemini') || key.includes('google')) {
    return { badgeColor: '#4285F4', icon: require('../../assets/images/models/gemini.png') };
  }
  if (key.includes('claude') || key.includes('anthropic')) {
    return { badgeColor: '#D97706', icon: require('../../assets/tool-logos/claude.png') };
  }
  if (key.includes('groq')) {
    return { badgeColor: '#F59E0B', icon: require('../../assets/images/models/groq.png') };
  }
  if (key.includes('openai') || key.includes('gpt') || key.includes('chatgpt')) {
    return { badgeColor: '#10A37F', icon: require('../../assets/tool-logos/chatgpt.png') };
  }
  if (key.includes('deepseek')) {
    return { badgeColor: '#0284C7', icon: require('../../assets/tool-logos/copilot.png') };
  }
  if (key.includes('mistral')) {
    return { badgeColor: '#FF7000', icon: require('../../assets/images/models/mistral.png') };
  }
  if (key.includes('cerebras')) {
    return { badgeColor: '#EC4899', icon: require('../../assets/images/models/cerebras.png') };
  }
  if (key.includes('cohere')) {
    return { badgeColor: '#34D399', icon: require('../../assets/images/models/cohere.png') };
  }
  if (key.includes('nvidia')) {
    return { badgeColor: '#76B900', icon: require('../../assets/images/models/nvidia.png') };
  }
  return { badgeColor: '#000000', icon: require('../../assets/images/logo/crackwithai.png') };
};

export const AIScreen = ({route, navigation}: Props) => {
  const {user} = useAuth();
  const insets = useSafeAreaInsets();
  const [models, setModels] = useState<WorkspaceModel[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState('');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [picker, setPicker] = useState<'model' | 'history' | null>(null);
  const [voice, setVoice] = useState<'idle' | 'starting' | 'listening'>('idle');
  const [voiceError, setVoiceError] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenActive, setScreenActive] = useState(false);

  const scroll = useRef<ScrollView>(null);
  const input = useRef<TextInput>(null);
  const request = useRef<AbortController | null>(null);
  const modelRequest = useRef<AbortController | null>(null);
  const historyRef = useRef<Conversation[]>([]);
  const historyReady = useRef(false);
  const activeId = useRef(`chat-${Date.now()}`);
  const saveQueue = useRef(Promise.resolve());
  const mounted = useRef(true);

  const selected = models.find(model => model.id === selectedId);
  const storageKey = `@crackwithai_workshop_${user?._id || 'signed-out'}`;

  const loadModels = useCallback(async () => {
    modelRequest.current?.abort(); const controller = new AbortController(); modelRequest.current = controller;
    setModelsLoading(true); setModelsError('');
    try {
      const response = await aiApi.getModels(controller.signal);
      if (controller.signal.aborted) return;
      setModels(response.data);
      setSelectedId(previous => response.data.some(model => model.id === previous) ? previous : response.data[0]?.id || '');
      if (!response.data.length) setModelsError('No AI model is configured yet.');
    } catch {
      if (!controller.signal.aborted) {
        setModelsError('Couldn’t load available models.');
        setModels([]);
      }
    } finally {
      if (!controller.signal.aborted) setModelsLoading(false);
    }
  }, []);

  useEffect(() => {
    let live = true; historyReady.current = false; request.current?.abort(); request.current = null; setBusy(false); setMessages([]); setConversations([]); historyRef.current = []; activeId.current = `chat-${Date.now()}`;
    void storage.getItem(storageKey).then(raw => {if (live) {const records = readHistory(raw); historyRef.current = records; setConversations(records); historyReady.current = true;}});
    return () => {live = false;};
  }, [storageKey]);

  useEffect(() => {
    mounted.current = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {mounted.current = false; listener.remove();};
  }, []);

  useEffect(() => {if (route?.params?.initialPrompt) setPrompt(route.params.initialPrompt);}, [route?.params?.initialPrompt]);

  const cancelVoice = useCallback(() => {speechRecognition.cancel(); setVoice('idle');}, []);

  useFocusEffect(useCallback(() => {
    setScreenActive(true);
    void loadModels();
    return () => {
      setScreenActive(false);
      modelRequest.current?.abort();
      if (request.current) {request.current.abort(); request.current = null; setBusy(false); setError('Reply paused.');}
      cancelVoice();
    };
  }, [loadModels, cancelVoice]));

  const commitMessages = (next: ChatMessage[], modelId: string) => {
    setMessages(next);
    if (!next.length) return;
    const record = {id: activeId.current, title: next[0].text.slice(0, 70), messages: next.slice(-100), modelId, updatedAt: new Date().toISOString()};
    const records = [record, ...historyRef.current.filter(item => item.id !== record.id)].slice(0, 20);
    historyRef.current = records; setConversations(records);
    saveQueue.current = saveQueue.current.then(() => storage.setItem(storageKey, JSON.stringify(records))).catch(() => {});
  };

  const send = async (retry = false) => {
    if (request.current || !selected || voice !== 'idle' || !historyReady.current) return;
    const text = retry ? messages[messages.length - 1]?.text : prompt.trim();
    if (!text || (retry && messages[messages.length - 1]?.sender !== 'user')) return;
    const previous = retry ? messages.slice(0, -1) : messages;
    const next: ChatMessage[] = retry ? messages : [...messages, {id: `user-${Date.now()}`, sender: 'user', text}];
    const controller = new AbortController(); request.current = controller; setBusy(true); setError('');
    if (!retry) {setPrompt('');}
    commitMessages(next, selected.id); const model = selected;
    try {
      const result = await aiApi.chat(text, previous.map(message => ({role: message.sender === 'user' ? 'user' : 'assistant', content: message.text})), model.apiModel, controller.signal);
      if (!controller.signal.aborted) commitMessages([...next, {id: `ai-${Date.now()}`, sender: 'ai', text: result.data.response, model: model.name}], model.id);
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof ApiError ? cause.message : 'Couldn’t get a reply. Please try again.');
    } finally {
      if (!controller.signal.aborted) {request.current = null; setBusy(false);}
    }
  };

  const newChat = () => {
    if (busy) return;
    cancelVoice();
    activeId.current = `chat-${Date.now()}`;
    setMessages([]);
    setPrompt('');
    setError('');
    setVoiceError('');
    setPicker(null);
  };

  const selectedBrand = selected ? getModelBrand(selected.id, selected.provider, selected.name) : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* TOP HEADER */}
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="chevron-left" size={24} color="#0F172A" />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitleText}>AI Workspace</Text>
          </View>

          <Pressable accessibilityRole="button" onPress={() => setPicker('history')} disabled={busy} style={styles.historyBlackBtn}>
            <Text style={styles.historyBlackBtnText}>History</Text>
          </Pressable>
        </View>

        {/* CHAT MESSAGES SCROLLVIEW */}
        <ScrollView
          ref={scroll}
          style={{flex: 1}}
          contentContainerStyle={[styles.content, !messages.length && styles.emptyContent]}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => messages.length && scroll.current?.scrollToEnd({animated: !reduceMotion})}
        >
          {!messages.length ? (
            <View style={styles.welcome}>
              <View style={styles.welcomeIconBadge}>
                {selectedBrand ? (
                  <Image source={selectedBrand.icon} style={{ width: 44, height: 44 }} resizeMode="contain" />
                ) : (
                  <Icon name="sparkles" size={36} color="#5653FE" />
                )}
              </View>
              <Text style={styles.welcomeTitle}>How can I help you today?</Text>
              <Text style={styles.welcomeSubtitle}>
                Connected to {selected ? `${selected.name} (${selected.provider})` : 'AI Assistant'}. Ask any question!
              </Text>
            </View>
          ) : (
            messages.map(message => (
              <View key={message.id} style={message.sender === 'user' ? styles.userBubble : styles.aiBubble}>
                {message.sender === 'ai' && (
                  <View style={styles.answerHeader}>
                    <Text style={styles.modelCaption}>{message.model || 'AI Assistant'}</Text>
                    <Pressable onPress={() => copyToClipboard(message.text, 'AI response')} style={styles.copyBtn}>
                      <Text style={styles.copyBtnText}>Copy</Text>
                    </Pressable>
                  </View>
                )}
                {message.sender === 'ai' ? (
                  <WorkshopMessage text={message.text} />
                ) : (
                  <Text selectable style={styles.userText}>{message.text}</Text>
                )}
              </View>
            ))
          )}

          {busy && <WorkshopThinking animate={screenActive && !reduceMotion} />}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => void send(true)}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* BOTTOM INPUT COMPOSER AREA WITH MODEL SELECTOR ON LEFT */}
        <View style={styles.composerArea}>
          <View style={styles.inputCapsuleBar}>
            {/* MODEL SELECTOR BUTTON INSIDE INPUT BAR (LEFT SIDE) */}
            <Pressable
              accessibilityRole="button"
              onPress={() => setPicker('model')}
              disabled={busy}
              style={styles.inputModelBtn}
            >
              {selectedBrand && (
                <Image source={selectedBrand.icon} style={styles.inputModelIcon} resizeMode="contain" />
              )}
              <Text style={styles.inputModelText} numberOfLines={1}>
                {selected ? selected.name.split(' ')[0] : 'AI'}
              </Text>
              <Icon name="chevron-down" size={12} color="#64748B" />
            </Pressable>

            <View style={styles.inputDivider} />

            <TextInput
              ref={input}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Ask anything..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={8000}
              editable={voice === 'idle'}
              style={styles.textInput}
            />

            <Pressable
              accessibilityRole="button"
              disabled={busy || !prompt.trim()}
              onPress={() => void send()}
              style={[styles.sendBtn, (!prompt.trim() || busy) && styles.sendBtnDisabled]}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Icon name="arrow-right" size={18} color="#FFFFFF" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* SELECTION / HISTORY MODAL */}
      <Modal visible={picker !== null} transparent animationType="slide" onRequestClose={() => setPicker(null)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setPicker(null)} />
          <View style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, 20)}]}>
            <View style={styles.sheetHandle} />

            {picker === 'model' ? (
              <>
                <View style={styles.answerHeader}>
                  <Text style={styles.sheetTitle}>Select AI Model</Text>
                  <Pressable onPress={() => setPicker(null)} style={styles.backBtn}>
                    <Icon name="x" size={18} color="#0F172A" />
                  </Pressable>
                </View>
                <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 380 }}>
                  {models.map((modelItem) => {
                    const isSelected = modelItem.id === selectedId;
                    const brand = getModelBrand(modelItem.id, modelItem.provider, modelItem.name);
                    return (
                      <Pressable
                        key={modelItem.id}
                        onPress={() => {
                          setSelectedId(modelItem.id);
                          setPicker(null);
                        }}
                        style={[styles.modelSheetRow, isSelected && styles.activeModelSheetRow]}
                      >
                        <Image source={brand.icon} style={styles.sheetModelIcon} resizeMode="contain" />
                        <View style={styles.sheetModelTextCol}>
                          <Text style={[styles.sheetModelName, isSelected && { color: brand.badgeColor, fontWeight: '800' }]}>
                            {modelItem.name}
                          </Text>
                          <Text style={styles.sheetModelProvider}>{modelItem.provider}</Text>
                        </View>
                        {isSelected && (
                          <View style={[styles.activeCheckBadge, { backgroundColor: brand.badgeColor }]}>
                            <Icon name="check" size={12} color="#FFFFFF" />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            ) : (
              <>
                <View style={styles.answerHeader}>
                  <Text style={styles.sheetTitle}>Recent AI Conversations</Text>
                  <Pressable onPress={() => setPicker(null)} style={styles.backBtn}>
                    <Icon name="x" size={18} color="#0F172A" />
                  </Pressable>
                </View>
                <ScrollView keyboardShouldPersistTaps="handled">
                  <Pressable onPress={newChat} style={styles.sheetRow}>
                    <Text style={styles.newChatText}>＋ Start New Chat</Text>
                  </Pressable>
                  {!conversations.length && <Text style={styles.emptyHistoryText}>Your past chats will appear here.</Text>}
                  {conversations.map(conversation => (
                    <Pressable
                      key={conversation.id}
                      onPress={() => {
                        activeId.current = conversation.id;
                        setMessages(conversation.messages);
                        setPrompt('');
                        setPicker(null);
                      }}
                      style={styles.sheetRow}
                    >
                      <Text numberOfLines={2} style={styles.rowTitle}>{conversation.title}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerModelSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 8,
  },
  headerModelIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  headerModelNameText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    maxWidth: 150,
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
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modelBarWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modelBarScrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  modelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 8,
  },
  modelChipIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  modelChipTextCol: {
    justifyContent: 'center',
  },
  modelChipName: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  modelChipProvider: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
  },
  activeModelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
  },
  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 24,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  welcome: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  welcomeIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEEDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  welcomeTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  /* USER MESSAGE BUBBLE (MATCHING IMAGE 1) */
  userBubble: {
    backgroundColor: '#5653FE',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    maxWidth: '82%',
    alignSelf: 'flex-end',
    shadowColor: '#5653FE',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  userText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  /* AI MESSAGE BUBBLE (MATCHING IMAGE 1) */
  aiBubble: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: '88%',
    alignSelf: 'flex-start',
    gap: 8,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modelCaption: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '800',
    color: '#5653FE',
  },
  copyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    flex: 1,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  /* COMPOSER INPUT AREA (MATCHING IMAGE 1) */
  composerArea: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputCapsuleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 30,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 5,
    minHeight: 52,
  },
  inputModelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 6,
  },
  inputModelIcon: {
    width: 18,
    height: 18,
    borderRadius: 5,
  },
  inputModelText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    maxWidth: 90,
  },
  inputDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14.5,
    color: '#0F172A',
    paddingVertical: 6,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#5653FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  newChatText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 15,
    fontWeight: '800',
    color: '#5653FE',
  },
  emptyHistoryText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    color: '#94A3B8',
    paddingVertical: 20,
    textAlign: 'center',
  },
  rowTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14.5,
    color: '#0F172A',
  },
  modelSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  activeModelSheetRow: {
    borderColor: '#5653FE',
    backgroundColor: '#EEEDFF',
  },
  sheetModelIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  sheetModelTextCol: {
    flex: 1,
  },
  sheetModelName: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sheetModelProvider: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  activeCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
