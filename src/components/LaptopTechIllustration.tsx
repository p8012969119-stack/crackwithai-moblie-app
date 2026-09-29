import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';

export const LaptopTechIllustration: React.FC<{ size?: number }> = ({ size = 96 }) => {
  const scale = size / 96;

  return (
    <View style={[styles.container, { width: size * 1.25, height: size }]}>
      {/* Floating Badge Chips matching Image 1 */}
      {/* 1. Node Pill Badge (Green - Top Left) */}
      <View style={[styles.floatingBadge, styles.nodeBadge, { transform: [{ scale: scale * 0.95 }] }]}>
        <Text style={styles.badgeTextGreen}>node</Text>
      </View>

      {/* 2. JS Badge (Yellow - Top Right) */}
      <View style={[styles.floatingBadge, styles.jsBadge, { transform: [{ scale: scale * 0.95 }] }]}>
        <Text style={styles.badgeTextYellow}>JS</Text>
      </View>

      {/* 3. React Atom Badge (Cyan - Top Center) */}
      <View style={[styles.floatingBadge, styles.reactBadge, { transform: [{ scale: scale * 0.9 }] }]}>
        <Text style={styles.badgeTextCyan}>⚛</Text>
      </View>

      {/* 4. OOS Badge (Lavender/Purple - Middle Right) */}
      <View style={[styles.floatingBadge, styles.oosBadge, { transform: [{ scale: scale * 0.9 }] }]}>
        <Text style={styles.badgeTextPurple}>OOS</Text>
      </View>

      {/* 5. Code symbol badge (~0, - Bottom Right) */}
      <View style={[styles.floatingBadge, styles.codeBadge, { transform: [{ scale: scale * 0.85 }] }]}>
        <Text style={styles.badgeTextSlate}>~0,</Text>
      </View>

      {/* Main 3D Angled Laptop Visual */}
      <View style={[styles.laptopContainer, { transform: [{ scale }] }]}>
        {/* Screen Outer Frame */}
        <View style={styles.screenFrame}>
          {/* Inner Display Screen */}
          <View style={styles.display}>
            {/* Code Lines inside laptop display */}
            <View style={styles.codeRow}>
              <View style={[styles.codeLine, { width: '38%', backgroundColor: '#F43F5E' }]} />
              <View style={[styles.codeLine, { width: '28%', backgroundColor: '#38BDF8' }]} />
            </View>
            <View style={styles.codeRow}>
              <View style={[styles.codeLine, { width: '72%', backgroundColor: '#A78BFA' }]} />
            </View>
            <View style={styles.codeRow}>
              <View style={[styles.codeLine, { width: '48%', backgroundColor: '#FBBF24' }]} />
            </View>
            <View style={styles.codeRow}>
              <View style={[styles.codeLine, { width: '64%', backgroundColor: '#34D399' }]} />
            </View>
          </View>
        </View>

        {/* Laptop Base Keyboard & Trackpad */}
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
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 6,
  },
  nodeBadge: {
    top: 2,
    left: 2,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  badgeTextGreen: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#166534',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  jsBadge: {
    top: 4,
    right: 4,
    backgroundColor: '#FEFCE8',
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  badgeTextYellow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#854D0E',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  reactBadge: {
    top: -4,
    left: 42,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  badgeTextCyan: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  oosBadge: {
    bottom: 22,
    right: -2,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  badgeTextPurple: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#3730A3',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  codeBadge: {
    bottom: 6,
    right: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeTextSlate: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  laptopContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  screenFrame: {
    width: 82,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#1E1B4B',
    padding: 4,
    borderWidth: 2,
    borderColor: '#312E81',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
  },
  display: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    padding: 5,
    gap: 3.5,
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
    width: 94,
    height: 11,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
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
    width: 18,
    height: 3,
    backgroundColor: '#94A3B8',
    borderRadius: 1.5,
  },
  laptopShadow: {
    width: 88,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
    marginTop: 2,
  },
});
