import React, {useState} from 'react';
import {Image, ImageSourcePropType, View} from 'react-native';
import {CONFIG} from '../constants/config';
import {LearningIcon} from './learning/LearningLayout';
const logos: Record<string, ImageSourcePropType> = {
  'chatgpt': require('../assets/tool-logos/chatgpt.png'),
  'gemini': require('../assets/tool-logos/gemini.png'),
  'claude': require('../assets/tool-logos/claude.png'),
  'midjourney': require('../assets/tool-logos/midjourney.png'),
  'nano-banana': require('../assets/tool-logos/nano-banana.png'),
  'cursor': require('../assets/tool-logos/cursor.png'),
  'copilot': require('../assets/tool-logos/copilot.png'),
  'canva': require('../assets/tool-logos/canva.png'),
  'perplexity': require('../assets/tool-logos/perplexity.png'),
  'runway': require('../assets/tool-logos/runway.png'),
  'elevenlabs': require('../assets/tool-logos/elevenlabs.png'),
  'notion': require('../assets/tool-logos/notion.png'),
  'pika': require('../assets/tool-logos/pika.png'),
  'gamma': require('../assets/tool-logos/gamma.png'),
  'zapier': require('../assets/tool-logos/zapier.png'),
};
const slugs: Record<string, string> = {
  'chatgpt-mastery': 'chatgpt', 'google-gemini-ai': 'gemini', 'claude-ai-professional': 'claude',
  'midjourney-ai-image-creation': 'midjourney', 'nano-banana-ai': 'nano-banana',
  'cursor-ai-coding-assistant': 'cursor', 'github-copilot': 'copilot', 'canva-ai-design': 'canva',
  'perplexity-ai-research': 'perplexity', 'runway-ai-video-generation': 'runway',
  'elevenlabs-ai-voice': 'elevenlabs', 'notion-ai-productivity': 'notion',
  'pika-ai-video-creator': 'pika', 'gamma-ai-presentation': 'gamma', 'zapier-ai-automation': 'zapier',
};
export function resolveLogoUri(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/i.test(value)) return value;
  if (/^\/assets\/course-logos\/[a-z0-9-]+\.png$/.test(value)) return CONFIG.API_BASE_URL.replace(/\/api\/?$/, '') + value;
  return undefined;
}
export const ToolLogo = ({courseKey, slug, logoUrl, size = 64}: {courseKey: string; slug?: string; logoUrl?: string; size?: number}) => {
  // Slugs are authoritative. Never pick another brand from a title's incidental words.
  const normalizedTitle = courseKey.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const key = slugs[slug || normalizedTitle];
  const local = key ? logos[key] : undefined;
  const uri = resolveLogoUri(logoUrl);
  const [failedUri, setFailedUri] = useState<string>();
  // Bundled copies of our own catalog assets also work offline. Custom logos use HTTPS.
  const bundled = local && (!logoUrl || logoUrl === `/assets/course-logos/${key}.png`);
  const source = bundled ? local : uri && failedUri !== uri ? {uri} : local;
  return <View style={{width: size, height: size, borderRadius: size * .25, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEEAF3', padding: size * .14, alignItems: 'center', justifyContent: 'center'}}>
    {source ? <Image accessibilityLabel={`${key === 'nano-banana' ? 'Google Gemini — Nano Banana' : courseKey} logo`} source={source} resizeMode="contain" onError={() => setFailedUri(uri)} style={{width: '100%', height: '100%'}} /> : <LearningIcon name="book" size={size * .45} color="#82758F" />}
  </View>;
};
