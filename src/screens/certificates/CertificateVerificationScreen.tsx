import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { certificateApi } from '../../api/certificateApi';
import { Icon } from '../../components/Icon';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export const CertificateVerificationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { certificateId: routeCertId } = route.params || {};

  const [inputCode, setInputCode] = useState<string>(routeCertId || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performVerification = useCallback(async (codeToVerify: string) => {
    const clean = codeToVerify.trim();
    if (!clean) {
      setError('Please enter a Certificate ID or verification code.');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await certificateApi.verifyCertificate(clean);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || 'No certificate found matching this credential.');
      }
    } catch (err: any) {
      setError(
        err.message || 'Unable to verify certificate. Please check the ID and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (routeCertId) {
      performVerification(routeCertId);
    }
  }, [routeCertId, performVerification]);

  const handleShare = async () => {
    if (!result) return;
    const certId = result.certificateId || result.certificateNumber || inputCode;
    const studentName = result.studentName || result.recipientName || 'Student';
    const courseTitle = result.title || result.courseName || 'Full Stack Web Development';
    try {
      await Share.share({
        title: `CrackWithAI Verified Credential: ${studentName}`,
        message: `Verified Credential:\n${studentName} has completed "${courseTitle}" from CrackWithAI.\nCertificate ID: ${certId}\nStatus: Verified Authentic ✓`
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const technologies = result?.metadata?.technologies || [
    'HTML5 & Semantic Web',
    'CSS3, Flexbox & Grid',
    'JavaScript (ES6+)',
    'Node.js Runtime',
    'Express.js Framework',
    'MongoDB & Mongoose',
    'REST APIs',
    'JWT Authentication',
    'Full Stack Capstone'
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credential Verification</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Verification Intro Card */}
        <View style={styles.introCard}>
          <View style={styles.shieldIconWrap}>
            <Icon name="shield" size={24} color="#6366F1" />
          </View>
          <Text style={styles.introTitle}>Public Certificate Verification</Text>
          <Text style={styles.introSubtitle}>
            Verify the authenticity of any CrackWithAI credential by entering the Certificate ID or Verification Code below.
          </Text>

          {/* Search Input Bar */}
          <View style={styles.searchBar}>
            <Icon name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="e.g. CWA-FS-2026-XXXXXX"
              placeholderTextColor="#64748B"
              value={inputCode}
              onChangeText={setInputCode}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => performVerification(inputCode)}
            />
            {inputCode.length > 0 && (
              <TouchableOpacity onPress={() => setInputCode('')}>
                <Icon name="x" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={() => performVerification(inputCode)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="check-circle" size={16} color="#FFFFFF" />
                <Text style={styles.verifyBtnText}>Verify Credential</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Error Feedback */}
        {error && (
          <View style={styles.errorCard}>
            <Icon name="alert-triangle" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Verification Success Result */}
        {result && (
          <View style={styles.resultCard}>
            {/* Status Header Badge */}
            <View style={styles.resultStatusRow}>
              <View style={styles.verifiedPill}>
                <Icon name="check" size={14} color="#10B981" />
                <Text style={styles.verifiedPillText}>VERIFIED AUTHENTIC</Text>
              </View>
              <Text style={styles.resultIssuer}>CrackWithAI Registry</Text>
            </View>

            <Text style={styles.resultSubLabel}>RECIPIENT NAME</Text>
            <Text style={styles.resultRecipient}>
              {result.studentName || result.recipientName || 'Student'}
            </Text>

            <View style={styles.resultDivider} />

            <Text style={styles.resultSubLabel}>COURSE COMPLETED</Text>
            <Text style={styles.resultCourse}>
              {result.title || result.courseName || 'Full Stack Web Development'}
            </Text>

            {/* Details Table */}
            <View style={styles.detailsTable}>
              <View style={styles.tableRow}>
                <Text style={styles.tableKey}>Certificate ID</Text>
                <Text style={styles.tableVal}>
                  {result.certificateId || result.certificateNumber || inputCode}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableKey}>Issued On</Text>
                <Text style={styles.tableVal}>
                  {result.issuedAt || result.issueDate
                    ? new Date(result.issuedAt || result.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'Verified'}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableKey}>Status</Text>
                <Text style={[styles.tableVal, { color: '#10B981', fontWeight: '700' }]}>
                  Active & Valid
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableKey}>Issuer</Text>
                <Text style={styles.tableVal}>CrackWithAI Certification Authority</Text>
              </View>
            </View>

            {/* Technologies Verified */}
            <Text style={[styles.resultSubLabel, { marginTop: 14, marginBottom: 8 }]}>
              CURRICULUM MODULES MASTERED
            </Text>
            <View style={styles.techChipsRow}>
              {technologies.map((t: string, i: number) => (
                <View key={i} style={styles.techChip}>
                  <Icon name="check-circle" size={11} color="#10B981" />
                  <Text style={styles.techChipText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* Share Verified Record */}
            <TouchableOpacity style={styles.shareRecordBtn} onPress={handleShare}>
              <Icon name="share-2" size={16} color="#FFFFFF" />
              <Text style={styles.shareRecordBtnText}>Share Verified Record</Text>
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
    backgroundColor: '#070B14'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600'
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  introCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
    alignItems: 'center'
  },
  shieldIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  introTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6
  },
  introSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
    marginBottom: 14
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    height: 46,
    width: '100%'
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 16
  },
  errorText: {
    flex: 1,
    color: '#F87171',
    fontSize: 13,
    lineHeight: 18
  },
  resultCard: {
    backgroundColor: '#0B1120',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6
  },
  resultStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)'
  },
  verifiedPillText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800'
  },
  resultIssuer: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600'
  },
  resultSubLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  resultRecipient: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginBottom: 12
  },
  resultCourse: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16
  },
  detailsTable: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tableKey: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600'
  },
  tableVal: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600'
  },
  techChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 18
  },
  techChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155'
  },
  techChipText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600'
  },
  shareRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 13
  },
  shareRecordBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
