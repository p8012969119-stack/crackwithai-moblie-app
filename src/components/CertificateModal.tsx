import React, {useState} from 'react';
import {Modal, View, Text, Pressable, ScrollView, Share, Alert, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {certificateApi} from '../api/certificateApi';
import {Certificate} from '../types';
import {useAuth} from '../store/AuthContext';
import {InlineCertificateCanvas} from './InlineCertificateCanvas';
import {ActionButton, LearningIcon, learningStyles as s, palette} from './learning/LearningLayout';
import {getPublicCertificateUrl, getPublicCertificatePdfUrl} from '../constants/config';

interface Props {visible: boolean; certificate: Certificate | null; onClose: () => void}

export const CertificateModal = ({visible, certificate, onClose}: Props) => {
  const {user} = useAuth();
  const [busy, setBusy] = useState(false);
  if (!certificate) return null;
  const active = certificate.status === 'active';
  const studentName = certificate.recipientName || certificate.userName ||
    (typeof certificate.user === 'object' ? certificate.user.fullName || certificate.user.name : undefined) ||
    user?.fullName || user?.name || 'Prakash';
  const courseTitle = certificate.courseName || (typeof certificate.course === 'object' ? certificate.course.title : undefined) || 'Course name unavailable';
  const certificateId = certificate.certificateId || certificate.certificateNumber;
  const code = certificate.verificationCode || certificate.certificateNumber || certificate._id;

  const handleDownload = async () => {
    if (busy || !active) return;
    setBusy(true);
    try {
      const pdfUrl = getPublicCertificatePdfUrl(code);
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        await Share.share({ title: `${courseTitle} Certificate PDF`, url: pdfUrl });
      }
    } catch {
      Alert.alert('Unable to open certificate', 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    const publicUrl = getPublicCertificateUrl(code);
    const pdfUrl = getPublicCertificatePdfUrl(code);
    const message = `🎓 CrackWithAI Official Certificate of Completion\n\nRecipient: ${studentName}\nCourse: ${courseTitle}\nVerification ID: ${code}\nStatus: Verified Authentic ✓ (100% Completed)\n\nView Full Certificate:\n${publicUrl}\n\nDownload Official PDF:\n${pdfUrl}`;
    try {
      await Share.share({
        title: `${courseTitle} Certificate - CrackWithAI`,
        message,
        url: publicUrl,
      });
    } catch {
      Alert.alert('Unable to share', 'Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.screen}>
        <View style={[s.header, {justifyContent: 'space-between'}]}>
          <Text style={s.cardTitle}>Official Certificate</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close certificate" onPress={onClose} style={[s.circle, {backgroundColor: palette.white}]}><LearningIcon name="close" /></Pressable>
        </View>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {active ? (
            <InlineCertificateCanvas
              studentName={studentName}
              courseTitle={courseTitle}
              issueDate={certificate.issuedAt || certificate.issueDate}
              verificationCode={code}
              isUnlocked
            />
          ) : (
            <View style={s.card}>
              <Text style={s.heading}>Certificate unavailable</Text>
              <Text style={s.body}>This certificate is no longer active.</Text>
            </View>
          )}
        </ScrollView>
        {active && (
          <View style={s.footer}>
            <ActionButton title="Download Official PDF" variant="gold" loading={busy} onPress={handleDownload} />
            <ActionButton title="Share Complete Certificate" variant="outline" onPress={handleShare} />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};
