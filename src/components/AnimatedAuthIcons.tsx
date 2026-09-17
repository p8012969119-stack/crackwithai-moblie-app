import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface AnimatedEyeToggleProps {
  showPassword: boolean;
  onPress: () => void;
  color?: string;
}

export const AnimatedEyeToggle: React.FC<AnimatedEyeToggleProps> = ({
  showPassword,
  onPress,
  color = '#64748B',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slashAnim = useRef(new Animated.Value(showPassword ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(slashAnim, {
      toValue: showPassword ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showPassword]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.82,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const slashRotate = slashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg'],
  });

  const slashScale = slashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const strokeColor = showPassword ? '#5653fe' : '#64748B';

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Animated.View style={[styles.eyeContainer, { transform: [{ scale: scaleAnim }] }]}>
        {/* Realistic Professional Almond Eye Contour (No outer box background) */}
        <View style={[styles.eyeAlmond, { borderColor: strokeColor }]}>
          {/* Inner Iris with Pupil & Light Catch Reflection */}
          <View style={[styles.eyeIris, { backgroundColor: strokeColor }]}>
            <View style={styles.eyeReflectionDot} />
          </View>
        </View>

        {/* Eyelash Accents */}
        <View style={styles.lashesContainer}>
          <View style={[styles.lashTick, styles.lashL, { backgroundColor: strokeColor }]} />
          <View style={[styles.lashTick, styles.lashR, { backgroundColor: strokeColor }]} />
        </View>

        {/* Diagonal Slash Line when Password Hidden */}
        <Animated.View
          style={[
            styles.eyeSlashLine,
            {
              backgroundColor: strokeColor,
              opacity: slashAnim,
              transform: [{ rotate: slashRotate }, { scaleX: slashScale }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eyeContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent', // Float cleanly inside input bar
  },
  eyeAlmond: {
    width: 24,
    height: 15,
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  eyeIris: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748B',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: 1,
  },
  eyeReflectionDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  lashesContainer: {
    position: 'absolute',
    bottom: 5,
    width: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  lashTick: {
    width: 3,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: '#64748B',
  },
  lashL: {
    transform: [{ rotate: '30deg' }],
  },
  lashR: {
    transform: [{ rotate: '-30deg' }],
  },
  eyeSlashLine: {
    position: 'absolute',
    width: 26,
    height: 2,
    backgroundColor: '#64748B',
    borderRadius: 1,
  },
});
