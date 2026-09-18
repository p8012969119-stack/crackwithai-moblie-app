import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Image, AccessibilityInfo } from 'react-native';
import { DashboardData } from '../types';
import {useFocusEffect} from '@react-navigation/native';
import { LearningIcon } from './learning/LearningLayout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.76, 280);
const CARD_GAP = 12;

export const DashboardOverview = ({
  data,
  onProfile,
  onTools,
  onAI,
}: {
  data: DashboardData;
  onProfile: () => void;
  onTools: () => void;
  onAI: () => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isUserInteracting = useRef(false);
  const lastInteraction = useRef(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [active, setActive] = useState(false);
  useFocusEffect(React.useCallback(() => {setActive(true); return () => setActive(false);}, []));
  useEffect(() => {let live = true; void AccessibilityInfo.isReduceMotionEnabled().then(value => {if(live) setReduceMotion(value);}); const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion); return () => {live = false; listener.remove();};}, []);

  // Fast automatic movement while keeping pause for user interactions.
  useEffect(() => {
    if (!active || reduceMotion) return;
    const timer = setInterval(() => {
      if (!isUserInteracting.current && Date.now() - lastInteraction.current > 2500 && scrollViewRef.current) {
        setActiveIndex((prev) => {
          const nextIndex = (prev + 1) % 3;
          const targetX = nextIndex * (CARD_WIDTH + CARD_GAP);
          scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
          return nextIndex;
        });
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [active, reduceMotion]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
    if (index >= 0 && index < 3 && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container} testID="dashboard-overview">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          isUserInteracting.current = true;
        }}
        onScrollEndDrag={() => {
          isUserInteracting.current = false;
          lastInteraction.current = Date.now();
        }}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
      >
        {/* CARD 1: AI WORKSPACE (INDIGO/PURPLE THEME) */}
        <Pressable
          accessibilityRole="button"
          onPress={onAI}
          style={[styles.card, styles.cardIndigo]}
        >
          <Image accessible={false} source={require('../assets/dashboard/learning.png')} style={styles.art} resizeMode="cover" fadeDuration={0} />
          <View pointerEvents="none" style={styles.scrim} />
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircleWhite}>
              <LearningIcon name="play" color="#4F46E5" size={22} />
            </View>
            <View style={styles.cardBadgeWhite}>
              <Text style={styles.cardBadgeTextIndigo}>AI WORKSPACE</Text>
            </View>
          </View>
          <Text style={styles.cardLabelLight}>
            AI Workspace & Chat
          </Text>
          <Text style={styles.cardTitleLight} numberOfLines={2}>
            Chat with AI Models
          </Text>
          <Text style={styles.cardSubTextLight}>Gemini, Groq, Mistral & more</Text>
        </Pressable>

        {/* CARD 2: AI TOOLS SUITE (MAGENTA/VIOLET THEME) */}
        <Pressable accessibilityRole="button" onPress={onTools} style={[styles.card, styles.cardRose]}>
          <Image accessible={false} source={require('../assets/dashboard/tools.png')} style={styles.art} resizeMode="cover" fadeDuration={0} />
          <View pointerEvents="none" style={styles.scrim} />
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircleWhite}>
              <LearningIcon name="book" color="#7C3AED" size={22} />
            </View>
            <View style={styles.cardBadgeWhite}>
              <Text style={styles.cardBadgeTextRose}>AI SUITE</Text>
            </View>
          </View>
          <Text style={styles.cardLabelLight}>Instant AI Generators</Text>
          <Text style={styles.cardTitleLight} numberOfLines={1}>
            Explore AI Tools
          </Text>
          <Text style={styles.cardSubTextLight}>Email, voice, code & images</Text>
        </Pressable>

        {/* CARD 3: LEARNING STREAK (AMBER/ORANGE THEME) */}
        <Pressable accessibilityRole="button" onPress={onProfile} style={[styles.card, styles.cardAmber]}>
          <Image accessible={false} source={require('../assets/dashboard/streak.png')} style={styles.art} resizeMode="cover" fadeDuration={0} />
          <View pointerEvents="none" style={styles.scrim} />
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircleWhite}>
              <LearningIcon name="clock" color="#EA580C" size={22} />
            </View>
            <View style={styles.cardBadgeWhite}>
              <Text style={styles.cardBadgeTextAmber}>DAILY STREAK</Text>
            </View>
          </View>
          <Text style={styles.cardLabelLight}>Daily Streak</Text>
          <Text style={styles.cardValueLight}>
            {data.streak ?? 1} <Text style={styles.unitLight}>days</Text>
          </Text>
          <Text style={styles.cardSubTextLight}>Build your daily AI habit</Text>
        </Pressable>
      </ScrollView>

      {/* PAGINATION DOTS */}
      <View style={styles.paginationRow}>
        {[0, 1, 2].map((idx) => (
          <View
            key={idx}
            style={[styles.dot, activeIndex === idx ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  art: {...StyleSheet.absoluteFillObject, width: undefined, height: undefined},
  scrim: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 8, 23, .08)'},
  progressTrack: {height: 4, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.3)', overflow: 'hidden'},
  progressFill: {height: 4, backgroundColor: '#E4D5FF', borderRadius: 3},
  container: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 4,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 196,
    overflow: 'hidden',
    gap: 9,
    borderRadius: 22,
    padding: 16,
    marginRight: CARD_GAP,
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardIndigo: {
    backgroundColor: '#4F46E5',
  },
  cardTeal: {
    backgroundColor: '#0D9488',
  },
  cardAmber: {
    backgroundColor: '#EA580C',
  },
  cardRose: {
    backgroundColor: '#E11D48',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconCircleWhite: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardBadgeWhite: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cardBadgeTextIndigo: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardBadgeTextTeal: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardBadgeTextAmber: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardBadgeTextRose: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardLabelLight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardTitleLight: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardValueLight: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  unitLight: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubTextLight: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#4F46E5',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
});
