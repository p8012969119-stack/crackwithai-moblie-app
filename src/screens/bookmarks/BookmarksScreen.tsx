import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookmarkApi } from '../../api/bookmarkApi';
import { Bookmark } from '../../types';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Icon } from '../../components/Icon';
import { Header } from '../../components/Header';

export const BookmarksScreen = ({ navigation }: any) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    try {
      setError(null);
      const res = await bookmarkApi.getAllBookmarks();
      if (res.success) {
        setBookmarks(res.data || []);
      }
    } catch (err: any) {
      console.warn('[BookmarksScreen] Fetch error:', err);
      setError('Unable to load bookmarks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookmarks();
  };

  const handleRemoveBookmark = async (id: string) => {
    try {
      await bookmarkApi.deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
    } catch (e) {
      console.warn('[BookmarksScreen] Delete bookmark error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header
        title="Saved Bookmarks"
        showBack
        onBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('MainTabs');
          }
        }}
      />

      {loading && !refreshing ? (
        <LoadingView message="Fetching your saved bookmarks..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBookmarks} />
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="bookmark"
              title="No Bookmarks Saved"
              message="Bookmark key lessons and AI tools to easily revisit them anytime!"
              actionTitle="Explore Courses"
              onAction={() => navigation.navigate('CoursesTab')}
            />
          }
          renderItem={({ item }) => {
            const title = item.title || item.lesson?.title || item.aiTool?.name || 'Saved Item';
            const itemType = item.itemType || 'lesson';

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => {
                  if (itemType === 'lesson' && item.itemId) {
                    navigation.navigate('Lesson', { lessonId: item.itemId, courseId: item.courseId });
                  } else {
                    navigation.navigate('MainTabs', { screen: 'AITab' });
                  }
                }}
              >
                <View style={styles.iconCircle}>
                  <Icon
                    name={itemType === 'lesson' ? 'book-open' : 'bot'}
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.content}>
                  <Text style={styles.badgeText}>{itemType.toUpperCase()}</Text>
                  <Text style={styles.title} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text style={styles.date}>
                    Saved {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveBookmark(item._id)}
                >
                  <Icon name="bookmark-filled" size={20} color={COLORS.accent} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  title: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
  },
  date: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    marginTop: 2,
  },
  removeBtn: {
    padding: SPACING.xs,
  },
});
