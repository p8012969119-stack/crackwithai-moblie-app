import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  RefreshControl,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { courseApi } from '../../api/courseApi';
import { ApiError } from '../../api/client';
import { Course } from '../../types';
import { useAuth } from '../../store/AuthContext';
import { CourseCard } from '../../components/learning/CourseCard';
import {
  ActionButton,
  LearningIcon,
  LearningEmpty,
  LearningSkeleton,
  learningStyles as s,
  palette,
} from '../../components/learning/LearningLayout';

type CoursesNavigation = {
  navigate: (
    ...args:
      | [screen: 'Profile']
      | [screen: 'CourseDetails', params: { courseId: string }]
  ) => void;
};

function loadingMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401)
      return 'Your session has expired. Please sign in again.';
    if (error.status === 403)
      return 'Your account cannot access these courses. Please check your profile.';
    if (error.status && error.status >= 500)
      return 'Courses are temporarily unavailable. Please try again shortly.';
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')
      return 'Loading courses took too long. Please try again.';
    if (error.code === 'INVALID_COURSE_DATA') return error.message;
    if (!error.status)
      return 'We couldn’t reach CrackWithAI. Check your connection and try again.';
  }
  return 'Courses could not be loaded. Please try again.';
}

export const CoursesScreen = ({
  navigation,
}: {
  navigation: CoursesNavigation;
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my-learning'>('all');
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<FlatList<Course>>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [learningError, setLearningError] = useState<string>();
  const [progressAvailable, setProgressAvailable] = useState(false);
  const request = useRef<AbortController | null>(null);
  const loaded = useRef(false);

  const fetchCourses = useCallback(async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(!loaded.current);
    setRefreshing(loaded.current);
    setError(null);
    try {
      const response = await courseApi.getAllCourses(controller.signal);
      if (controller.signal.aborted) return;
      setCourses(response.data);
      setLearningError(response.learningError);
      setProgressAvailable(response.progressAvailable);
      loaded.current = true;
    } catch (cause: unknown) {
      if (!controller.signal.aborted) setError(loadingMessage(cause));
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
        request.current = null;
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchCourses();
      return () => {
        request.current?.abort();
        request.current = null;
      };
    }, [fetchCourses]),
  );

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return courses.filter(
      (course) =>
        (activeTab === 'all' || course.isEnrolled) &&
        (!query || [course.title, course.description, course.shortDescription].some(value => value?.toLowerCase().includes(query))),
    );
  }, [courses, searchQuery, activeTab]);

  const fatalError = !loaded.current
    ? error
    : activeTab === 'my-learning' && !progressAvailable
    ? learningError
    : undefined;
  const notice = !fatalError ? error || learningError : undefined;
  const searching = Boolean(searchQuery.trim());
  const emptyTitle = searching
    ? 'No matching courses'
    : activeTab === 'my-learning'
    ? 'Your next chapter starts here'
    : 'No courses available yet';
  const emptyMessage = searching
    ? 'Try another course title or clear your search.'
    : activeTab === 'my-learning'
    ? 'Choose a course to begin. Your progress will appear here.'
    : 'New learning opportunities will appear here when they are published.';

  const header = (
    <View style={styles.header}>
      <View style={s.between}>
        <View style={styles.heading}>
          <Text style={s.label}>CRACKWITHAI / ACADEMY</Text>
          <Text style={s.title}>Courses</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => navigation.navigate('Profile')}
          style={[s.circle, styles.avatar]}
        >
          <Text style={styles.avatarText}>
            {(user?.fullName || user?.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </Pressable>
      </View>

      <Text style={[s.body, s.muted]}>
        Build practical AI skills with hands-on guided courses.
      </Text>

      <View style={styles.tabs}>
        {(['all', 'my-learning'] as const).map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
            onPress={() => {setActiveTab(tab); setExpanded(false);}}
            style={[styles.tab, activeTab === tab && styles.selectedTab]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? palette.ink : palette.muted },
              ]}
            >
              {tab === 'all' ? 'All Courses' : 'My Learning'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[s.row, styles.search]}>
        <LearningIcon name="search" color={palette.muted} size={18} />
        <TextInput
          accessibilityLabel="Search courses"
          placeholder="Search AI courses…"
          placeholderTextColor={palette.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {notice && (
        <View style={[s.card, styles.notice]} accessibilityLiveRegion="polite">
          <Text style={s.small}>{notice}</Text>
          <ActionButton
            title="Try again"
            variant="outline"
            loading={refreshing}
            onPress={fetchCourses}
          />
        </View>
      )}

      {!loading && !fatalError && (
        <View style={[s.between, styles.collectionHeading]}>
          <Text style={styles.collectionTitle}>
            {searching
              ? 'Search Results'
              : activeTab === 'all'
              ? 'All Academy Courses'
              : 'Enrolled Courses'}
          </Text>
          <Text style={styles.collectionCount}>
            {filtered.length} {filtered.length === 1 ? 'course' : 'courses'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <FlatList
        ref={listRef}
        data={loading || fatalError ? [] : searching || expanded ? filtered : filtered.slice(0, 10)}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={5}
        windowSize={5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchCourses}
            tintColor={palette.purple}
          />
        }
        ListEmptyComponent={
          loading ? (
            <LearningSkeleton label="Loading your courses…" />
          ) : fatalError ? (
            <LearningEmpty
              title="Unable to load courses"
              message={fatalError}
              icon="info"
              onRetry={fetchCourses}
            />
          ) : (
            <LearningEmpty
              title={emptyTitle}
              message={emptyMessage}
              action={searching ? 'Clear search' : 'Explore courses'}
              onRetry={
                searching
                  ? () => setSearchQuery('')
                  : activeTab === 'my-learning'
                  ? () => setActiveTab('all')
                  : undefined
              }
            />
          )
        }
        ListFooterComponent={!loading && !fatalError && !searching && filtered.length > 10 ?
          <ActionButton title={expanded ? 'Show Less' : 'Show More'} variant="outline" onPress={() => {
            if (expanded) listRef.current?.scrollToOffset({offset: 0, animated: true});
            setExpanded(value => !value);
          }} /> : null}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() =>
              navigation.navigate('CourseDetails', { courseId: item._id })
            }
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 20,
    paddingBottom: 36,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
  },
  header: {
    gap: 16,
    paddingBottom: 20,
  },
  heading: {
    flex: 1,
    gap: 4,
  },
  avatar: {
    borderRadius: 22,
    backgroundColor: palette.tint,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.purple,
  },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  selectedTab: {
    backgroundColor: palette.white,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  search: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    fontSize: 15,
    color: palette.ink,
    paddingVertical: 12,
    fontWeight: '500',
  },
  notice: {
    padding: 14,
    gap: 10,
  },
  collectionHeading: {
    flexWrap: 'wrap',
    marginTop: 4,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.ink,
    letterSpacing: -0.3,
  },
  collectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.muted,
  },
});
