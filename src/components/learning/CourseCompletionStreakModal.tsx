import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CourseCompletionStreakModalProps {
  visible: boolean;
  onClose: () => void;
  courseTitle: string;
  newStreak: number;
  onViewCertificate: () => void;
  nextCourseTitle?: string | null;
  onNextCourse?: () => void;
}

interface FireParticle {
  anim: Animated.Value;
  x: number;
  size: number;
  icon: string;
  duration: number;
  delay: number;
}

export const CourseCompletionStreakModal: React.FC<CourseCompletionStreakModalProps> = ({
  visible,
  onClose,
  courseTitle,
  newStreak,
  onViewCertificate,
  nextCourseTitle,
  onNextCourse,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 12 Animated Flying Fire / Flame Particles
  const particles = useRef<FireParticle[]>(
    Array.from({ length: 12 }, (_, i) => ({
      anim: new Animated.Value(0),
      x: (Math.random() - 0.5) * (SCREEN_WIDTH * 0.8),
      size: Math.floor(Math.random() * 16) + 18,
      icon: i % 3 === 0 ? '🔥' : i % 3 === 1 ? '✨' : '💥',
      duration: Math.floor(Math.random() * 1200) + 1800,
      delay: Math.floor(Math.random() * 600),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // 1. Entrance Spring
      scaleAnim.setValue(0.4);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 2. Continuous Central Fire Pulse
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      // 3. Continuous Flying Flames / Particles Animation
      const particleAnimations = particles.map((p) => {
        p.anim.setValue(0);
        return Animated.loop(
          Animated.sequence([
            Animated.delay(p.delay),
            Animated.timing(p.anim, {
              toValue: 1,
              duration: p.duration,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        );
      });
      Animated.parallel(particleAnimations).start();

      return () => {
        pulseLoop.stop();
        particleAnimations.forEach((a) => a.stop());
      };
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Animated Flying Fire Particles Floating Upward */}
        <View style={styles.particlesContainer} pointerEvents="none">
          {particles.map((p, index) => {
            const translateY = p.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [120, -260],
            });
            const opacity = p.anim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0, 1, 0.8, 0],
            });
            const scale = p.anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.6, 1.3, 0.9],
            });
            const translateX = p.anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [p.x, p.x + (index % 2 === 0 ? 30 : -30), p.x + (index % 2 === 0 ? -20 : 20)],
            });

            return (
              <Animated.Text
                key={`fire-part-${index}`}
                style={[
                  styles.particleText,
                  {
                    fontSize: p.size,
                    opacity,
                    transform: [{ translateX }, { translateY }, { scale }],
                  },
                ]}
              >
                {p.icon}
              </Animated.Text>
            );
          })}
        </View>

        {/* Modal Card Content */}
        <Animated.View
          style={[
            styles.modalCard,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Glowing Animated Fire Badge */}
          <View style={styles.fireRingWrap}>
            <Animated.View
              style={[
                styles.fireGlowCircle,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Text style={styles.fireEmoji}>🔥</Text>
            </Animated.View>
          </View>

          {/* Streak Boost Pill */}
          <View style={styles.streakPill}>
            <Text style={styles.streakPillFire}>🔥</Text>
            <Text style={styles.streakPillText}>COURSE STREAK +1</Text>
          </View>

          {/* Heading */}
          <Text style={styles.congratsTitle}>Course Completed! 🎉</Text>
          <Text style={styles.courseName}>{courseTitle}</Text>

          <Text style={styles.subtitle}>
            You mastered all lessons! Your official verified certificate is now unlocked and your streak increased.
          </Text>

          {/* Streak Stat Display Box */}
          <View style={styles.streakStatBox}>
            <Text style={styles.streakStatLabel}>TOTAL COURSE STREAK</Text>
            <View style={styles.streakStatRow}>
              <Text style={styles.streakStatEmoji}>🔥</Text>
              <Text style={styles.streakStatNumber}>{newStreak}</Text>
              <Text style={styles.streakStatUnit}>
                {newStreak === 1 ? 'Course Done' : 'Courses Done'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionCol}>
            {/* 1. View Official Certificate Button */}
            <TouchableOpacity
              style={styles.certBtn}
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                onViewCertificate();
              }}
            >
              <Text style={styles.certBtnText} numberOfLines={1}>
                View Official Certificate 🏆
              </Text>
            </TouchableOpacity>

            {/* 2. Next Course Button (if applicable) */}
            {nextCourseTitle && onNextCourse ? (
              <TouchableOpacity
                style={styles.nextCourseBtn}
                activeOpacity={0.85}
                onPress={() => {
                  onClose();
                  onNextCourse();
                }}
              >
                <Text style={styles.nextCourseBtnText} numberOfLines={1}>
                  Start Next Course: {nextCourseTitle} ➔
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.nextCourseBtn}
                activeOpacity={0.85}
                onPress={onClose}
              >
                <Text style={styles.nextCourseBtnText} numberOfLines={1}>
                  Back to Learning ➔
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  particlesContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  particleText: {
    position: 'absolute',
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#FED7AA',
    zIndex: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  fireRingWrap: {
    marginTop: 6,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireGlowCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FDBA74',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fireEmoji: {
    fontSize: 44,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDBA74',
    gap: 5,
    marginBottom: 12,
  },
  streakPillFire: {
    fontSize: 13,
  },
  streakPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.8,
    fontFamily: Platform.select({ android: 'sans-serif-medium', ios: 'System' }),
  },
  congratsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Platform.select({ android: 'sans-serif-medium', ios: 'System' }),
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EA580C',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: Platform.select({ android: 'sans-serif-medium', ios: 'System' }),
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
    fontFamily: Platform.select({ android: 'sans-serif', ios: 'System' }),
  },
  streakStatBox: {
    width: '100%',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  streakStatLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.7,
    marginBottom: 4,
    fontFamily: Platform.select({ android: 'sans-serif-medium', ios: 'System' }),
  },
  streakStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakStatEmoji: {
    fontSize: 22,
  },
  streakStatNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#92400E',
    fontFamily: Platform.select({ android: 'sans-serif-medium', ios: 'System' }),
  },
  streakStatUnit: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 4,
    fontFamily: Platform.select({ android: 'sans-serif-medium', ios: 'System' }),
  },
  actionCol: {
    width: '100%',
    gap: 10,
  },
  certBtn: {
    width: '100%',
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  certBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.select({ android: 'sans-serif-medium', ios: 'System' }),
  },
  nextCourseBtn: {
    width: '100%',
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextCourseBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.select({ android: 'sans-serif-medium', ios: 'System' }),
  },
});
