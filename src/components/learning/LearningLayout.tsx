import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {CertificateMark, certificateGold} from '../CertificateMark';
import { SafeAreaView } from 'react-native-safe-area-context';

export const palette = {
  ink: '#0F172A',
  muted: '#64748B',
  purple: '#6150C9',
  purpleDark: '#4F46E5',
  tint: '#EEF2FF',
  canvas: '#F8FAFC',
  line: '#E2E8F0',
  white: '#FFFFFF',
  green: '#059669',
  greenTint: '#ECFDF5',
  gold: '#D97706',
  goldTint: '#FEF3C7',
  red: '#DC2626',
  redTint: '#FEF2F2',
  cardBg: '#FFFFFF',
};

export const learningStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
    gap: 20,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: 20,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: palette.canvas,
  },
  label: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1.2,
    color: palette.purple,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.7,
    color: palette.ink,
    fontWeight: '800',
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
    color: palette.ink,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 17,
    lineHeight: 24,
    color: palette.ink,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15.5,
    lineHeight: 25,
    color: '#334155',
    fontWeight: '400',
  },
  small: {
    fontSize: 13,
    lineHeight: 20,
    color: palette.muted,
    fontWeight: '500',
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  tinted: {
    backgroundColor: palette.tint,
    borderColor: '#C7D2FE',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: palette.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touch: {
    minHeight: 44,
    justifyContent: 'center',
  },
  muted: {
    color: palette.muted,
  },
  success: {
    color: palette.green,
  },
  gold: {
    color: palette.gold,
  },
  warning: {
    color: palette.red,
  },
  divider: {
    height: 1,
    backgroundColor: palette.line,
  },
  correct: {
    borderColor: '#A7F3D0',
    backgroundColor: palette.greenTint,
  },
  wrong: {
    borderColor: '#FECACA',
    backgroundColor: palette.redTint,
  },
  chip: {
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.white,
    justifyContent: 'center',
  },
  selected: {
    borderColor: palette.purple,
    backgroundColor: palette.tint,
  },
  footer: {
    padding: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.white,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 8,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

export type LearningIconName =
  | 'back'
  | 'next'
  | 'down'
  | 'check'
  | 'lock'
  | 'book'
  | 'clock'
  | 'search'
  | 'award'
  | 'certificate'
  | 'close'
  | 'play'
  | 'pause'
  | 'bookmark'
  | 'info';

export function LearningIcon({
  name,
  size = 20,
  color = palette.ink,
}: {
  name: LearningIconName;
  size?: number;
  color?: string;
}) {
  const stroke = {
    borderColor: color,
    borderWidth: 1.8,
  };
  let shape: React.ReactNode;
  switch (name) {
    case 'check':
      shape = (
        <View
          style={{
            width: 11,
            height: 6,
            borderLeftWidth: 2.2,
            borderBottomWidth: 2.2,
            borderColor: color,
            transform: [{ rotate: '-45deg' }],
            marginTop: -3,
          }}
        />
      );
      break;
    case 'back':
    case 'next':
    case 'down':
      shape = (
        <View
          style={{
            width: 8,
            height: 8,
            borderTopWidth: 2,
            borderRightWidth: 2,
            borderColor: color,
            transform: [
              {
                rotate:
                  name === 'back'
                    ? '-135deg'
                    : name === 'down'
                    ? '135deg'
                    : '45deg',
              },
            ],
          }}
        />
      );
      break;
    case 'lock':
      shape = (
        <>
          <View
            style={[
              stroke,
              {
                position: 'absolute',
                width: 10,
                height: 10,
                top: 1,
                borderRadius: 5,
              },
            ]}
          />
          <View
            style={[
              stroke,
              {
                position: 'absolute',
                width: 16,
                height: 12,
                bottom: 1,
                borderRadius: 3.5,
                backgroundColor: palette.canvas,
              },
            ]}
          />
        </>
      );
      break;
    case 'search':
      shape = (
        <>
          <View
            style={[
              stroke,
              {
                width: 12,
                height: 12,
                borderRadius: 8,
                position: 'absolute',
                left: 1,
                top: 1,
              },
            ]}
          />
          <View
            style={{
              height: 7,
              width: 1.8,
              backgroundColor: color,
              position: 'absolute',
              right: 3,
              bottom: 1,
              transform: [{ rotate: '-45deg' }],
            }}
          />
        </>
      );
      break;
    case 'clock':
      shape = (
        <View
          style={[
            stroke,
            {
              width: 18,
              height: 18,
              borderRadius: 10,
              alignItems: 'center',
            },
          ]}
        >
          <View
            style={{
              height: 6,
              width: 1.8,
              backgroundColor: color,
              marginTop: 3,
            }}
          />
          <View
            style={{
              height: 1.8,
              width: 5,
              backgroundColor: color,
              marginLeft: 4,
            }}
          />
        </View>
      );
      break;
    case 'book':
      shape = (
        <View style={{ flexDirection: 'row' }}>
          {[0, 1].map((i) => (
            <View
              key={i}
              style={[
                stroke,
                {
                  width: 9,
                  height: 15,
                  borderRadius: 2,
                  marginLeft: i ? -1 : 0,
                },
              ]}
            />
          ))}
        </View>
      );
      break;
    case 'bookmark':
      shape = (
        <View
          style={[
            stroke,
            {
              width: 12,
              height: 17,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            },
          ]}
        />
      );
      break;
    case 'certificate':
      return <CertificateMark size={size} />;
    case 'award':
      shape = (
        <>
          <View
            style={{
              position: 'absolute',
              width: 11,
              height: 9,
              borderLeftWidth: 3,
              borderRightWidth: 3,
              borderColor: color,
              bottom: 0,
            }}
          />
          <View
            style={[
              stroke,
              {
                width: 14,
                height: 14,
                borderRadius: 8,
                position: 'absolute',
                top: 0,
                backgroundColor: palette.white,
              },
            ]}
          />
        </>
      );
      break;
    case 'pause':
      shape = (
        <View
          style={{
            width: 11,
            height: 14,
            borderLeftWidth: 3,
            borderRightWidth: 3,
            borderColor: color,
          }}
        />
      );
      break;
    case 'play':
      shape = (
        <View
          style={{
            borderLeftWidth: 11,
            borderTopWidth: 7,
            borderBottomWidth: 7,
            borderLeftColor: color,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            marginLeft: 3,
          }}
        />
      );
      break;
    case 'close':
      shape = (
        <>
          {[-45, 45].map((r) => (
            <View
              key={r}
              style={{
                position: 'absolute',
                width: 17,
                height: 2,
                backgroundColor: color,
                transform: [{ rotate: r + 'deg' }],
              }}
            />
          ))}
        </>
      );
      break;
    default:
      shape = (
        <View
          style={[
            stroke,
            {
              width: 18,
              height: 18,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 12,
              lineHeight: 15,
              fontWeight: '700',
              color,
            }}
          >
            i
          </Text>
        </View>
      );
  }
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: size / 20 }],
        }}
      >
        {shape}
      </View>
    </View>
  );
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReduced(value);
    });
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduced,
    );
    return () => {
      active = false;
      listener.remove();
    };
  }, []);
  return reduced;
}

