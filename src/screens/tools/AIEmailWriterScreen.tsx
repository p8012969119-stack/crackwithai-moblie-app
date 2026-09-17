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
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { aiApi } from '../../api/aiApi';

import { copyToClipboard } from '../../utils/clipboard';

export const AIEmailWriterScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [selectedTone, setSelectedTone] = useState<'professional' | 'formal' | 'informal'>('professional');

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

  const generateToneFallback = () => {
    const recipient = to
      ? to.includes('@')
        ? to.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : to
      : 'there';

    const mainText = reason.trim() || 'our project updates and next steps';
    const lowerReason = mainText.toLowerCase();

    let inferredSubject = 'Discussion & Important Update';
    if (lowerReason.includes('sick') || lowerReason.includes('fever') || lowerReason.includes('unwell') || lowerReason.includes('doctor')) {
      inferredSubject = 'Application for Sick Leave';
    } else if (lowerReason.includes('leave') || lowerReason.includes('vacation') || lowerReason.includes('pto')) {
      inferredSubject = 'Leave Request';
    } else if (lowerReason.includes('salary') || lowerReason.includes('hike') || lowerReason.includes('pay') || lowerReason.includes('raise')) {
      inferredSubject = 'Request for Compensation Review';
    } else if (lowerReason.includes('meeting') || lowerReason.includes('call') || lowerReason.includes('chat') || lowerReason.includes('discuss')) {
      inferredSubject = 'Request for a Quick Discussion';
    } else if (lowerReason.includes('resign') || lowerReason.includes('notice')) {
      inferredSubject = 'Notice of Resignation';
    } else if (lowerReason.includes('delay') || lowerReason.includes('status') || lowerReason.includes('project')) {
      inferredSubject = 'Project Status & Timeline Update';
    }

    let greeting = `Hi ${recipient},`;
    let content = '';
    let signOff = `Best regards,\n[Your Name]`;

    if (selectedTone === 'formal') {
      greeting = `Dear ${recipient},`;
      content = `I am writing to formally communicate regarding the following:\n\n"${mainText}"\n\nPlease advise if any additional details are needed.`;
      signOff = `Sincerely,\n[Your Name]`;
    } else if (selectedTone === 'informal') {
      greeting = `Hey ${recipient},`;
      content = `Hope you're having a good day! Quick note regarding ${mainText}.\n\nLet me know your thoughts whenever you get a chance!`;
      signOff = `Cheers,\n[Your Name]`;
    } else {
      greeting = `Hi ${recipient},`;
      content = `I hope this email finds you well.\n\nI am reaching out to discuss ${mainText.toLowerCase().startsWith('i ') ? mainText : `the following matter: ${mainText}`}.\n\nPlease let me know if we can schedule a brief time to connect.`;
      signOff = `Best regards,\n[Your Name]`;
    }

    return {
      subject: inferredSubject,
      body: `${greeting}\n\n${content}\n\n${signOff}`,
      to: to || undefined,
    };
  };

  const handleGenerateEmail = async () => {
    if (!reason.trim()) {
      Alert.alert('Required Input', 'Please enter your Reason for Email so AI can draft your email.');
      return;
    }

    setGenerating(true);
    setGeneratedEmail(null);

    try {
      const res = await aiApi.generateEmail(
        {
          to,
          reason,
          body: reason,
          prompt: reason,
        },
        selectedTone
      );

      if (res.success && res.data && res.data.body) {
        const cleanBody = res.data.body.replace(/CrackWithAI Team/gi, '[Your Name]');
        setGeneratedEmail({
          subject: res.data.subject || 'Email Update',
          body: cleanBody,
          to: to || undefined,
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
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Icon name="chevron-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerSubtitle}>AI TOOL</Text>
          <Text style={styles.headerTitle}>AI Email Writer</Text>
        </View>
        <TouchableOpacity
          style={styles.headerRightBtn}
          onPress={() => {
            setTo('');
            setReason('');
            setGeneratedEmail(null);
          }}
        >
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* DOODLE ANNOTATION 1: TOP / "WHO SHOULD WE SEND THIS TO?" */}
        <View style={styles.topDoodleContainer}>
          <View style={styles.speechBubble}>
            <Text style={styles.speechBubbleText}>Who should we send this to?</Text>
          </View>
          <View style={styles.speechTailUp} />
          <View style={styles.faceDoodleSmall}>
            <Text style={styles.faceEyes}>••</Text>
          </View>
        </View>

        {/* 1. RECIPIENT EMAIL / TO FIELD */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Recipient Email (To)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="jane@company.com"
            placeholderTextColor="#94A3B8"
            value={to}
            onChangeText={setTo}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* 2. TONE SELECTOR */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Select Tone</Text>
          <View style={styles.toneContainer}>
            {(['professional', 'formal', 'informal'] as const).map((t) => {
              const isSelected = selectedTone === t;
              const label = t === 'professional' ? '💼 Professional' : t === 'formal' ? '📜 Formal' : '💬 Informal';
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.toneChip, isSelected && styles.toneChipSelected]}
                  onPress={() => setSelectedTone(t)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toneChipText, isSelected && styles.toneChipTextSelected]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. REASON FOR EMAIL FIELD (WITH DOODLE ANNOTATIONS) */}
        <View style={styles.bodyFieldContainer}>
          {/* DOODLE ANNOTATION: STANDING CHARACTER */}
          <View style={styles.leftStandingDoodle}>
            <View style={styles.faceDoodleSmall}>
              <Text style={styles.faceEyes}>••</Text>
            </View>
            <View style={styles.stickBody} />
            <View style={styles.stickArmRight} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.labelWithDoodleRow}>
              <Text style={styles.fieldLabel}>Reason for Email</Text>
              <View style={styles.speechBubbleMiniInline}>
                <Text style={styles.speechBubbleTextMini}>Type keywords or reason</Text>
              </View>
            </View>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="e.g. need sick leave tomorrow due to fever, or asking for salary review"
              placeholderTextColor="#94A3B8"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* 4. GENERATE BUTTON */}
        <TouchableOpacity
          style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
          onPress={handleGenerateEmail}
          activeOpacity={0.85}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#0F172A" size="small" />
          ) : (
            <Text style={styles.generateBtnText}>Generate my email</Text>
          )}
        </TouchableOpacity>

        {/* 5. GENERATED EMAIL RESULT CARD */}
        {generatedEmail && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <View style={styles.resultBadge}>
                <Icon name="check-circle" size={16} color="#059669" />
                <Text style={styles.resultBadgeText}>Email Ready</Text>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={handleCopyEmail}
                activeOpacity={0.75}
              >
                <Icon name={copied ? "check" : "copy"} size={14} color="#6D28D9" />
                <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy email'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.resultDivider} />

            <View style={styles.resultItemRow}>
              <Text style={styles.resultItemLabel}>Subject:</Text>
              <Text style={styles.resultItemValueSubject}>{generatedEmail.subject}</Text>
            </View>

            {generatedEmail.to && (
              <View style={styles.resultItemRow}>
                <Text style={styles.resultItemLabel}>To:</Text>
                <Text style={styles.resultItemValue}>{generatedEmail.to}</Text>
              </View>
            )}

            <View style={[styles.resultItemRow, { flexDirection: 'column', alignItems: 'flex-start', marginTop: 8 }]}>
              <Text style={styles.resultItemLabel}>Body:</Text>
              <View style={styles.bodyBox}>
                <Text style={styles.resultBodyText}>{generatedEmail.body}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.copyEmailBottomBtn, copied && styles.copyEmailBottomBtnSuccess]}
              onPress={handleCopyEmail}
              activeOpacity={0.8}
            >
              <Icon name={copied ? "check" : "copy"} size={16} color="#FFFFFF" />
              <Text style={styles.copyEmailBottomBtnText}>
                {copied ? '✓ Email Copied to Clipboard!' : 'Copy Complete Email'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRightBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  topDoodleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  speechBubbleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  speechTailUp: {
    width: 6,
    height: 6,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#0F172A',
    transform: [{ rotate: '-45deg' }],
    marginTop: -3,
    marginBottom: 2,
    backgroundColor: '#FFFFFF',
  },
  faceDoodleSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceEyes: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: -2,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  labelWithDoodleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  speechBubbleMiniInline: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  speechBubbleTextMini: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  bodyFieldContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  leftStandingDoodle: {
    alignItems: 'center',
    marginRight: 10,
    marginTop: 28,
  },
  stickBody: {
    width: 2,
    height: 18,
    backgroundColor: '#0F172A',
    marginTop: 1,
  },
  stickArmRight: {
    position: 'absolute',
    top: 24,
    right: -6,
    width: 8,
    height: 2,
    backgroundColor: '#0F172A',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  multilineInput: {
    minHeight: 120,
  },
  toneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toneChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  toneChipSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  toneChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  toneChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  generateBtn: {
    backgroundColor: '#FDE047',
    borderWidth: 1,
    borderColor: '#EAB308',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  generateBtnDisabled: {
    opacity: 0.7,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  resultCard: {
    marginTop: 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
    marginLeft: 6,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D28D9',
    marginLeft: 4,
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  resultItemRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  resultItemLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    width: 65,
  },
  resultItemValueSubject: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  resultItemValue: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
  },
  bodyBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
  },
  resultBodyText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 20,
  },
  copyEmailBottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  copyEmailBottomBtnSuccess: {
    backgroundColor: '#059669',
  },
  copyEmailBottomBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
  },
});
