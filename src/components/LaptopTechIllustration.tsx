import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export const LaptopTechIllustration: React.FC<{ size?: number }> = ({ size = 100 }) => {
  const scale = size / 100;

  return (
    <View style={[styles.container, { width: size * 1.2, height: size }]}>
      {/* Floating Badges */}
      {/* Node Badge (Green) */}
      <View style={[styles.floatingBadge, styles.nodeBadge, { transform: [{ scale: scale * 0.9 }] }]}>
        <Text style={styles.badgeTextGreen}>node</Text>
      </View>

      {/* JS Badge (Yellow) */}
      <View style={[styles.floatingBadge, styles.jsBadge, { transform: [{ scale: scale * 0.9 }] }]}>
        <Text style={styles.badgeTextYellow}>JS</Text>
      </View>

      {/* DB Badge (Purple) */}
      <View style={[styles.floatingBadge, styles.dbBadge, { transform: [{ scale: scale * 0.85 }] }]}>
        <Text style={styles.badgeTextPurple}>OOS</Text>
      </View>

      {/* Code Badge (Blue) */}
      <View style={[styles.floatingBadge, styles.codeBadge, { transform: [{ scale: scale * 0.8 }] }]}>
        <Text style={styles.badgeTextBlue}>~0,</Text>
      </View>

      {/* Main 3D Laptop */}
      <View style={[styles.laptopContainer, { transform: [{ scale }] }]}>
        {/* Screen Outer */}
        <View style={styles.screenFrame}>
          {/* Inner Display */}
          <View style={styles.display}>
            {/* Code Lines inside laptop display */}
            <View style={styles.codeRow}>
              <View style={[styles.codeLine, { width: '40%', backgroundColor: '#F43F5E' }]} />
              <View style={[styles.codeLine, { width: '25%', backgroundColor: '#38BDF8' }]} />
            </View>
            <View style={styles.codeRow}>
              <View style={[styles.codeLine, { width: '70%', backgroundColor: '#A78BFA' }]} />
            </View>
            <View style={styles.codeRow}>
              <View style={[styles.codeLine, { width: '50%', backgroundColor: '#FBBF24' }]} />
            </View>
            <View style={styles.codeRow}>
              <View style={[styles.codeLine, { width: '60%', backgroundColor: '#34D399' }]} />
            </View>
          </View>
        </View>

        {/* Laptop Hinge & Base Keyboard */}
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
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 5,
  },
  nodeBadge: {
    top: 2,
    left: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  badgeTextGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  jsBadge: {
    top: 6,
    right: 6,
    backgroundColor: '#FEFCE8',
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  badgeTextYellow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#854D0E',
  },
  dbBadge: {
    bottom: 22,
    right: 0,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  badgeTextPurple: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3730A3',
  },
  codeBadge: {
    bottom: 8,
    right: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeTextBlue: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  laptopContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  screenFrame: {
    width: 84,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#1E1B4B',
    padding: 4,
    borderWidth: 2,
    borderColor: '#312E81',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  display: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 4,
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
    width: 96,
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
    width: 90,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
    marginTop: 2,
  },
});
