import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Module, Lesson } from '../../types';
import {
  ActionButton,
  CourseProgress,
  LearningIcon,
  StatusBadge,
  LearningEmpty,
  learningStyles as s,
  palette,
} from './LearningLayout';

export function ModuleRoadmap({
  modules,
  nextLessonId,
  onLesson,
  busy = false,
}: {
  modules: Module[];
  nextLessonId?: string;
  onLesson: (lesson: Lesson) => void;
  busy?: boolean;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!modules.length)
    return (
      <LearningEmpty
        title="No modules available"
        message="The course roadmap will appear here when its lessons are available."
      />
    );

  return (
    <View style={styles.container}>
      {modules.map((module, index) => {
        const lessons = module.lessons || [];
        const completed = lessons.filter((lesson) => lesson.isCompleted).length;
        const required = lessons.filter(lesson => lesson.isRequired !== false);
        const done = required.length > 0 && required.every(lesson => lesson.isCompleted);
        const next = lessons.find(lesson => lesson.isUnlocked && !lesson.isCompleted);
        const available = lessons.some((lesson) => lesson.isUnlocked === true);
        const current = lessons.some((lesson) => lesson._id === nextLessonId);
        const open = expanded[module._id] ?? false;

        return (
          <View key={module._id} style={styles.roadmapRow}>
            <View style={styles.timelineColumn}>
              <View
                style={[
                  styles.timelineBadge,
                  done
                    ? styles.timelineDone
                    : current
                    ? styles.timelineCurrent
                    : styles.timelineDefault,
                ]}
              >
                {done ? (
                  <LearningIcon name="check" size={13} color={palette.gold} />
                ) : (
                  <Text
                    style={[
                      styles.timelineText,
                      current && styles.timelineTextCurrent,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              {index < modules.length - 1 && <View style={styles.timelineConnector} />}
            </View>

            <View
              style={[
                s.card,
                styles.moduleCard,
                current && styles.moduleCardCurrent,
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={module.title}
                accessibilityState={{ expanded: open }}
                onPress={() =>
                  setExpanded({
                    ...expanded,
                    [module._id]: !open,
                  })
                }
                style={styles.moduleHeader}
              >
                <View style={s.between}>
                  <Text style={s.label}>MODULE {String(index + 1).padStart(2, '0')}</Text>
                  <LearningIcon
                    name={open ? 'down' : 'next'}
                    size={15}
                    color={palette.muted}
                  />
                </View>
                <Text style={s.cardTitle}>{module.title}</Text>
                {module.description && (
                  <Text
                    style={s.small}
                    numberOfLines={open ? undefined : 2}
                  >
                    {module.description}
                  </Text>
                )}
                <View style={s.wrap}>
                  <StatusBadge
                    label={
                      done
                        ? 'Completed'
                        : current
                        ? 'Current module'
                        : available
                        ? 'Available'
                        : 'Locked'
                    }
                    tone={done ? 'gold' : current ? 'purple' : 'neutral'}
                    icon={done ? 'check' : !available ? 'lock' : undefined}
                  />
                  <Text style={[s.small, { paddingVertical: 4 }]}>
                    {lessons.length} lessons
                  </Text>
                </View>
              </Pressable>

              <CourseProgress
                compact
                progress={lessons.length ? (completed / lessons.length) * 100 : 0}
                label={completed + ' of ' + lessons.length + ' complete'}
                gold={done}
              />

              {!open && next && <ActionButton title={completed ? 'Continue Module' : 'Start Module'} loading={busy} onPress={() => {
                setExpanded(value => ({...value, [module._id]: true}));
                onLesson(next);
              }} />}
              {open && (
                <View style={styles.lessonsContainer}>
                  {lessons.map((lesson, i) => (
                    <Pressable
                      key={lesson._id}
                      accessibilityRole="button"
                      accessibilityLabel={
                        lesson.title +
                        '. ' +
                        (lesson.isCompleted
                          ? 'Completed'
                          : lesson.isUnlocked
                          ? 'Available'
                          : 'Locked')
                      }
                      accessibilityState={{ disabled: !lesson.isUnlocked }}
                      disabled={!lesson.isUnlocked || busy}
                      onPress={() => onLesson(lesson)}
                      style={({ pressed }) => [
                        styles.lessonRow,
                        pressed && styles.lessonRowPressed,
                      ]}
                    >
                      <View style={styles.lessonIconCol}>
                        {lesson.isCompleted ? (
                          <LearningIcon
                            name="check"
                            size={15}
                            color={palette.gold}
                          />
                        ) : !lesson.isUnlocked ? (
                          <LearningIcon
                            name="lock"
                            size={14}
                            color={palette.muted}
                          />
                        ) : (
                          <Text style={styles.lessonIndexText}>
                            {String(i + 1).padStart(2, '0')}
                          </Text>
                        )}
                      </View>
                      <View style={styles.lessonContentCol}>
                        <Text
                          style={[
                            styles.lessonTitle,
                            !lesson.isUnlocked && styles.lessonTitleLocked,
                          ]}
                        >
                          {lesson.title}
                        </Text>
                        {lesson.description && (
                          <Text style={s.small} numberOfLines={2}>
                            {lesson.description}
                          </Text>
                        )}
                        <Text
                          style={[
                            s.small,
                            lesson.isCompleted
                              ? s.gold
                              : lesson._id === nextLessonId
                              ? { color: palette.purple, fontWeight: '700' }
                              : {},
                          ]}
                        >
                          {lesson.isCompleted
                            ? 'Completed'
                            : lesson._id === nextLessonId
                            ? 'Continue here'
                            : lesson.isUnlocked
                            ? 'Available'
                            : 'Locked'}
                          {lesson.duration ? ' · ' + lesson.duration + ' min' : ''}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                  {!lessons.length && (
                    <Text style={s.small}>No lessons available yet.</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  roadmapRow: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineColumn: {
    width: 28,
    alignItems: 'center',
  },
  timelineBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  timelineDone: {
    backgroundColor: palette.goldTint,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  timelineCurrent: {
    backgroundColor: palette.purple,
  },
  timelineDefault: {
    backgroundColor: '#E2E8F0',
  },
  timelineText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.muted,
  },
  timelineTextCurrent: {
    color: palette.white,
  },
  timelineConnector: {
    width: 2,
    backgroundColor: '#E2E8F0',
    flex: 1,
    marginVertical: 4,
  },
  moduleCard: {
    flex: 1,
    padding: 18,
    marginBottom: 16,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  moduleCardCurrent: {
    borderColor: '#C7D2FE',
    backgroundColor: palette.white,
  },
  moduleHeader: {
    gap: 8,
    minHeight: 44,
  },
  lessonsContainer: {
    gap: 0,
    marginTop: 4,
  },
  lessonRow: {
    paddingVertical: 13,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  lessonRowPressed: {
    opacity: 0.75,
  },
  lessonIconCol: {
    width: 24,
    paddingTop: 3,
  },
  lessonIndexText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.purple,
    fontVariant: ['tabular-nums'],
  },
  lessonContentCol: {
    flex: 1,
    gap: 4,
  },
  lessonTitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: palette.ink,
  },
  lessonTitleLocked: {
    color: palette.muted,
  },
});
