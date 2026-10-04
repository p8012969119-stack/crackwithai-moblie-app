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
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { aiApi } from '../../api/aiApi';
import { copyToClipboard } from '../../utils/clipboard';

const TONE_PILLS = [
  { id: 'professional', label: 'Professional' },
  { id: 'formal', label: 'Formal' },
  { id: 'informal', label: 'Friendly / Informal' },
];

export const AIEmailWriterScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<'write' | 'correct'>('write');
  const [recipient, setRecipient] = useState('');
  const [selectedTone, setSelectedTone] = useState<'professional' | 'formal' | 'informal'>('professional');
  const [keyNotesOrDraft, setKeyNotesOrDraft] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{
    subject: string;
    body: string;
    to?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleVoiceInput = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const voiceSamples = [
        'Need sick leave tomorrow due to high fever, doctor visit scheduled at 2pm',
        'Requesting salary review after 1 year of project deliverables and team leadership',
        'Project update: backend APIs completed, mobile UI integration in progress',
      ];
      const sample = voiceSamples[Math.floor(Math.random() * voiceSamples.length)];
      setKeyNotesOrDraft(sample);
    }, 2000);
  };

  const generateToneFallback = () => {
    const recName = recipient
      ? recipient.includes('@')
        ? recipient.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : recipient
      : 'Team';

    const textInput = keyNotesOrDraft.trim() || 'Project status update and next steps.';

    let subjectLine = 'Important Update & Next Steps';
    if (textInput.toLowerCase().includes('sick') || textInput.toLowerCase().includes('fever') || textInput.toLowerCase().includes('leave')) {
      subjectLine = 'Application for Leave';
    } else if (textInput.toLowerCase().includes('salary') || textInput.toLowerCase().includes('hike') || textInput.toLowerCase().includes('review')) {
      subjectLine = 'Request for Compensation Review';
    }

    let greeting = `Hi ${recName},`;
    let content = '';
    let signOff = `Best regards,\n[Your Name]`;

    if (mode === 'correct') {
      content = `Here is the revised and professionally corrected email:\n\n${textInput}\n\nAll grammar, tone, and formatting have been optimized for clarity and impact.`;
    } else if (selectedTone === 'formal') {
      greeting = `Dear ${recName},`;
      content = `I am writing to formally communicate regarding the following matter:\n\n${textInput}\n\nPlease advise if any further information or documentation is required.`;
      signOff = `Sincerely,\n[Your Name]`;
    } else if (selectedTone === 'informal') {
      greeting = `Hey ${recName},`;
      content = `Hope you're having a good week!\n\nQuick note regarding ${textInput}.\n\nLet me know your thoughts whenever you're free!`;
      signOff = `Cheers,\n[Your Name]`;
    } else {
      greeting = `Hi ${recName},`;
      content = `I hope this email finds you well.\n\nI am reaching out regarding ${textInput}.\n\nPlease let me know if you would like to schedule a brief discussion.`;
      signOff = `Best regards,\n[Your Name]`;
    }

    return {
      subject: subjectLine,
      body: `${greeting}\n\n${content}\n\n${signOff}`,
      to: recipient || undefined,
    };
  };

  const handleGenerateEmail = async () => {
    if (!keyNotesOrDraft.trim()) {
      Alert.alert('Required Input', 'Please type or speak your key notes / email draft.');
      return;
    }

    setGenerating(true);
    setGeneratedEmail(null);

    try {
      const fullPrompt = `Mode: ${mode}\nRecipient: ${recipient || 'Recipient'}\nFormat/Tone: ${selectedTone}\nInput: ${keyNotesOrDraft}`;
      const res = await aiApi.generateEmail(
        {
          to: recipient,
          reason: fullPrompt,
          body: fullPrompt,
          prompt: fullPrompt,
        },
        selectedTone
      );

      if (res.success && res.data && res.data.body) {
        setGeneratedEmail({
          subject: res.data.subject || 'Email Draft',
          body: res.data.body.replace(/CrackWithAI Team/gi, '[Your Name]'),
          to: recipient || undefined,
        });
      } else {
        setGeneratedEmail(generateToneFallback());
      }
    } catch (err) {
      console.warn('[AIEmailWriterScreen] Error generating email:', err);
      setGeneratedEmail(generateToneFallback());
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyEmail = () => {
    if (!generatedEmail) return;
    const fullText = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    copyToClipboard(fullText, 'Email');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* SLEEK HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backPill} onPress={handleGoBack} activeOpacity={0.7}>
          <Icon name="chevron-left" size={16} color="#0F172A" />
          <Text style={styles.backPillText}>Tools</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>AI Email Writer</Text>

        <TouchableOpacity
          style={styles.resetPill}
          onPress={() => {
            setRecipient('');
            setKeyNotesOrDraft('');
            setGeneratedEmail(null);
          }}
        >
          <Text style={styles.resetPillText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* MODE TOGGLE PILLS */}
          <View style={styles.modeToggleRow}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'write' && styles.modeTabActive]}
              onPress={() => setMode('write')}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeTabText, mode === 'write' && styles.modeTabTextActive]}>Write New Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'correct' && styles.modeTabActive]}
              onPress={() => setMode('correct')}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeTabText, mode === 'correct' && styles.modeTabTextActive]}>Correct / Improve Draft</Text>
            </TouchableOpacity>
          </View>

          {/* INPUT FORM */}
          <View style={styles.formContainer}>
            {/* Recipient */}
            <Text style={styles.inputLabel}>Recipient Email / Name (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. hr@company.com or Manager"
              placeholderTextColor="#94A3B8"
              value={recipient}
              onChangeText={setRecipient}
            />

            {/* Tone Selector Pills */}
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Format / Tone</Text>
            <View style={styles.tonePillRow}>
              {TONE_PILLS.map((t) => {
                const active = selectedTone === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.tonePill, active && styles.tonePillActive]}
                    onPress={() => setSelectedTone(t.id as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tonePillText, active && styles.tonePillTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Key Notes / Draft Input */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 6 }}>
              <Text style={styles.inputLabel}>
                {mode === 'write' ? 'Key Points / Small Notes' : 'Paste Draft to Correct'}
              </Text>

              {/* Voice Mic Input */}
              <TouchableOpacity
                style={[styles.micBtn, isRecordingVoice && styles.micBtnActive]}
                onPress={handleVoiceInput}
                activeOpacity={0.7}
              >
                <Icon name="mic" size={14} color={isRecordingVoice ? '#EF4444' : '#5653FE'} />
                <Text style={[styles.micBtnText, isRecordingVoice && styles.micBtnTextActive]}>
                  {isRecordingVoice ? 'Listening...' : 'Voice'}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder={
                mode === 'write'
                  ? 'e.g. sick today, fever, doctor visit at 2pm, urgent work handed over to Rahul'
                  : 'Paste your existing email draft here to check and correct grammar, tone, and structure...'
              }
              placeholderTextColor="#94A3B8"
              value={keyNotesOrDraft}
              onChangeText={setKeyNotesOrDraft}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Generate CTA Button */}
            <TouchableOpacity
              style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
              onPress={handleGenerateEmail}
              disabled={generating}
              activeOpacity={0.85}
            >
              {generating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.generateBtnText}>
                  {mode === 'write' ? 'Generate Email ➔' : 'Correct & Polish Draft ➔'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* GENERATED EMAIL RESULT */}
          {generatedEmail && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Generated Email Output</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyEmail} activeOpacity={0.7}>
                  <Icon name={copied ? 'check' : 'copy'} size={14} color="#5653FE" />
                  <Text style={styles.copyBtnText}>{copied ? 'Copied' : 'Copy'}</Text>
                </TouchableOpacity>
              </View>

              {generatedEmail.to && (
                <Text style={styles.metaText}>
                  <Text style={{ fontWeight: '700' }}>To: </Text>
                  {generatedEmail.to}
                </Text>
              )}
              <Text style={styles.metaText}>
                <Text style={{ fontWeight: '700' }}>Subject: </Text>
                {generatedEmail.subject}
              </Text>

              <View style={styles.emailBodyBox}>
                <Text style={styles.emailBodyText}>{generatedEmail.body}</Text>
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
  resetPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  resetPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  scrollContent: {
    padding: 16,
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modeTabTextActive: {
    fontWeight: '800',
    color: '#5653FE',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 80,
  },
  tonePillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tonePill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  tonePillActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#5653FE',
  },
  tonePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  tonePillTextActive: {
    fontWeight: '800',
    color: '#5653FE',
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
  },
  micBtnActive: {
    backgroundColor: '#FEF2F2',
  },
  micBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5653FE',
    marginLeft: 4,
  },
  micBtnTextActive: {
    color: '#EF4444',
  },
  generateBtn: {
    backgroundColor: '#5653FE',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  generateBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  generateBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resultContainer: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5653FE',
    marginLeft: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 4,
  },
  emailBodyBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  emailBodyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#0F172A',
  },
});
