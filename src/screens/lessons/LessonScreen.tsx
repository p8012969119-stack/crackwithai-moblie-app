import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import { TopicNavigation } from '../../components/learning/TopicNavigation';
import { useFocusEffect } from '@react-navigation/native';
import { courseApi, LearningPath, LessonActivity } from '../../api/courseApi';
import { progressApi } from '../../api/progressApi';
import { bookmarkApi } from '../../api/bookmarkApi';
import { aiApi } from '../../api/aiApi';
import { entityId } from '../../api/learningTransport';
import { speakTextOutLoud, stopSpeechSound } from '../../utils/speechUtils';
import {
  LearningLayout,
  ActionButton as Button,
  CourseProgress,
  LearningIcon,
  LearningEmpty,
  LearningSkeleton,
  StatusBadge,
  ReadingContent,
  learningStyles as s,
  palette,
} from '../../components/learning/LearningLayout';

export const LessonScreen = ({ route, navigation }: any) => {
  const { lessonId, courseId } = route.params;
  const [path, setPath] = useState<LearningPath | null>(null);
  const [index, setIndex] = useState(0);
  const [activity, setActivity] = useState<LessonActivity>({
    lesson: lessonId,
    readTopics: [],
    practicedTopics: [],
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const response = await courseApi.getLearningPath(courseId);
      const lesson = response.data.lessons.find(
        (item) => item._id === lessonId,
      );
      if (!lesson || !lesson.isUnlocked)
        throw new Error('Complete previous lessons to unlock this lesson.');
      setPath(response.data);
      const saved = response.data.progress?.lessonActivity?.find(
        (item) => entityId(item.lesson) === lessonId,
      );
      setActivity(
        saved || {
          lesson: lessonId,
          readTopics: [],
          practicedTopics: [],
        },
      );
    } catch (e: any) {
      setError(e.message);
    }
  }, [courseId, lessonId]);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {
        stopSpeechSound();
        setSpeaking(false);
      };
    }, [load]),
  );

  useEffect(() => {
    setIndex(0);
    setAnswer('');
  }, [lessonId]);

  const lesson = path?.lessons.find((item) => item._id === lessonId);
  const topics = lesson?.topicContents || [];
  const topic = topics[index];

  const record = async (action: 'read' | 'practice') => {
    try {
      setBusy(true);
      setActivity(
        (await progressApi.recordActivity(lessonId, index, action)).data,
      );
    } catch (e: any) {
      Alert.alert('Progress not saved', e.message);
    } finally {
      setBusy(false);
    }
  };

  if (error)
    return (
      <LearningLayout navigation={navigation} label="Lesson">
        <LearningEmpty
          title="Unable to open this lesson"
          message={error}
          onRetry={load}
          icon="info"
        />
      </LearningLayout>
    );

  if (!path || !lesson)
    return (
      <LearningLayout navigation={navigation} label="Lesson">
        <LearningSkeleton label="Loading your lesson content…" />
      </LearningLayout>
    );

  if (!topic)
    return (
      <LearningLayout navigation={navigation} label={lesson.title}>
        <LearningEmpty
          title="Content unavailable"
          message="This lesson’s content is not available yet. Please try again."
          onRetry={load}
        />
      </LearningLayout>
    );

  const module = path.modules.find(
    (item) => item._id === entityId(lesson.module),
  );
  const read = lesson.isCompleted || activity.readTopics.includes(index);
  const practiced =
    lesson.isCompleted || activity.practicedTopics.includes(index);
  const ready =
    lesson.isCompleted ||
    topics.every(
      (_, i) =>
        activity.readTopics.includes(i) && activity.practicedTopics.includes(i),
    );
  const lessonNumber =
    path.lessons.findIndex((item) => item._id === lessonId) + 1;
  const topicProgress = lesson.isCompleted
    ? 100
    : (topics.reduce(
        (total, _, i) =>
          total +
          Number(activity.readTopics.includes(i)) +
          Number(activity.practicedTopics.includes(i)),
        0,
      ) /
        (topics.length * 2)) *
      100;

  const changeTopic = (value: number) => {
    stopSpeechSound();
    setSpeaking(false);
    setIndex(value);
  };

  const nextLesson = path.lessons[lessonNumber];
  const previousLesson = path.lessons[lessonNumber - 2];

  return (
    <LearningLayout
      navigation={navigation}
      label={module?.title || 'Course Lesson'}
      contentKey={lessonId + '-' + index}
      footer={
        <View style={s.row}>
          {index > 0 && (
            <Button
              title="Previous"
              variant="outline"
              onPress={() => changeTopic(index - 1)}
              style={{ flex: 1 }}
            />
          )}
          <Button
            style={{ flex: 2 }}
            title={
              index < topics.length - 1
                ? 'Next Topic'
                : lesson.isCompleted && nextLesson?.isUnlocked
                ? 'Next Lesson'
                : lesson.isCompleted
                ? 'Review Quiz'
                : 'Continue to Quiz'
            }
            disabled={index === topics.length - 1 && !ready}
            onPress={() => {
              if (index < topics.length - 1) changeTopic(index + 1);
              else if (lesson.isCompleted && nextLesson?.isUnlocked)
                navigation.navigate('Lesson', {
                  lessonId: nextLesson._id,
                  courseId,
                });
              else
                navigation.navigate('Quiz', {
                  courseId,
                  lessonId,
                });
            }}
          />
        </View>
      }
    >
      {/* Lesson Heading Card */}
      <View style={styles.lessonHeaderBlock}>
        <View style={s.between}>
          <Text style={s.label}>
            LESSON {String(lessonNumber).padStart(2, '0')} / {path.lessons.length}
          </Text>
          {lesson.isCompleted && (
            <StatusBadge label="Completed" tone="gold" icon="check" />
          )}
        </View>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        {lesson.description && (
          <Text style={[s.body, s.muted]}>{lesson.description}</Text>
        )}
        <CourseProgress progress={topicProgress} label="Reading & Practice" />
      </View>

      {/* Action Bar: Bookmark & Speech Audio */}
      <View style={[s.between, styles.actionsRow]}>
        <TouchableOpacity
          style={[s.row, s.touch]}
          accessibilityRole="button"
          accessibilityState={{ selected: bookmarked }}
          onPress={async () => {
            try {
              const r = await bookmarkApi.toggleBookmark({
                itemType: 'lesson',
                itemId: lessonId,
              });
              setBookmarked(Boolean(r.data?.isBookmarked));
            } catch (e: any) {
              Alert.alert('Bookmark unavailable', e.message);
            }
          }}
        >
          <LearningIcon
            name="bookmark"
            size={18}
            color={bookmarked ? palette.purple : palette.muted}
          />
          <Text style={s.small}>{bookmarked ? 'Saved' : 'Save Lesson'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.row, s.touch]}
          accessibilityRole="button"
          onPress={() => {
            if (speaking) stopSpeechSound();
            else
              speakTextOutLoud(
                topic.title + '. ' + topic.content + '. ' + topic.example,
              );
            setSpeaking(!speaking);
          }}
        >
          <LearningIcon
            name={speaking ? 'pause' : 'play'}
            size={16}
            color={palette.purple}
          />
          <Text style={s.small}>
            {speaking ? 'Pause Audio' : 'Listen Narration'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Topic Chips Navigation */}
      <TopicNavigation
        topics={topics}
        activeIndex={index}
        completedIndices={
          lesson.isCompleted
            ? topics.map((_, i) => i)
            : activity.practicedTopics
        }
        onSelect={changeTopic}
      />

      {/* Main Topic Reading Content */}
      <View style={styles.topicContentBlock}>
        <Text style={s.label}>
          TOPIC {index + 1} OF {topics.length}
        </Text>
        <Text style={styles.topicTitle}>{topic.title}</Text>
        <ReadingContent text={topic.content} />
      </View>

      {/* Worked Example Callout */}
      {topic.example && (
        <View style={[s.card, s.tinted]}>
          <Text style={s.label}>WORKED EXAMPLE</Text>
          <ReadingContent text={topic.example} />
        </View>
      )}

      {/* Key Takeaway Callout */}
      {topic.keyTakeaway && (
        <View style={styles.takeawayBox}>
          <View style={styles.takeawayInner}>
            <Text style={s.cardTitle}>Key Takeaway</Text>
            <ReadingContent text={topic.keyTakeaway} />
          </View>
        </View>
      )}

      {/* Topic Complete Action Button */}
      <Button
        title={read ? 'Topic Completed' : 'Mark Topic Complete'}
        variant="outline"
        disabled={Boolean(read)}
        loading={busy}
        onPress={() => record('read')}
      />

      {/* Interactive Practice Box */}
      <View style={s.card}>
        <View style={s.between}>
          <Text style={s.heading}>Put it into Practice</Text>
          {practiced && <LearningIcon name="check" color={palette.green} />}
        </View>
        {topic.practice?.goal && (
          <Text style={[s.body, s.muted]}>{topic.practice.goal}</Text>
        )}
        {topic.practice?.steps?.map((step: string, i: number) => (
          <View key={i} style={[s.row, { alignItems: 'flex-start' }]}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{i + 1}</Text>
            </View>
            <Text selectable style={[s.body, { flex: 1 }]}>
              {step}
            </Text>
          </View>
        ))}
        {topic.practice?.expectedResult && (
          <View style={styles.goalContainer}>
            <Text style={s.label}>EXPECTED RESULT</Text>
            <Text style={s.body}>{topic.practice.expectedResult}</Text>
          </View>
        )}
        {topic.practice?.practiceUrl && (
          <Button
            variant="outline"
            title={'Open ' + (topic.practice.platform || 'practice tool')}
            onPress={() =>
              Linking.openURL(topic.practice.practiceUrl).catch(() =>
                Alert.alert(
                  'Unable to open tool',
                  'Check your internet connection and try again.',
                ),
              )
            }
          />
        )}
        <Button
          title={practiced ? 'Practice Completed' : 'Mark Practice Complete'}
          disabled={!read || Boolean(practiced)}
          loading={busy}
          onPress={() => record('practice')}
        />
        {!read && (
          <Text style={s.small}>
            Mark this topic complete before saving your practice.
          </Text>
        )}
      </View>

      {/* Quiz Readiness Card */}
      <View style={[s.card, ready && s.tinted]}>
        <View style={s.row}>
          <LearningIcon
            name={lesson.isCompleted ? 'check' : ready ? 'book' : 'lock'}
            color={ready ? palette.purple : palette.muted}
          />
          <Text style={s.cardTitle}>
            {lesson.isCompleted
              ? 'Lesson Completed'
              : ready
              ? 'Ready for Quiz'
              : 'Lesson Quiz'}
          </Text>
        </View>
        <Text style={[s.body, s.muted]}>
          {lesson.isCompleted
            ? 'Your completed lesson progress is saved.'
            : ready
            ? 'You’ve completed the reading and practice. Continue to the quiz to test your knowledge.'
            : 'Complete each topic and practice task to unlock the lesson quiz.'}
        </Text>
        {ready && index < topics.length - 1 && (
          <Button
            title={lesson.isCompleted ? 'Review Quiz' : 'Continue to Quiz'}
            onPress={() =>
              navigation.navigate('Quiz', {
                courseId,
                lessonId,
              })
            }
          />
        )}
      </View>

      {/* AI Assistant Section */}
      <View style={s.card}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ expanded: assistantOpen }}
          onPress={() => setAssistantOpen(!assistantOpen)}
          style={s.between}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={s.cardTitle}>Need a little clarity?</Text>
            <Text style={s.small}>Ask your CrackWithAI assistant</Text>
          </View>
          <LearningIcon name={assistantOpen ? 'down' : 'next'} size={16} />
        </TouchableOpacity>
        {assistantOpen && (
          <>
            <TextInput
              accessibilityLabel="Your learning question"
              placeholder="Ask anything about this topic…"
              placeholderTextColor={palette.muted}
              multiline
              value={question}
              onChangeText={setQuestion}
              style={styles.aiInput}
            />
            <Button
              title="Ask AI"
              loading={asking}
              disabled={!question.trim()}
              onPress={async () => {
                try {
                  setAsking(true);
                  const r = await aiApi.chat(
                    'Course: ' +
                      path.course.title +
                      '. Lesson: ' +
                      lesson.title +
                      '. Topic: ' +
                      topic.title +
                      '. Explain for a beginner: ' +
                      question,
                  );
                  setAnswer(
                    r.data?.response ||
                      r.data?.text ||
                      'No response received. Please retry.',
                  );
                } catch (e: any) {
                  Alert.alert('Assistant unavailable', e.message);
                } finally {
                  setAsking(false);
                }
              }}
            />
            {Boolean(answer) && <ReadingContent text={answer} />}
          </>
        )}
      </View>

      {/* Further Reading Links */}
      {Boolean(lesson.resources?.length) && (
        <View style={{ gap: 10 }}>
          <Text style={s.label}>FURTHER READING</Text>
          {lesson.resources?.map((url, i) => (
            <TouchableOpacity
              accessibilityRole="link"
              key={url}
              style={[s.touch, { gap: 2 }]}
              onPress={() =>
                Linking.openURL(url).catch(() =>
                  Alert.alert('Unable to open source'),
                )
              }
            >
              <Text
                style={[
                  s.small,
                  { color: palette.purple, fontWeight: '700' },
                ]}
              >
                Official Resource {i + 1}
              </Text>
              <Text numberOfLines={1} style={s.small}>
                {url}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {previousLesson?.isUnlocked && (
        <Button
          title="Previous Lesson"
          variant="outline"
          onPress={() =>
            navigation.navigate('Lesson', {
              lessonId: previousLesson._id,
              courseId,
            })
          }
        />
      )}
    </LearningLayout>
  );
};

const styles = StyleSheet.create({
  lessonHeaderBlock: {
    gap: 12,
  },
  lessonTitle: {
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '800',
    color: palette.ink,
    letterSpacing: -0.4,
  },
  actionsRow: {
    flexWrap: 'wrap',
  },
  topicContentBlock: {
    gap: 12,
  },
  topicTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: palette.ink,
    letterSpacing: -0.3,
  },
  takeawayBox: {
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderColor: palette.purple,
  },
  takeawayInner: {
    flex: 1,
    gap: 8,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: palette.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.purple,
  },
  goalContainer: {
    gap: 6,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiInput: {
    minHeight: 100,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    textAlignVertical: 'top',
    fontSize: 15,
    color: palette.ink,
    backgroundColor: '#F8FAFC',
  },
});
