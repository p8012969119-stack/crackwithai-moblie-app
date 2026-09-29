import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export const AiRobotMascot: React.FC<{ size?: number }> = ({ size = 110 }) => {
  const scale = size / 110;

  return (
    <View style={[styles.wrapper, { width: size, height: size * 1.1 }]}>
      {/* Floating Star Sparkles */}
      <Text style={[styles.sparkle, styles.sparkleTopLeft, { transform: [{ scale }] }]}>✦</Text>
      <Text style={[styles.sparkle, styles.sparkleTopRight, { transform: [{ scale }] }]}>✦</Text>
      <Text style={[styles.sparkle, styles.sparkleBottomRight, { transform: [{ scale }] }]}>✧</Text>

      {/* Main Mascot Robot Container */}
      <View style={[styles.robotContainer, { transform: [{ scale }] }]}>
        {/* Ears / Antenna Nubs */}
        <View style={[styles.ear, styles.earLeft]} />
        <View style={[styles.ear, styles.earRight]} />

        {/* Robot Head */}
        <View style={styles.head}>
          {/* Head Top Shine Highlight */}
          <View style={styles.headHighlight} />

          {/* Visor Screen */}
          <View style={styles.visor}>
            {/* Visor Gloss */}
            <View style={styles.visorGloss} />

            {/* Glowing Cyan Oval Eyes */}
            <View style={styles.eyesRow}>
              <View style={styles.eye}>
                <View style={styles.eyeSparkle} />
              </View>
              <View style={styles.eye}>
                <View style={styles.eyeSparkle} />
              </View>
            </View>

            {/* Subtle Happy Mouth Line */}
            <View style={styles.mouth} />
          </View>
        </View>

        {/* Neck */}
        <View style={styles.neck} />

        {/* Robot Body */}
        <View style={styles.body}>
          {/* Body Highlight */}
          <View style={styles.bodyHighlight} />

          {/* Purple Chest Badge Emblem */}
          <View style={styles.chestEmblem}>
            <View style={styles.emblemInner}>
              <Text style={styles.emblemText}>✦</Text>
            </View>
          </View>

          {/* Waving Arm (Left side of robot / Right from viewer perspective) */}
          <View style={styles.wavingArmGroup}>
            <View style={styles.wavingArm} />
            <View style={styles.wavingHand}>
              <View style={styles.finger1} />
              <View style={styles.finger2} />
              <View style={styles.finger3} />
            </View>
          </View>

          {/* Left Arm (Resting arm) */}
          <View style={styles.leftArmGroup}>
            <View style={styles.leftArm} />
            <View style={styles.leftHand} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '700',
    zIndex: 10,
  },
  sparkleTopLeft: {
    top: 2,
    left: 2,
  },
  sparkleTopRight: {
    top: 8,
    right: 4,
    fontSize: 14,
    color: '#FFFFFF',
  },
  sparkleBottomRight: {
    bottom: 8,
    right: 0,
    fontSize: 10,
    color: '#818CF8',
  },
  robotContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  ear: {
    position: 'absolute',
    top: 22,
    width: 14,
    height: 16,
    borderRadius: 7,
    backgroundColor: '#7C3AED',
    borderWidth: 2,
    borderColor: '#A78BFA',
  },
  earLeft: {
    left: 6,
  },
  earRight: {
    right: 6,
  },
  head: {
    width: 76,
    height: 56,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 4,
    overflow: 'hidden',
  },
  headHighlight: {
    position: 'absolute',
    top: 2,
    width: 50,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  visor: {
    width: 62,
    height: 40,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  visorGloss: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 45,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    transform: [{ rotate: '-25deg' }],
  },
  eyesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eye: {
    width: 16,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  eyeSparkle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 2,
    left: 3,
  },
  mouth: {
    width: 12,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
    marginTop: 3,
    opacity: 0.8,
  },
  neck: {
    width: 20,
    height: 6,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
    marginTop: -2,
    zIndex: 2,
  },
  body: {
    width: 60,
    height: 40,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    position: 'relative',
    marginTop: -2,
    zIndex: 3,
  },
  bodyHighlight: {
    position: 'absolute',
    top: 2,
    left: 6,
    width: 14,
    height: 20,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  chestEmblem: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: '#A78BFA',
  },
  emblemInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#6D28D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  leftArmGroup: {
    position: 'absolute',
    left: -10,
    top: 4,
  },
  leftArm: {
    width: 10,
    height: 18,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    transform: [{ rotate: '15deg' }],
  },
  leftHand: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#CBD5E1',
    marginTop: -4,
    marginLeft: -2,
  },
  wavingArmGroup: {
    position: 'absolute',
    right: -14,
    top: -6,
    alignItems: 'center',
  },
  wavingArm: {
    width: 10,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    transform: [{ rotate: '-40deg' }],
  },
  wavingHand: {
    width: 14,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginTop: -8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 1,
  },
  finger1: {
    width: 2,
    height: 5,
    borderRadius: 1,
    backgroundColor: '#94A3B8',
  },
  finger2: {
    width: 2,
    height: 6,
    borderRadius: 1,
    backgroundColor: '#94A3B8',
  },
  finger3: {
    width: 2,
    height: 4,
    borderRadius: 1,
    backgroundColor: '#94A3B8',
  },
});
