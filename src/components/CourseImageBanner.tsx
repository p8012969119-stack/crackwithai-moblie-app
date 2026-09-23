import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, Animated, Easing } from 'react-native';
import { SHADOWS } from '../constants/theme';

interface CourseImageBannerProps {
  courseId?: string;
  lessonId?: string;
  imageUrl?: string;
  height?: number;
  style?: ViewStyle;
}

interface CourseConfig {
  bg: string;
  darkBg: string;
  badge: string;
  emoji: string;
  icon: string;
  uri: string;
  tagline: string;
}

const COURSE_CONFIGS: Record<string, CourseConfig> = {
  'chatgpt': {
    bg: '#10B981',
    darkBg: '#047857',
    badge: 'ChatGPT Mastery',
    emoji: '🤖',
    icon: 'bot',
    uri: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    tagline: '✨ Prompt Engineering & GPT-4o',
  },
  'gemini': {
    bg: '#3B82F6',
    darkBg: '#1E40AF',
    badge: 'Google Gemini AI',
    emoji: '🌐',
    icon: 'globe',
    uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    tagline: '🌐 Multimodal AI & Live Reasoning',
  },
  'claude': {
    bg: '#8B5CF6',
    darkBg: '#5B21B6',
    badge: 'Claude AI Professional',
    emoji: '📖',
    icon: 'book-open',
    uri: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
    tagline: '🧠 200K Context & Complex Analysis',
  },
  'midjourney': {
    bg: '#EC4899',
    darkBg: '#9D174D',
    badge: 'Midjourney AI Art',
    emoji: '🖼️',
    icon: 'image',
    uri: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
    tagline: '🎨 Photo-real V6 Art Generation',
  },
  'nano-banana': {
    bg: '#F59E0B',
    darkBg: '#B45309',
    badge: 'Nano Banana AI',
    emoji: '✨',
    icon: 'image',
    uri: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
    tagline: '⚡ Ultra-Fast 0.1s Nano Inference',
  },
  'cursor': {
    bg: '#0284C7',
    darkBg: '#075985',
    badge: 'Cursor AI Coding',
    emoji: '💻',
    icon: 'code',
    uri: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    tagline: '💻 Full-Stack AI Pair Programming',
  },
  'copilot': {
    bg: '#0F766E',
    darkBg: '#134E4A',
    badge: 'GitHub Copilot',
    emoji: '⚡',
    icon: 'code',
    uri: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80',
    tagline: '⚡ Instant Code Completion & Chat',
  },
  'canva': {
    bg: '#06B6D4',
    darkBg: '#0E7490',
    badge: 'Canva AI Design',
    emoji: '🎨',
    icon: 'image',
    uri: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
    tagline: '🎨 Magic Studio & Brand Design',
  },
  'perplexity': {
    bg: '#475569',
    darkBg: '#1E293B',
    badge: 'Perplexity AI Research',
    emoji: '🔍',
    icon: 'search',
    uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop&q=80',
    tagline: '🔍 Real-Time Web Search & Citations',
  },
  'runway': {
    bg: '#E11D48',
    darkBg: '#881337',
    badge: 'Runway AI Video',
    emoji: '🎬',
    icon: 'play',
    uri: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
    tagline: '🎬 Gen-2 Video Motion & FX Engine',
  },
  'elevenlabs': {
    bg: '#D97706',
    darkBg: '#78350F',
    badge: 'ElevenLabs AI Voice',
    emoji: '🎙️',
    icon: 'bell',
    uri: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
    tagline: '🎙️ Human-Quality Voice Synthesis',
  },
  'notion': {
    bg: '#1E293B',
    darkBg: '#020617',
    badge: 'Notion AI Productivity',
    emoji: '📝',
    icon: 'book-open',
    uri: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop&q=80',
    tagline: '📝 Workspace Automation & Notes',
  },
  'pika': {
    bg: '#805AD5',
    darkBg: '#44337A',
    badge: 'Pika AI Animation',
    emoji: '🎥',
    icon: 'play',
    uri: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    tagline: '🎥 3D Camera Controls & Motion',
  },
  'gamma': {
    bg: '#3182CE',
    darkBg: '#2C5282',
    badge: 'Gamma AI Presentation',
    emoji: '📊',
    icon: 'home',
    uri: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    tagline: '📊 Instant Presentation & Web Decks',
  },
  'zapier': {
    bg: '#FF4F00',
    darkBg: '#992F00',
    badge: 'Zapier AI Automation',
    emoji: '⚡',
    icon: 'flame',
    uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    tagline: '⚡ Multi-Step Automated AI Workflows',
  },
};

