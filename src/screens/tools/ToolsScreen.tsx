import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
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

const LOCAL_TOOL_IMAGES: Record<string, any> = {
  'email': require('../../assets/tools/email_writer.png'),
  'voice': require('../../assets/tools/voice_generator.png'),
  'image': require('../../assets/tools/image_generator.png'),
  'code': require('../../assets/tools/code_generator.png'),
};

const DEFAULT_TOOLS_DATA: AIToolCardItem[] = [
  {
    id: 'email_writer',
    name: 'AI Email Writer',
    category: 'writing',
    categoryLabel: 'EMAIL WRITING',
    isFeatured: true,
    description: 'Draft professional outreach, sales proposals, and newsletter email copy in seconds.',
    useCasesCount: 8,
    pricingType: 'free',
    progressPercentage: 65,
    actionText: 'Open Email',
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
    description: 'Convert script text into realistic natural-sounding voiceover audio tracks.',
    useCasesCount: 12,
    pricingType: 'freemium',
    progressPercentage: 80,
    actionText: 'Open Voice',
    actionToolMode: 'voice',
    iconImage: LOCAL_TOOL_IMAGES['voice'],
    iconEmoji: '🎙️',
    isBookmarked: false,
  },
  {
    id: 'image_generator',
    name: 'AI Image Generator',
    category: 'image',
    categoryLabel: 'IMAGE ART',
    isFeatured: true,
    description: 'Generate high-resolution social media graphics, UI assets, and creative visuals.',
    useCasesCount: 15,
    pricingType: 'freemium',
    progressPercentage: 50,
    actionText: 'Open Image',
    actionToolMode: 'image',
    iconImage: LOCAL_TOOL_IMAGES['image'],
    iconEmoji: '🎨',
    isBookmarked: false,
  },
  {
    id: 'code_generator',
    name: 'AI Code Generator',
    category: 'coding',
    categoryLabel: 'DEVELOPMENT',
    isFeatured: true,
    description: 'Generate clean React Native components, fix bugs, and refactor functions.',
    useCasesCount: 10,
    pricingType: 'freemium',
    progressPercentage: 90,
    actionText: 'Open Code',
    actionToolMode: 'code',
    iconImage: LOCAL_TOOL_IMAGES['code'],
    iconEmoji: '💻',
    isBookmarked: false,
  },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'writing', label: 'AI Writing' },
  { id: 'image', label: 'AI Image' },
  { id: 'voice', label: 'AI Voice' },
  { id: 'coding', label: 'AI Coding' },
];

