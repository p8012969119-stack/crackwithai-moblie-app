import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import {
  LearningLayout,
  ActionButton as Button,
  CourseProgress,
  LearningIcon,
  StatusBadge,
  learningStyles as s,
  palette,
} from '../../components/learning/LearningLayout';
import { certificateApi } from '../../api/certificateApi';



export const QuizResultScreen = ({ route, navigation }: any) => {
  const { result, courseId, lessonId } = route.params;
  const passed = result.status === 'Pass' || result.passed === true;
  const courseComplete = result.courseCompleted === true;
  const moduleComplete = result.moduleCompleted === true;
  const finalReady = passed && result.finalQuizAvailable === true;

  const [busy, setBusy] = useState(false);

  const viewCertificate = async () => {
    try {
      setBusy(true);
      if (!courseComplete) return;
      const certificate = (await certificateApi.issueCertificate(courseId)).data;
      if (certificate.status !== 'active') throw new Error('Certificate unavailable');
      navigation.navigate('Certificates', {certificateId: certificate._id});
    } catch (e: any) {
      Alert.alert('Certificate unavailable', e.message);
    } finally {
      setBusy(false);
    }
  };

  const roadmap = () =>
    navigation.navigate('CourseDetails', {
      courseId,
      showRoadmap: true,
    });

  return (
    <LearningLayout
      navigation={navigation}
      label={lessonId ? 'Lesson Results' : 'Final Assessment Results'}
      footer={
        <>
          <Button
            title={
              !passed
                ? 'Try Again'
                : courseComplete
                ? 'View Certificate'
                : finalReady ? 'Take Final Quiz' : moduleComplete ? 'Continue to Next Module' : 'Continue Learning'
            }
            variant={passed && courseComplete ? 'gold' : 'primary'}
            loading={busy}
            onPress={
              !passed
                ? () =>
                    navigation.replace('Quiz', {
                      courseId,
                      lessonId,
                    })
                : courseComplete
                ? viewCertificate
                : finalReady ? () => navigation.replace('Quiz', {courseId}) : result.nextLessonId ? () => navigation.replace('Lesson', {courseId, lessonId: result.nextLessonId}) : roadmap
            }
          />
          {(!passed || (courseComplete)) && (
            <Button
              title="Return to Roadmap"
              variant="outline"
              onPress={roadmap}
            />
          )}
        </>
      }
    >
      {/* Result Hero Box */}
      <View style={styles.resultHeroBox}>
        <View
          style={[
            styles.badgeCircle,
            { backgroundColor: passed ? palette.goldTint : palette.tint },
          ]}
        >
          <LearningIcon
            name={courseComplete ? 'certificate' : passed ? 'check' : 'book'}
            size={36}
            color={passed ? palette.gold : palette.purple}
          />
        </View>
        <Text style={styles.resultHeroTitle}>
          {passed
            ? courseComplete
              ? 'Course Completed!'
              : moduleComplete ? 'Module Completed!' : 'Well Done!'
            : 'Keep Moving Forward'}
        </Text>
        <Text style={styles.resultHeroSub}>
          {passed
            ? lessonId
              ? finalReady ? 'All four modules are complete. Take the final quiz to earn your certificate.' : moduleComplete ? 'Your module progress is saved. Continue to the next module.' : 'Your lesson quiz is passed. Your next learning step is ready.'
              : courseComplete
              ? 'Congratulations! You’ve completed the course and passed the final assessment.'
              : 'You passed the assessment. Return to the roadmap to complete remaining requirements.'
            : 'Review the topics, revisit your practice, and try again. Your completed lessons are saved.'}
        </Text>
      </View>

      {/* Main Score Summary Card */}
      <View style={s.card}>
        <View style={s.between}>
          <Text style={s.cardTitle}>Your Result</Text>
          <StatusBadge
            label={passed ? 'Passed' : 'Not Passed Yet'}
            tone={passed ? 'green' : 'neutral'}
            icon={passed ? 'check' : undefined}
          />
        </View>

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreNumber}>
            {Number.isFinite(result.percentage)
              ? Math.round(result.percentage)
              : '—'}
            <Text style={styles.percentSymbol}>%</Text>
          </Text>
          <Text style={s.small}>
            {result.obtainedMarks ?? result.score ?? '—'} /{' '}
            {result.totalMarks ?? '—'} points
          </Text>
        </View>

        <CourseProgress
          progress={result.percentage}
          label="Assessment Score"
          gold={passed}
        />

        <View style={s.divider} />

        <View style={s.row}>
          {[
            {
              label: 'Correct Answers',
              value: result.correctAnswers,
            },
            {
              label: 'Incorrect Answers',
              value: result.wrongAnswers,
            },
          ].map((stat) => (
            <View key={stat.label} style={styles.statSubBox}>
              <Text style={s.heading}>{stat.value ?? '—'}</Text>
              <Text style={s.small}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {result.certificateEligibilityReason && (
        <Text style={[s.body, s.muted]}>
          {result.certificateEligibilityReason}
        </Text>
      )}

      {!lessonId && (
        <View style={s.card}>
          <View style={s.row}>
            <LearningIcon
              name={courseComplete ? 'certificate' : 'lock'}
              color={courseComplete ? palette.gold : palette.muted}
            />
            <Text style={s.cardTitle}>
              {courseComplete ? 'Certificate Available' : 'Certificate Locked'}
            </Text>
          </View>
          <Text style={s.small}>
            {courseComplete
              ? 'View your credential or save the official certificate.'
              : 'Complete all required lessons and pass the final assessment to unlock your certificate.'}
          </Text>
        </View>
      )}

      {Boolean(result.review?.length) && (
        <Text style={s.heading}>Review & Reflect</Text>
      )}

      {result.review?.map((item: any) => (
        <View key={item.questionId} style={s.card}>
          <Text style={s.cardTitle}>{item.question}</Text>
          <Text style={s.body}>{item.explanation}</Text>
        </View>
      ))}


    </LearningLayout>
  );
};

const styles = StyleSheet.create({
  resultHeroBox: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  badgeCircle: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultHeroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: palette.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  resultHeroSub: {
    fontSize: 15,
    lineHeight: 23,
    color: palette.muted,
    textAlign: 'center',
    maxWidth: 380,
  },
  scoreBlock: {
    alignItems: 'center',
    gap: 2,
  },
  scoreNumber: {
    fontSize: 54,
    lineHeight: 64,
    fontWeight: '800',
    letterSpacing: -2,
    color: palette.ink,
    fontVariant: ['tabular-nums'],
  },
  percentSymbol: {
    fontSize: 26,
    letterSpacing: 0,
    color: palette.muted,
  },
  statSubBox: {
    flex: 1,
    gap: 4,
    alignItems: 'center',
  },
});
