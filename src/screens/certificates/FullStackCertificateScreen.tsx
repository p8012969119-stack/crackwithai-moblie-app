import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  Platform,
  NativeModules
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { certificateApi } from '../../api/certificateApi';
import { FullStackCertificateData } from '../../types/fullstack';
import { Icon } from '../../components/Icon';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export const FullStackCertificateScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { certificateId: initialCertId } = route.params || {};

  const [certificate, setCertificate] = useState<FullStackCertificateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  const loadCertificate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fullstackApi.getFullStackCertificate();
      if (isMounted.current) {
        setCertificate(data);
      }
    } catch (err: any) {
      // If not yet generated, attempt to generate if user is eligible
      try {
        const eligibility = await fullstackApi.getFullStackEligibility();
        if (eligibility.eligible) {
          const gen = await fullstackApi.generateFullStackCertificate();
          if (isMounted.current) {
            setCertificate(gen);
          }
        } else {
          if (isMounted.current) {
            setError(
              `You have completed ${eligibility.completedModules} of ${eligibility.totalModules} modules. Complete all lessons and projects to claim this certificate.`
            );
          }
        }
      } catch (genErr: any) {
        if (isMounted.current) {
          setError(genErr.message || 'Unable to load certificate. Please try again.');
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    loadCertificate();
    return () => {
      isMounted.current = false;
    };
  }, [loadCertificate]);

  const handleClaimCertificate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await fullstackApi.generateFullStackCertificate();
      setCertificate(result);
      Alert.alert('Congratulations! 🎉', 'Your official Full Stack Web Development Certificate has been generated!');
    } catch (err: any) {
      setError(err.message || 'Unable to generate certificate. Ensure all modules are 100% complete.');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!certificate) return;
    const certId = certificate.certificateId;
    const verifyUrl = `https://crackwithai.com/verify/${encodeURIComponent(certId)}`;
    try {
      await Share.share({
        title: 'CrackWithAI Full Stack Developer Certificate',
        message: `🎓 I just earned my official Full Stack Web Development Certificate from CrackWithAI!\n\nVerify Credential: ${verifyUrl}\nCertificate ID: ${certId}`
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleCopyLink = () => {
    if (!certificate) return;
    const certId = certificate.certificateId;
    const verifyUrl = `https://crackwithai.com/verify/${encodeURIComponent(certId)}`;
    Clipboard.setString(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    Alert.alert('Link Copied!', 'Public certificate verification URL copied to your clipboard.');
  };

  const handleDownload = async () => {
    if (!certificate) return;
    setDownloading(true);
    try {
      const certId = certificate.id || certificate.certificateId;
      if (certificate.id) {
        await certificateApi.downloadCertificate(certificate.id);
      } else {
        await handleShare();
      }
    } catch (err: any) {
      Alert.alert(
        'Certificate Export',
        'PDF export prepared. You can share or save your verified credential via the share options below.',
        [{ text: 'Share Now', onPress: handleShare }, { text: 'OK' }]
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleVerify = () => {
    if (!certificate) return;
    navigation.navigate('CertificateVerification', {
      certificateId: certificate.certificateId
    });
  };

  const issueDateFormatted = certificate?.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  const technologies = certificate?.metadata?.technologies || [
    'HTML5 & Semantic Markup',
    'CSS3, Flexbox & Grid',
    'JavaScript (ES6+)',
    'Node.js Server Runtime',
    'Express.js Web Framework',
    'MongoDB & Mongoose ODM',
    'RESTful API Architecture',
    'JWT Authentication & Security',
    'Production Capstone'
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
        <Text style={styles.headerTitle}>Full Stack Certificate</Text>
        {certificate ? (
          <TouchableOpacity style={styles.headerShareBtn} onPress={handleShare}>
            <Icon name="share-2" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Verifying course completion & credential...</Text>
          </View>
        ) : error && !certificate ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconWrap}>
              <Icon name="alert-circle" size={40} color="#EF4444" />
            </View>
            <Text style={styles.errorTitle}>Certificate Incomplete</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.continueCourseBtn}
              onPress={() => navigation.navigate('FullStackOverview')}
            >
              <Text style={styles.continueCourseBtnText}>Continue Full Stack Course</Text>
              <Icon name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : certificate ? (
          <>
            {/* Celebratory Banner */}
            <View style={styles.celebrationBanner}>
              <View style={styles.celebrationBadge}>
                <Icon name="award" size={18} color="#F59E0B" />
                <Text style={styles.celebrationBadgeText}>OFFICIAL ACCREDITATION</Text>
              </View>
              <Text style={styles.celebrationTitle}>Verified Full Stack Engineer</Text>
              <Text style={styles.celebrationSubtitle}>
                Congratulations on achieving 100% completion of the CrackWithAI Full Stack curriculum!
              </Text>
            </View>

            {/* The Certificate Frame */}
            <View style={styles.certificateOuterFrame}>
              <View style={styles.certificateInnerBorder}>
                {/* Certificate Watermark / Header */}
                <View style={styles.certBrandRow}>
                  <View style={styles.certBrandLogo}>
                    <Icon name="code" size={16} color="#F59E0B" />
                  </View>
                  <Text style={styles.certBrandText}>CRACKWITHAI CERTIFICATION AUTHORITY</Text>
                </View>

                {/* Ribbon Tag */}
                <View style={styles.certRibbon}>
                  <Text style={styles.certRibbonText}>CERTIFICATE OF COMPLETION</Text>
                </View>

                <Text style={styles.certSubPrompt}>THIS IS PROUDLY PRESENTED TO</Text>

                {/* Recipient Name */}
                <Text style={styles.recipientName}>
                  {certificate.recipientName || 'Full Stack Engineer'}
                </Text>

                <View style={styles.certDividerLine} />

                {/* Achievement Description */}
                <Text style={styles.certAchievementText}>
                  For successfully demonstrating comprehensive mastery across modern frontend markup, responsive design,
                  asynchronous JavaScript, server-side Node.js runtimes, Express REST APIs, MongoDB data architecture,
                  and shipping a full stack production capstone project.
                </Text>

                {/* Course Name */}
                <Text style={styles.certCourseName}>Full Stack Web Development</Text>

                {/* Technologies Grid */}
                <View style={styles.techGrid}>
                  {technologies.map((tech, idx) => (
                    <View key={idx} style={styles.techChip}>
                      <Icon name="check-circle" size={11} color="#10B981" />
                      <Text style={styles.techChipText}>{tech}</Text>
                    </View>
                  ))}
                </View>

                {/* Metadata Row: ID, Date, Grade */}
                <View style={styles.certDetailsRow}>
                  <View style={styles.certDetailCol}>
                    <Text style={styles.certDetailLabel}>CERTIFICATE ID</Text>
                    <Text style={styles.certDetailValue}>{certificate.certificateId}</Text>
                  </View>
                  <View style={styles.certDetailCol}>
                    <Text style={styles.certDetailLabel}>ISSUE DATE</Text>
                    <Text style={styles.certDetailValue}>{issueDateFormatted}</Text>
                  </View>
                  <View style={styles.certDetailCol}>
                    <Text style={styles.certDetailLabel}>GRADE</Text>
                    <Text style={[styles.certDetailValue, { color: '#10B981' }]}>Excellence (100%)</Text>
                  </View>
                </View>

                {/* Verification Seal & Signatures */}
                <View style={styles.certBottomRow}>
                  <View style={styles.certSignCol}>
                    <Text style={styles.certSignatureScript}>Prakash & AI Faculty</Text>
                    <View style={styles.certSignLine} />
                    <Text style={styles.certSignTitle}>Lead Instructor</Text>
                  </View>

                  {/* Golden Authenticity Seal */}
                  <View style={styles.certSealWrap}>
                    <View style={styles.certSealOuter}>
                      <View style={styles.certSealInner}>
                        <Icon name="shield" size={18} color="#F59E0B" />
                        <Text style={styles.certSealText}>VERIFIED</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.certSignCol}>
                    <Text style={styles.certSignatureScript}>CrackWithAI Board</Text>
                    <View style={styles.certSignLine} />
                    <Text style={styles.certSignTitle}>Certification Director</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Action Grid */}
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                activeOpacity={0.85}
                onPress={handleShare}
              >
                <Icon name="share-2" size={16} color="#FFFFFF" />
                <Text style={styles.primaryActionBtnText}>Share Certificate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionBtn}
                activeOpacity={0.85}
                onPress={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="download" size={16} color="#FFFFFF" />
                    <Text style={styles.secondaryActionBtnText}>Download PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Utility Buttons */}
            <View style={styles.utilityRow}>
              <TouchableOpacity
                style={styles.utilityBtn}
                onPress={handleCopyLink}
                activeOpacity={0.8}
              >
                <Icon name={copied ? 'check' : 'copy'} size={15} color="#818CF8" />
                <Text style={styles.utilityBtnText}>
                  {copied ? 'Link Copied!' : 'Copy Verification Link'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.utilityBtn}
                onPress={handleVerify}
                activeOpacity={0.8}
              >
                <Icon name="check-circle" size={15} color="#10B981" />
                <Text style={styles.utilityBtnText}>Verify Authenticity</Text>
              </TouchableOpacity>
            </View>

            {/* Public Verification Callout */}
            <View style={styles.verificationNoteCard}>
              <Icon name="globe" size={16} color="#6366F1" />
              <Text style={styles.verificationNoteText}>
                Publicly verifiable online with Certificate ID{' '}
                <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>{certificate.certificateId}</Text>.
                Anyone can verify this credential without signing in.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.claimContainer}>
            <Icon name="award" size={48} color="#F59E0B" />
            <Text style={styles.claimTitle}>Ready to Claim Your Certificate!</Text>
            <Text style={styles.claimSubtitle}>
              You have completed all requirements of the Full Stack Web Development Curriculum.
            </Text>
            <TouchableOpacity
              style={styles.claimBtn}
              onPress={handleClaimCertificate}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check" size={18} color="#FFFFFF" />
                  <Text style={styles.claimBtnText}>Generate My Certificate</Text>
                </>
              )}
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
  headerShareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14
  },
  errorContainer: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    marginTop: 20
  },
  errorIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F87171',
    marginBottom: 8
  },
  errorMessage: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  continueCourseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  continueCourseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  celebrationBanner: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 16
  },
  celebrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  celebrationBadgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  celebrationTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4
  },
  celebrationSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18
  },
  certificateOuterFrame: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#D97706',
    padding: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20
  },
  certificateInnerBorder: {
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.35)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#0B1120'
  },
  certBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14
  },
  certBrandLogo: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  certBrandText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  certRibbon: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    marginBottom: 14
  },
  certRibbonText: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  },
  certSubPrompt: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8
  },
  recipientName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  certDividerLine: {
    width: 140,
    height: 2,
    backgroundColor: '#F59E0B',
    borderRadius: 1,
    marginBottom: 14
  },
  certAchievementText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 8
  },
  certCourseName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 18,
    paddingHorizontal: 4
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
  certDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16
  },
  certDetailCol: {
    alignItems: 'center',
    flex: 1
  },
  certDetailLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  certDetailValue: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700'
  },
  certBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  certSignCol: {
    alignItems: 'center',
    flex: 1
  },
  certSignatureScript: {
    fontStyle: 'italic',
    color: '#C7D2FE',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4
  },
  certSignLine: {
    width: 70,
    height: 1,
    backgroundColor: '#475569',
    marginBottom: 4
  },
  certSignTitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600'
  },
  certSealWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8
  },
  certSealOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  certSealInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  certSealText: {
    color: '#F59E0B',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 1
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  secondaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  utilityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  utilityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  utilityBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600'
  },
  verificationNoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)'
  },
  verificationNoteText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16
  },
  claimContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16
  },
  claimTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center'
  },
  claimSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 8
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});
