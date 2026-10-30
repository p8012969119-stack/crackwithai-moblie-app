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
import { aiApi } from '../../api/aiApi';
import { copyToClipboard } from '../../utils/clipboard';
import { useSpeechToText } from '../../hooks/useSpeechToText';

const TONES = ['Professional', 'Friendly', 'Urgent'];

export const AIEmailWriterScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [prompt, setPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [generating, setGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{
    subject: string;
    body: string;
  } | null>(null);

  // Real Speech-To-Text hook: listens to user voice and types into input bar in real time
  const { isListening, toggleListening, stopListening } = useSpeechToText({
    getCurrentText: () => prompt,
    onTextReceived: (text) => setPrompt(text),
  });

  const handleGoBack = () => {
    stopListening();
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
    if (generatedEmail) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [generatedEmail]);

  const handleGenerateEmail = async () => {
    stopListening();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      Alert.alert('Input Required', 'Please type or speak the details of the email you want to write.');
      return;
    }

    setGenerating(true);
    setGeneratedEmail(null);

    try {
      const res = await aiApi.generateEmail(
        {
          reason: cleanPrompt,
          prompt: cleanPrompt,
          body: cleanPrompt,
        },
        selectedTone
      );

      if (res.success && res.data && res.data.body) {
        setGeneratedEmail({
          subject: res.data.subject || 'Email Update',
          body: res.data.body.replace(/CrackWithAI Team/gi, '[Your Name]'),
        });
      } else {
        // Fallback
        setGeneratedEmail({
          subject: `Regarding: ${cleanPrompt.slice(0, 35)}`,
          body: `Dear Recipient,\n\nI am writing to communicate regarding: ${cleanPrompt}.\n\nPlease let me know if you need any additional details.\n\nBest regards,\n[Your Name]`,
        });
      }
    } catch (err: any) {
      console.warn('[AIEmailWriterScreen] Error generating email:', err?.message || err);
      setGeneratedEmail({
        subject: `Regarding: ${cleanPrompt.slice(0, 35)}`,
        body: `Dear Recipient,\n\nI am writing to follow up regarding: ${cleanPrompt}.\n\nPlease let me know if any further details are required.\n\nBest regards,\n[Your Name]`,
      });
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

        <Text style={styles.headerTitle} numberOfLines={1}>AI Email Writer</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            stopListening();
            setPrompt('');
            setGeneratedEmail(null);
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
          {/* TONE SELECTION ROW */}
          <View style={styles.toneRow}>
            {TONES.map((tone) => {
              const isSelected = selectedTone === tone;
              return (
                <TouchableOpacity
                  key={tone}
                  style={[styles.toneChip, isSelected && styles.toneChipActive]}
                  onPress={() => setSelectedTone(tone)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toneChipText, isSelected && styles.toneChipTextActive]} numberOfLines={1}>
                    {tone}
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
              placeholder="Describe your email requirement or speak below (e.g., Leave request for 2 days fever to manager Alex, or paste an email to polish)..."
              placeholderTextColor="#94A3B8"
              value={prompt}
              onChangeText={setPrompt}
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

              {prompt.trim().length > 0 && (
                <TouchableOpacity
                  style={styles.clearInputBtn}
                  onPress={() => setPrompt('')}
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
            onPress={handleGenerateEmail}
            disabled={generating}
            activeOpacity={0.85}
          >
            {generating ? (
              <View style={styles.btnLoadingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.generateBtnText} numberOfLines={1}>Generating Email...</Text>
              </View>
            ) : (
              <Text style={styles.generateBtnText} numberOfLines={1}>Generate Email</Text>
            )}
          </TouchableOpacity>

          {/* GENERATED EMAIL RESULT */}
          {generatedEmail && (
            <View style={styles.resultContainer}>
              <View style={styles.subjectBox}>
                <Text style={styles.subjectLabel}>Subject:</Text>
                <Text style={styles.subjectText} selectable>{generatedEmail.subject}</Text>
              </View>

              <View style={styles.bodyBox}>
                <Text style={styles.bodyText} selectable>{generatedEmail.body}</Text>
              </View>

              {/* ACTION BUTTONS ROW - TEXT ONLY, NO ICONS */}
              <View style={styles.resultActionsRow}>
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={() => {
                    const full = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
                    copyToClipboard(full, 'Email');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionBtnPrimaryText} numberOfLines={1}>Copy Full Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => copyToClipboard(generatedEmail.subject, 'Subject')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnSecondaryText} numberOfLines={1}>Copy Subject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => setGeneratedEmail(null)}
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

  toneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  toneChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toneChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  toneChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  toneChipTextActive: {
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
    minHeight: 120,
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
  subjectBox: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
  },
  subjectLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 21,
  },
  bodyBox: {
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 22,
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
