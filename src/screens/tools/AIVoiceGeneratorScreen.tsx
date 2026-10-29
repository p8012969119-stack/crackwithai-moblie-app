import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  BackHandler,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import Tts from 'react-native-tts';
import { aiApi } from '../../api/aiApi';
import { copyToClipboard } from '../../utils/clipboard';

export interface VoiceOption {
  id: string;
  name: string;
  label: string;
  gender: 'female' | 'male';
  pitch: number;
  rate: number;
}

const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'kore', name: 'Kore', label: 'Female · Bright & Crisp', gender: 'female', pitch: 1.35, rate: 0.52 },
  { id: 'adam', name: 'Adam', label: 'Male · Professional Tech', gender: 'male', pitch: 0.75, rate: 0.46 },
  { id: 'rachel', name: 'Rachel', label: 'Female · Warm Narrative', gender: 'female', pitch: 1.15, rate: 0.50 },
  { id: 'fenrir', name: 'Fenrir', label: 'Male · Deep & Expressive', gender: 'male', pitch: 1.25, rate: 0.58 },
];

const SPEED_OPTIONS = [
  { id: '0.8', label: '0.8x Calm', rate: 0.40 },
  { id: '1.0', label: '1.0x Normal', rate: 0.50 },
  { id: '1.2', label: '1.2x Dynamic', rate: 0.60 },
];

const SCRIPT_PRESETS = [
  { label: 'Welcome Script', text: 'Welcome to CrackWithAI. Build high-performance mobile applications and master modern AI technology.' },
  { label: 'Tech Intro', text: 'Full Stack Development combines responsive interfaces, scalable backend APIs, and modern database architecture.' },
  { label: 'AI Overview', text: 'Autonomous agent pipelines allow developers to trigger actions, process documents, and automate complex workflows.' },
];

interface GeneratedOutput {
  id: string;
  voice: string;
  speed: string;
  script: string;
  timestamp: string;
}

