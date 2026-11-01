import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Share,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { certificateApi } from '../../api/certificateApi';
import { fullstackApi } from '../../api/fullstackApi';
import { Certificate } from '../../types';
import { CertificateModal } from '../../components/CertificateModal';
import { Icon } from '../../components/Icon';

const SANS_SERIF_FONT = Platform.OS === 'android' ? 'Roboto' : undefined;

export const CertificatesScreen = ({ navigation, route }: any) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const requestedId = route?.params?.certificateId as string | undefined;
  const openedId = useRef<string>();
  const requestGeneration = useRef<number>(0);

  const fetchCertificates = useCallback(async () => {
    const generation = ++requestGeneration.current;
    try {
      setError(null);
      const [certRes, fsProgress] = await Promise.allSettled([
        certificateApi.getMyCertificates(),
        fullstackApi.getFullStackProgress(),
      ]);

      if (generation !== requestGeneration.current) return;

      const loadedList: Certificate[] = [];

      if (certRes.status === 'fulfilled' && certRes.value?.success && Array.isArray(certRes.value.data)) {
        loadedList.push(...certRes.value.data);
      }

      // Check if Full Stack certificate exists and merge if missing
      if (fsProgress.status === 'fulfilled' && fsProgress.value?.certificate) {
        const fsCert = fsProgress.value.certificate;
        const exists = loadedList.some(
          c => c.certificateNumber === (fsCert.certificateNumber || fsCert.verificationCode || fsCert.certificateId) ||
               c._id === fsCert.id
        );
        if (!exists) {
          loadedList.unshift({
            _id: fsCert.id || 'fs-cert-id',
            user: '',
            course: '',
            courseName: fsCert.courseName || 'Full Stack Web Development',
            recipientName: fsCert.recipientName,
            certificateNumber: fsCert.certificateNumber || fsCert.verificationCode || fsCert.certificateId || 'CWA-FS',
            issueDate: fsCert.issuedAt || new Date().toISOString(),
            verificationCode: fsCert.verificationCode || fsCert.certificateNumber || 'CWA-FS-VERIFIED',
            percentage: fsCert.percentage || 100,
            status: 'active',
          });
        }
      }

      setCertificates(loadedList);

      if (requestedId && openedId.current !== requestedId) {
        const selected = loadedList.find(item => (item._id === requestedId || item.certificateNumber === requestedId) && item.status === 'active');
        if (selected) {
          setSelectedCert(selected);
          openedId.current = requestedId;
        }
      }
    } catch (err: any) {
      if (generation !== requestGeneration.current) return;
      setError(err?.message || 'Unable to load certificates. Please try again.');
    } finally {
      if (generation !== requestGeneration.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestedId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void fetchCertificates();
      return () => {
        requestGeneration.current++;
      };
    }, [fetchCertificates])
  );

  const handleShareCertificate = async (cert: Certificate) => {
    const title = typeof cert.course === 'object' ? cert.course.title : cert.courseName || 'CrackWithAI Course';
    const code = cert.verificationCode || cert.certificateNumber;
    try {
      await Share.share({
        title: 'CrackWithAI Certificate - ' + title,
        message: `Official CrackWithAI Certificate of Completion for "${title}"! Verification Code: ${code} - https://crackwithai.com`,
      });
    } catch (e) {
      console.warn('[CertificatesScreen] Share error:', e);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'HomeTab' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER BAR */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <Icon name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            My Certificates
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Verified Credentials & Achievements
          </Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <FlatList
        data={loading || error ? [] : certificates}
        keyExtractor={item => item._id || item.certificateNumber}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchCertificates();
            }}
            tintColor="#5653FE"
          />
        }
        ListHeaderComponent={
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <View style={styles.summaryIconBox}>
                <Image
                  source={require('../../assets/menu-icons/certificate.png')}
                  style={styles.summaryIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.summaryTextCol}>
                <Text style={styles.summaryTitle}>Accredited Credentials</Text>
                <Text style={styles.summarySub}>
                  Official certificates issued upon 100% syllabus mastery & code verification.
                </Text>
              </View>
            </View>

            <View style={styles.summaryBadgeRow}>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>
                  {certificates.length} {certificates.length === 1 ? 'Certificate Earned' : 'Certificates Earned'}
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#5653FE" />
              <Text style={styles.emptyLoadingText}>Loading your certificates…</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Unable to load certificates</Text>
              <Text style={styles.emptySub}>{error}</Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => {
                  setLoading(true);
                  fetchCertificates();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyActionBtnText} numberOfLines={1}>Try Again ➔</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Image
                source={require('../../assets/brand/certificate_rosette.png')}
                style={styles.emptyRosetteImage}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>No Certificates Earned Yet</Text>
              <Text style={styles.emptySub}>
                Complete 100% of any course curriculum in learning to automatically unlock your official certificate here.
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => navigation.navigate('FullStackRoadmap')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyActionBtnText} numberOfLines={1}>Explore Courses ➔</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item }) => {
          const courseTitle = typeof item.course === 'object' ? item.course.title : item.courseName || 'Full Stack Course';
          const issueDate = item.issueDate
            ? new Date(item.issueDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Verified';
          const certId = item.certificateNumber || item.verificationCode || item._id;
          const student = item.recipientName || item.userName || 'Student';

          return (
            <View style={styles.certCard}>
              <View style={styles.certCardTopRow}>
                <Image
                  source={require('../../assets/brand/certificate_rosette.png')}
                  style={styles.certRosette}
                  resizeMode="contain"
                />

                <View style={styles.certHeaderMetaCol}>
                  <View style={styles.verifiedTag}>
                    <Text style={styles.verifiedTagText}>OFFICIAL 100% COMPLETION</Text>
                  </View>
                  <Text style={styles.certCourseTitle} numberOfLines={2}>
                    {courseTitle}
                  </Text>
                  <Text style={styles.certStudentText} numberOfLines={1}>
                    Awarded to {student} · {issueDate}
                  </Text>
                </View>
              </View>

              <View style={styles.certDivider} />

              <View style={styles.certDetailsRow}>
                <View style={styles.certDetailItem}>
                  <Text style={styles.certDetailLabel}>VERIFICATION ID</Text>
                  <Text style={styles.certDetailValue} numberOfLines={1} selectable>
                    {certId}
                  </Text>
                </View>
                <View style={styles.certDetailItem}>
                  <Text style={styles.certDetailLabel}>STATUS</Text>
                  <Text style={[styles.certDetailValue, { color: '#059669' }]}>
                    Active & Verified ✓
                  </Text>
                </View>
              </View>

              <View style={styles.certActionsRow}>
                <TouchableOpacity
                  style={styles.viewCertBtn}
                  activeOpacity={0.85}
                  onPress={() => setSelectedCert(item)}
                >
                  <Text style={styles.viewCertBtnText} numberOfLines={1}>
                    View Official Certificate ➔
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareCertBtn}
                  activeOpacity={0.8}
                  onPress={() => handleShareCertificate(item)}
                >
                  <Text style={styles.shareCertBtnText} numberOfLines={1}>
                    Share Certificate
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <CertificateModal
        visible={Boolean(selectedCert)}
        certificate={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: SANS_SERIF_FONT,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: SANS_SERIF_FONT,
    marginTop: 1,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  listContent: {
    padding: 18,
    paddingBottom: 40,
    gap: 16,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },

  /* SUMMARY CARD */
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  summaryIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIcon: {
    width: 28,
    height: 28,
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: SANS_SERIF_FONT,
  },
  summarySub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
    fontFamily: SANS_SERIF_FONT,
  },
  summaryBadgeRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  countPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#059669',
    fontFamily: SANS_SERIF_FONT,
  },

  /* CERTIFICATE CARD */
  certCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  certCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  certRosette: {
    width: 58,
    height: 58,
  },
  certHeaderMetaCol: {
    flex: 1,
  },
  verifiedTag: {
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 4,
  },
  verifiedTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
    fontFamily: SANS_SERIF_FONT,
  },
  certCourseTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: SANS_SERIF_FONT,
    letterSpacing: -0.2,
    marginBottom: 2,
    lineHeight: 22,
  },
  certStudentText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: SANS_SERIF_FONT,
  },
  certDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  certDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  certDetailItem: {
    flex: 1,
  },
  certDetailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    fontFamily: SANS_SERIF_FONT,
  },
  certDetailValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    fontFamily: SANS_SERIF_FONT,
  },

  /* ACTION BUTTONS (TEXT-ONLY, NO ICONS, ZERO TEXT BREAKING) */
  certActionsRow: {
    gap: 10,
  },
  viewCertBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  viewCertBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.1,
    fontFamily: SANS_SERIF_FONT,
  },
  shareCertBtn: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCertBtnText: {
    color: '#334155',
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: SANS_SERIF_FONT,
  },

  /* EMPTY STATES */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyRosetteImage: {
    width: 72,
    height: 72,
    marginBottom: 16,
    opacity: 0.75,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: SANS_SERIF_FONT,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: SANS_SERIF_FONT,
  },
  emptyLoadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontFamily: SANS_SERIF_FONT,
  },
  emptyActionBtn: {
    backgroundColor: '#5653FE',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#5653FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    fontFamily: SANS_SERIF_FONT,
  },
});
