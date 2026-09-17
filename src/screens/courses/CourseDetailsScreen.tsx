import React, {useCallback, useRef, useState} from 'react';
import {View, Text, Alert} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {courseApi, LearningPath} from '../../api/courseApi';
import {ApiError} from '../../api/client';
import {certificateApi} from '../../api/certificateApi';
import {ToolLogo} from '../../components/ToolLogo';
import {CertificateMark} from '../../components/CertificateMark';
import {Lesson} from '../../types';
import {ModuleRoadmap} from '../../components/learning/ModuleRoadmap';
import {LearningLayout, ActionButton, LearningEmpty, LearningSkeleton, learningStyles as s} from '../../components/learning/LearningLayout';

type Props = {
  route: {params: {courseId: string; showRoadmap?: boolean}};
  navigation: {
    goBack: () => void;
    navigate: (...args: [screen: 'Lesson', params: {courseId: string; lessonId: string}] |
      [screen: 'Quiz', params: {courseId: string}] | [screen: 'Certificates', params: {certificateId: string}]) => void;
  };
};
export const CourseDetailsScreen = ({route, navigation}: Props) => {
  const [path, setPath] = useState<LearningPath | null>(null);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  const active = useRef(false);
  const acting = useRef(false);
  const courseId = route.params.courseId;
  const load = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true); setError(''); setNotFound(false);
    try {
      const response = await courseApi.getLearningPath(courseId, controller.signal);
      if (!controller.signal.aborted) setPath(response.data);
    } catch (cause: unknown) {
      if (!controller.signal.aborted) {
        setNotFound(cause instanceof ApiError && cause.status === 404);
        setError(cause instanceof ApiError && cause.status === 404 ? 'This course is no longer available.' : 'We couldn’t load this course. Please try again.');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [courseId]);
  useFocusEffect(useCallback(() => {
    active.current = true;
    void load();
    return () => {active.current = false; request.current?.abort();};
  }, [load]));

  const openLesson = async (lesson: Lesson) => {
    if (!path || acting.current || !lesson.isUnlocked) return;
    acting.current = true; setBusy(true);
    try {
      if (!path.progress) await courseApi.startCourse(path.course._id);
      if (active.current) navigation.navigate('Lesson', {courseId: path.course._id, lessonId: lesson._id});
    } catch {
      if (active.current) Alert.alert('Unable to start lesson', 'Your progress could not be saved. Please try again.');
    } finally {acting.current = false; if (active.current) setBusy(false);}
  };
  const openCertificate = async () => {
    if (!path?.summary.courseCompleted || acting.current) return;
    acting.current = true; setBusy(true);
    try {
      const response = await certificateApi.issueCertificate(path.course._id);
      if (response.data.status !== 'active') throw new Error('Certificate unavailable');
      if (active.current) navigation.navigate('Certificates', {certificateId: response.data._id});
    } catch {
      if (active.current) Alert.alert('Certificate unavailable', 'We couldn’t open your certificate. Please try again.');
    } finally {acting.current = false; if (active.current) setBusy(false);}
  };

  if (loading) return <LearningLayout navigation={navigation} label="Course modules"><LearningSkeleton label="Loading your modules…" /></LearningLayout>;
  if (error || !path) return <LearningLayout navigation={navigation} label="Course modules"><LearningEmpty title={notFound ? 'Course not found' : 'Unable to load this course'} message={error || 'Please try again.'} onRetry={load} icon="info" /></LearningLayout>;

  const next = path.lessons.find(lesson => lesson.isUnlocked && !lesson.isCompleted);
  const completed = path.summary.courseCompleted === true;
  return <LearningLayout navigation={navigation} label="Course modules" footer={
    completed ? <ActionButton title="View Certificate" variant="gold" loading={busy} onPress={openCertificate} /> :
      path.summary.learningCompleted && path.quiz?.available ? <ActionButton title={path.quizAttempt?.status === 'Fail' ? 'Retry Final Quiz' : path.quizAttempt?.status === 'in_progress' ? 'Continue Final Quiz' : 'Take Final Quiz'} onPress={() => navigation.navigate('Quiz', {courseId: path.course._id})} /> : undefined
  }>
    <View style={{gap: 10}}><ToolLogo courseKey={path.course.title} slug={path.course.slug} logoUrl={path.course.logoUrl} size={52} /><Text style={s.title}>{path.course.title}</Text><Text style={s.small}>{path.modules.length} modules · {path.summary.completedLessonCount} of {path.summary.totalLessons} lessons completed</Text></View>
    {completed && <View style={[s.card, s.tinted]} accessibilityLiveRegion="polite"><CertificateMark size={48} /><Text style={s.heading}>Course Completed</Text><Text style={s.body}>You’ve completed all four modules and the required assessments. Your certificate is ready.</Text></View>}
    <ModuleRoadmap modules={path.modules} nextLessonId={next?._id} onLesson={openLesson} busy={busy} />
  </LearningLayout>;
};
