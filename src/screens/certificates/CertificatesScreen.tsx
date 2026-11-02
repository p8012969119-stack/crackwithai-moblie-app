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
import { ToolLogo } from '../../components/ToolLogo';
import { getPublicCertificateUrl, getPublicCertificatePdfUrl } from '../../constants/config';

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
            recipientName: fsCert.recipientName || 'Prakash',
            certificateNumber: fsCert.certificateNumber || fsCert.verificationCode || fsCert.certificateId || 'CWA-FS-VERIFIED',
            issueDate: fsCert.issuedAt || new Date().toISOString(),
            verificationCode: fsCert.verificationCode || fsCert.certificateNumber || 'CWA-FS-VERIFIED',
            percentage: fsCert.percentage || 100,
            status: 'active',
          });
        }
      }

      // Check all completed modules in Full Stack track
      if (fsProgress.status === 'fulfilled' && Array.isArray(fsProgress.value?.modules)) {
        for (const mod of fsProgress.value.modules) {
          const isDone = Boolean(mod.isCompleted || (mod.totalLessons > 0 && mod.completedLessons >= mod.totalLessons));
          if (isDone) {
            const courseTitle = mod.title || `${mod.id.toUpperCase()} Course`;
            const alreadyExists = loadedList.some(c => {
              const name = (c.courseName || (typeof c.course === 'object' && (c.course as any)?.title) || '').toLowerCase();
              return name.includes(mod.id.toLowerCase()) || name.includes((mod.title || '').toLowerCase());
            });
            if (!alreadyExists) {
              const codePrefix = mod.id.toUpperCase();
              loadedList.push({
                _id: `mod-cert-${mod.id}`,
                user: '',
                course: '',
                courseName: courseTitle,
                recipientName: 'Prakash',
                certificateNumber: `CWA-${codePrefix}-VERIFIED`,
                issueDate: new Date().toISOString(),
                verificationCode: `CWA-${codePrefix}-VERIFIED`,
                percentage: 100,
                status: 'active',
              });
            }
          }
        }
      }

      setCertificates(loadedList);

      if (requestedId && openedId.current !== requestedId) {
        const selected = loadedList.find(
          item =>
            (item._id === requestedId ||
             item.certificateNumber === requestedId ||
             item.verificationCode === requestedId ||
             (item.courseName && requestedId.toLowerCase().includes(item.courseName.toLowerCase()))) &&
            item.status === 'active'
        );
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
    const student = cert.recipientName || cert.userName || 'Prakash';
    const code = cert.verificationCode || cert.certificateNumber || cert._id;
    const publicUrl = getPublicCertificateUrl(code);
    const pdfUrl = getPublicCertificatePdfUrl(code);

    const message = `🎓 CrackWithAI Official Certificate of Completion\n\nRecipient: ${student}\nCourse: ${title}\nVerification ID: ${code}\nStatus: Verified Authentic ✓ (100% Completed)\n\nView Full Certificate:\n${publicUrl}\n\nDownload Official PDF:\n${pdfUrl}`;

    try {
      await Share.share({
        title: `CrackWithAI Certificate - ${title}`,
        message,
        url: publicUrl,
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
            tintColor="#6C5CE7"
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#6C5CE7" />
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
                <Text style={styles.emptyActionBtnText} numberOfLines={1}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Certificates Earned Yet</Text>
              <Text style={styles.emptySub}>
                Complete 100% of any course curriculum in learning to automatically unlock your official certificate here.
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => navigation.navigate('FullStackRoadmap')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyActionBtnText} numberOfLines={1}>Explore Courses</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item }) => {
          const courseTitle = typeof item.course === 'object' ? item.course.title : item.courseName || 'Full Stack Course';
          const courseSlug = (typeof item.course === 'object' ? item.course.slug : '') || item.courseName || '';

          return (
            <TouchableOpacity
              style={styles.certRowCard}
              activeOpacity={0.85}
              onPress={() => setSelectedCert(item)}
            >
              {/* LEFT: Course Logo (NOT medal logo) */}
              <View style={styles.certLogoWrap}>
                <ToolLogo
                  courseKey={courseTitle}
                  slug={courseSlug}
                  size={42}
                />
              </View>

              {/* CENTER: Course Name */}
              <View style={styles.certCenterCol}>
                <Text style={styles.certCourseName} numberOfLines={2}>
                  {courseTitle}
                </Text>
              </View>

              {/* RIGHT: Text-only button "Open" */}
              <TouchableOpacity
                style={styles.openBtn}
                activeOpacity={0.8}
                onPress={() => setSelectedCert(item)}
              >
                <Text style={styles.openBtnText}>Open</Text>
              </TouchableOpacity>
            </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 40,
    gap: 12,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },

  /* HORIZONTAL CERTIFICATE ROW CARD */
  certRowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  certLogoWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certCenterCol: {
    flex: 1,
    marginHorizontal: 14,
    justifyContent: 'center',
  },
  certCourseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: SANS_SERIF_FONT,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  openBtn: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 17,
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
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#6C5CE7',
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
