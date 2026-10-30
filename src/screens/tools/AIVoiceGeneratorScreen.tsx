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
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import Tts from 'react-native-tts';
import { aiApi } from '../../api/aiApi';
import { copyToClipboard } from '../../utils/clipboard';
import { useSpeechToText } from '../../hooks/useSpeechToText';

const VOICES = [
  { id: 'kore', name: 'Kore', label: 'Female', pitch: 1.0, rate: 0.50 },
  { id: 'fenrir', name: 'Fenrir', label: 'Male', pitch: 0.85, rate: 0.48 },
  { id: 'zephyr', name: 'Zephyr', label: 'Female Soft', pitch: 1.15, rate: 0.52 },
  { id: 'puck', name: 'Puck', label: 'Male Dynamic', pitch: 0.95, rate: 0.55 },
];

const SPEEDS = [
  { id: '0.8', label: '0.8x Slow', rate: 0.40 },
  { id: '1.0', label: '1.0x Normal', rate: 0.50 },
  { id: '1.2', label: '1.2x Fast', rate: 0.60 },
];

export const AIVoiceGeneratorScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [selectedSpeed, setSelectedSpeed] = useState('1.0');
  const [generating, setGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedVoice, setGeneratedVoice] = useState<{
    script: string;
    voice: string;
    speed: string;
  } | null>(null);

  // Real Speech-To-Text hook
  const { isListening, toggleListening, stopListening } = useSpeechToText({
    getCurrentText: () => script,
    onTextReceived: (text) => setScript(text),
  });

  const handleGoBack = () => {
    stopListening();
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
      Tts.setDefaultRate(0.5);
      Tts.setDefaultPitch(1.0);
      Tts.addEventListener('tts-finish', () => setIsPlaying(false));
      Tts.addEventListener('tts-cancel', () => setIsPlaying(false));
    } catch (e) {}

    return () => {
      try {
        Tts.stop();
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (generatedVoice) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [generatedVoice]);

  const playSpeech = (textToSpeak: string) => {
    try {
      Tts.stop();
      setIsPlaying(true);
      const speedObj = SPEEDS.find((s) => s.id === selectedSpeed) || SPEEDS[1];
      Tts.setDefaultPitch(selectedVoice.pitch);
      Tts.setDefaultRate(speedObj.rate);
      Tts.speak(textToSpeak);
    } catch (e) {
      console.warn('TTS playback error', e);
      setIsPlaying(false);
    }
  };

  const stopSpeech = () => {
    try {
      Tts.stop();
    } catch (e) {}
    setIsPlaying(false);
  };

  const handleGenerateVoice = async () => {
    stopListening();
    const cleanScript = script.trim();
    if (!cleanScript) {
      Alert.alert('Input Required', 'Please enter or speak the script text for your voiceover narration.');
      return;
    }

    setGenerating(true);
    setGeneratedVoice(null);

    const speedVal = parseFloat(selectedSpeed) || 1.0;
    const output = {
      script: cleanScript,
      voice: selectedVoice.name,
      speed: `${selectedSpeed}x`,
    };

    setGeneratedVoice(output);
    playSpeech(cleanScript);
    setGenerating(false);

    // Background server audio persistence without blocking user playback
    void aiApi.generateVoice({
      script: cleanScript,
      voice: selectedVoice.name,
      speed: speedVal,
    }).catch(() => {});
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

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            stopListening();
            stopSpeech();
            setScript('');
            setGeneratedVoice(null);
          }}
          activeOpacity={0.7}
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
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* VOICE MODEL ROW */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {VOICES.map((voice) => {
              const isSelected = selectedVoice.id === voice.id;
              return (
                <TouchableOpacity
                  key={voice.id}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setSelectedVoice(voice)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]} numberOfLines={1}>
                    {voice.name} ({voice.label})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* SPEAKING SPEED ROW */}
          <View style={styles.speedRow}>
            {SPEEDS.map((speed) => {
              const isSelected = selectedSpeed === speed.id;
              return (
                <TouchableOpacity
                  key={speed.id}
                  style={[styles.speedChip, isSelected && styles.speedChipActive]}
                  onPress={() => setSelectedSpeed(speed.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.speedChipText, isSelected && styles.speedChipTextActive]} numberOfLines={1}>
                    {speed.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* SINGLE CLEAN INPUT AREA */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.mainInput}
              multiline
              numberOfLines={4}
              placeholder="Enter script text or speak below to generate realistic AI voice narration..."
              placeholderTextColor="#94A3B8"
              value={script}
              onChangeText={setScript}
            />

            {/* ACTION ROW INSIDE INPUT */}
            <View style={styles.inputBottomRow}>
              <TouchableOpacity
                style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
                onPress={toggleListening}
                activeOpacity={0.8}
              >
                <Text style={[styles.voiceBtnText, isListening && styles.voiceBtnTextActive]} numberOfLines={1}>
                  {isListening ? 'Listening... Tap to stop' : 'Voice Input'}
                </Text>
              </TouchableOpacity>

              {script.trim().length > 0 && (
                <TouchableOpacity
                  style={styles.clearInputBtn}
                  onPress={() => setScript('')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearInputBtnText} numberOfLines={1}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* MAIN GENERATE CTA BUTTON */}
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

          {/* GENERATED VOICE RESULT */}
          {generatedVoice && (
            <View style={styles.resultContainer}>
              <View style={styles.voiceHeaderRow}>
                <Text style={styles.voiceMetaBadge} numberOfLines={1}>
                  {generatedVoice.voice} · {generatedVoice.speed}
                </Text>
              </View>

              <Text style={styles.scriptText} selectable>
                {generatedVoice.script}
              </Text>

              {/* ACTION BUTTONS ROW - TEXT ONLY, NO ICONS */}
              <View style={styles.resultActionsRow}>
                {isPlaying ? (
                  <TouchableOpacity
                    style={styles.actionBtnPause}
                    onPress={stopSpeech}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionBtnPauseText} numberOfLines={1}>Pause Audio</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={() => playSpeech(generatedVoice.script)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionBtnPrimaryText} numberOfLines={1}>Play Audio</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => copyToClipboard(generatedVoice.script, 'Script')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnSecondaryText} numberOfLines={1}>Copy Script</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => {
                    stopSpeech();
                    setGeneratedVoice(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnSecondaryText} numberOfLines={1}>Clear</Text>
                </TouchableOpacity>
              </View>
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
  headerBtn: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  speedChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  speedChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  speedChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  mainInput: {
    fontSize: 15,
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: 22,
    padding: 0,
  },
  inputBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  voiceBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  voiceBtnActive: {
    backgroundColor: '#DC2626',
  },
  voiceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  voiceBtnTextActive: {
    color: '#FFFFFF',
  },
  clearInputBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearInputBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  generateBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  generateBtnDisabled: {
    opacity: 0.65,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  resultContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  voiceHeaderRow: {
    marginBottom: 8,
  },
  voiceMetaBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  scriptText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 16,
  },

  resultActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnPrimary: {
    flex: 1.2,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnPause: {
    flex: 1.2,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPauseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnSecondary: {
    flex: 0.9,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
});
