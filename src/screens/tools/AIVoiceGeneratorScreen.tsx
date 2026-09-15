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
  FlatList,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import Tts from 'react-native-tts';
import { aiApi } from '../../api/aiApi';
import { copyToClipboard } from '../../utils/clipboard';

const VOICE_OPTIONS = [
  { id: 'kore', name: 'Kore - Bright & Confident', gender: 'female', pitch: 1.35, rate: 0.52 },
  { id: 'adam', name: 'Adam - Deep & Professional', gender: 'male', pitch: 0.75, rate: 0.46 },
  { id: 'rachel', name: 'Rachel - Warm & Engaging', gender: 'female', pitch: 1.15, rate: 0.50 },
  { id: 'fenrir', name: 'Fenrir - Energetic & Expressive', gender: 'male', pitch: 1.25, rate: 0.58 },
];

const SAMPLE_FILES = [
  {
    name: 'Quick_Voice_Note.txt',
    type: 'text/plain',
    size: '12 B',
    content: 'Hii hello',
  },
  {
    name: 'Lesson_1_AI_Concepts.txt',
    type: 'text/plain',
    size: '1.2 KB',
    content: 'Artificial intelligence is the simulation of human intelligence processes by machines, especially computer systems.',
  },
  {
    name: 'Revision_Summary.doc',
    type: 'application/msword',
    size: '2.4 KB',
    content: 'Neural networks consist of input, hidden, and output layers. Each neuron processes input data and passes activation forward.',
  },
];

interface VoiceHistoryItem {
  id: string;
  script: string;
  voice: string;
  date: string;
  audioUrl: string;
  durationSeconds: number;
}

