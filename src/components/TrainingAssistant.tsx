import React, {useCallback, useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {trainingApi, TrainingReply} from '../api/trainingApi';
import {ToolLogo} from './ToolLogo';
import {ActionButton, LearningIcon, palette} from './learning/LearningLayout';
import {speechRecognition} from '../services/speechRecognition';
import {MicrophoneIcon} from './MicrophoneIcon';

const prompts = [
  {label: 'College projects', message: 'Learn AI for college'},
  {label: 'Presentations', message: 'Create presentations'},
  {label: 'Automation', message: 'Automate my work'},
  {label: 'AI images', message: 'Create AI images'},
  {label: 'Resume help', message: 'Improve my resume'},
  {label: 'Research', message: 'Research a topic'},
];

type Turn = {question: string; reply: TrainingReply};

export const TrainingAssistant = ({
  onStartCourse,
}: {
  onStartCourse: (courseId: string) => void;
}) => {
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Voice Speech-to-Text states
  const [voiceState, setVoiceState] = useState<'idle' | 'starting' | 'listening'>('idle');
  const [voiceNotice, setVoiceNotice] = useState('');
  const voiceBaseRef = useRef('');
  const speechActiveRef = useRef(false);

  const conversation = useRef<string>();
  const request = useRef<AbortController | null>(null);
  const history = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(
      () => () => {
        if (request.current) {
          request.current.abort();
          setError('Your reply was paused. Tap Retry message to continue.');
        }
        request.current = null;
        setBusy(false);
        speechActiveRef.current = false; speechRecognition.cancel(); setVoiceState('idle');
      },
      [],
    ),
  );

  // Subscribe to speech recognition events
  useEffect(() => {
    const subscription = speechRecognition.subscribe(event => {
      if (!speechActiveRef.current) return;
      if (event.text) {
        const textToSet = [voiceBaseRef.current, event.text].filter(Boolean).join(' ');
        setDraft(textToSet.slice(0, 1000));
      }
      if (event.error) {
        setVoiceNotice(event.error);
      }
      if (event.final) {
        speechActiveRef.current = false;
        setVoiceState('idle');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const stopVoice = () => {
    speechRecognition.stop();
  };

  const toggleVoiceInput = async () => {
    if (voiceState !== 'idle') {
      stopVoice();
      return;
    }

    setVoiceNotice('');
    setVoiceState('starting');
    Keyboard.dismiss();
    voiceBaseRef.current = draft;
    speechActiveRef.current = true;

    try {
      await speechRecognition.start();
      if (speechActiveRef.current) setVoiceState('listening');
    } catch (cause) {
      speechActiveRef.current = false;
      setVoiceState('idle');
      setVoiceNotice(cause instanceof Error ? cause.message : 'Voice input is unavailable. Please type your goal.');
    }
  };

  const send = async (value = draft) => {
    const message = value.trim();
    if (request.current) return;
    if (!message) {
      setError('Tell me what you’d like to learn first.');
      return;
    }
    if (voiceState !== 'idle') {
      stopVoice();
    }
    Keyboard.dismiss();
    const controller = new AbortController();
    request.current = controller;
    setPending(message);
    setBusy(true);
    setError('');
    setDraft('');
    try {
      const reply = await trainingApi.chat(message, conversation.current, controller.signal);
      if (controller.signal.aborted) return;
      conversation.current = reply.conversationId;
      setTurns(previous => [...previous, {question: message, reply}].slice(-4));
      setPending('');
    } catch {
      if (!controller.signal.aborted)
        setError('We couldn’t reach your learning assistant. Try again when you’re connected.');
    } finally {
      if (!controller.signal.aborted) {
        request.current = null;
        setBusy(false);
      }
    }
  };

  const recommendation = turns[turns.length - 1]?.reply.recommendedCourse;

  return (
    <View style={styles.card}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>✦</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.eyebrow}>PERSONAL LEARNING GUIDE</Text>
          <Text style={styles.title}>Your AI Learning Assistant</Text>
          <Text style={styles.subtitle}>Find the right course for your next goal.</Text>
        </View>
      </View>

      {!turns.length && !pending && (
        <>
          <Text style={styles.message}>What would you like to learn or do today?</Text>
          <View style={styles.prompts}>
            {prompts.map((prompt, index) => (
              <Pressable key={prompt.message} accessibilityRole="button" accessibilityLabel={prompt.message}
                onPress={() => void send(prompt.message)} disabled={busy || voiceState !== 'idle'} style={styles.chip}>
                <Text style={styles.promptNumber}>{String(index + 1).padStart(2, '0')}</Text>
                <Text style={styles.chipText}>{prompt.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {(turns.length > 0 || Boolean(pending)) && (
        <ScrollView
          ref={history}
          style={styles.history}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => history.current?.scrollToEnd({animated: true})}
        >
          {turns.map((turn, index) => (
            <View key={`${index}-${turn.question}`} style={{gap: 10, marginBottom: 12}}>
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{turn.question}</Text>
              </View>
              <Text accessibilityLiveRegion="polite" style={styles.message}>
                {turn.reply.message}
              </Text>
            </View>
          ))}
          {!!pending && (
            <View style={styles.userBubble}>
              <Text style={styles.userText}>{pending}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {!!error && (
        <View accessibilityLiveRegion="polite" style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
          {!!pending && (
            <ActionButton
              title="Retry message"
              variant="outline"
              onPress={() => void send(pending)}
            />
          )}
        </View>
      )}

      {recommendation && !busy && !pending && (
        <View style={styles.recommendation}>
          <View style={styles.header}>
            <ToolLogo
              courseKey={recommendation.title}
              slug={recommendation.slug}
              logoUrl={recommendation.logoUrl}
              size={46}
            />
            <View style={{flex: 1}}>
              <Text style={styles.eyebrow}>SUGGESTED FOR YOU</Text>
              <Text style={styles.title}>{recommendation.title}</Text>
            </View>
          </View>
          <Text numberOfLines={3} style={styles.subtitle}>
            {recommendation.shortDescription || recommendation.description}
          </Text>
          <ActionButton title="Start Course" onPress={() => onStartCourse(recommendation._id)} />
        </View>
      )}

      {/* Voice Listening Mode Indicator Banner */}
      {voiceState !== 'idle' && (
        <View style={styles.voiceActiveBanner}>
          <View style={styles.voicePulsingDot} />
          <Text style={styles.voiceActiveText}>
            {voiceState === 'starting'
              ? 'Connecting microphone…'
              : 'Listening…'}
          </Text>
          <Pressable onPress={stopVoice} style={styles.voiceDoneBtn}>
            <Text style={styles.voiceDoneBtnText}>Done</Text>
          </Pressable>
        </View>
      )}

      {!!voiceNotice && (
        <Text style={styles.voiceNoticeText}>{voiceNotice}</Text>
      )}

      {/* Main Input Box Area with Voice Mic & Send Button */}
      <View style={styles.inputContainer}>
        <TextInput
          accessibilityLabel="Your learning goal"
          value={draft}
          onChangeText={setDraft}
          placeholder="What do you want to achieve?"
          placeholderTextColor="#94A3B8"
          multiline
          maxLength={1000}
          editable={!busy && voiceState === 'idle'}
          style={styles.input}
        />

        <View style={styles.actionButtonsRow}>
          {/* Microphone Voice Input Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voice input"
            onPress={toggleVoiceInput}
            disabled={busy || voiceState === 'starting'}
            style={[
              styles.micBtn,
              voiceState !== 'idle' && styles.micBtnActive,
            ]}
          >
            <MicrophoneIcon color={voiceState !== 'idle' ? '#6150C9' : '#726182'} />
          </Pressable>

          {/* Send Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            onPress={() => void send()}
            disabled={!draft.trim() || busy || voiceState !== 'idle'}
            style={[
              styles.sendBtn,
              (!draft.trim() || busy || voiceState !== 'idle') && styles.sendBtnDisabled,
            ]}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.sendBtnText}>Send</Text>
            )}
          </Pressable>
        </View>
      </View>

      {(turns.length > 0 || !!pending) && (
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => {
            conversation.current = undefined;
            setTurns([]);
            setPending('');
            setError('');
            setDraft('');
          }}
          style={styles.reset}
        >
          <Text style={styles.chipText}>＋ New conversation</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E1EE', borderRadius: 24, padding: 18, gap: 16, marginBottom: 24},
  header: {flexDirection: 'row', alignItems: 'center', gap: 12},
  avatar: {width: 40, height: 40, borderRadius: 13, backgroundColor: '#EEE8FB', alignItems: 'center', justifyContent: 'center'},
  avatarIcon: {fontSize: 25, color: '#7452C4'},
  title: {fontSize: 17, lineHeight: 23, fontWeight: '700', color: '#241C33', flexShrink: 1},
  eyebrow: {fontSize: 8, lineHeight: 13, letterSpacing: 1, fontWeight: '700', color: '#88759F', marginBottom: 3},
  subtitle: {fontSize: 12, lineHeight: 18, color: '#7A7185', marginTop: 4},
  message: {fontSize: 14, lineHeight: 21, color: '#41374E'},
  prompts: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {width: '48%', flexGrow: 1, minHeight: 62, borderRadius: 13, backgroundColor: '#F8F5FC', padding: 10, gap: 5},
  promptNumber: {fontSize: 9, fontWeight: '600', color: '#A394BB'},
  chipText: {fontSize: 12, lineHeight: 17, fontWeight: '600', color: '#615078'},
  history: {maxHeight: 240}, userBubble: {alignSelf: 'flex-end', maxWidth: '92%', backgroundColor: '#F0E9FC', borderRadius: 15, padding: 12},
  userText: {fontSize: 14, lineHeight: 21, color: '#57416D'},
  error: {gap: 10, backgroundColor: '#FFF5EE', padding: 12, borderRadius: 13}, errorText: {color: '#914F2A', fontSize: 13, lineHeight: 19},
  recommendation: {gap: 12, backgroundColor: '#FAF8FE', padding: 14, borderRadius: 16},
  voiceActiveBanner: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4EFFB', paddingHorizontal: 10, borderRadius: 12, gap: 8},
  voicePulsingDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#8060C4'}, voiceActiveText: {flex: 1, fontSize: 12, color: '#69527E'},
  voiceDoneBtn: {minHeight: 44, justifyContent: 'center', paddingHorizontal: 8}, voiceDoneBtnText: {color: '#6150C9', fontSize: 13, fontWeight: '600'},
  voiceNoticeText: {fontSize: 12, lineHeight: 18, color: '#96552D'},
  inputContainer: {borderWidth: 1, borderColor: '#DDD4EA', borderRadius: 18, padding: 8, gap: 4},
  input: {minHeight: 42, maxHeight: 100, fontSize: 14, lineHeight: 21, color: '#30283C', paddingHorizontal: 7, paddingTop: 8, paddingBottom: 8},
  actionButtonsRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  micBtn: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}, micBtnActive: {backgroundColor: '#F1EBFA', borderRadius: 12},
  sendBtn: {backgroundColor: '#6150C9', paddingHorizontal: 19, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  sendBtnDisabled: {backgroundColor: '#D4CBE2'}, sendBtnText: {color: '#FFFFFF', fontSize: 13, fontWeight: '600'},
  reset: {alignSelf: 'flex-start', minHeight: 40, justifyContent: 'center'},
});