const LOCAL_COURSE_IMAGES: Record<string, any> = {
  'chatgpt': require('../assets/courses/chatgpt.png'),
  'gemini': require('../assets/courses/gemini.png'),
  'claude': require('../assets/courses/claude.png'),
  'midjourney': require('../assets/courses/midjourney.png'),
  'nano-banana': require('../assets/courses/nanobanana.png'),
  'cursor': require('../assets/courses/cursor.png'),
  'copilot': require('../assets/courses/copilot.png'),
  'canva': require('../assets/courses/canva.png'),
  'perplexity': require('../assets/courses/perplexity.png'),
  'runway': require('../assets/courses/runway.png'),
  'elevenlabs': require('../assets/courses/elevenlabs.png'),
  'notion': require('../assets/courses/notion.png'),
  'pika': require('../assets/courses/pika.png'),
  'gamma': require('../assets/courses/gamma.png'),
  'zapier': require('../assets/courses/zapier.png'),
};

export const CourseImageBanner: React.FC<CourseImageBannerProps> = ({
  courseId,
  lessonId,
  imageUrl,
  height = 175,
  style,
}) => {
  const [imageError, setImageError] = useState(false);
  const targetStr = `${courseId || ''} ${lessonId || ''}`.toLowerCase();

  const resolveKey = (): string => {
    if (targetStr.includes('zapier')) return 'zapier';
    if (targetStr.includes('gamma')) return 'gamma';
    if (targetStr.includes('pika')) return 'pika';
    if (targetStr.includes('notion')) return 'notion';
    if (targetStr.includes('runway')) return 'runway';
    if (targetStr.includes('eleven')) return 'elevenlabs';
    if (targetStr.includes('perplexity')) return 'perplexity';
    if (targetStr.includes('canva')) return 'canva';
    if (targetStr.includes('github') || targetStr.includes('copilot')) return 'copilot';
    if (targetStr.includes('cursor')) return 'cursor';
    if (targetStr.includes('banana') || targetStr.includes('nano')) return 'nano-banana';
    if (targetStr.includes('midjourney')) return 'midjourney';
    if (targetStr.includes('claude')) return 'claude';
    if (targetStr.includes('gemini') || targetStr.includes('google')) return 'gemini';
    if (targetStr.includes('chatgpt') || targetStr.includes('gpt')) return 'chatgpt';

    return 'runway';
  };

  const matchedKey = resolveKey();
  const cfg = COURSE_CONFIGS[matchedKey] || COURSE_CONFIGS['runway'];
  const localImage = LOCAL_COURSE_IMAGES[matchedKey];
  const imageSource = localImage || { uri: imageUrl || cfg.uri };
  const isLocal = !!localImage;

  return (
    <View style={[styles.container, { height }, style]}>
      {(!imageError || isLocal) ? (
        <>
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
            onError={() => !isLocal && setImageError(true)}
          />
          {!isLocal && (
            <>
              {/* Top Translucent Overlay Badge */}
              <View style={styles.overlayBadge}>
                <Text style={styles.emojiText}>{cfg.emoji}</Text>
                <Text style={styles.badgeText}>{cfg.badge}</Text>
              </View>
              {/* Right CrackWithAI Branding Tag */}
              <View style={styles.cwaBrandBadge}>
                <Text style={styles.cwaBrandText}>⚡ CrackWithAI</Text>
              </View>
              {/* Bottom Tagline */}
              <View style={styles.bottomOverlay}>
                <Text style={styles.bottomTaglineText}>{cfg.tagline}</Text>
              </View>
            </>
          )}
        </>
      ) : (
        <View style={[styles.fallbackBanner, { backgroundColor: cfg.darkBg }]}>
          {/* Header row with badges side-by-side (NO overlap) */}
          <View style={styles.fallbackHeaderRow}>
            <View style={styles.fallbackLeftBadge}>
              <Text style={styles.emojiText}>{cfg.emoji}</Text>
              <Text style={styles.badgeText}>{cfg.badge}</Text>
            </View>
            <View style={styles.fallbackRightBadge}>
              <Text style={styles.cwaBrandText}>⚡ CrackWithAI</Text>
            </View>
          </View>

          {/* Center Graphic Glow Circle */}
          <View style={styles.centerGraphicCircle}>
            <Text style={{ fontSize: 32 }}>{cfg.emoji}</Text>
          </View>

          {/* Bottom Tagline Badge */}
          <View style={styles.fallbackBottomBadge}>
            <Text style={styles.bottomTaglineText}>{cfg.tagline}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  emojiText: {
    fontSize: 12,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cwaBrandBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  cwaBrandText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bottomTaglineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fallbackBanner: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  fallbackHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fallbackLeftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fallbackRightBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  centerGraphicCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  fallbackBottomBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
});
