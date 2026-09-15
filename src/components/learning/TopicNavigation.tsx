import React, { useEffect, useRef } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import {
  LearningIcon,
  palette,
  useReducedMotion,
} from './LearningLayout';

export function TopicNavigation({
  topics,
  activeIndex,
  completedIndices,
  onSelect,
}: {
  topics: { title: string }[];
  activeIndex: number;
  completedIndices: number[];
  onSelect: (index: number) => void;
}) {
  const scroll = useRef<ScrollView>(null);
  const positions = useRef<number[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    const x = positions.current[activeIndex];
    if (x !== undefined)
      scroll.current?.scrollTo({ x: Math.max(0, x - 12), animated: !reduced });
  }, [activeIndex, reduced]);

  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {topics.map((topic, index) => {
        const selected = index === activeIndex;
        const completed = completedIndices.includes(index);

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="tab"
            accessibilityLabel={topic.title}
            accessibilityState={{ selected }}
            onLayout={(event) => {
              positions.current[index] = event.nativeEvent.layout.x;
              if (selected)
                scroll.current?.scrollTo({
                  x: Math.max(0, event.nativeEvent.layout.x - 12),
                  animated: false,
                });
            }}
            style={[
              styles.chip,
              selected ? styles.chipSelected : styles.chipDefault,
            ]}
            onPress={() => onSelect(index)}
          >
            <View style={styles.chipInner}>
              <Text
                numberOfLines={1}
                style={[
                  styles.chipText,
                  selected ? styles.chipTextSelected : styles.chipTextDefault,
                ]}
              >
                {index + 1}. {topic.title}
              </Text>
              {completed && (
                <LearningIcon
                  name="check"
                  size={12}
                  color={selected ? palette.purple : palette.green}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    maxWidth: 240,
  },
  chipDefault: {
    backgroundColor: palette.white,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: palette.tint,
    borderColor: palette.purple,
  },
  chipInner: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  chipTextDefault: {
    color: palette.muted,
  },
  chipTextSelected: {
    color: palette.purple,
    fontWeight: '700',
  },
});
