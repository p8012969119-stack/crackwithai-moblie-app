import React, {useState} from 'react';
import {Image, ImageSourcePropType, View} from 'react-native';
import {CONFIG, getDevApiBaseUrl} from '../constants/config';
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
  // Full Stack & Curriculum Course Logos
  'html': require('../assets/tool-logos/html.png'),
  'css': require('../assets/tool-logos/css.png'),
  'javascript': require('../assets/tool-logos/javascript.png'),
  'nodejs': require('../assets/tool-logos/nodejs.png'),
  'expressjs': require('../assets/tool-logos/expressjs.png'),
  'mongodb': require('../assets/tool-logos/mongodb.png'),
  'restapi': require('../assets/tool-logos/restapi.png'),
  'auth': require('../assets/tool-logos/auth.png'),
  'capstone': require('../assets/tool-logos/capstone.png'),
};
const slugs: Record<string, string> = {
  'chatgpt-mastery': 'chatgpt', 'google-gemini-ai': 'gemini', 'claude-ai-professional': 'claude',
  'midjourney-ai-image-creation': 'midjourney', 'nano-banana-ai': 'nano-banana',
  'cursor-ai-coding-assistant': 'cursor', 'github-copilot': 'copilot', 'canva-ai-design': 'canva',
  'perplexity-ai-research': 'perplexity', 'runway-ai-video-generation': 'runway',
  'elevenlabs-ai-voice': 'elevenlabs', 'notion-ai-productivity': 'notion',
  'pika-ai-video-creator': 'pika', 'gamma-ai-presentation': 'gamma', 'zapier-ai-automation': 'zapier',
  // Full Stack Course Slugs
  'html': 'html', 'html-course': 'html', 'html-from-beginner-to-practical': 'html', 'html-fundamentals': 'html',
  'css': 'css', 'css-modern-responsive-design': 'css', 'css-responsive-design': 'css',
  'javascript': 'javascript', 'javascript-modern-es6': 'javascript', 'js': 'javascript',
  'nodejs': 'nodejs', 'nodejs-server-runtime': 'nodejs', 'node': 'nodejs',
  'expressjs': 'expressjs', 'expressjs-backend-framework': 'expressjs', 'express': 'expressjs',
  'mongodb': 'mongodb', 'mongodb-database-mongoose': 'mongodb', 'mongo': 'mongodb',
  'restapi': 'restapi', 'rest-api': 'restapi', 'rest-api-architecture': 'restapi', 'rest-auth': 'restapi',
  'auth': 'auth', 'authentication': 'auth', 'authentication-jwt-security': 'auth',
  'capstone': 'capstone', 'fullstack-final-project': 'capstone', 'final-project': 'capstone',
};
export function resolveLogoUri(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/i.test(value)) return value;
  if (/^\/assets\/course-logos\/[a-z0-9-]+\.png$/.test(value)) return getDevApiBaseUrl().replace(/\/api\/?$/, '') + value;
  return undefined;
}
export const ToolLogo = ({courseKey, slug, logoUrl, size = 64}: {courseKey: string; slug?: string; logoUrl?: string; size?: number}) => {
  // Slugs are authoritative. Never pick another brand from a title's incidental words.
  const normalizedTitle = courseKey.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let key = slugs[slug || ''] || slugs[normalizedTitle];
  if (!key) {
    const s = `${slug || ''} ${normalizedTitle}`.toLowerCase();
    if (s.includes('html')) key = 'html';
    else if (s.includes('css')) key = 'css';
    else if (s.includes('javascript') || s.includes('js')) key = 'javascript';
    else if (s.includes('nodejs') || s.includes('node')) key = 'nodejs';
    else if (s.includes('express')) key = 'expressjs';
    else if (s.includes('mongo')) key = 'mongodb';
    else if (s.includes('rest') || s.includes('api')) key = 'restapi';
    else if (s.includes('auth') || s.includes('jwt') || s.includes('security')) key = 'auth';
    else if (s.includes('capstone') || s.includes('final-project')) key = 'capstone';
  }
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
