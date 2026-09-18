import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, RefreshControl, Share, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { certificateApi } from '../../api/certificateApi';
import { Certificate } from '../../types';
import { CertificateModal } from '../../components/CertificateModal';
import { LearningIcon, LearningSkeleton, LearningEmpty, StatusBadge, ActionButton, learningStyles as s, palette } from '../../components/learning/LearningLayout';
export const CertificatesScreen = ({
  navigation, route
}: any) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestedId = route?.params?.certificateId as string | undefined;
  const openedId = useRef<string>();
  const requestGeneration = useRef(0);
  const fetchCertificates = useCallback(async () => {
    const generation = ++requestGeneration.current;
    try {
      setError(null);
      const res = await certificateApi.getMyCertificates();
      if (generation !== requestGeneration.current) return;
      if (res.success) {
        setCertificates(res.data || []);
        if (requestedId && openedId.current !== requestedId) {
          const selected = res.data.find(item => item._id === requestedId && item.status === 'active');
          if (selected) {setSelectedCert(selected); openedId.current = requestedId;}
          else setError('This certificate is not available. Please try again.');
        }
      }
    } catch (err: any) {
      if (generation !== requestGeneration.current) return;
      setError(err.message || 'Unable to load your certificates. Please try again.');
    } finally {
      if (generation !== requestGeneration.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestedId]);
  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchCertificates();
    return () => {requestGeneration.current++;};
  }, [fetchCertificates]));
  const handleShareCertificate = async (cert: Certificate) => {
    const title = typeof cert.course === 'object' ? cert.course.title : cert.courseName || 'CrackWithAI Course';
    const code = cert.verificationCode || cert.certificateNumber;
    try {
      await Share.share({
        title: 'CrackWithAI Certificate - ' + title,
        message: 'Check out my official CrackWithAI completion certificate for "' + title + '"! Verification Code: ' + code
      });
    } catch (e) {
      console.warn('[CertificatesScreen] Share error:', e);
    }
  };
  return <SafeAreaView style={s.screen}>
    <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" style={{
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center'
      }} onPress={() => {
        if (navigation.canGoBack()) navigation.goBack();else navigation.navigate('MainTabs');
      }}><LearningIcon name="back" /></Pressable><Text style={s.small}>Your achievements</Text></View>
    <FlatList data={loading || error ? [] : certificates} keyExtractor={item => item._id} contentContainerStyle={{
      padding: 20,
      gap: 16,
      paddingBottom: 32,
      maxWidth: 680,
      width: '100%',
      alignSelf: 'center'
    }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
      setRefreshing(true);
      fetchCertificates();
    }} tintColor={palette.purple} />} ListHeaderComponent={<View style={{
      gap: 12,
      paddingBottom: 12
    }}><Text style={s.label}>CRACKWITHAI / ACHIEVEMENTS</Text><Text style={s.title}>Certificates</Text><Text style={[s.body, s.muted]}>A lasting record of the skills you’ve earned.</Text>{!loading && !error && <Text style={s.small}>{certificates.length} {certificates.length === 1 ? 'certificate' : 'certificates'} in your collection</Text>}</View>} ListEmptyComponent={loading ? <LearningSkeleton label="Loading your achievements…" /> : error ? <LearningEmpty title="Unable to load certificates" message={error} onRetry={() => {
      setLoading(true);
      fetchCertificates();
    }} icon="info" /> : <LearningEmpty title="Your achievements start here" message="Complete assessments and AI tool workshops to unlock your certificates." icon="certificate" action="Explore Workspace" onRetry={() => navigation.navigate('MainTabs', {
      screen: 'HomeTab'
    })} />} renderItem={({
      item
    }) => <View style={[s.card, {
      borderColor: item.status === 'active' ? '#E9DCBF' : palette.line
    }]}><View style={s.between}><View style={[s.circle, {
          backgroundColor: palette.goldTint
        }]}><LearningIcon name="certificate" color={palette.gold} /></View><StatusBadge label={item.status === 'revoked' ? 'Revoked' : 'Earned'} tone={item.status === 'revoked' ? 'neutral' : 'gold'} icon={item.status === 'revoked' ? 'lock' : 'check'} /></View><Text style={s.heading}>{typeof item.course === 'object' ? item.course.title : item.courseName || 'Course certificate'}</Text>{item.issueDate && <Text style={s.small}>Issued {new Date(item.issueDate).toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}</Text>}<View style={s.divider} /><Text selectable style={s.small}>Certificate ID · {item.certificateNumber || item.verificationCode}</Text><ActionButton title="View certificate" variant="gold" disabled={item.status !== 'active'} onPress={() => setSelectedCert(item)} /><ActionButton title="Share achievement" variant="outline" disabled={item.status !== 'active'} onPress={() => handleShareCertificate(item)} /></View>} ListFooterComponent={certificates.length > 0 && !loading && !error ? <View style={{
      gap: 8,
      paddingVertical: 12
    }}><View style={s.row}><LearningIcon name="lock" size={16} color={palette.muted} /><Text style={s.cardTitle}>Keep building your collection</Text></View><Text style={s.small}>Each course roadmap shows the exact steps remaining to unlock its certificate.</Text></View> : null} />
    <CertificateModal visible={Boolean(selectedCert)} certificate={selectedCert} onClose={() => setSelectedCert(null)} />
  </SafeAreaView>;
};
