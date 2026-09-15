import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Icon } from './Icon';

interface QuizOptionProps {
  optionText: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean | null;
  isAnswered?: boolean;
  onSelect: () => void;
}

export const QuizOption: React.FC<QuizOptionProps> = ({
  optionText,
  index,
  isSelected,
  isCorrect = null,
  isAnswered = false,
  onSelect,
}) => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const optionLetter = letters[index % letters.length];

  const getOptionStyle = () => {
    if (isAnswered) {
      if (isCorrect === true && isSelected) {
        return styles.correctOption;
      }
      if (isCorrect === false && isSelected) {
        return styles.incorrectOption;
      }
      if (isCorrect === true) {
        return styles.correctOption;
      }
    }
    if (isSelected) {
      return styles.selectedOption;
    }
    return styles.defaultOption;
  };

  const getLetterStyle = () => {
    if (isAnswered && isCorrect === true && (isSelected || isCorrect)) {
      return styles.correctLetter;
    }
    if (isAnswered && isCorrect === false && isSelected) {
      return styles.incorrectLetter;
    }
    if (isSelected) {
      return styles.selectedLetter;
    }
    return styles.defaultLetter;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isAnswered}
      style={[styles.container, getOptionStyle()]}
      onPress={onSelect}
    >
      <View style={[styles.letterBadge, getLetterStyle()]}>
        <Text style={styles.letterText}>{optionLetter}</Text>
      </View>
      <Text style={styles.optionText}>{optionText}</Text>

      {isAnswered && isSelected && isCorrect === true && (
        <Icon name="check-circle" size={20} color={COLORS.success} />
      )}
      {isAnswered && isSelected && isCorrect === false && (
        <Icon name="help-circle" size={20} color={COLORS.danger} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
  },
  defaultOption: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  selectedOption: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  correctOption: {
    backgroundColor: COLORS.badgeSuccessBg,
    borderColor: COLORS.success,
  },
  incorrectOption: {
    backgroundColor: '#FCE8E6',
    borderColor: COLORS.danger,
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  defaultLetter: {
    backgroundColor: COLORS.inputBackground,
  },
  selectedLetter: {
    backgroundColor: COLORS.primary,
  },
  correctLetter: {
    backgroundColor: COLORS.success,
  },
  incorrectLetter: {
    backgroundColor: COLORS.danger,
  },
  letterText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textPrimary,
  },
  optionText: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 15,
  },
});
