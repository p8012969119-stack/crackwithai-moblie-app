import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';

export const LaptopTechIllustration: React.FC<{ size?: number }> = ({ size = 105 }) => {
  const scale = size / 105;

  return (
    <View style={[styles.container, { width: size * 1.3, height: size * 1.05 }]}>
      {/* Floating Badges matching Image 1 */}
      {/* 1. Green Node Badge (Top Left) */}
      <View style={[styles.floatingBadge, styles.nodeBadge, { transform: [{ scale: scale * 0.95 }] }]}>
        <Text style={styles.badgeTextGreen}>node</Text>
      </View>

      {/* 2. Yellow JS Badge (Top Right) */}
      <View style={[styles.floatingBadge, styles.jsBadge, { transform: [{ scale: scale * 0.95 }] }]}>
        <Text style={styles.badgeTextYellow}>JS</Text>
      </View>

      {/* 3. White Top Badge (Center Top) */}
      <View style={[styles.floatingBadge, styles.topCenterBadge, { transform: [{ scale: scale * 0.9 }] }]}>
        <Text style={styles.badgeTextPurpleIcon}>⬢</Text>
      </View>

      {/* 4. Dark Navy OOS Badge (Middle Right) */}
      <View style={[styles.floatingBadge, styles.oosBadge, { transform: [{ scale: scale * 0.9 }] }]}>
        <Text style={styles.badgeTextWhiteOOS}>OOS</Text>
      </View>

      {/* 5. Light Gray ~0, Badge (Bottom Right) */}
      <View style={[styles.floatingBadge, styles.codeBadge, { transform: [{ scale: scale * 0.85 }] }]}>
        <Text style={styles.badgeTextDarkCode}>~0,</Text>
      </View>

      {/* 3D Angled Laptop Component */}
      <View style={[styles.laptopContainer, { transform: [{ scale }] }]}>
        {/* Screen Outer Lid */}
        <View style={styles.screenFrame}>
          {/* Inner Display Screen */}
          <View style={styles.display}>
            {/* Code Lines inside display */}
            <View style={styles.codeRow}>
              <View style={[styles.codeLine, { width: '40%', backgroundColor: '#F43F5E' }]} />
              <View style={[styles.codeLine, { width: '30%', backgroundColor: '#38BDF8' }]} />
            </View>
            <View style={styles.codeRow}>
              <View style={[styles.codeLine, { width: '75%', backgroundColor: '#A78BFA' }]} />
            </View>
            <View style={styles.codeRow}>
              <View style={[styles.codeLine, { width: '50%', backgroundColor: '#FBBF24' }]} />
            </View>
            <View style={styles.codeRow}>
              <View style={[styles.codeLine, { width: '65%', backgroundColor: '#34D399' }]} />
            </View>
          </View>
        </View>

        {/* 3D Keyboard Base */}
        <View style={styles.keyboardBase}>
          <View style={styles.trackpad} />
        </View>
        <View style={styles.laptopShadow} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  floatingBadge: {
    position: 'absolute',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 6,
  },
  nodeBadge: {
    top: 2,
    left: 2,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  badgeTextGreen: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    includeFontPadding: false,
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined,
  },
  jsBadge: {
    top: 4,
    right: 4,
    backgroundColor: '#FEFCE8',
    borderWidth: 1.5,
    borderColor: '#FDE047',
  },
  badgeTextYellow: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#A16207',
    includeFontPadding: false,
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined,
  },
  topCenterBadge: {
    top: -4,
    left: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeTextPurpleIcon: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '800',
    includeFontPadding: false,
  },
  oosBadge: {
    bottom: 24,
    right: -2,
    backgroundColor: '#1E1459',
    borderWidth: 1,
    borderColor: '#312E81',
  },
  badgeTextWhiteOOS: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    includeFontPadding: false,
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined,
  },
  codeBadge: {
    bottom: 4,
    right: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  badgeTextDarkCode: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#334155',
    includeFontPadding: false,
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined,
  },
  laptopContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  screenFrame: {
    width: 86,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#1E1459',
    padding: 5,
    borderWidth: 2,
    borderColor: '#312E81',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  display: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    padding: 6,
    gap: 4,
    justifyContent: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  codeLine: {
    height: 3,
    borderRadius: 1.5,
  },
  keyboardBase: {
    width: 98,
    height: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: '#CBD5E1',
    borderWidth: 1,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -1,
  },
  trackpad: {
    width: 20,
    height: 3,
    backgroundColor: '#94A3B8',
    borderRadius: 1.5,
  },
  laptopShadow: {
    width: 92,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.14)',
    marginTop: 2,
  },
});