export function ActionButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost' | 'purple' | 'gold';
  style?: StyleProp<ViewStyle>;
}) {
  const secondary = variant === 'outline' || variant === 'ghost';
  const color = disabled
    ? palette.muted
    : variant === 'gold' ? certificateGold.ink
    : secondary
    ? palette.ink
    : palette.white;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          minHeight: 52,
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: variant === 'gold' ? certificateGold.line : secondary ? palette.line : 'transparent',
          backgroundColor: disabled
            ? '#E2E8F0'
            : secondary
            ? palette.white
            : variant === 'gold' ? certificateGold.fill
            : variant === 'purple'
            ? palette.purple
            : palette.ink,
          opacity: pressed ? 0.88 : 1,
          shadowColor: disabled || secondary ? 'transparent' : '#0F172A',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: disabled || secondary ? 0 : 2,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text
          style={{
            fontSize: 15.5,
            lineHeight: 22,
            fontWeight: '700',
            textAlign: 'center',
            color,
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function StatusBadge({
  label,
  tone = 'neutral',
  icon,
}: {
  label: string;
  tone?: 'neutral' | 'purple' | 'gold' | 'green';
  icon?: LearningIconName;
}) {
  const color =
    tone === 'purple'
      ? palette.purple
      : tone === 'gold'
      ? palette.gold
      : tone === 'green'
      ? palette.green
      : palette.muted;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor:
          tone === 'purple'
            ? palette.tint
            : tone === 'gold'
            ? palette.goldTint
            : tone === 'green'
            ? palette.greenTint
            : '#F1F5F9',
        borderWidth: 1,
        borderColor:
          tone === 'purple'
            ? '#C7D2FE'
            : tone === 'gold'
            ? '#FDE68A'
            : tone === 'green'
            ? '#A7F3D0'
            : '#E2E8F0',
      }}
    >
      {icon && <LearningIcon name={icon} size={13} color={color} />}
      <Text
        style={{
          fontSize: 12,
          lineHeight: 16,
          fontWeight: '700',
          color,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function CourseProgress({
  progress,
  label = 'Course progress',
  gold = false,
  compact = false,
}: {
  progress: number;
  label?: string;
  gold?: boolean;
  compact?: boolean;
}) {
  const value = Number.isFinite(progress)
    ? Math.max(0, Math.min(100, progress))
    : 0;
  const width = useRef(new Animated.Value(value)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    const animation = Animated.timing(width, {
      toValue: value,
      duration: reduced ? 0 : 280,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [value, width, reduced]);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(value),
      }}
      style={{
        gap: compact ? 6 : 10,
      }}
    >
      <View style={learningStyles.between}>
        <Text style={learningStyles.small}>{label}</Text>
        <Text
          style={[
            learningStyles.small,
            {
              fontWeight: '700',
              color: gold ? palette.gold : palette.ink,
              fontVariant: ['tabular-nums'],
            },
          ]}
        >
          {Math.round(value)}%
        </Text>
      </View>
      <View
        style={{
          height: 6,
          backgroundColor: '#E2E8F0',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: 6,
            borderRadius: 4,
            backgroundColor: gold ? palette.gold : palette.purple,
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );
}

export function LearningSkeleton({
  label = 'Loading your learning…',
}: {
  label?: string;
}) {
  const opacity = useRef(new Animated.Value(0.55)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, opacity]);
  return (
    <View
      accessibilityLabel={label}
      accessibilityState={{
        busy: true,
      }}
      style={{
        gap: 20,
      }}
    >
      <Text style={learningStyles.small}>{label}</Text>
      <Animated.View
        accessibilityElementsHidden
        style={{
          opacity,
          gap: 16,
        }}
      >
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              learningStyles.card,
              {
                gap: 15,
              },
            ]}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: '#E2E8F0',
              }}
            />
            {[90, 65, 100].map((w, j) => (
              <View
                key={j}
                style={{
                  height: j ? 12 : 20,
                  width: (w + '%') as '100%',
                  backgroundColor: '#E2E8F0',
                  borderRadius: 6,
                }}
              />
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export function LearningEmpty({
  title,
  message,
  onRetry,
  action = 'Try again',
  icon = 'book',
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  action?: string;
  icon?: LearningIconName;
}) {
  return (
    <View
      style={{
        paddingVertical: 44,
        gap: 16,
        alignItems: 'center',
      }}
    >
      <View
        style={[
          learningStyles.circle,
          {
            width: 64,
            height: 64,
            borderRadius: 22,
          },
        ]}
      >
        <LearningIcon name={icon} size={28} color={palette.purple} />
      </View>
      <Text
        style={[
          learningStyles.heading,
          {
            textAlign: 'center',
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          learningStyles.body,
          learningStyles.muted,
          {
            textAlign: 'center',
            maxWidth: 360,
          },
        ]}
      >
        {message}
      </Text>
      {onRetry && (
        <ActionButton
          title={action}
          onPress={onRetry}
          variant="outline"
          style={{
            alignSelf: 'stretch',
            marginTop: 8,
          }}
        />
      )}
    </View>
  );
}

export function ReadingContent({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <View
      style={{
        gap: 16,
      }}
    >
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((paragraph, i) => (
          <Text selectable key={i} style={learningStyles.body}>
            {paragraph.trim()}
          </Text>
        ))}
    </View>
  );
}

export const LearningLayout = ({
  navigation,
  label,
  children,
  footer,
  contentKey,
}: {
  navigation: any;
  label: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentKey?: string | number;
}) => (
  <SafeAreaView style={learningStyles.screen} edges={['top', 'bottom']}>
    <View style={learningStyles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        style={({ pressed }) => [
          {
            width: 42,
            height: 42,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            backgroundColor: palette.white,
            borderWidth: 1,
            borderColor: palette.line,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        onPress={() => navigation.goBack()}
      >
        <LearningIcon name="back" size={18} color={palette.ink} />
      </Pressable>
      <Text
        numberOfLines={2}
        style={[
          learningStyles.small,
          {
            flex: 1,
            fontWeight: '700',
            color: palette.ink,
            fontSize: 14,
          },
        ]}
      >
        {label}
      </Text>
    </View>
    <ScrollView
      key={contentKey}
      contentContainerStyle={learningStyles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
    {footer && <View style={learningStyles.footer}>{footer}</View>}
  </SafeAreaView>
);

export function LearningReveal({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduced) return;
    opacity.setValue(0);
    const transition = Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    });
    transition.start();
    return () => transition.stop();
  }, [reduced, opacity]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}
