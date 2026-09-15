import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Certificate, Course } from '../types';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import {CertificateMark, certificateGold} from './CertificateMark';
import { Icon } from './Icon';

interface CertificateCardProps {
  certificate: Certificate;
  onView: () => void;
  onDownload?: () => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onView,
  onDownload,
}) => {
  const courseTitle =
    (typeof certificate.course === 'object' && certificate.course ? certificate.course.title : null) ||
    certificate.courseName ||
    (typeof certificate.course === 'string' ? certificate.course : null) ||
    'Course certificate';
  const issueDateFormatted = certificate.issueDate
    ? new Date(certificate.issueDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Issued';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <CertificateMark size={44} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.certifiedLabel}>OFFICIAL CERTIFICATE</Text>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {courseTitle}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Certificate ID:</Text>
          <Text style={styles.detailValue}>{certificate.certificateNumber || certificate.verificationCode}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Issued On:</Text>
          <Text style={styles.detailValue}>{issueDateFormatted}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.viewBtn} onPress={onView} disabled={certificate.status !== 'active'}>
          <Icon name="book-open" size={16} color={certificateGold.ink} style={styles.btnIcon} />
          <Text style={styles.viewBtnText}>View Certificate</Text>
        </TouchableOpacity>
        {onDownload && (
          <TouchableOpacity style={styles.downloadBtn} onPress={onDownload} disabled={certificate.status !== 'active'}>
            <Icon name="arrow-right" size={16} color="#FFFFFF" style={styles.btnIcon} />
            <Text style={styles.downloadBtnText}>Share / Download</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  headerText: {
    flex: 1,
  },
  certifiedLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#D97706',
    marginBottom: 2,
  },
  courseTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 17,
  },
  details: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: certificateGold.fill,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  viewBtnText: {
    ...TYPOGRAPHY.captionBold,
    color: certificateGold.ink,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: certificateGold.ink,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  downloadBtnText: {
    ...TYPOGRAPHY.captionBold,
    color: '#FFFFFF',
  },
  btnIcon: {
    marginRight: 4,
  },
});
