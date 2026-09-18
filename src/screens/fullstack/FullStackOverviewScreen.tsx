import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { FullStackTrack, FullStackProgress } from '../../types/fullstack';
import { Icon } from '../../components/Icon';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export const FullStackOverviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [tracks, setTracks] = useState<FullStackTrack[]>([]);
  const [progress, setProgress] = useState<FullStackProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [tracksData, progressData] = await Promise.all([
        fullstackApi.getTracks(),
        fullstackApi.getProgress()
      ]);
      setTracks(tracksData);
      setProgress(progressData);
    } catch (err) {
      console.warn('Failed to load full stack track data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleTrackPress = (track: FullStackTrack) => {
    if (track.status === 'active' && track.route) {
      navigation.navigate(track.route);
    }
  };

  const completedCount = progress?.completedCount || 0;
  const totalCount = progress?.totalLessons || 25;
  const progressPercent = progress?.percentage || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.badgeTop}>
              <Text style={styles.badgeTopText}>FULL STACK ACADEMY</Text>
            </View>
          </View>
          <Text style={styles.mainTitle}>Full Stack Developer Track</Text>
          <Text style={styles.subTitle}>
            Master web development from the ground up with interactive lessons and live code playgrounds.
          </Text>
        </View>

        {/* Hero Active Course Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.activePill}>
              <View style={styles.pulsingDot} />
              <Text style={styles.activePillText}>NOW ACTIVE</Text>
            </View>
            <Text style={styles.heroLevel}>Beginner Track</Text>
          </View>

          <Text style={styles.heroTitle}>HTML — From Beginner to Practical</Text>
          <Text style={styles.heroDesc}>
            Learn markup, elements, tables, forms, and practical layouts with real-time browser preview & code validation.
          </Text>

          {/* Progress bar inside hero */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Course Progress</Text>
              <Text style={styles.progressPercentText}>{completedCount} of {totalCount} completed ({progressPercent}%)</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.heroButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('HtmlCourse')}
            >
              <Text style={styles.heroButtonText}>
                {completedCount > 0 ? 'Continue Learning' : 'Start HTML Course'}
              </Text>
              <Icon name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playgroundQuickButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('HtmlPlayground')}
            >
              <Icon name="code" size={16} color={COLORS.primary} />
              <Text style={styles.playgroundQuickButtonText}>Open Playground</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#EEEDFF' }]}>
              <Icon name="code" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.featureTitle}>HTML Editor</Text>
            <Text style={styles.featureDesc}>Line numbers & quick tags</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="play" size={18} color="#10B981" />
            </View>
            <Text style={styles.featureTitle}>Sandboxed View</Text>
            <Text style={styles.featureDesc}>Live mobile preview</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="check-circle" size={18} color="#3B82F6" />
            </View>
            <Text style={styles.featureTitle}>Auto Validation</Text>
            <Text style={styles.featureDesc}>Syntax & task checks</Text>
          </View>
        </View>

        {/* Roadmap Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Curriculum Roadmap</Text>
          <Text style={styles.sectionSubtitle}>
            Follow the complete modern full stack engineering curriculum step-by-step
          </Text>
        </View>

        {/* Tracks List */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <View style={styles.tracksList}>
            {tracks.map((track, idx) => {
              const isActive = track.status === 'active';
              return (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.trackCard,
                    isActive ? styles.trackCardActive : styles.trackCardUpcoming
                  ]}
                  activeOpacity={isActive ? 0.75 : 1}
                  onPress={() => handleTrackPress(track)}
                >
                  <View style={styles.trackTopRow}>
                    <View style={styles.trackIndexBadge}>
                      <Text style={styles.trackIndexText}>0{idx + 1}</Text>
                    </View>
                    <View style={styles.trackBadgeContainer}>
                      {isActive ? (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>Available Now</Text>
                        </View>
                      ) : (
                        <View style={styles.upcomingBadge}>
                          <Icon name="lock" size={12} color={COLORS.textMuted} />
                          <Text style={styles.upcomingBadgeText}>Upcoming Track</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.trackBody}>
                    <View style={styles.trackTitleRow}>
                      <Text style={[styles.trackTitle, !isActive && styles.trackTitleMuted]}>
                        {track.title}
                      </Text>
                      {isActive && (
                        <View style={styles.chevronWrapper}>
                          <Icon name="chevron-right" size={18} color={COLORS.primary} />
                        </View>
                      )}
                    </View>
                    {track.subtitle && (
                      <Text style={styles.trackSubtitle}>{track.subtitle}</Text>
                    )}
                    <Text style={styles.trackDescription} numberOfLines={2}>
                      {track.description}
                    </Text>
                  </View>

                  <View style={styles.trackFooter}>
                    <View style={styles.metaItem}>
                      <Icon name="file-text" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.metaText}>
                        {isActive ? '25 Lessons' : 'Curriculum in dev'}
                      </Text>
                    </View>
                    <View style={styles.metaDivider} />
                    <View style={styles.metaItem}>
                      <Icon name="clock" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.metaText}>
                        {isActive ? '3 Hours' : 'Coming soon'}
                      </Text>
                    </View>
                    <View style={styles.metaDivider} />
                    <View style={styles.metaItem}>
                      <Icon name="star" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.metaText}>{track.level || 'Beginner'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  container: {
    flex: 1
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  header: {
    marginBottom: SPACING.md
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  badgeTop: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full
  },
  badgeTopText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.8
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20
  },
  heroCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#10B981'
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.5
  },
  heroLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A5B4FC'
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs
  },
  heroDesc: {
    fontSize: 13,
    color: '#C7D2FE',
    lineHeight: 18,
    marginBottom: SPACING.md
  },
  progressContainer: {
    marginBottom: SPACING.md
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E0E7FF'
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34D399'
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4
  },
  heroActions: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  heroButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 8
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  playgroundQuickButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 6
  },
  playgroundQuickButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700'
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: 8
  },
  featureItem: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2
  },
  featureDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center'
  },
  sectionHeader: {
    marginBottom: SPACING.md
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  loader: {
    marginTop: 40
  },
  tracksList: {
    gap: SPACING.sm
  },
  trackCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    ...SHADOWS.small
  },
  trackCardActive: {
    borderColor: COLORS.primary,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary
  },
  trackCardUpcoming: {
    borderColor: COLORS.border,
    opacity: 0.85
  },
  trackTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  trackIndexBadge: {
    backgroundColor: COLORS.separator,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  trackIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  trackBadgeContainer: {},
  activeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669'
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.separator,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4
  },
  upcomingBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted
  },
  trackBody: {
    marginBottom: SPACING.sm
  },
  trackTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  trackTitleMuted: {
    color: COLORS.textSecondary
  },
  chevronWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  trackSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
    marginBottom: 4
  },
  trackDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16
  },
  trackFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: COLORS.border,
    marginHorizontal: 8
  }
});
