import React, {useState} from 'react';
import {View, Text, FlatList, Pressable, Image, StyleSheet, ImageSourcePropType} from 'react-native';
import {AiTool} from '../types';
import {LearningIcon} from './learning/LearningLayout';
import {Icon} from './Icon';
import {COLORS, SPACING} from '../constants/theme';

interface TargetToolDef {
  key: string;
  keyword: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  screen: string;
  asset: ImageSourcePropType;
}

const DASHBOARD_4_TOOLS: TargetToolDef[] = [
  {
    key: 'email',
    keyword: 'email',
    slug: 'ai-email-writer',
    name: 'AI Email Writer',
    category: 'AI Writing',
    description: 'Draft professional outreach, sales proposals, and newsletter copy.',
    screen: 'AIEmailWriter',
    asset: require('../assets/tools/email_writer.png'),
  },
  {
    key: 'voice',
    keyword: 'voice',
    slug: 'ai-voice-generator',
    name: 'AI Voice Generator',
    category: 'AI Voice',
    description: 'Convert text to natural human-like voice recordings.',
    screen: 'AIVoiceGenerator',
    asset: require('../assets/tools/voice_generator.png'),
  },
  {
    key: 'code',
    keyword: 'code',
    slug: 'ai-code-generator',
    name: 'AI Code Generator',
    category: 'AI Coding',
    description: 'Generate production-ready code, debug, and optimize algorithms.',
    screen: 'AICodeGenerator',
    asset: require('../assets/tools/code_generator.png'),
  },
  {
    key: 'image',
    keyword: 'image',
    slug: 'ai-image-generator',
    name: 'AI Image Generator',
    category: 'AI Image',
    description: 'Create high quality images, artwork, and graphics from prompts.',
    screen: 'AIImageGenerator',
    asset: require('../assets/tools/image_generator.png'),
  },
];

const ToolCard = ({
  tool,
  target,
  open,
}: {
  tool?: AiTool;
  target: TargetToolDef;
  open: (screen: string) => void;
}) => {
  const [failed, setFailed] = useState(false);
  const uri = tool?.logo || tool?.iconUrl;
  const source = uri && /^https:\/\//.test(uri) && !failed ? {uri} : target.asset;
  const name = tool?.name || target.name;
  const category = tool?.category || target.category;
  const description = tool?.description || target.description;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${name}`}
      onPress={() => open(target.screen)}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.logo}>
          {source ? (
            <Image
              source={source}
              resizeMode="contain"
              onError={() => setFailed(true)}
              style={{width: 28, height: 28}}
            />
          ) : (
            <LearningIcon name="book" size={24} color="#6150C9" />
          )}
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{category.toUpperCase()}</Text>
        </View>
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {name}
      </Text>
      <Text numberOfLines={2} style={styles.description}>
        {description}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Instant AI Tool • Free</Text>
      </View>

      <View style={styles.ctaRow}>
        <Text style={styles.ctaText}>Open Tool</Text>
        <Icon name="arrow-right" size={14} color={COLORS.primary || '#6150C9'} />
      </View>
    </Pressable>
  );
};

export const DashboardTools = ({
  tools,
  open,
}: {
  tools: AiTool[];
  open: (screen: string) => void;
}) => {
  const fourTools = DASHBOARD_4_TOOLS.map(def => {
    const matchedTool = tools.find(t => {
      const haystack = `${t.slug || ''} ${t.flowType || ''} ${t.name || ''} ${t.category || ''}`.toLowerCase();
      return haystack.includes(def.keyword);
    });
    return {def, tool: matchedTool};
  });

  return (
    <FlatList
      horizontal
      data={fourTools}
      keyExtractor={item => item.def.key}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingRight: SPACING.md, gap: 12, paddingVertical: 4}}
      renderItem={({item}) => (
        <ToolCard tool={item.tool} target={item.def} open={open} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F6F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 16.5,
    lineHeight: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6150C9',
  },
});
