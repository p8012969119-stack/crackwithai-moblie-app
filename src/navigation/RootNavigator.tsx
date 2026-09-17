import React from 'react';
import { ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/AuthContext';
import { LoadingView } from '../components/LoadingView';
import { ErrorState } from '../components/ErrorState';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { CourseDetailsScreen } from '../screens/courses/CourseDetailsScreen';
import { LessonScreen } from '../screens/lessons/LessonScreen';
import { QuizScreen } from '../screens/quiz/QuizScreen';
import { QuizResultScreen } from '../screens/quiz/QuizResultScreen';
import { BookmarksScreen } from '../screens/bookmarks/BookmarksScreen';
import { CertificatesScreen } from '../screens/certificates/CertificatesScreen';

import { LanguageSelectionScreen } from '../screens/auth/LanguageSelectionScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { GamesScreen } from '../screens/games/GamesScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { AIEmailWriterScreen } from '../screens/tools/AIEmailWriterScreen';
import { AIVoiceGeneratorScreen } from '../screens/tools/AIVoiceGeneratorScreen';
import { AIImageGeneratorScreen } from '../screens/tools/AIImageGeneratorScreen';
import { AICodeGeneratorScreen } from '../screens/tools/AICodeGeneratorScreen';

type RootStackParams = ParamListBase & {CourseDetails: {courseId: string; showRoadmap?: boolean}};
const Stack = createNativeStackNavigator<RootStackParams>();

export const RootNavigator = () => {
  const { isAuthenticated, isRestoringSession, sessionError, retrySession } = useAuth();

  if (isRestoringSession) {
    return <LoadingView message="Verifying session..." fullScreen />;
  }

  if (sessionError) {
    return <SafeAreaView style={{flex: 1}}><ErrorState style={{flex: 1}} message={sessionError} onRetry={retrySession} /></SafeAreaView>;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Stack
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Group>
      ) : (
        // App Main Stack
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
          <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
          <Stack.Screen name="Lesson" component={LessonScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="QuizResult" component={QuizResultScreen} />
          <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
          <Stack.Screen name="Certificates" component={CertificatesScreen} />
          <Stack.Screen name="Games" component={GamesScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="AIEmailWriter" component={AIEmailWriterScreen} />
          <Stack.Screen name="AIVoiceGenerator" component={AIVoiceGeneratorScreen} />
          <Stack.Screen name="AIImageGenerator" component={AIImageGeneratorScreen} />
          <Stack.Screen name="AICodeGenerator" component={AICodeGeneratorScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};
