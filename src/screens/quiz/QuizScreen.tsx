import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { quizApi, LearningQuiz } from '../../api/quizApi';
import {
  LearningLayout,
  ActionButton as Button,
  CourseProgress,
  LearningIcon,
  LearningEmpty,
  LearningSkeleton,
  LearningReveal,
  StatusBadge,
  learningStyles as s,
  palette,
} from '../../components/learning/LearningLayout';

export const QuizScreen = ({ route, navigation }: any) => {
  const { courseId, lessonId } = route.params;
  const [quiz, setQuiz] = useState<LearningQuiz | null>(null);
  const [attemptId, setAttemptId] = useState('');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submissionKey = useRef(
    `lesson-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  const load = useCallback(async () => {
    try {
      setError('');
      if (lessonId) setQuiz((await quizApi.getLessonQuiz(lessonId)).data);
      else {
        const available = await quizApi.getCourseQuiz(courseId);
        if (!available.data) throw new Error(available.message);
        const start = await quizApi.startQuiz(available.data._id);
        setQuiz(start.data.quiz);
        setAttemptId(start.data.attemptId);
        const result = (await quizApi.getAttemptResult(start.data.attemptId))
          .data;
        setAnswers(
          Object.fromEntries(
            (result.answers || []).map((a: any) => [
              a.questionId,
              a.selectedOption,
            ]),
          ),
        );
      }
    } catch (e: any) {
      setError(e.message);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error)
    return (
      <LearningLayout navigation={navigation} label="Assessment">
        <LearningEmpty
          title="Unable to load your quiz"
          message={error}
          onRetry={load}
          icon="info"
        />
      </LearningLayout>
    );

  if (!quiz)
    return (
      <LearningLayout navigation={navigation} label="Assessment">
        <LearningSkeleton label="Preparing your assessment…" />
      </LearningLayout>
    );

  const question = quiz.questions[index];
  if (!question)
    return (
      <LearningLayout navigation={navigation} label="Assessment">
        <LearningEmpty
          title="No questions available"
          message="Please retry to load the questions for this assessment."
          onRetry={load}
        />
      </LearningLayout>
    );

  const selected = answers[question._id];

  const next = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      if (lessonId && !feedback) {
        setFeedback(
          (
            await quizApi.checkLessonAnswer(lessonId, {
              quizId: quiz._id,
              questionId: question._id,
              selectedOptionId: selected,
            })
          ).data,
        );
        return;
      }
      if (!lessonId)
        await quizApi.submitAnswer(quiz._id, {
          attemptId,
          questionId: question._id,
          selectedOptionId: selected,
        });

      if (index < quiz.questions.length - 1) {
        setIndex(index + 1);
        setFeedback(null);
      } else {
        const result = lessonId
          ? await quizApi.submitLessonQuiz(lessonId, {
              quizId: quiz._id,
              attemptKey: submissionKey.current,
              answers: quiz.questions.map((q) => ({
                questionId: q._id,
                selectedOptionId: answers[q._id],
              })),
            })
          : await quizApi.submitQuiz(quiz._id, {
              attemptId,
            });
        navigation.replace('QuizResult', {
          result: result.data,
          courseId,
          lessonId,
        });
      }
    } catch (e: any) {
      if (!lessonId && index === quiz.questions.length - 1) {
        try {
          const saved = (
            await quizApi.submitQuiz(quiz._id, {
              attemptId,
            })
          ).data;
          navigation.replace('QuizResult', {
            result: saved,
            courseId,
          });
          return;
        } catch {}
      }
      Alert.alert('Unable to save answer', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <LearningLayout
      contentKey={index}
      navigation={navigation}
      label={lessonId ? 'Lesson Knowledge Check' : 'Final Course Quiz'}
      footer={
        <Button
          title={
            lessonId && !feedback
              ? 'Check Answer'
              : index === quiz.questions.length - 1
              ? 'Finish Quiz'
              : 'Next Question'
          }
          disabled={!selected}
          loading={busy}
          onPress={next}
        />
      }
    >
      {/* Quiz Title & Question Progress */}
      <View style={styles.quizHeaderBlock}>
        <Text style={s.small}>{quiz.title}</Text>
        <CourseProgress
          progress={((index + 1) / quiz.questions.length) * 100}
          label={'Question ' + (index + 1) + ' of ' + quiz.questions.length}
        />
      </View>

      {/* Question Text */}
      <View style={styles.questionBlock}>
        <StatusBadge label="Select one answer" tone="purple" />
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      {/* Option Selection Cards */}
      <View style={styles.optionsList}>
        {question.options.map((option, position) => {
          const correct = feedback && option.id === feedback.correctOptionId;
          const wrong =
            feedback && option.id === selected && !feedback.isCorrect;
          const chosen = selected === option.id;

          return (
            <TouchableOpacity
              accessibilityRole="radio"
              accessibilityLabel={
                option.text +
                (correct
                  ? '. Correct answer'
                  : wrong
                  ? '. Incorrect answer'
                  : '')
              }
              accessibilityState={{
                checked: chosen,
                disabled: Boolean(feedback) || busy,
              }}
              disabled={Boolean(feedback) || busy}
              key={option.id}
              activeOpacity={0.85}
              onPress={() =>
                setAnswers({
                  ...answers,
                  [question._id]: option.id,
                })
              }
              style={[
                styles.optionCard,
                chosen && styles.optionChosen,
                correct && styles.optionCorrect,
                wrong && styles.optionWrong,
              ]}
            >
              <View
                style={[
                  styles.optionBadge,
                  chosen && styles.optionBadgeChosen,
                  correct && styles.optionBadgeCorrect,
                  wrong && styles.optionBadgeWrong,
                ]}
              >
                {correct ? (
                  <LearningIcon name="check" size={15} color={palette.green} />
                ) : wrong ? (
                  <LearningIcon name="close" size={14} color={palette.red} />
                ) : (
                  <Text
                    style={[
                      styles.optionLetterText,
                      chosen && styles.optionLetterTextChosen,
                    ]}
                  >
                    {String.fromCharCode(65 + position)}
                  </Text>
                )}
              </View>

              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Answer Feedback Reveal */}
      {feedback && (
        <LearningReveal>
          <View
            accessibilityLiveRegion="polite"
            style={[s.card, feedback.isCorrect ? s.correct : s.wrong]}
          >
            <View style={s.row}>
              <LearningIcon
                name={feedback.isCorrect ? 'check' : 'info'}
                color={feedback.isCorrect ? palette.green : palette.red}
              />
              <Text style={s.cardTitle}>
                {feedback.isCorrect
                  ? 'That’s Correct!'
                  : 'A Useful Learning Moment'}
              </Text>
            </View>
            <Text style={s.body}>{feedback.explanation}</Text>
            {!feedback.isCorrect && (
              <View style={styles.correctAnswerBox}>
                <Text style={s.label}>CORRECT ANSWER</Text>
                <Text style={s.body}>
                  {question.options.find(
                    (o) => o.id === feedback.correctOptionId,
                  )?.text || feedback.correctAnswer}
                </Text>
              </View>
            )}
          </View>
        </LearningReveal>
      )}

      {!feedback && (
        <Text style={s.small}>
          {lessonId
            ? 'Check your answer to see the detailed explanation before moving to the next question.'
            : 'Your answers are saved automatically as you advance through the quiz.'}
        </Text>
      )}
    </LearningLayout>
  );
};

const styles = StyleSheet.create({
  quizHeaderBlock: {
    gap: 12,
  },
  questionBlock: {
    gap: 12,
  },
  questionText: {
    fontSize: 22,
    lineHeight: 31,
    fontWeight: '800',
    color: palette.ink,
    letterSpacing: -0.3,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: palette.white,
    borderRadius: 18,
    minHeight: 68,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  optionChosen: {
    borderColor: palette.purple,
    backgroundColor: palette.tint,
  },
  optionCorrect: {
    borderColor: '#A7F3D0',
    backgroundColor: palette.greenTint,
  },
  optionWrong: {
    borderColor: '#FECACA',
    backgroundColor: palette.redTint,
  },
  optionBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBadgeChosen: {
    borderColor: palette.purple,
    backgroundColor: palette.white,
  },
  optionBadgeCorrect: {
    borderColor: '#A7F3D0',
    backgroundColor: palette.white,
  },
  optionBadgeWrong: {
    borderColor: '#FECACA',
    backgroundColor: palette.white,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.muted,
  },
  optionLetterTextChosen: {
    color: palette.purple,
  },
  optionText: {
    fontSize: 15.5,
    lineHeight: 23,
    fontWeight: '500',
    color: palette.ink,
    flex: 1,
  },
  correctAnswerBox: {
    gap: 4,
    paddingTop: 6,
  },
});
