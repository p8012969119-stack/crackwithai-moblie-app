import React, {useState, useEffect, useRef, useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Image, Animated, AccessibilityInfo, AppState, Keyboard, Easing, LayoutAnimation} from 'react-native';
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
import {LearningIcon} from '../../components/learning/LearningLayout';

interface ChatMessage {id: string; sender: 'user' | 'ai'; text: string; model?: string}
interface Conversation {id: string; title: string; messages: ChatMessage[]; modelId: string; updatedAt: string}
type Props = {route?: {params?: {initialPrompt?: string}}; navigation: {navigate: (screen: string) => void}};
const readHistory = (raw: string | null): Conversation[] => {
  try {const data: unknown = JSON.parse(raw || '[]'); return Array.isArray(data) ? data.filter((c): c is Conversation => c && typeof c.id === 'string' && typeof c.title === 'string' && Array.isArray(c.messages) && c.messages.every((m: ChatMessage) => typeof m.id === 'string' && typeof m.text === 'string' && ['user', 'ai'].includes(m.sender))).slice(0, 20) : [];} catch {return [];}
};
const MODEL_IMAGES: Record<string, any> = {
  gemini: require('../../assets/images/models/gemini.png'),
  groq: require('../../assets/images/models/groq.png'),
  cerebras: require('../../assets/images/models/cerebras.png'),
  mistral: require('../../assets/images/models/mistral.png'),
  nvidia: require('../../assets/images/models/nvidia.png'),
  cohere: require('../../assets/images/models/cohere.png'),
  cwa_free: require('../../assets/brand/crackwithai-logo.png'),
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
  const [focused, setFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(46);
  const [voice, setVoice] = useState<'idle' | 'starting' | 'listening'>('idle');
  const [voiceError, setVoiceError] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenActive, setScreenActive] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const glow = useRef(new Animated.Value(0)).current;
  const focusValue = useRef(new Animated.Value(0)).current;
  const scroll = useRef<ScrollView>(null);
  const input = useRef<TextInput>(null);
  const request = useRef<AbortController | null>(null);
  const modelRequest = useRef<AbortController | null>(null);
  const historyRef = useRef<Conversation[]>([]);
  const historyReady = useRef(false);
  const activeId = useRef(`chat-${Date.now()}`);
  const saveQueue = useRef(Promise.resolve());
  const voiceBase = useRef('');
  const voiceGeneration = useRef(0);
  const speechActive = useRef(false);
  const mounted = useRef(true);
  const selected = models.find(model => model.id === selectedId);
  const expanded = focused || prompt.length > 0 || voice !== 'idle';
  const animate = screenActive && appActive && !reduceMotion;
  const showGlow = animate && picker === null && focused && prompt.trim().length > 0 && !busy && voice === 'idle';
  const animateLayout = () => {if (!reduceMotion) LayoutAnimation.configureNext({duration: 200, update: {type: LayoutAnimation.Types.easeInEaseOut}});};
  useEffect(() => {
    glow.setValue(0);
    if (!showGlow) return;
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(glow, {toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false}),
      Animated.timing(glow, {toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false}),
    ]));
    pulse.start();
    return () => {pulse.stop(); glow.setValue(0);};
  }, [glow, showGlow]);
  const storageKey = `@crackwithai_workshop_${user?._id || 'signed-out'}`;

  const loadModels = useCallback(async () => {
    modelRequest.current?.abort(); const controller = new AbortController(); modelRequest.current = controller;
    setModelsLoading(true); setModelsError('');
    try {const response = await aiApi.getModels(controller.signal); if (controller.signal.aborted) return;
      setModels(response.data); setSelectedId(previous => response.data.some(model => model.id === previous) ? previous : response.data[0]?.id || '');
      if (!response.data.length) setModelsError('No AI model is configured yet. Please try again later.');
    } catch {if (!controller.signal.aborted) {setModelsError('Couldn’t load available models. Tap to retry.'); setModels([]);}}
    finally {if (!controller.signal.aborted) setModelsLoading(false);}
  }, []);
  useEffect(() => {let live = true; historyReady.current = false; request.current?.abort(); request.current = null; setBusy(false); setMessages([]); setConversations([]); historyRef.current = []; activeId.current = `chat-${Date.now()}`;
    void storage.getItem(storageKey).then(raw => {if (live) {const records = readHistory(raw); historyRef.current = records; setConversations(records); historyReady.current = true;}});
    return () => {live = false;};
  }, [storageKey]);
  useEffect(() => {mounted.current = true; void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion); const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion); return () => {mounted.current = false; listener.remove();};}, []);
  useEffect(() => {const animation = Animated.timing(focusValue, {toValue: focused ? 1 : 0, duration: reduceMotion ? 0 : 180, useNativeDriver: false}); animation.start(); return () => animation.stop();}, [focused, focusValue, reduceMotion]);
  useEffect(() => {if (route?.params?.initialPrompt) setPrompt(route.params.initialPrompt);}, [route?.params?.initialPrompt]);
  const cancelVoice = useCallback(() => {voiceGeneration.current++; speechActive.current = false; speechRecognition.cancel(); setVoice('idle');}, []);
  useFocusEffect(useCallback(() => {setScreenActive(true); void loadModels(); return () => {
    setScreenActive(false);
    modelRequest.current?.abort(); if (request.current) {request.current.abort(); request.current = null; setBusy(false); setError('Reply paused. Tap Retry to try again.');}
    cancelVoice();
  };}, [loadModels, cancelVoice]));
  useEffect(() => {
    const subscription = speechRecognition.subscribe(event => {
      if (!mounted.current || !speechActive.current) return;
      if (event.text) setPrompt([voiceBase.current, event.text].filter(Boolean).join(' ').slice(0, 8000));
      if (event.error) setVoiceError(event.error);
      if (event.final) {speechActive.current = false; voiceGeneration.current++; setVoice('idle');}
    });
    const appState = AppState.addEventListener('change', state => {setAppActive(state === 'active'); if (state === 'background') cancelVoice();});
    return () => {subscription.remove(); appState.remove();};
  }, [cancelVoice]);
  const startVoice = async () => {
    if (voice !== 'idle' || speechActive.current) return;
    const generation = ++voiceGeneration.current;
    setVoiceError(''); setVoice('starting'); Keyboard.dismiss(); voiceBase.current = prompt; speechActive.current = true;
    try {await speechRecognition.start(); if (generation === voiceGeneration.current) setVoice('listening');}
    catch (cause) {if (generation === voiceGeneration.current) {speechActive.current = false; setVoice('idle'); setVoiceError(cause instanceof Error ? cause.message : 'Voice input is unavailable. Please type your message.');}}
  };
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
    if (!retry) {setPrompt(''); setInputHeight(46);}
    commitMessages(next, selected.id); const model = selected;
    try {const result = await aiApi.chat(text, previous.map(message => ({role: message.sender === 'user' ? 'user' : 'assistant', content: message.text})), model.apiModel, controller.signal);
      if (!controller.signal.aborted) commitMessages([...next, {id: `ai-${Date.now()}`, sender: 'ai', text: result.data.response, model: model.name}], model.id);
    } catch (cause) {if (!controller.signal.aborted) setError(cause instanceof ApiError ? cause.message : 'Couldn’t get a reply. Please try again.');}
    finally {if (!controller.signal.aborted) {request.current = null; setBusy(false);}}
  };
  const newChat = () => {if (busy) return; cancelVoice(); activeId.current = `chat-${Date.now()}`; setMessages([]); setPrompt(''); setError(''); setVoiceError(''); setPicker(null);};

  return <SafeAreaView style={s.screen} edges={['top']}>
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Chat history" onPress={() => setPicker('history')} disabled={busy} style={s.iconButton}><LearningIcon name="clock" size={21} color="#544A66" /></Pressable>
        <View style={{flex: 1}}><Text style={s.brand}>CRACKWITHAI</Text><Text style={s.headerTitle}>AI Workshop</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="New chat" disabled={busy} onPress={newChat} style={s.iconButton}><Text style={{fontSize: 27, color: '#6150C9'}}>＋</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => navigation.navigate('Profile')} style={s.profile}><Text style={s.profileText}>{(user?.fullName || user?.name || 'U').slice(0, 1).toUpperCase()}</Text></Pressable>
      </View>
      <ScrollView ref={scroll} style={{flex: 1}} contentContainerStyle={[s.content, !messages.length && s.emptyContent]} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" onContentSizeChange={() => messages.length && scroll.current?.scrollToEnd({animated: !reduceMotion})}>
        {!messages.length ? <View style={s.welcome}>
          <Image source={require('../../assets/brand/crackwithai-logo.png')} style={s.brandLogo} resizeMode="contain" />
          <Text style={s.welcomeTitle}>How can I help you today?</Text><Text style={[s.subtitle, {textAlign: 'center'}]}>A little clarity. A new idea. Your next step.</Text>
        </View> : messages.map(message => <View key={message.id} style={message.sender === 'user' ? s.userBubble : s.answer}>
          {message.sender === 'ai' && <View style={s.answerHeader}><Text style={s.modelCaption}>{message.model || 'CrackWithAI'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Copy response" onPress={() => copyToClipboard(message.text, 'AI response')} style={s.copy}><Text style={s.link}>Copy</Text></Pressable></View>}
          {message.sender === 'ai' ? <WorkshopMessage text={message.text} /> : <Text selectable style={s.userText}>{message.text}</Text>}
        </View>)}
        {busy && <WorkshopThinking animate={animate && picker === null} />}
        {!!error && <View style={s.error} accessibilityLiveRegion="polite"><Text style={s.errorText}>{error}</Text><Pressable accessibilityRole="button" onPress={() => void send(true)} style={s.retry}><Text style={s.link}>Retry</Text></Pressable></View>}
      </ScrollView>
      <View style={s.composerArea}>
        {!!modelsError && <Pressable accessibilityRole="button" onPress={loadModels}><Text style={s.errorText}>{modelsError}</Text></Pressable>}
        {!!voiceError && <View accessibilityLiveRegion="polite" style={s.voiceNotice}><Text style={[s.errorText, {flex: 1}]}>{voiceError}</Text><Pressable accessibilityRole="button" accessibilityLabel="Dismiss voice error" onPress={() => setVoiceError('')} style={s.iconButton}><LearningIcon name="close" size={16} /></Pressable></View>}
        <Animated.View testID="workshop-composer" style={[s.composer, !expanded && s.composerCompact, {borderColor: focusValue.interpolate({inputRange: [0, 1], outputRange: ['#E1DCEB', '#8973D9']}), shadowOpacity: focusValue.interpolate({inputRange: [0, 1], outputRange: [.03, .1]})}]}>
          {showGlow && <Animated.View pointerEvents="none" style={[s.glowRing, {opacity: glow.interpolate({inputRange: [0, 1], outputRange: [.18, .75]})}]} />}
          {voice !== 'idle' && <View style={s.listening} accessibilityLiveRegion="polite"><View style={s.dot} /><Text style={[s.link, {flex: 1}]}>{voice === 'starting' ? 'Preparing microphone…' : 'Listening…'}</Text><Pressable accessibilityRole="button" onPress={() => {cancelVoice(); setPrompt(voiceBase.current);}} style={s.smallControl}><Text style={s.subtitle}>Cancel</Text></Pressable><Pressable accessibilityRole="button" disabled={voice === 'starting'} onPress={() => speechRecognition.stop()} style={s.smallControl}><Text style={s.link}>Done</Text></Pressable></View>}
          <TextInput ref={input} accessibilityLabel="Message AI Workshop" value={prompt} onChangeText={text => {if (!!text.length !== !!prompt.length) animateLayout(); setPrompt(text);}} onFocus={() => {animateLayout(); setFocused(true);}} onBlur={() => {animateLayout(); setFocused(false);}} placeholder="Ask anything…" placeholderTextColor="#92899E" multiline maxLength={8000} editable={voice === 'idle'} onContentSizeChange={event => setInputHeight(Math.min(140, Math.max(46, event.nativeEvent.contentSize.height)))} style={[s.input, {height: expanded ? inputHeight : 44}, !expanded && s.inputCompact]} />
          <View style={[s.controls, !expanded && s.controlsCompact]}>
            <Pressable accessibilityRole="button" accessibilityLabel={selected ? `Select AI model, ${selected.name}` : 'Select AI model'} onPress={() => setPicker('model')} disabled={modelsLoading || !models.length} style={[s.modelChip, !expanded && s.modelChipCompact]}>
              {selected && expanded && (
                <Image
                  source={MODEL_IMAGES[selected.id.toLowerCase()] || MODEL_IMAGES[selected.provider?.toLowerCase()] || MODEL_IMAGES['cwa_free']}
                  style={s.chipModelIcon}
                  resizeMode="contain"
                />
              )}
              <Text numberOfLines={1} style={s.modelName}>{modelsLoading ? 'Loading models…' : selected?.name || 'No model'}</Text>
              <LearningIcon name="down" size={13} color="#75658E" />
            </Pressable>
            {expanded && <View style={{flex: 1}} />}
            <Pressable accessibilityRole="button" accessibilityLabel={voice === 'idle' ? 'Dictate message' : 'Stop voice input'} accessibilityState={{disabled: busy || voice === 'starting', selected: voice === 'listening'}} disabled={busy || voice === 'starting'} onPress={() => voice === 'listening' ? speechRecognition.stop() : void startVoice()} style={[s.micButton, voice === 'listening' && {backgroundColor: '#E8E0FF'}]}><View style={s.micCapsule} /><View style={s.micStand} /></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Send message" accessibilityState={{disabled: busy || !selected || !prompt.trim() || voice !== 'idle', busy}} disabled={busy || !selected || !prompt.trim() || voice !== 'idle'} onPress={() => void send()} style={[s.send, (!prompt.trim() || !selected || busy || voice !== 'idle') && s.sendDisabled]}>{busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.sendArrow}>↑</Text>}</Pressable>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
    <Modal visible={picker !== null} transparent animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={() => setPicker(null)}>
      <View style={s.overlay}><Pressable accessibilityRole="button" accessibilityLabel="Close picker" style={StyleSheet.absoluteFillObject} onPress={() => setPicker(null)} /><View style={[s.sheet, {paddingBottom: Math.max(insets.bottom, 20)}]}>
        <View style={s.sheetHandle} /><View style={s.answerHeader}><Text style={s.sheetTitle}>{picker === 'model' ? 'Choose an AI model' : 'Recent chats'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setPicker(null)} style={s.iconButton}><LearningIcon name="close" /></Pressable></View>
        <ScrollView keyboardShouldPersistTaps="handled">
          {picker === 'model' ? models.map(model => {
            const mImg = MODEL_IMAGES[model.id.toLowerCase()] || MODEL_IMAGES[model.provider?.toLowerCase()] || MODEL_IMAGES['cwa_free'];
            return (
              <Pressable key={model.id} accessibilityRole="button" accessibilityState={{selected: selectedId === model.id}} onPress={() => {setSelectedId(model.id); setPicker(null);}} style={s.sheetRow}>
                <View style={s.modelIconCircle}>
                  <Image source={mImg} style={s.modelIconImg} resizeMode="contain" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={s.rowTitle}>{model.name}</Text>
                  <Text style={s.subtitle}>{model.provider}</Text>
                </View>
                {selectedId === model.id && <LearningIcon name="check" color="#6150C9" />}
              </Pressable>
            );
          }) : <>
            <Pressable accessibilityRole="button" onPress={newChat} style={s.sheetRow}><Text style={s.link}>＋ New chat</Text></Pressable>
            {!conversations.length && <Text style={s.subtitle}>Your conversations will appear here.</Text>}
            {conversations.map(conversation => <Pressable key={conversation.id} accessibilityRole="button" onPress={() => {cancelVoice(); activeId.current = conversation.id; setMessages(conversation.messages); setPrompt(''); setError(''); if (models.some(m => m.id === conversation.modelId)) setSelectedId(conversation.modelId); setPicker(null);}} style={s.sheetRow}><Text numberOfLines={2} style={s.rowTitle}>{conversation.title}</Text></Pressable>)}
          </>}
        </ScrollView>
      </View></View>
    </Modal>
  </SafeAreaView>;
};
const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FCFBFE'}, header: {paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10}, brand: {fontSize: 9, letterSpacing: 1.5, color: '#8D7BA9', fontWeight: '700'}, headerTitle: {fontSize: 17, lineHeight: 25, fontWeight: '700', color: '#2F253E'}, iconButton: {minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center'}, profile: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEE8FA', alignItems: 'center', justifyContent: 'center'}, profileText: {color: '#6150C9', fontWeight: '700'},
  content: {padding: 20, gap: 22, paddingBottom: 26}, emptyContent: {flexGrow: 1, justifyContent: 'center'}, welcome: {gap: 15, paddingVertical: 24}, brandLogo: {width: 58, height: 58, alignSelf: 'center', marginBottom: 6}, welcomeTitle: {fontSize: 28, lineHeight: 35, fontWeight: '700', color: '#2C213D', textAlign: 'center'}, subtitle: {fontSize: 13, lineHeight: 20, color: '#7B7286'}, userBubble: {backgroundColor: '#EEE8FA', padding: 15, borderRadius: 20, borderBottomRightRadius: 6, maxWidth: '90%', alignSelf: 'flex-end'}, userText: {fontSize: 16, lineHeight: 24, color: '#3F3156'}, answer: {gap: 10}, answerHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, modelCaption: {fontSize: 12, fontWeight: '700', color: '#716080'}, copy: {minHeight: 36, paddingHorizontal: 8, justifyContent: 'center'}, link: {fontSize: 13, lineHeight: 20, color: '#6150C9', fontWeight: '600'}, error: {padding: 12, borderRadius: 12, backgroundColor: '#FFF5EC', gap: 6}, errorText: {fontSize: 13, lineHeight: 19, color: '#8B522C'}, retry: {minHeight: 40, justifyContent: 'center'},
  composerArea: {paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 8, backgroundColor: '#FCFBFE'}, composer: {borderWidth: 1.2, borderRadius: 24, backgroundColor: '#FFFFFF', padding: 9, shadowColor: '#5C378B', shadowOffset: {width: 0, height: 3}, shadowRadius: 12}, input: {fontSize: 16, lineHeight: 23, color: '#30263E', paddingHorizontal: 12, paddingTop: 11, paddingBottom: 10}, controls: {flexDirection: 'row', gap: 8, alignItems: 'center', paddingTop: 4}, modelChip: {flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 12, minHeight: 40, maxWidth: '58%', borderRadius: 13, backgroundColor: '#F5F1FB'}, modelName: {fontSize: 12, fontWeight: '600', color: '#635273', flexShrink: 1}, micButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#F6F3FA'}, micCapsule: {width: 9, height: 15, borderRadius: 5, borderWidth: 1.7, borderColor: '#736082', marginTop: -5}, micStand: {position: 'absolute', width: 17, height: 14, borderWidth: 1.5, borderTopWidth: 0, borderBottomLeftRadius: 9, borderBottomRightRadius: 9, borderColor: '#736082', top: 17}, send: {width: 44, height: 44, borderRadius: 15, backgroundColor: '#6150C9', alignItems: 'center', justifyContent: 'center'}, sendDisabled: {backgroundColor: '#C7BBDD'}, sendArrow: {fontSize: 27, lineHeight: 31, color: '#FFFFFF', fontWeight: '500'}, listening: {flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10}, dot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#9370C9'}, smallControl: {minHeight: 40, paddingHorizontal: 6, justifyContent: 'center'}, voiceNotice: {flexDirection: 'row', alignItems: 'center', gap: 4}, overlay: {flex: 1, backgroundColor: 'rgba(24,15,39,.28)', justifyContent: 'flex-end'}, sheet: {maxHeight: '70%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 10}, sheetHandle: {width: 34, height: 4, borderRadius: 2, backgroundColor: '#DDD6E6', alignSelf: 'center', marginBottom: 10}, sheetTitle: {fontSize: 20, fontWeight: '700', color: '#332341'}, sheetRow: {minHeight: 64, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0EBF5', flexDirection: 'row', gap: 12, alignItems: 'center'}, rowTitle: {fontSize: 16, lineHeight: 23, color: '#342840', fontWeight: '500', flexShrink: 1},
  composerCompact: {flexDirection: 'row', alignItems: 'center', padding: 6, borderRadius: 24},
  inputCompact: {flex: 1, minWidth: 0, paddingHorizontal: 10}, controlsCompact: {paddingTop: 0, gap: 5}, modelChipCompact: {paddingHorizontal: 8, maxWidth: 92, gap: 4, backgroundColor: '#F8F5FC'},
  glowRing: {position: 'absolute', top: -2, right: -2, bottom: -2, left: -2, borderRadius: 25, borderWidth: 2, borderColor: '#A881ED', shadowColor: '#A376E6', shadowOffset: {width: 0, height: 0}, shadowOpacity: .7, shadowRadius: 12},
  modelIconCircle: {width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', padding: 4},
  modelIconImg: {width: 26, height: 26},
  chipModelIcon: {width: 18, height: 18, borderRadius: 4},
});