export const AIVoiceGeneratorScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICE_OPTIONS[0]);
  const [selectedSpeed, setSelectedSpeed] = useState('1.0');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const [outputs, setOutputs] = useState<GeneratedOutput[]>([]);
  const [history, setHistory] = useState<GeneratedOutput[]>([]);

  const handleGoBack = () => {
    try {
      Tts.stop();
    } catch (e) {}
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
    try {
      Tts.getInitStatus()
        .then(() => {
          try {
            Tts.setIgnoreSilentSwitch('ignore');
            Tts.setDefaultLanguage('en-US');
            Tts.setDefaultRate(0.5);
          } catch (e) {}
        })
        .catch(() => {});

      const onFinish = () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      };
      const onCancel = () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      };

      const subFinish: any = Tts.addEventListener('tts-finish', onFinish);
      const subCancel: any = Tts.addEventListener('tts-cancel', onCancel);

      return () => {
        try {
          if (subFinish && typeof subFinish.remove === 'function') subFinish.remove();
          if (subCancel && typeof subCancel.remove === 'function') subCancel.remove();
        } catch (e) {}
      };
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (outputs.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [outputs, generating]);

  const handleVoiceInput = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const voiceSamples = [
        'Welcome to CrackWithAI. Learn Full Stack Development and AI Automation with expert interactive lessons.',
        'Artificial intelligence enables smarter modern mobile workflows and seamless user experiences.',
        'Transform your code into scalable production-grade applications with CrackWithAI.',
      ];
      const picked = voiceSamples[Math.floor(Math.random() * voiceSamples.length)];
      setScript((prev) => (prev.trim() ? `${prev.trim()} ${picked}` : picked));
    }, 1800);
  };

  const playSpeech = (textToSpeak: string, itemId: string, voiceOpt: VoiceOption) => {
    try {
      Tts.stop();
      setIsPlaying(true);
      setCurrentPlayingId(itemId);

      const speedObj = SPEED_OPTIONS.find((s) => s.id === selectedSpeed);
      const speedRate = speedObj?.rate || voiceOpt.rate;

      Tts.setDefaultPitch(voiceOpt.pitch);
      Tts.setDefaultRate(speedRate);
      Tts.speak(textToSpeak);
    } catch (e) {
      console.warn('TTS playback error', e);
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  };

  const stopSpeech = () => {
    try {
      Tts.stop();
    } catch (e) {}
    setIsPlaying(false);
    setCurrentPlayingId(null);
  };

  const handleGenerateVoice = async () => {
    if (!script.trim()) {
      Alert.alert('Required Script', 'Please enter or speak the script text for your voiceover narration.');
      return;
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setGenerating(true);

    try {
      const speedVal = parseFloat(selectedSpeed) || 1.0;
      await aiApi.generateVoice({
        script: script.trim(),
        voice: selectedVoice.name,
        speed: speedVal,
      });

      const newOutput: GeneratedOutput = {
        id: `voice_${Date.now()}`,
        voice: selectedVoice.name,
        speed: `${selectedSpeed}x`,
        script: script.trim(),
        timestamp: nowStr,
      };

      setOutputs((prev) => [...prev, newOutput]);
      setHistory((prev) => [newOutput, ...prev]);

      // Auto start playback
      playSpeech(script.trim(), newOutput.id, selectedVoice);
    } catch (err) {
      console.warn('[AIVoiceGeneratorScreen] Error generating speech:', err);
      const newOutput: GeneratedOutput = {
        id: `voice_${Date.now()}`,
        voice: selectedVoice.name,
        speed: `${selectedSpeed}x`,
        script: script.trim(),
        timestamp: nowStr,
      };
      setOutputs((prev) => [...prev, newOutput]);
      setHistory((prev) => [newOutput, ...prev]);
      playSpeech(script.trim(), newOutput.id, selectedVoice);
    } finally {
      setGenerating(false);
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

        <Text style={styles.headerTitle} numberOfLines={1}>AI Voice Generator</Text>

        <TouchableOpacity style={styles.headerBtnDark} onPress={() => setShowHistoryModal(true)} activeOpacity={0.8}>
          <Text style={styles.headerBtnDarkText} numberOfLines={1}>History</Text>
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
          {/* QUICK SCRIPT PRESETS */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Quick Script Presets</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
              {SCRIPT_PRESETS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetPill}
                  onPress={() => setScript(p.text)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.presetPillText} numberOfLines={1}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* INPUT FORM CARD */}
          <View style={styles.inputCard}>
            {/* VOICE MODEL SELECTION */}
            <Text style={styles.controlLabel}>Select Voice Model</Text>
            <View style={styles.voiceOptionsGrid}>
              {VOICE_OPTIONS.map((voice) => {
                const isSelected = selectedVoice.id === voice.id;
                return (
                  <TouchableOpacity
                    key={voice.id}
                    style={[styles.voiceCard, isSelected && styles.voiceCardActive]}
                    onPress={() => setSelectedVoice(voice)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.voiceCardHeader}>
                      <Text style={[styles.voiceName, isSelected && styles.voiceNameActive]} numberOfLines={1}>
                        {voice.name}
                      </Text>
                      <View style={[styles.genderBadge, isSelected && styles.genderBadgeActive]}>
                        <Text style={[styles.genderBadgeText, isSelected && styles.genderBadgeTextActive]} numberOfLines={1}>
                          {voice.gender.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.voiceDesc} numberOfLines={1}>{voice.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* SPEED CONTROLS */}
            <Text style={[styles.controlLabel, { marginTop: 12 }]}>Speaking Pace</Text>
            <View style={styles.speedRow}>
              {SPEED_OPTIONS.map((speed) => {
                const isSelected = selectedSpeed === speed.id;
                return (
                  <TouchableOpacity
                    key={speed.id}
                    style={[styles.speedPill, isSelected && styles.speedPillActive]}
                    onPress={() => setSelectedSpeed(speed.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.speedPillText, isSelected && styles.speedPillTextActive]} numberOfLines={1}>
                      {speed.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* SCRIPT INPUT AREA */}
            <View style={styles.promptHeaderRow}>
              <Text style={[styles.controlLabel, { marginTop: 12, marginBottom: 0 }]}>Script to Narrate</Text>
              <TouchableOpacity
                style={[styles.voiceBtn, isRecordingVoice && styles.voiceBtnActive]}
                onPress={handleVoiceInput}
                activeOpacity={0.7}
              >
                <Text style={[styles.voiceBtnText, isRecordingVoice && styles.voiceBtnTextActive]} numberOfLines={1}>
                  {isRecordingVoice ? 'Listening...' : 'Voice Input'}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.scriptInput}
              multiline
              numberOfLines={4}
              placeholder="Enter your voiceover text, lecture script, or explanation to convert to natural AI speech..."
              placeholderTextColor="#94A3B8"
              value={script}
              onChangeText={setScript}
            />

            {/* GENERATE CTA BUTTON - TEXT ONLY, NO ICONS */}
            <TouchableOpacity
              style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
              onPress={handleGenerateVoice}
              disabled={generating}
              activeOpacity={0.85}
            >
              {generating ? (
                <View style={styles.btnLoadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.generateBtnText} numberOfLines={1}>Generating Voice Audio...</Text>
                </View>
              ) : (
                <Text style={styles.generateBtnText} numberOfLines={1}>Generate Voice</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* GENERATED AUDIO OUTPUTS */}
          {outputs.length > 0 && (
            <View style={styles.outputSection}>
              <Text style={styles.outputSectionTitle}>Audio Narrations</Text>
              {outputs.map((item) => {
                const isItemPlaying = isPlaying && currentPlayingId === item.id;
                return (
                  <View key={item.id} style={styles.audioCard}>
                    <View style={styles.audioCardHeader}>
                      <View style={styles.voiceBadge}>
                        <Text style={styles.voiceBadgeText} numberOfLines={1}>{item.voice} ({item.speed})</Text>
                      </View>
                      <Text style={styles.timestampText} numberOfLines={1}>{item.timestamp}</Text>
                    </View>

                    <Text style={styles.scriptOutputText}>{item.script}</Text>

                    {/* ACTION BUTTONS ROW - TEXT ONLY, NO ICONS */}
                    <View style={styles.audioActionsRow}>
                      {isItemPlaying ? (
                        <TouchableOpacity style={styles.actionBtnPause} onPress={stopSpeech} activeOpacity={0.8}>
                          <Text style={styles.actionBtnPauseText} numberOfLines={1}>Pause Audio</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.actionBtnPlay}
                          onPress={() => {
                            const matchedVoice = VOICE_OPTIONS.find((v) => v.name === item.voice) || selectedVoice;
                            playSpeech(item.script, item.id, matchedVoice);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.actionBtnPlayText} numberOfLines={1}>Play Narration</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity style={styles.actionBtnSecondary} onPress={stopSpeech} activeOpacity={0.8}>
                        <Text style={styles.actionBtnSecondaryText} numberOfLines={1}>Stop</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnOutline}
                        onPress={() => copyToClipboard(item.script, 'Script')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.actionBtnOutlineText} numberOfLines={1}>Copy Script</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* HISTORY MODAL */}
      <Modal visible={showHistoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>Voice History</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowHistoryModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseBtnText} numberOfLines={1}>Close</Text>
              </TouchableOpacity>
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyHistoryBox}>
                <Text style={styles.emptyHistoryText}>No voice recordings yet. Generate audio above!</Text>
              </View>
            ) : (
              <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                {history.map((item) => (
                  <View key={item.id} style={styles.historyCard}>
                    <View style={styles.historyInfo}>
                      <View style={styles.historyMetaRow}>
                        <Text style={styles.historyVoiceName} numberOfLines={1}>{item.voice}</Text>
                        <Text style={styles.historyTime} numberOfLines={1}>{item.timestamp}</Text>
                      </View>
                      <Text style={styles.historyScriptText} numberOfLines={2}>{item.script}</Text>
                      <TouchableOpacity
                        style={styles.historyUseBtn}
                        onPress={() => {
                          setScript(item.script);
                          setShowHistoryModal(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.historyUseBtnText} numberOfLines={1}>Use Script</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  headerBtnDark: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnDarkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
  voiceOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voiceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  voiceCardActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#7C3AED',
  },
  voiceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  voiceNameActive: {
    color: '#7C3AED',
  },
  genderBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genderBadgeActive: {
    backgroundColor: '#DDD6FE',
  },
  genderBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
  },
  genderBadgeTextActive: {
    color: '#7C3AED',
  },
  voiceDesc: {
    fontSize: 11,
    color: '#64748B',
  },

  speedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  speedPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedPillActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#7C3AED',
  },
  speedPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  speedPillTextActive: {
    color: '#7C3AED',
  },

  promptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  voiceBtn: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  voiceBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C3AED',
  },
  voiceBtnTextActive: {
    color: '#EF4444',
  },

  scriptInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13.5,
    color: '#0F172A',
    minHeight: 88,
    textAlignVertical: 'top',
  },

  generateBtn: {
    backgroundColor: '#7C3AED',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  generateBtnDisabled: {
    backgroundColor: '#C4B5FD',
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
    gap: 12,
  },
  outputSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  audioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  audioCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  voiceBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C3AED',
  },
  timestampText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  scriptOutputText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 19,
  },

  audioActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  actionBtnPlay: {
    flex: 1.2,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBtnPlayText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  actionBtnPause: {
    flex: 1.2,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBtnPauseText: {
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

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyHistoryBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 13,
    color: '#64748B',
  },
  historyList: {
    maxHeight: 400,
  },
  historyCard: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyInfo: {
    gap: 4,
  },
  historyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyVoiceName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C3AED',
  },
  historyTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  historyScriptText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 17,
  },
  historyUseBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  historyUseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
});
