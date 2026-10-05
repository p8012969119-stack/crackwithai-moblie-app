import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { Icon } from '../../components/Icon';
import { aiApi } from '../../api/aiApi';
import { bookmarkApi } from '../../api/bookmarkApi';
import { useAuth } from '../../store/AuthContext';
import { AiTool } from '../../types';

export interface AIToolCardItem {
  id: string;
  name: string;
  category: 'writing' | 'image' | 'voice' | 'coding' | 'research' | 'productivity';
  categoryLabel: string;
  isFeatured?: boolean;
  description: string;
  useCasesCount: number;
  pricingType: 'free' | 'freemium' | 'pro';
  progressPercentage: number;
  actionText: string;
  actionToolMode: 'email' | 'voice' | 'image' | 'code' | 'chat';
  iconImage?: any;
  iconEmoji: string;
  isBookmarked?: boolean;
}

export interface CardTheme {
  cardBg: string;
  borderColor: string;
  accent: string;
  titleColor: string;
  descColor: string;
  badgeBg: string;
  badgeText: string;
  shadowColor: string;
}

const LOCAL_TOOL_IMAGES: Record<string, any> = {
  'email': require('../../assets/tools/ai_email_tool_cover.jpg'),
  'voice': require('../../assets/tools/ai_voice_tool_cover.jpg'),
  'image': require('../../assets/tools/ai_image_tool_cover.jpg'),
  'code': require('../../assets/tools/ai_code_tool_cover.jpg'),
};

const CARD_THEMES: Record<string, CardTheme> = {
  code_generator: {
    cardBg: '#FFEDD5',        // Warm Soft Peach Gold (Reference Image 2 Palette!)
    borderColor: '#FDBA74',
    accent: '#EA580C',
    titleColor: '#0F172A',
    descColor: '#475569',
    badgeBg: '#FFD8A8',
    badgeText: '#C2410C',
    shadowColor: '#EA580C',
  },
  image_generator: {
    cardBg: '#FFE4E6',        // Soft Warm Rose Coral
    borderColor: '#FDA4AF',
    accent: '#E11D48',
    titleColor: '#0F172A',
    descColor: '#475569',
    badgeBg: '#FECDD3',
    badgeText: '#BE123C',
    shadowColor: '#E11D48',
  },
  email_writer: {
    cardBg: '#D1FAE5',        // Soft Fresh Mint Green
    borderColor: '#6EE7B7',
    accent: '#059669',
    titleColor: '#0F172A',
    descColor: '#475569',
    badgeBg: '#A7F3D0',
    badgeText: '#047857',
    shadowColor: '#059669',
  },
  voice_generator: {
    cardBg: '#EDE9FE',        // Soft Lavender Periwinkle
    borderColor: '#C7D2FE',
    accent: '#7C3AED',
    titleColor: '#0F172A',
    descColor: '#475569',
    badgeBg: '#DDD6FE',
    badgeText: '#6D28D9',
    shadowColor: '#7C3AED',
  },
};

const DEFAULT_TOOLS_DATA: AIToolCardItem[] = [
  {
    id: 'code_generator',
    name: 'AI Code Generator',
    category: 'coding',
    categoryLabel: 'DEVELOPMENT',
    isFeatured: true,
    description: 'Generate clean React Native components, fix bugs, and refactor functions in seconds.',
    useCasesCount: 8,
    pricingType: 'free',
    progressPercentage: 90,
    actionText: 'Open Code Studio',
    actionToolMode: 'code',
    iconImage: LOCAL_TOOL_IMAGES['code'],
    iconEmoji: '💻',
    isBookmarked: false,
  },
  {
    id: 'image_generator',
    name: 'AI Image Generator',
    category: 'image',
    categoryLabel: 'IMAGE ART',
    isFeatured: true,
    description: 'Generate high-resolution social media graphics, UI assets, and creative visual artwork.',
    useCasesCount: 8,
    pricingType: 'freemium',
    progressPercentage: 85,
    actionText: 'Open Image Studio',
    actionToolMode: 'image',
    iconImage: LOCAL_TOOL_IMAGES['image'],
    iconEmoji: '🎨',
    isBookmarked: false,
  },
  {
    id: 'email_writer',
    name: 'AI Email Writer',
    category: 'writing',
    categoryLabel: 'EMAIL WRITING',
    isFeatured: true,
    description: 'Draft professional outreach emails, sales proposals, and newsletter copy instantly.',
    useCasesCount: 8,
    pricingType: 'free',
    progressPercentage: 75,
    actionText: 'Open Writer',
    actionToolMode: 'email',
    iconImage: LOCAL_TOOL_IMAGES['email'],
    iconEmoji: '✉️',
    isBookmarked: false,
  },
  {
    id: 'voice_generator',
    name: 'AI Voice Generator',
    category: 'voice',
    categoryLabel: 'VOICE OVER',
    isFeatured: true,
    description: 'Convert script text into realistic, natural-sounding voiceover audio tracks.',
    useCasesCount: 8,
    pricingType: 'freemium',
    progressPercentage: 80,
    actionText: 'Open Voice Studio',
    actionToolMode: 'voice',
    iconImage: LOCAL_TOOL_IMAGES['voice'],
    iconEmoji: '🎙️',
    isBookmarked: false,
  },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Tools' },
  { id: 'coding', label: 'AI Coding' },
  { id: 'image', label: 'AI Image' },
  { id: 'writing', label: 'AI Email' },
  { id: 'voice', label: 'AI Voice' },
];

const FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';
const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

/* ANIMATED TOOL CARD COMPONENT WITH ZOOM EFFECT ON TOUCH */
const AnimatedToolCard: React.FC<{
  tool: AIToolCardItem;
  theme: CardTheme;
  onPress: () => void;
}> = ({ tool, theme, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 24,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.cardWrapper]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.toolCard,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.borderColor,
            shadowColor: theme.shadowColor,
          },
        ]}
      >
        {/* CARD MAIN BODY ROW */}
        <View style={styles.cardMainRow}>
          {/* LEFT COLUMN: IMAGE + BLACK CURVED BUTTON DIRECTLY UNDERNEATH */}
          <View style={styles.leftCol}>
            <View style={styles.thumbnailBox}>
              <Image
                source={
                  tool.iconImage ||
                  (tool.name.toLowerCase().includes('email') || tool.id.includes('email') || tool.category === 'writing'
                    ? LOCAL_TOOL_IMAGES['email']
                    : tool.name.toLowerCase().includes('voice') || tool.id.includes('voice') || tool.category === 'voice'
                    ? LOCAL_TOOL_IMAGES['voice']
                    : tool.name.toLowerCase().includes('image') || tool.id.includes('image') || tool.category === 'image'
                    ? LOCAL_TOOL_IMAGES['image']
                    : LOCAL_TOOL_IMAGES['code'])
                }
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            </View>

            {/* BLACK CURVED ACTION BUTTON WITH FULL TEXT VISIBILITY */}
            <TouchableOpacity
              style={styles.blackActionBtn}
              onPress={onPress}
              activeOpacity={0.85}
            >
              <Text style={styles.blackActionBtnText} numberOfLines={1}>
                {tool.actionText} ↗
              </Text>
            </TouchableOpacity>
          </View>

          {/* RIGHT COLUMN: TITLE, META & DESCRIPTION */}
          <View style={styles.rightContentCol}>
            <Text style={[styles.toolTitleText, { color: theme.titleColor }]}>
              {tool.name}
            </Text>
            <Text style={[styles.toolSubMetaText, { color: theme.accent }]}>
              {tool.useCasesCount} use cases • {tool.pricingType}
            </Text>
            <Text style={[styles.toolDescText, { color: theme.descColor }]} numberOfLines={3}>
              {tool.description}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const ToolsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toolsData, setToolsData] = useState<AIToolCardItem[]>(DEFAULT_TOOLS_DATA);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBackendTools = useCallback(async () => {
    try {
      const response = await aiApi.getTools();
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        const merged: AIToolCardItem[] = DEFAULT_TOOLS_DATA.map((localTool) => {
          const matchedBackend = response.data.find(
            (bTool: AiTool) =>
              (bTool.slug && bTool.slug.toLowerCase().includes(localTool.id)) ||
              bTool._id === localTool.id ||
              (bTool.name && bTool.name.toLowerCase().includes(localTool.name.toLowerCase().split(' ')[1] || ''))
          );
          if (matchedBackend) {
            return {
              ...localTool,
              name: matchedBackend.name || localTool.name,
              description: matchedBackend.description || localTool.description,
            };
          }
          return localTool;
        });

        setToolsData(merged);
      }
    } catch {
      // Fallback gracefully to DEFAULT_TOOLS_DATA
    }
  }, []);

  useEffect(() => {
    fetchBackendTools();
  }, [fetchBackendTools]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBackendTools();
    setRefreshing(false);
  }, [fetchBackendTools]);

  const handleActionPress = (tool: AIToolCardItem) => {
    if (tool.actionToolMode === 'email') {
      navigation.navigate('AIEmailWriter');
    } else if (tool.actionToolMode === 'voice') {
      navigation.navigate('AIVoiceGenerator');
    } else if (tool.actionToolMode === 'image') {
      navigation.navigate('AIImageGenerator');
    } else if (tool.actionToolMode === 'code') {
      navigation.navigate('AICodeGenerator');
    } else {
      navigation.navigate('AITab', {
        activeTool: tool.actionToolMode,
        toolName: tool.name,
      });
    }
  };

  const filteredTools = toolsData.filter((tool) => {
    if (selectedCategory === 'all') return true;
    const str = `${tool.id} ${tool.name} ${tool.category} ${tool.categoryLabel}`.toLowerCase();
    if (selectedCategory === 'writing') return tool.category === 'writing' || str.includes('email');
    if (selectedCategory === 'image') return tool.category === 'image' || str.includes('image');
    if (selectedCategory === 'voice') return tool.category === 'voice' || str.includes('voice');
    if (selectedCategory === 'coding') return tool.category === 'coding' || str.includes('code');
    return tool.category === selectedCategory;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 1. HEADER (NO AI MODEL SELECTOR) */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs');
              }
            }}
            activeOpacity={0.7}
          >
            <Icon name="chevron-left" size={20} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerTitleCol}>
            <Text style={styles.headerSubtitleTag}>AI WORKSHOP</Text>
            <Text style={styles.headerMainTitle}>Explore AI tools</Text>
          </View>
          
          <View style={{ width: 38 }} />
        </View>

        {/* 2. CATEGORY FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {CATEGORY_FILTERS.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isSelected && styles.activeCategoryChip]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.activeCategoryChipText]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* MAIN CONTENT AREA */}
      <ScrollView
        contentContainerStyle={styles.scrollListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching AI Tools...</Text>
          </View>
        ) : filteredTools.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No AI Tools Found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search query or filter category.</Text>
          </View>
        ) : (
          filteredTools.map((tool) => {
            const theme = CARD_THEMES[tool.id] || {
              cardBg: '#FFEDD5',
              borderColor: '#FDBA74',
              accent: '#EA580C',
              titleColor: '#0F172A',
              descColor: '#475569',
              badgeBg: '#FFD8A8',
              badgeText: '#C2410C',
              shadowColor: '#EA580C',
            };

            return (
              <AnimatedToolCard
                key={tool.id}
                tool={tool}
                theme={theme}
                onPress={() => handleActionPress(tool)}
              />
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerSubtitleTag: {
    fontSize: 10.5,
    fontFamily: FONT_FAMILY_MEDIUM,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  headerMainTitle: {
    fontSize: 21,
    fontFamily: FONT_FAMILY_MEDIUM,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  categoryScrollContent: {
    gap: 8,
    paddingRight: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeCategoryChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#6D28D9',
    borderWidth: 1.5,
  },
  categoryChipText: {
    fontSize: 12.5,
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
    color: '#334155',
  },
  activeCategoryChipText: {
    color: '#6D28D9',
    fontFamily: FONT_FAMILY_MEDIUM,
    fontWeight: '800',
  },
  scrollListContent: {
    padding: 16,
    paddingBottom: 32,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  toolCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftCol: {
    width: 145,
    marginRight: 16,
    alignItems: 'center',
  },
  thumbnailBox: {
    width: 145,
    height: 94,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  blackActionBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 6,
    width: 145,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  blackActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: FONT_FAMILY_MEDIUM,
    fontWeight: '700',
    textAlign: 'center',
  },
  rightContentCol: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingRight: 4,
  },
  toolTitleText: {
    fontSize: 18,
    fontFamily: FONT_FAMILY_MEDIUM,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  toolSubMetaText: {
    fontSize: 11.5,
    fontFamily: FONT_FAMILY_MEDIUM,
    fontWeight: '700',
    marginBottom: 6,
  },
  toolDescText: {
    fontSize: 12.5,
    fontFamily: FONT_FAMILY,
    color: '#475569',
    lineHeight: 18,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY_MEDIUM,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: FONT_FAMILY,
    color: '#64748B',
    marginTop: 4,
  },
});
