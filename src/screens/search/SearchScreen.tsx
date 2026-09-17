import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Icon } from '../../components/Icon';
import { courseApi } from '../../api/courseApi';
import { ErrorState } from '../../components/ErrorState';
import { LoadingView } from '../../components/LoadingView';
import { Course } from '../../types';

export const SearchScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = async () => {try {setError(''); setCourses((await courseApi.getAllCourses()).data);} catch(e: any) {setError(e.message);} finally {setLoading(false);}};
  useEffect(() => {load();}, []);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'ChatGPT Mastery',
    'Prompt Engineering',
    'Gemini AI',
    'Code Generator',
  ]);

  const searchResults: Course[] = query.trim()
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()) ||
          c.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleSelectRecent = (term: string) => {
    setQuery(term);
  };

  const clearRecent = () => {
    setRecentSearches([]);
  };

  if (error) return <ErrorState message={error} onRetry={load}/>;
  if (loading) return <LoadingView message="Loading course search…"/>;
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header with Search Input */}
      <View style={styles.header}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs');
              }
            }}
            style={styles.backBtn}
          >
            <Icon name="chevron-left" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.searchBox}>
            <Icon name="search" size={18} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Search courses, AI tools, topics..."
              placeholderTextColor={COLORS.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {query.trim().length === 0 ? (
          /* Recent Searches Section */
          <View style={styles.recentSection}>
            {recentSearches.length > 0 && (
              <>
                <View style={styles.recentHeader}>
                  <Text style={styles.recentTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecent}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.recentTagsRow}>
                  {recentSearches.map((term, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.recentTag}
                      onPress={() => handleSelectRecent(term)}
                    >
                      <Icon name="clock" size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={styles.recentTagText}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={[styles.recentTitle, { marginTop: SPACING.lg }]}>Popular Categories</Text>
            <View style={styles.catGrid}>
              {['Prompting', 'LLM Models', 'AI Art', 'Coding AI', 'Automation', 'Research'].map((cat, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.catCard}
                  onPress={() => setQuery(cat)}
                >
                  <Text style={styles.catText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : searchResults.length === 0 ? (
          /* Empty Search Results */
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptySub}>We couldn't find matching items for "{query}". Try checking your spelling.</Text>
          </View>
        ) : (
          /* Search Results List */
          <View style={styles.resultsList}>
            <Text style={styles.resultsHeader}>Search Results ({searchResults.length})</Text>
            {searchResults.map((course) => (
              <TouchableOpacity
                key={course._id}
                style={styles.resultItem}
                onPress={() => navigation.navigate('CourseDetails', { courseId: course._id })}
              >
                <View style={styles.resultIconBox}>
                  <Icon name="book-open" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.resultTextCol}>
                  <Text style={styles.resultItemTitle}>{course.title}</Text>
                  <Text style={styles.resultItemDesc} numberOfLines={1}>
                    {course.description}
                  </Text>
                </View>
                <Icon name="chevron-right" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: SPACING.xs,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 44,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  input: {
    flex: 1,
    marginLeft: SPACING.xs,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  clearText: {
    fontSize: 16,
    color: COLORS.textMuted,
    paddingHorizontal: 4,
  },
  content: {
    padding: SPACING.md,
  },
  recentSection: {
    marginTop: SPACING.xs,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  recentTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  clearAllText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.danger,
    fontSize: 12,
  },
  recentTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  recentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recentTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  catCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  catText: {
    ...TYPOGRAPHY.captionBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  emptySub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  resultsList: {
    marginTop: SPACING.xs,
  },
  resultsHeader: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  resultTextCol: {
    flex: 1,
  },
  resultItemTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  resultItemDesc: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
