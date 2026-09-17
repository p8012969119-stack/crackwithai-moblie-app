import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Topic } from '../types';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface TopicItemProps {
  topic: Topic;
  index: number;
}

export const TopicItem: React.FC<TopicItemProps> = ({ topic, index }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
        <Text style={styles.title}>{topic.title}</Text>
      </View>

      <Text style={styles.content}>{topic.content}</Text>

      {topic.imageUrl && (
        <Image
          source={{ uri: topic.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {topic.examples && topic.examples.length > 0 && (
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesHeader}>Key Examples / Code Snippets:</Text>
          {topic.examples.map((example, i) => (
            <View key={i} style={styles.exampleBox}>
              <Text style={styles.exampleText}>{example}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  numberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  numberText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    flex: 1,
  },
  content: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  examplesContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  examplesHeader: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  exampleBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  exampleText: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: '#212529',
  },
});
