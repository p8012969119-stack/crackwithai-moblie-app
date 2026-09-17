import React from 'react';
import {View, Text, StyleSheet, Image, Platform} from 'react-native';
import {palette} from './learning/LearningLayout';

interface InlineCertificateCanvasProps {
  studentName: string;
  courseTitle: string;
  issueDate?: string;
  verificationCode?: string;
  isUnlocked: boolean;
  onPress?: () => void;
}
// Mobile adaptation of the supplied web certificate: double frame, corner
// ribbons, brand medallion, serif heading, recipient line and signature area.
export const InlineCertificateCanvas = ({studentName, courseTitle, issueDate, isUnlocked}: InlineCertificateCanvasProps) => {
  if (!isUnlocked) return null;
  const date = issueDate ? new Date(issueDate) : null;
  const formattedDate = date && Number.isFinite(date.getTime()) ? date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'Date unavailable';
  return <View style={styles.canvas}>
    <View style={[styles.corner, styles.topCorner]} />
    <View style={[styles.corner, styles.bottomCorner]} />
    <View style={styles.outerFrame} pointerEvents="none" />
    <View style={styles.innerFrame} pointerEvents="none" />
    <View style={styles.brandRow}>
      <View style={styles.medallion}>
        <Image source={require('../assets/brand/crackwithai-logo.png')} accessibilityLabel="CrackWithAI" style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.verified}><Text style={styles.verifiedText}>VERIFIED</Text></View>
    </View>
    <View style={styles.content}>
      <Text style={styles.title} adjustsFontSizeToFit numberOfLines={1}>CERTIFICATE</Text>
      <Text style={styles.subtitle}>of Completion</Text>
      <Text style={styles.label}>THIS CERTIFICATE IS PRESENTED TO</Text>
      <Text style={styles.name}>{studentName}</Text>
      <View style={styles.underline} />
      <Text style={styles.description}>for successfully completing the full learning path, final quiz, and certificate requirements for</Text>
      <Text style={styles.course}>{courseTitle}</Text>
      <View style={styles.footer}>
        <View style={styles.footerColumn}><Text style={styles.footerLabel}>DATE</Text><Text style={styles.footerValue}>{formattedDate}</Text></View>
        <View style={styles.footerColumn}><Text style={styles.footerLabel}>SIGNATURE</Text><Text style={styles.signature}>CrackWithAI</Text></View>
      </View>
    </View>
  </View>;
};
const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';
const styles = StyleSheet.create({
  canvas: {backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#DDD6EE', padding: 24, gap: 24},
  outerFrame: {...StyleSheet.absoluteFillObject, margin: 10, borderWidth: 1, borderColor: '#CDC3E2'},
  innerFrame: {...StyleSheet.absoluteFillObject, margin: 15, borderWidth: 1, borderColor: '#E7E1EF'},
  corner: {position: 'absolute', width: 130, height: 58, backgroundColor: '#6150C9', transform: [{rotate: '-45deg'}]},
  topCorner: {top: -8, left: -53},
  bottomCorner: {bottom: -8, right: -53},
  brandRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12},
  medallion: {width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#E6B549', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center'},
  logo: {width: 53, height: 53},
  verified: {borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: palette.tint},
  verifiedText: {fontSize: 10, letterSpacing: 1, fontWeight: '700', color: palette.purple},
  content: {alignItems: 'center', paddingHorizontal: 2},
  title: {fontFamily: serif, fontSize: 28, color: palette.ink, textAlign: 'center', width: '100%'},
  subtitle: {fontFamily: serif, fontStyle: 'italic', fontSize: 19, color: palette.ink, marginTop: 4},
  label: {fontSize: 10, lineHeight: 16, letterSpacing: 1.4, fontWeight: '700', color: palette.muted, textAlign: 'center', marginTop: 28},
  name: {fontFamily: serif, fontSize: 30, lineHeight: 40, fontStyle: 'italic', color: palette.purple, textAlign: 'center', marginTop: 12},
  underline: {height: 1, backgroundColor: '#CDC3E2', width: '100%', marginTop: 8, marginBottom: 16},
  description: {fontSize: 12, lineHeight: 19, color: palette.muted, textAlign: 'center'},
  course: {fontSize: 20, lineHeight: 28, fontWeight: '700', color: palette.ink, textAlign: 'center', marginTop: 12},
  footer: {alignSelf: 'stretch', flexDirection: 'row', gap: 20, marginTop: 38, marginBottom: 12},
  footerColumn: {flex: 1, borderTopWidth: 1, borderTopColor: '#A69DB8', paddingTop: 8, alignItems: 'center', gap: 4},
  footerLabel: {fontSize: 9, letterSpacing: 1.5, fontWeight: '700', color: palette.muted},
  footerValue: {fontSize: 11, lineHeight: 17, color: palette.muted, textAlign: 'center'},
  signature: {fontFamily: serif, fontStyle: 'italic', fontSize: 13, lineHeight: 18, color: palette.ink, textAlign: 'center'},
});
