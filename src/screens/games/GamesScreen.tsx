import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';

interface GameItem {
  id: string;
  title: string;
  category: string;
  description: string;
  emoji: string;
  xpReward: number;
  isUnlocked: boolean;
}

const GAMES: GameItem[] = [
  {
    id: 'g1',
    title: 'AI Quiz Speed Challenge',
    category: 'Speed Quiz',
    description: 'Test your AI knowledge against the clock in 60 seconds!',
    emoji: '⚡',
    xpReward: 150,
    isUnlocked: true,
  },
  {
    id: 'g2',
    title: 'Prompt Master Challenge',
    category: 'Prompt Engineering',
    description: 'Craft optimal prompts to solve real-world AI scenarios.',
    emoji: '🎯',
    xpReward: 200,
    isUnlocked: true,
  },
  {
    id: 'g3',
    title: 'AI Tool Guessing Game',
    category: 'Tool Trivia',
    description: 'Guess the AI tool from features and visual hints.',
    emoji: '🧩',
    xpReward: 100,
    isUnlocked: true,
  },
  {
    id: 'g4',
    title: 'Neural Network Simulator',
    category: 'Advanced AI',
    description: 'Build neural layers and tune weights interactively.',
    emoji: '🧠',
    xpReward: 300,
    isUnlocked: false,
  },
];

export const GamesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const handleStartGame = (game: GameItem) => {
    if (!game.isUnlocked) {
      Alert.alert('Game Locked', 'Complete Course Level 2 to unlock this challenge!');
      return;
    }
    Alert.alert('Starting Game', `Launching ${game.title}! Get ready to earn +${game.xpReward} XP.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs');
              }
            }}
            style={styles.backBtn}
          >
            <Icon name="chevron-left" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Learning Games Hub</Text>
        </View>
        <Text style={styles.headerSub}>Gamified challenges to sharpen your AI & Prompting skills</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {GAMES.map((game) => (
          <View key={game.id} style={[styles.gameCard, !game.isUnlocked && styles.lockedGameCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.emojiBox}>
                <Text style={styles.emoji}>{game.emoji}</Text>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameCategory}>{game.category}</Text>
              </View>
              <View style={styles.xpTag}>
                <Text style={styles.xpText}>+{game.xpReward} XP</Text>
              </View>
            </View>

            <Text style={styles.gameDesc}>{game.description}</Text>

            <Button
              title={game.isUnlocked ? 'Play Challenge' : '🔒 Locked (Reach Level 2)'}
              variant={game.isUnlocked ? 'primary' : 'secondary'}
              size="medium"
              onPress={() => handleStartGame(game)}
              disabled={!game.isUnlocked}
              style={styles.playBtn}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backBtn: {
    marginRight: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  headerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  gameCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  lockedGameCard: {
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  emoji: {
    fontSize: 22,
  },
  cardMeta: {
    flex: 1,
  },
  gameTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  gameCategory: {
    ...TYPOGRAPHY.captionBold,
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 2,
  },
  xpTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  xpText: {
    ...TYPOGRAPHY.captionBold,
    fontSize: 11,
    color: '#D97706',
  },
  gameDesc: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  playBtn: {
    borderRadius: RADIUS.lg,
  },
});
