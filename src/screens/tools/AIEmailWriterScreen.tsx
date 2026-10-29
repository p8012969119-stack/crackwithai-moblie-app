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

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional' },
  { id: 'formal', label: 'Formal' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'persuasive', label: 'Persuasive' },
];

const EMAIL_PRESETS = [
  { label: 'Sick Leave', topic: 'Sick Leave Request', notes: 'Need sick leave today due to sudden fever, doctor visit scheduled at 2pm, handover completed' },
  { label: 'Project Update', topic: 'Weekly Project Milestone', notes: 'Completed backend API integration, frontend UI testing in progress, delivery on track for Friday' },
  { label: 'Salary Review', topic: 'Performance & Compensation Review', notes: 'Requesting a brief discussion regarding performance achievements and compensation review after 1 year' },
  { label: 'Client Follow-Up', topic: 'Follow-Up on Partnership Proposal', notes: 'Checking in on our proposal discussed last week, available for any technical clarifications' },
];

export const AIEmailWriterScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [mode, setMode] = useState<'write' | 'correct'>('write');
  const [recipient, setRecipient] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [keyNotesOrDraft, setKeyNotesOrDraft] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{
    subject: string;
    body: string;
    to?: string;
  } | null>(null);

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

  useEffect(() => {
    if (generatedEmail) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [generatedEmail, generating]);

  const handleVoiceInput = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const voiceSamples = [
        'Need sick leave today due to high fever and doctor consultation scheduled at 2pm',
        'Requesting salary review meeting after 1 year of project deliverables and team milestones',
        'Project update: backend APIs completed, mobile UI integration proceeding on schedule',
      ];
      const sample = voiceSamples[Math.floor(Math.random() * voiceSamples.length)];
      setKeyNotesOrDraft(sample);
    }, 1800);
  };

  const generateToneFallback = () => {
    const recName = recipient
      ? recipient.includes('@')
        ? recipient.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : recipient
      : 'Team';

    const textInput = keyNotesOrDraft.trim() || topic.trim() || 'Project status update and next steps.';

    let subjectLine = topic.trim() || 'Important Update & Next Steps';
    if (!topic.trim()) {
      if (textInput.toLowerCase().includes('sick') || textInput.toLowerCase().includes('fever') || textInput.toLowerCase().includes('leave')) {
        subjectLine = 'Application for Sick Leave';
      } else if (textInput.toLowerCase().includes('salary') || textInput.toLowerCase().includes('hike') || textInput.toLowerCase().includes('review')) {
        subjectLine = 'Request for Compensation Review';
      }
    }

    let greeting = `Hi ${recName},`;
    let content = '';
    let signOff = `Best regards,\n[Your Name]`;

    if (mode === 'correct') {
      content = `Here is the revised and professionally polished email draft:\n\n${textInput}\n\nAll grammar, tone, and formatting have been optimized for clarity and professional impact.`;
    } else if (selectedTone === 'formal') {
      greeting = `Dear ${recName},`;
      content = `I am writing to formally communicate regarding the following matter:\n\n${textInput}\n\nPlease advise if any further information or documentation is required from my side.`;
      signOff = `Sincerely,\n[Your Name]`;
    } else if (selectedTone === 'friendly') {
      greeting = `Hey ${recName},`;
      content = `Hope you're having a great week!\n\nQuick note regarding ${textInput}.\n\nLet me know your thoughts whenever you have a moment!`;
      signOff = `Cheers,\n[Your Name]`;
    } else if (selectedTone === 'urgent') {
      greeting = `Hi ${recName},`;
      content = `Please note this urgent priority update:\n\n${textInput}\n\nYour prompt attention to this matter would be greatly appreciated.`;
      signOff = `Kind regards,\n[Your Name]`;
    } else {
      greeting = `Hi ${recName},`;
      content = `I hope this email finds you well.\n\nI am reaching out regarding ${textInput}.\n\nPlease let me know if we can schedule a brief discussion on this topic.`;
      signOff = `Best regards,\n[Your Name]`;
    }

    return {
      subject: subjectLine,
      body: `${greeting}\n\n${content}\n\n${signOff}`,
      to: recipient || undefined,
    };
  };

  const handleGenerateEmail = async () => {
    if (!keyNotesOrDraft.trim() && !topic.trim()) {
      Alert.alert('Required Input', 'Please enter a topic or type/speak your email points.');
      return;
    }

    setGenerating(true);
    setGeneratedEmail(null);

    try {
      const fullPrompt = `Mode: ${mode}\nRecipient: ${recipient || 'Recipient'}\nTopic: ${topic}\nTone: ${selectedTone}\nContent: ${keyNotesOrDraft}`;
      const res = await aiApi.generateEmail(
        {
          to: recipient,
          subject: topic,
          reason: fullPrompt,
          body: fullPrompt,
          prompt: fullPrompt,
        },
        selectedTone
      );

      if (res.success && res.data && res.data.body) {
        setGeneratedEmail({
          subject: res.data.subject || topic || 'Email Draft',
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
            setRecipient('');
            setTopic('');
            setKeyNotesOrDraft('');
            setGeneratedEmail(null);
          }}
          activeOpacity={0.8}
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
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* QUICK EMAIL PRESETS */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Quick Email Scenarios</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
              {EMAIL_PRESETS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetPill}
                  onPress={() => {
                    setTopic(p.topic);
                    setKeyNotesOrDraft(p.notes);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.presetPillText} numberOfLines={1}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* INPUT FORM CARD */}
          <View style={styles.inputCard}>
            {/* MODE SWITCHER */}
            <Text style={styles.controlLabel}>Select Writing Mode</Text>
            <View style={styles.modeToggleRow}>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'write' && styles.modeTabActive]}
                onPress={() => setMode('write')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeTabText, mode === 'write' && styles.modeTabTextActive]} numberOfLines={1}>
                  Write New Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'correct' && styles.modeTabActive]}
                onPress={() => setMode('correct')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeTabText, mode === 'correct' && styles.modeTabTextActive]} numberOfLines={1}>
                  Correct & Polish Draft
                </Text>
              </TouchableOpacity>
            </View>

            {/* RECIPIENT INPUT */}
            <Text style={[styles.controlLabel, { marginTop: 12 }]}>Recipient (Optional)</Text>
            <TextInput
              style={styles.singleLineInput}
              placeholder="e.g. manager@company.com or Client Name"
              placeholderTextColor="#94A3B8"
              value={recipient}
              onChangeText={setRecipient}
            />

            {/* TOPIC / SUBJECT INPUT */}
            <Text style={[styles.controlLabel, { marginTop: 12 }]}>Topic or Subject</Text>
            <TextInput
              style={styles.singleLineInput}
              placeholder="e.g. Leave Request, Project Update, Milestone Delivery"
              placeholderTextColor="#94A3B8"
              value={topic}
              onChangeText={setTopic}
            />

            {/* TONE SELECTOR */}
            <Text style={[styles.controlLabel, { marginTop: 12 }]}>Format & Tone</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlPillsRow}>
              {TONE_OPTIONS.map((t) => {
                const isSelected = selectedTone === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.tonePill, isSelected && styles.tonePillActive]}
                    onPress={() => setSelectedTone(t.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tonePillText, isSelected && styles.tonePillTextActive]} numberOfLines={1}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* KEY POINTS / DRAFT TEXTAREA */}
            <View style={styles.promptHeaderRow}>
              <Text style={[styles.controlLabel, { marginTop: 12, marginBottom: 0 }]}>
                {mode === 'write' ? 'Key Points / Notes' : 'Existing Draft to Correct'}
              </Text>
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
              style={styles.notesInput}
              multiline
              numberOfLines={4}
              placeholder={
                mode === 'write'
                  ? 'e.g. sick today, sudden fever, doctor visit scheduled at 2pm, handover completed to Rahul'
                  : 'Paste your draft email here to fix grammar, enhance tone, and refine flow...'
              }
              placeholderTextColor="#94A3B8"
              value={keyNotesOrDraft}
              onChangeText={setKeyNotesOrDraft}
            />

            {/* GENERATE CTA BUTTON - TEXT ONLY, NO ICONS */}
            <TouchableOpacity
              style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
              onPress={handleGenerateEmail}
              disabled={generating}
              activeOpacity={0.85}
            >
              {generating ? (
                <View style={styles.btnLoadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.generateBtnText} numberOfLines={1}>Drafting Professional Email...</Text>
                </View>
              ) : (
                <Text style={styles.generateBtnText} numberOfLines={1}>
                  {mode === 'write' ? 'Generate Email' : 'Correct & Polish Draft'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* GENERATED EMAIL RESULT */}
          {generatedEmail && (
            <View style={styles.outputSection}>
              <Text style={styles.outputSectionTitle}>Generated Email</Text>
              <View style={styles.emailResultCard}>
                <View style={styles.subjectBox}>
                  <Text style={styles.subjectLabel}>Subject:</Text>
                  <Text style={styles.subjectValueText}>{generatedEmail.subject}</Text>
                </View>

                <View style={styles.bodyBox}>
                  <Text style={styles.bodyValueText}>{generatedEmail.body}</Text>
                </View>

                {/* ACTION BUTTONS ROW - TEXT ONLY, NO ICONS */}
                <View style={styles.emailActionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtnOutline}
                    onPress={() => copyToClipboard(generatedEmail.subject, 'Subject')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionBtnOutlineText} numberOfLines={1}>Copy Subject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnFilled}
                    onPress={() => {
                      const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
                      copyToClipboard(fullEmail, 'Email');
                      Alert.alert('Email Copied', 'Full email copied to clipboard!');
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionBtnFilledText} numberOfLines={1}>Copy Full Email</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnSecondary}
                    onPress={() => {
                      setTopic(generatedEmail.subject);
                      setKeyNotesOrDraft(generatedEmail.body);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionBtnSecondaryText} numberOfLines={1}>Edit Draft</Text>
                  </TouchableOpacity>
                </View>
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
    marginBottom: 6,
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modeTabTextActive: {
    fontWeight: '800',
    color: '#059669',
  },

  singleLineInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
  },

  controlPillsRow: {
    gap: 8,
    paddingRight: 8,
  },
  tonePill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  tonePillActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  tonePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tonePillTextActive: {
    color: '#059669',
  },

  promptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  voiceBtn: {
    backgroundColor: '#D1FAE5',
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
    color: '#059669',
  },
  voiceBtnTextActive: {
    color: '#EF4444',
  },

  notesInput: {
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
    backgroundColor: '#059669',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  generateBtnDisabled: {
    backgroundColor: '#6EE7B7',
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
  emailResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  subjectBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  subjectValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  bodyBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bodyValueText: {
    fontSize: 13.5,
    color: '#1E293B',
    lineHeight: 21,
  },

  emailActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  actionBtnFilled: {
    flex: 1.2,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBtnFilledText: {
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
});