export const ToolsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toolsData, setTools] = useState<AIToolCardItem[]>(DEFAULT_TOOLS_DATA);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchToolsData = useCallback(async () => {
    try {
      setErrorMsg(null);
      const res = await aiApi.getTools();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const allowedApiTools = res.data.filter((tool: AiTool) => {
          const s = (tool.slug || tool.name || '').toLowerCase();
          return (
            !s.includes('pdf') &&
            !s.includes('summarizer') &&
            !s.includes('translator') &&
            !s.includes('translation')
          );
        });

        const mappedApiTools: AIToolCardItem[] = allowedApiTools.map((apiTool: AiTool, index: number) => {
          const str = `${apiTool.slug || ''} ${apiTool.name || ''} ${apiTool.type || ''} ${apiTool.category || ''}`.toLowerCase();
          const matchingPreset = DEFAULT_TOOLS_DATA.find((t) => t.id === apiTool.slug || t.id.includes(apiTool.slug) || str.includes(t.category));

          let inferredCategory: 'writing' | 'image' | 'voice' | 'coding' | 'research' | 'productivity' = 'productivity';
          let categoryLabel = 'AI TOOL';

          if (str.includes('email') || str.includes('mail') || str.includes('writing') || str.includes('writer')) {
            inferredCategory = 'writing';
            categoryLabel = 'EMAIL WRITING';
          } else if (str.includes('voice') || str.includes('audio') || str.includes('speech')) {
            inferredCategory = 'voice';
            categoryLabel = 'VOICE OVER';
          } else if (str.includes('image') || str.includes('art') || str.includes('photo')) {
            inferredCategory = 'image';
            categoryLabel = 'IMAGE ART';
          } else if (str.includes('code') || str.includes('coding') || str.includes('developer')) {
            inferredCategory = 'coding';
            categoryLabel = 'DEVELOPMENT';
          } else if (matchingPreset) {
            inferredCategory = matchingPreset.category;
            categoryLabel = matchingPreset.categoryLabel;
          }

          let toolImg = matchingPreset?.iconImage;
          if (!toolImg) {
            if (inferredCategory === 'writing') toolImg = LOCAL_TOOL_IMAGES['email'];
            else if (inferredCategory === 'voice') toolImg = LOCAL_TOOL_IMAGES['voice'];
            else if (inferredCategory === 'image') toolImg = LOCAL_TOOL_IMAGES['image'];
            else toolImg = LOCAL_TOOL_IMAGES['code'];
          }

          return {
            id: apiTool._id || apiTool.slug || `tool_${index}`,
            name: apiTool.name || matchingPreset?.name || 'AI Tool',
            category: inferredCategory,
            categoryLabel,
            isFeatured: index < 4,
            description: apiTool.description || matchingPreset?.description || 'Supercharge your AI workflow.',
            useCasesCount: 8,
            pricingType: index % 2 === 0 ? 'free' : 'freemium',
            progressPercentage: 65,
            actionText: matchingPreset?.actionText || 'Open Tool',
            actionToolMode: (apiTool.type as any) || matchingPreset?.actionToolMode || 'chat',
            iconImage: toolImg,
            iconEmoji: matchingPreset?.iconEmoji || '⚡',
            isBookmarked: false,
          };
        });
        setTools(mappedApiTools);
      } else {
        setTools(DEFAULT_TOOLS_DATA);
      }
    } catch (err) {
      setTools(DEFAULT_TOOLS_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchToolsData();
  }, [fetchToolsData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchToolsData();
  };

  const toggleSaveBookmark = async (toolId: string) => {
    setTools((prevTools) =>
      prevTools.map((t) => (t.id === toolId ? { ...t, isBookmarked: !t.isBookmarked } : t))
    );

    try {
      await bookmarkApi.toggleBookmark({
        itemType: 'aitool',
        itemId: toolId,
      });
    } catch (err) {
      console.warn('[ToolsScreen] Bookmark toggle failed:', err);
    }
  };

  const handleActionPress = (tool: AIToolCardItem) => {
    if (tool.actionToolMode === 'email' || tool.id === 'email_writer' || tool.id.includes('email')) {
      navigation.navigate('AIEmailWriter');
    } else if (tool.actionToolMode === 'voice' || tool.id === 'voice_generator' || tool.id.includes('voice')) {
      navigation.navigate('AIVoiceGenerator');
    } else if (tool.actionToolMode === 'image' || tool.id === 'image_generator' || tool.id.includes('image')) {
      navigation.navigate('AIImageGenerator');
    } else if (
      tool.actionToolMode === 'code' ||
      (tool.actionToolMode as string) === 'coding' ||
      tool.id === 'code_generator' ||
      tool.id.includes('code') ||
      tool.name.toLowerCase().includes('code')
    ) {
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

    if (selectedCategory === 'writing') {
      return tool.category === 'writing' || str.includes('email') || str.includes('writing') || str.includes('mail');
    }
    if (selectedCategory === 'image') {
      return tool.category === 'image' || str.includes('image') || str.includes('art');
    }
    if (selectedCategory === 'voice') {
      return tool.category === 'voice' || str.includes('voice') || str.includes('audio');
    }
    if (selectedCategory === 'coding') {
      return tool.category === 'coding' || str.includes('code') || str.includes('coding');
    }

    return tool.category === selectedCategory;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 1. iOS HEADER */}
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
            <Text style={styles.headerSubtitleTag}>AI TOOLS</Text>
            <Text style={styles.headerMainTitle}>Explore AI tools</Text>
          </View>
        </View>



        {/* 3. CATEGORY FILTERS */}
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
          filteredTools.map((tool) => (
            <View key={tool.id} style={styles.toolCard}>
              {/* CARD TOP ROW (BADGES & SAVE BUTTON) */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.leftBadgesGroup}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{tool.categoryLabel}</Text>
                  </View>
                  {tool.isFeatured && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>FEATURED</Text>
                    </View>
                  )}
                </View>

                {/* SAVE BUTTON */}
                <TouchableOpacity
                  style={styles.savePillButton}
                  onPress={() => toggleSaveBookmark(tool.id)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={tool.isBookmarked ? 'bookmark-filled' : 'tag'}
                    size={13}
                    color={tool.isBookmarked ? COLORS.primary : '#E11D48'}
                  />
                  <Text style={[styles.savePillText, tool.isBookmarked && styles.savePillTextBookmarked]}>
                    {tool.isBookmarked ? 'Saved' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* CARD MAIN CONTENT ROW (IMAGE LEFT, CONTENT RIGHT) */}
              <View style={styles.cardMainRow}>
                {/* LARGE THUMBNAIL IMAGE */}
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

                {/* RIGHT CONTENT COLUMN */}
                <View style={styles.rightContentCol}>
                  <Text style={styles.toolTitleText}>{tool.name}</Text>
                  <Text style={styles.toolSubMetaText}>
                    {tool.useCasesCount} use cases • {tool.pricingType}
                  </Text>

                  {/* PROGRESS BAR */}
                  <View style={styles.cardProgressBarTrack}>
                    <View style={[styles.cardProgressBarFill, { width: `${tool.progressPercentage}%` }]} />
                  </View>

                  {/* OPEN TOOL BUTTON */}
                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={() => handleActionPress(tool)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionBtnPrimaryText}>{tool.actionText} →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
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
    paddingBottom: 16,
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
    marginBottom: 14,
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
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  headerMainTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  aiWorkspacePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    marginLeft: 8,
  },
  aiWorkspacePillText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    marginLeft: 6,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
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
    fontWeight: '600',
    color: '#334155',
  },
  activeCategoryChipText: {
    color: '#6D28D9',
    fontWeight: '800',
  },
  scrollListContent: {
    padding: 16,
    paddingBottom: 32,
  },
  toolCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  leftBadgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  featuredBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredBadgeText: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  savePillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  savePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  savePillTextBookmarked: {
    color: COLORS.primary,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailBox: {
    width: 140,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  emojiFallbackBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolEmojiText: {
    fontSize: 36,
  },
  rightContentCol: {
    flex: 1,
    justifyContent: 'center',
  },
  toolTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  toolSubMetaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  cardProgressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardProgressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  actionBtnPrimary: {
    backgroundColor: '#6366F1',
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
});