export const AIVoiceGeneratorScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<typeof VOICE_OPTIONS[0]>(VOICE_OPTIONS[0]);
  const [systemVoices, setSystemVoices] = useState<any[]>([]);

  // Modals
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [showFilePickerModal, setShowFilePickerModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<{
    audioUrl: string;
    durationSeconds: number;
    voice: string;
    scriptSnippet: string;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  const [history, setHistory] = useState<VoiceHistoryItem[]>([
    {
      id: 'h1',
      script: 'Hii hello',
      voice: 'Kore - Bright & Confident',
      date: 'Just now',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      durationSeconds: 2,
    },
  ]);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'ToolsTab' });
    }
  };

  // Helper to compute dynamic duration based on word count
  const calculateDurationSeconds = (text: string): number => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (words === 0) return 2;
    // Speaking speed ~2.5 words per second
    return Math.max(2, Math.ceil(words / 2.5));
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Init TTS and fetch installed native system voices
  useEffect(() => {
    try {
      Tts.getInitStatus().then(() => {
        try {
          Tts.setIgnoreSilentSwitch('ignore');
          Tts.setDefaultLanguage('en-US');
          Tts.setDefaultRate(0.5);
        } catch (e) {}
        Tts.voices().then((voices: any[]) => {
          if (Array.isArray(voices)) {
            setSystemVoices(voices);
            const matchingVoice = voices.find(
              (v: any) =>
                v.language?.startsWith('en') &&
                (selectedVoice.gender === 'female' ? v.name?.includes('Siri') || v.id?.includes('female') : true)
            );
            if (matchingVoice && matchingVoice.id) {
              Tts.setDefaultVoice(matchingVoice.id);
            }
          }
        }).catch(() => {});
      }).catch(() => {});

      const onFinish = () => {
        setIsPlaying(false);
        setElapsedSeconds(0);
      };
      const onCancel = () => {
        setIsPlaying(false);
        setElapsedSeconds(0);
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

  // Back button handler
  useEffect(() => {
    const onBackPress = () => {
      handleGoBack();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);

  // Audio Playback Timer
  useEffect(() => {
    if (isPlaying && generatedAudio) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev + 1 >= generatedAudio.durationSeconds) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsPlaying(false);
            try {
              Tts.stop();
            } catch (e) {}
            return generatedAudio.durationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, generatedAudio]);

  // Apply voice switch on selection
  const handleVoiceChange = (voice: typeof VOICE_OPTIONS[0]) => {
    setSelectedVoice(voice);
    setShowVoicePicker(false);

    try {
      if (systemVoices.length > 0) {
        const matching = systemVoices.find(
          (v: any) =>
            v.language?.startsWith('en') &&
            (voice.id === 'adam' || voice.id === 'fenrir'
              ? v.id?.toLowerCase().includes('male') || v.name?.toLowerCase().includes('daniel') || v.name?.toLowerCase().includes('alex')
              : v.id?.toLowerCase().includes('female') || v.name?.toLowerCase().includes('siri') || v.name?.toLowerCase().includes('samantha'))
        ) || systemVoices[0];

        if (matching && matching.id) {
          Tts.setDefaultVoice(matching.id);
        }
      }
      Tts.setDefaultRate(voice.rate);
      Tts.setDefaultPitch(voice.pitch);
    } catch (e) {
      console.warn('[AIVoiceGeneratorScreen] Voice switch notice:', e);
    }
  };

  const playAudibleSpeech = (textToSpeak: string) => {
    try {
      Tts.stop();
      try {
        Tts.setIgnoreSilentSwitch('ignore');
        Tts.setDefaultLanguage('en-US');
      } catch (e) {}

      // Set voice specific rate & pitch
      Tts.setDefaultRate(selectedVoice.rate || 0.5);
      Tts.setDefaultPitch(selectedVoice.pitch || 1.0);

      Tts.speak(textToSpeak);
    } catch (err) {
      console.warn('[AIVoiceGeneratorScreen] Native TTS speech notice:', err);
    }
  };

  const handleGenerateSpeech = async () => {
    if (!script.trim()) {
      Alert.alert('Required Script', 'Please type or attach a text script to generate voice narration.');
      return;
    }

    setGenerating(true);
    setGeneratedAudio(null);
    setIsPlaying(false);

    const calculatedDuration = calculateDurationSeconds(script);

    try {
      const res = await aiApi.generateVoice({
        script,
        voice: selectedVoice.name,
      });

      const audioData = {
        audioUrl: res.data?.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        durationSeconds: res.data?.durationSeconds || calculatedDuration,
        voice: selectedVoice.name,
        scriptSnippet: script.slice(0, 60) + (script.length > 60 ? '...' : ''),
      };

      setGeneratedAudio(audioData);

      setHistory((prev) => [
        {
          id: `h_${Date.now()}`,
          script: script.slice(0, 80),
          voice: selectedVoice.name,
          date: 'Just now',
          audioUrl: audioData.audioUrl,
          durationSeconds: audioData.durationSeconds,
        },
        ...prev,
      ]);

      // Automatically trigger audible speech narration
      setIsPlaying(true);
      playAudibleSpeech(script);
    } catch (err) {
      console.warn('[AIVoiceGeneratorScreen] Error generating speech:', err);
    } finally {
      setGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!isPlaying && generatedAudio) {
      setIsPlaying(true);
      playAudibleSpeech(script || generatedAudio.scriptSnippet);
    } else {
      setIsPlaying(false);
      try {
        Tts.stop();
      } catch (e) {}
    }
  };

  const handleAttachFile = (fileItem: typeof SAMPLE_FILES[0]) => {
    setScript(fileItem.content);
    setShowFilePickerModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 1. TOP HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.aiToolsPillBtn}
          onPress={handleGoBack}
          activeOpacity={0.75}
        >
          <Icon name="chevron-left" size={16} color="#0F172A" />
          <Text style={styles.aiToolsPillText}>AI Tools</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyPillBtn}
          onPress={() => setShowHistoryModal(true)}
          activeOpacity={0.75}
        >
          <Text style={styles.historyPillText}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 2. MAIN TITLE SECTION */}
        <View style={styles.titleSection}>
          <Text style={styles.greenTag}>AI VOICE GENERATOR</Text>
          <Text style={styles.mainTitle}>Text to speech studio</Text>
        </View>

        {/* 3. SCRIPT INPUT AREA WITH ATTACH FILE SUPPORT */}
        <View style={styles.scriptCard}>
          <View style={styles.scriptHeaderRow}>
            <Text style={styles.scriptLabel}>Script & Document</Text>
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={() => setShowFilePickerModal(true)}
              activeOpacity={0.75}
            >
              <Icon name="paperclip" size={14} color="#6D28D9" />
              <Text style={styles.attachBtnText}>Attach File</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.scriptInput}
            placeholder="Type, paste, or attach a document file here..."
            placeholderTextColor="#94A3B8"
            value={script}
            onChangeText={setScript}
            multiline
            textAlignVertical="top"
            maxLength={5000}
          />

          <View style={styles.scriptBottomRow}>
            <View style={styles.scriptStatusWrap}>
              <Text style={styles.statusText}>
                {generating ? 'Synthesizing...' : 'Ready to generate'}
              </Text>
              <Text style={styles.charCountText}>{script.length} / 5,000 characters</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.generateSpeechBtn,
                (!script.trim() || generating) && styles.generateSpeechBtnDisabled,
              ]}
              onPress={handleGenerateSpeech}
              disabled={!script.trim() || generating}
              activeOpacity={0.85}
            >
              {generating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.generateSpeechBtnText}>Generate speech</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* AUDIO PLAYER CARD (DYNAMIC DURATION & TIMER) */}
        {generatedAudio && (
          <View style={styles.audioPlayerCard}>
            <View style={styles.audioHeaderRow}>
              <View style={styles.voiceBadgePill}>
                <Icon name="volume" size={14} color="#059669" />
                <Text style={styles.voiceBadgeText}>{generatedAudio.voice.split('-')[0].trim()}</Text>
              </View>
              <Text style={styles.formatTag}>{generatedAudio.durationSeconds}s • Voice Ready</Text>
            </View>

            <Text style={styles.audioScriptSnippet} numberOfLines={2}>
              "{generatedAudio.scriptSnippet}"
            </Text>

            <View style={styles.playerControlsRow}>
              <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayback}>
                <Icon name={isPlaying ? 'pause' : 'play'} size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.waveformContainer}>
                {[40, 65, 30, 85, 100, 50, 75, 90, 45, 60, 35, 80, 95, 55, 70].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveformBar,
                      {
                        height: h * 0.3,
                        backgroundColor: isPlaying && i < Math.floor((elapsedSeconds / generatedAudio.durationSeconds) * 15) ? '#059669' : '#CBD5E1',
                      },
                    ]}
                  />
                ))}
              </View>

              <Text style={styles.timerText}>
                {formatTime(elapsedSeconds)} / {formatTime(generatedAudio.durationSeconds)}
              </Text>
            </View>

            {/* BALANCED BOTTOM ACTION BAR FOR DOWNLOAD AUDIO */}
            <View style={styles.audioBottomBar}>
              <TouchableOpacity
                style={styles.downloadVoiceBtnFull}
                onPress={() => {
                  copyToClipboard(generatedAudio.audioUrl, 'Voice Audio Link');
                }}
                activeOpacity={0.8}
              >
                <Icon name="arrow-up" size={14} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
                <Text style={styles.downloadVoiceTextFull}>Download Audio File</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 4. VOICE SETTINGS CONTROLS PANEL (VOICE SELECTION ONLY) */}
        <View style={styles.controlsPanel}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Voice Selector</Text>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setShowVoicePicker(true)}
              activeOpacity={0.75}
            >
              <View style={styles.voiceDropdownLeft}>
                <View style={styles.voiceIconCircle}>
                  <Icon name="user" size={14} color="#059669" />
                </View>
                <Text style={styles.dropdownBtnText}>{selectedVoice.name}</Text>
              </View>
              <Icon name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* VOICE PICKER MODAL */}
      <Modal visible={showVoicePicker} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVoicePicker(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Voice</Text>
            {VOICE_OPTIONS.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={styles.modalOptionItem}
                onPress={() => handleVoiceChange(v)}
              >
                <View style={styles.voiceOptionRow}>
                  <Icon
                    name={v.gender === 'female' ? 'user' : 'user'}
                    size={16}
                    color={selectedVoice.id === v.id ? '#059669' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedVoice.id === v.id && styles.modalOptionTextSelected,
                    ]}
                  >
                    {v.name}
                  </Text>
                </View>
                {selectedVoice.id === v.id && <Icon name="check" size={16} color="#059669" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* FILE ATTACHMENT MODAL */}
      <Modal visible={showFilePickerModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilePickerModal(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.fileModalHeader}>
              <Text style={styles.modalTitle}>Attach Document / File</Text>
              <TouchableOpacity onPress={() => setShowFilePickerModal(false)}>
                <Icon name="x-circle" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.fileModalSub}>
              Select a file to extract text script into studio:
            </Text>

            {SAMPLE_FILES.map((file, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.fileCardItem}
                onPress={() => handleAttachFile(file)}
              >
                <View style={styles.fileIconBox}>
                  <Icon name="file-text" size={18} color="#6D28D9" />
                </View>
                <View style={styles.fileMetaBox}>
                  <Text style={styles.fileNameText}>{file.name}</Text>
                  <Text style={styles.fileSizeText}>
                    {file.size} • {file.content.slice(0, 35)}...
                  </Text>
                </View>
                <Icon name="chevron-right" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* HISTORY MODAL */}
      <Modal visible={showHistoryModal} transparent animationType="slide">
        <View style={styles.historyModalContainer}>
          <View style={[styles.historyModalHeader, { paddingTop: Math.max(insets.top, 16) }]}>
            <Text style={styles.historyModalTitle}>Audio History</Text>
            <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
              <Icon name="x-circle" size={22} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.historyListContent}
            renderItem={({ item }) => (
              <View style={styles.historyCardItem}>
                <View style={styles.historyTopRow}>
                  <Text style={styles.historyVoiceTag}>{item.voice.split('-')[0]}</Text>
                  <Text style={styles.historyDateText}>{item.date}</Text>
                </View>
                <Text style={styles.historyScriptSnippet}>"{item.script}..."</Text>
                <TouchableOpacity
                  style={styles.historyPlayBtn}
                  onPress={() => {
                    setScript(item.script);
                    setShowHistoryModal(false);
                  }}
                >
                  <Icon name="play" size={14} color="#6D28D9" />
                  <Text style={styles.historyPlayText}>Load into Studio ({item.durationSeconds}s)</Text>
                </TouchableOpacity>
              </View>
            )}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  aiToolsPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  aiToolsPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 4,
  },
  historyPillBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  historyPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6D28D9',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  greenTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  scriptCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    minHeight: 180,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scriptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scriptLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  attachBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D28D9',
    marginLeft: 4,
  },
  scriptInput: {
    fontSize: 15,
    color: '#0F172A',
    minHeight: 120,
    lineHeight: 22,
  },
  scriptBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 10,
  },
  scriptStatusWrap: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  charCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  generateSpeechBtn: {
    backgroundColor: '#64748B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateSpeechBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  generateSpeechBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  audioPlayerCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  audioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  voiceBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voiceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
    marginLeft: 4,
  },
  formatTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  audioScriptSnippet: {
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  playerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playPauseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30,
    marginRight: 12,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  controlsPanel: {
    backgroundColor: '#FFFFFF',
  },
  controlGroup: {
    marginBottom: 20,
  },
  controlLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  voiceDropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dropdownBtnText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  voiceOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
  },
  modalOptionTextSelected: {
    fontWeight: '700',
    color: '#059669',
  },
  fileModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileModalSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  fileCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  fileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileMetaBox: {
    flex: 1,
  },
  fileNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  fileSizeText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  historyModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  historyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyListContent: {
    padding: 20,
  },
  historyCardItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyVoiceTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  historyDateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  historyScriptSnippet: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 10,
  },
  historyPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyPlayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D28D9',
    marginLeft: 6,
  },
  downloadVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  downloadVoiceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
    marginLeft: 4,
  },
  audioBottomBar: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  downloadVoiceBtnFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  downloadVoiceTextFull: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
  },
});
