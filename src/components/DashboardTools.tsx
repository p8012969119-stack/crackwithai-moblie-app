import React, {useState} from 'react';
import {View, Text, FlatList, Pressable, Image, StyleSheet, ImageSourcePropType} from 'react-native';
import {AiTool} from '../types';
import {LearningIcon} from './learning/LearningLayout';

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
      <View style={styles.logo}>
        {source ? (
          <Image
            source={source}
            resizeMode="contain"
            onError={() => setFailed(true)}
            style={{width: 32, height: 32}}
          />
        ) : (
          <LearningIcon name="book" size={25} color="#6150C9" />
        )}
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {name}
      </Text>
      <Text numberOfLines={1} style={styles.category}>
        {category}
      </Text>
      <Text numberOfLines={2} style={styles.description}>
        {description}
      </Text>
      <Text style={styles.action}>Open tool →</Text>
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
      contentContainerStyle={{gap: 12, paddingVertical: 4}}
      renderItem={({item}) => (
        <ToolCard tool={item.tool} target={item.def} open={open} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    width: 210,
    padding: 17,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE6F2',
    gap: 8,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#F6F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#241C35',
  },
  category: {
    fontSize: 11,
    color: '#6150C9',
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    color: '#756D81',
  },
  action: {
    fontSize: 13,
    color: '#6150C9',
    fontWeight: '600',
    marginTop: 6,
  },
});
