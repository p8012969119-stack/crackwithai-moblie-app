import React, {useState} from 'react';
import {Modal, View, Text, Pressable, ScrollView, Share, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {certificateApi} from '../api/certificateApi';
import {CertificateMark} from './CertificateMark';
import {Certificate} from '../types';
import {useAuth} from '../store/AuthContext';
import {InlineCertificateCanvas} from './InlineCertificateCanvas';
import {ActionButton, LearningIcon, learningStyles as s, palette} from './learning/LearningLayout';
interface Props {visible: boolean; certificate: Certificate | null; onClose: () => void}
export const CertificateModal = ({visible, certificate, onClose}: Props) => {
  const {user} = useAuth();
  const [busy, setBusy] = useState(false);
  if (!certificate) return null;
  const active = certificate.status === 'active';
  const studentName = certificate.recipientName || certificate.userName ||
    (typeof certificate.user === 'object' ? certificate.user.fullName || certificate.user.name : undefined) ||
    user?.fullName || user?.name || 'Name unavailable';
  const courseTitle = certificate.courseName || (typeof certificate.course === 'object' ? certificate.course.title : undefined) || 'Course name unavailable';
  const certificateId = certificate.certificateId || certificate.certificateNumber;
  const handleDownload = async () => {
    if (busy || !active) return;
    setBusy(true);
    try {await certificateApi.downloadCertificate(certificate._id);}
    catch {Alert.alert('Unable to export', 'Your certificate could not be downloaded. Please try again.');}
    finally {setBusy(false);}
  };
  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={s.screen}>
      <View style={[s.header, {justifyContent: 'space-between'}]}>
        <Text style={s.cardTitle}>Your certificate</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Close certificate" onPress={onClose} style={[s.circle, {backgroundColor: palette.white}]}><LearningIcon name="close" /></Pressable>
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {active ? <>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}><CertificateMark size={40} /><Text style={s.label}>VERIFIED CREDENTIAL</Text></View>
          <InlineCertificateCanvas studentName={studentName} courseTitle={courseTitle} issueDate={certificate.issuedAt || certificate.issueDate} isUnlocked />
          <View style={s.card}>
            {Number.isFinite(certificate.percentage) && <View style={{gap: 4}}><Text style={s.label}>ASSESSMENT SCORE</Text><Text style={s.heading}>{certificate.percentage}%</Text></View>}
            {certificateId && <View style={{gap: 4}}><Text style={s.label}>CERTIFICATE ID</Text><Text selectable style={s.body}>{certificateId}</Text></View>}
            {certificate.verificationCode && <View style={{gap: 4}}><Text style={s.label}>VERIFICATION CODE</Text><Text selectable style={s.small}>{certificate.verificationCode}</Text></View>}
          </View>
        </> : <View style={s.card}><Text style={s.heading}>Certificate unavailable</Text><Text style={s.body}>This certificate is no longer active.</Text></View>}
      </ScrollView>
      {active && <View style={s.footer}>
        <ActionButton title="Download Certificate" variant="gold" loading={busy} onPress={handleDownload} />
        <ActionButton title="Share certificate" variant="outline" onPress={async () => {
          try {await Share.share({title: `${courseTitle} Certificate`, message: `CrackWithAI Certificate of Completion\n${studentName}\n${courseTitle}${certificate.verificationCode ? '\nVerification code: ' + certificate.verificationCode : ''}`});}
          catch {Alert.alert('Unable to share', 'Please try again.');}
        }} />
      </View>}
    </SafeAreaView>
  </Modal>;
};
