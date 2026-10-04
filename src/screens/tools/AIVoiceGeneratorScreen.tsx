import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import Tts from 'react-native-tts';
import { aiApi } from '../../api/aiApi';

const VOICE_OPTIONS = [
  { id: 'kore', name: 'Kore', label: 'Female (Bright & Crisp)', gender: 'female', pitch: 1.35, rate: 0.52 },
  { id: 'adam', name: 'Adam', label: 'Male (Professional Tech)', gender: 'male', pitch: 0.75, rate: 0.46 },
  { id: 'rachel', name: 'Rachel', label: 'Female (Warm Narrative)', gender: 'female', pitch: 1.15, rate: 0.50 },
  { id: 'fenrir', name: 'Fenrir', label: 'Male (Expressive Deep)', gender: 'male', pitch: 1.25, rate: 0.58 },
];

export const AIVoiceGeneratorScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);

  const [generating, setGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<{ id: string; voice: string; script: string; timestamp: string }[]>([]);

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

      const onFinish = () => setIsPlaying(false);
      const onCancel = () => setIsPlaying(false);

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

  const handleVoiceInput = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const voiceSamples = [
        'Welcome to CrackWithAI! Learn Full Stack Development and AI Automation today.',
        'Artificial intelligence is reshaping how modern software applications are designed.',
      ];
      setScript(voiceSamples[Math.floor(Math.random() * voiceSamples.length)]);
    }, 2000);
  };

  const handleAttachFile = () => {
    Alert.alert('Add Document File', 'Select a text file to convert into voice narration:', [
      {
        text: 'Lesson_Summary.txt',
        onPress: () => {
          const content = 'Full Stack Web Development combines HTML, CSS, JavaScript, Express, and MongoDB.';
          setAttachedFile({ name: 'Lesson_Summary.txt', content });
          setScript(content);
        },
      },
      {
        text: 'Notes.txt',
        onPress: () => {
          const content = 'AI Automation enables smart workflows using AI models and webhooks.';
          setAttachedFile({ name: 'Notes.txt', content });
          setScript(content);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const playSpeech = (textToSpeak: string) => {
    try {
      Tts.stop();
      Tts.setDefaultRate(selectedVoice.rate || 0.5);
      Tts.setDefaultPitch(selectedVoice.pitch || 1.0);
      Tts.speak(textToSpeak);
      setIsPlaying(true);
    } catch (e) {
      console.warn('[AIVoiceGeneratorScreen] TTS play notice:', e);
    }
  };

  const stopSpeech = () => {
    try {
      Tts.stop();
    } catch (e) {}
    setIsPlaying(false);
  };

  const handleGenerateVoice = async () => {
    const textToNarrate = script.trim();
    if (!textToNarrate) {
      Alert.alert('Required Script', 'Please type text, speak via microphone, or attach a document file.');
      return;
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setGenerating(true);
    try {
      await aiApi.generateVoice({
        script: textToNarrate,
        voice: selectedVoice.name,
      });

      setHistory((prev) => [
        { id: `voice_${Date.now()}`, voice: selectedVoice.name, script: textToNarrate, timestamp: nowStr },
        ...prev,
      ]);
      playSpeech(textToNarrate);
    } catch (err) {
      console.warn('[AIVoiceGeneratorScreen] Native TTS fallback active:', err);
      setHistory((prev) => [
        { id: `voice_${Date.now()}`, voice: selectedVoice.name, script: textToNarrate, timestamp: nowStr },
        ...prev,
      ]);
      playSpeech(textToNarrate);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backPill} onPress={handleGoBack} activeOpacity={0.7}>
          <Icon name="chevron-left" size={16} color="#0F172A" />
          <Text style={styles.backPillText}>Tools</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>AI Voice Generator</Text>

        <TouchableOpacity style={styles.historyBlackBtn} onPress={() => setShowHistoryModal(true)} activeOpacity={0.8}>
          <Text style={styles.historyBlackBtnText}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]} keyboardShouldPersistTaps="handled">
        {/* BRIGHT VOICE MODEL SELECTOR */}
        <View style={styles.voiceSectionContainer}>
          <Text style={styles.sectionLabelTitle}>Select AI Voice Model:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.voiceCardsScroll}>
            {VOICE_OPTIONS.map((v) => {
              const active = selectedVoice.id === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.brightVoiceCard, active && styles.brightVoiceCardActive]}
                  onPress={() => setSelectedVoice(v)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.voiceIconCircle, active && styles.voiceIconCircleActive]}>
                    <Icon name={v.gender === 'female' ? 'volume' : 'mic'} size={16} color={active ? '#FFFFFF' : '#7C3AED'} />
                  </View>
                  <View>
                    <Text style={[styles.brightVoiceName, active && styles.brightVoiceNameActive]}>
                      {v.name} {active ? '✓' : ''}
                    </Text>
                    <Text style={[styles.brightVoiceSub, active && styles.brightVoiceSubActive]}>
                      {v.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* INPUT CONTAINER */}
        <View style={styles.inputCard}>
          <View style={styles.inputCardHeader}>
            <Text style={styles.labelTitle}>Script / Document Content</Text>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              {/* Add Files (+) */}
              <TouchableOpacity style={styles.actionIconBtn} onPress={handleAttachFile} activeOpacity={0.7}>
                <Text style={styles.plusIcon}>+</Text>
              </TouchableOpacity>

              {/* Voice Input (🎙️ Mic Icon) */}
              <TouchableOpacity
                style={[styles.actionIconBtn, isRecordingVoice && styles.micActiveBtn]}
                onPress={handleVoiceInput}
                activeOpacity={0.7}
              >
                <Icon name="mic" size={14} color={isRecordingVoice ? '#EF4444' : '#7C3AED'} />
              </TouchableOpacity>
            </View>
          </View>

          {attachedFile && (
            <View style={styles.attachedFileBar}>
              <Icon name="file-text" size={14} color="#7C3AED" />
              <Text style={styles.attachedFileName} numberOfLines={1}>
                {attachedFile.name}
              </Text>
              <TouchableOpacity onPress={() => setAttachedFile(null)}>
                <Icon name="x-circle" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          )}

          {isRecordingVoice && (
            <View style={styles.recordingBar}>
              <ActivityIndicator size="small" color="#EF4444" />
              <Text style={styles.recordingText}>Listening... Speak your voice narration</Text>
            </View>
          )}

          <TextInput
            style={styles.textArea}
            placeholder="Type your script here, record via voice mic, or attach a document file..."
            placeholderTextColor="#94A3B8"
            value={script}
            onChangeText={setScript}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* GENERATE VOICE CTA BUTTON */}
          <TouchableOpacity
            style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
            onPress={handleGenerateVoice}
            disabled={generating}
            activeOpacity={0.85}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.generateBtnText}>Generate Voice</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* AUDIO TEST / PLAYBACK CONTROL */}
        {isPlaying && (
          <View style={styles.playerCard}>
            <Text style={styles.playerTitle}>🔊 Playing Narration ({selectedVoice.name})...</Text>
            <TouchableOpacity style={styles.stopBtn} onPress={stopSpeech} activeOpacity={0.8}>
              <Icon name="pause" size={16} color="#FFFFFF" />
              <Text style={styles.stopBtnText}>Pause Speech</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* HISTORY MODAL */}
      <Modal visible={showHistoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Voice Generation History</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Icon name="x" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {history.length === 0 ? (
              <Text style={styles.emptyHistoryText}>No voice history yet. Generate voice scripts to see them here.</Text>
            ) : (
              <ScrollView style={styles.historyList}>
                {history.map((item) => (
                  <View key={item.id} style={styles.historyItemCard}>
                    <View style={styles.historyItemContent}>
                      <View style={styles.historyMetaRow}>
                        <Text style={styles.historyVoiceBadge}>{item.voice}</Text>
                        <Text style={styles.historyItemTime}>{item.timestamp}</Text>
                      </View>
                      <Text style={styles.historyItemScript} numberOfLines={3}>
                        "{item.script}"
                      </Text>
                      <TouchableOpacity
                        style={styles.historyUseBtn}
                        onPress={() => {
                          setScript(item.script);
                          setShowHistoryModal(false);
                          playSpeech(item.script);
                        }}
                      >
                        <Icon name="volume" size={12} color="#7C3AED" />
                        <Text style={styles.historyUseBtnText}>Play Voice</Text>
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

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  backPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyBlackBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  historyBlackBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  scrollContent: {
    padding: 16,
  },

  /* BRIGHT VOICE MODEL SELECTOR */
  voiceSectionContainer: {
    marginBottom: 16,
  },
  sectionLabelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  voiceCardsScroll: {
    gap: 10,
    paddingRight: 16,
  },
  brightVoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 160,
  },
  brightVoiceCardActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#7C3AED',
  },
  voiceIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIconCircleActive: {
    backgroundColor: '#7C3AED',
  },
  brightVoiceName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  brightVoiceNameActive: {
    color: '#7C3AED',
  },
  brightVoiceSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  brightVoiceSubActive: {
    color: '#6B21A8',
    fontWeight: '600',
  },

  /* INPUT CARD */
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  labelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
    marginTop: -2,
  },
  micActiveBtn: {
    backgroundColor: '#FEE2E2',
  },
  attachedFileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    marginBottom: 8,
  },
  attachedFileName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
    flex: 1,
    marginHorizontal: 6,
  },
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 8,
  },
  recordingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 6,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 120,
  },

  /* CTA BUTTON */
  generateBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  generateBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* PLAYER CARD */
  playerCard: {
    marginTop: 16,
    backgroundColor: '#F3E8FF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  playerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 10,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    gap: 6,
  },
  stopBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    marginVertical: 20,
  },
  historyList: {
    maxHeight: 400,
  },
  historyItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyItemContent: {
    gap: 6,
  },
  historyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyVoiceBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  historyItemTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  historyItemScript: {
    fontSize: 13,
    color: '#0F172A',
  },
  historyUseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  historyUseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
});
