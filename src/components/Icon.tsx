import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { COLORS } from '../constants/theme';

export type IconName =
  | 'home'
  | 'book-open'
  | 'bot'
  | 'award'
  | 'user'
  | 'chevron-left'
  | 'chevron-right'
  | 'check-circle'
  | 'lock'
  | 'play'
  | 'bookmark'
  | 'bookmark-filled'
  | 'flame'
  | 'search'
  | 'clock'
  | 'star'
  | 'code'
  | 'mail'
  | 'image'
  | 'log-out'
  | 'shield'
  | 'settings'
  | 'help-circle'
  | 'arrow-right'
  | 'arrow-left'
  | 'refresh-cw'
  | 'globe'
  | 'bell'
  | 'volume'
  | 'play-circle'
  | 'pause'
  | 'eye'
  | 'eye-off'
  | 'alert-circle'
  | 'x-circle'
  | 'info'
  | 'copy'
  | 'check'
  | 'chevron-down'
  | 'tag'
  | 'plus'
  | 'arrow-up'
  | 'mic'
  | 'sparkles'
  | 'paperclip'
  | 'file-text';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: TextStyle;
}

// Crisp iOS-friendly symbol map for native look
const ICON_MAP: Record<IconName, string> = {
  home: '🏠',
  'book-open': '📖',
  bot: '🤖',
  award: '🏆',
  user: '👤',
  'chevron-left': '‹',
  'chevron-right': '›',
  'check-circle': '✓',
  lock: '🔒',
  play: '▶',
  bookmark: '🔖',
  'bookmark-filled': '🏷️',
  flame: '🔥',
  search: '🔍',
  clock: '⏱️',
  star: '⭐',
  code: '💻',
  mail: '✉️',
  image: '🖼️',
  'log-out': '🚪',
  shield: '🛡️',
  settings: '⚙️',
  'help-circle': '❓',
  'arrow-right': '➔',
  'arrow-left': '←',
  'refresh-cw': '🔄',
  globe: '🌐',
  bell: '🔔',
  volume: '🔊',
  'play-circle': '▶️',
  pause: '⏸️',
  eye: '👁',
  'eye-off': '👁‍🗨',
  'alert-circle': '⚠️',
  'x-circle': '✕',
  info: 'ℹ️',
  copy: '📋',
  check: '✓',
  'chevron-down': '˅',
  tag: '🏷️',
  plus: '＋',
  'arrow-up': '↑',
  mic: '🎤',
  sparkles: '✨',
  paperclip: '📎',
  'file-text': '📄',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = COLORS.textPrimary,
  style,
}) => {
  if (name === 'eye-off') {
    return (
      <View style={[styles.eyeOffContainer, { width: size, height: size }, style]}>
        <Text style={{ fontSize: size * 0.9, color: color, includeFontPadding: false }}>👁️</Text>
        <View
          style={[
            styles.slashLine,
            {
              width: size * 1.1,
              height: 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    );
  }

  const symbol = ICON_MAP[name] || '•';

  return (
    <Text
      style={[
        styles.iconText,
        { fontSize: size, color: color, lineHeight: size * 1.2 },
        style,
      ]}
    >
      {symbol}
    </Text>
  );
};

const styles = StyleSheet.create({
  iconText: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  eyeOffContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slashLine: {
    position: 'absolute',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
});
