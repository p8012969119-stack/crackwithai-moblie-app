import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  Image
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { FullStackCourseProgress } from '../../types/fullstack';
import { FULLSTACK_TRACKS } from '../../data/fullstackHtmlData';
import { Icon } from '../../components/Icon';
import { COLORS } from '../../constants/theme';

const COURSE_LOGOS: Record<string, any> = {
  html: require('../../assets/courses/html.png'),
  css: require('../../assets/courses/css.png'),
  javascript: require('../../assets/courses/javascript.png'),
  nodejs: require('../../assets/courses/nodejs.png'),
  expressjs: require('../../assets/courses/expressjs.png'),
  mongodb: require('../../assets/courses/mongodb.png'),
  restapi: require('../../assets/courses/restapi.png'),
  auth: require('../../assets/courses/auth.png'),
  capstone: require('../../assets/courses/capstone.png'),
};

const CARD_STYLES: Record<string, { bg: string; border: string }> = {
  html: { bg: '#FFF8F0', border: '#FFD8B5' },
  css: { bg: '#F0F9FF', border: '#BAE6FD' },
  javascript: { bg: '#FEFCE8', border: '#FEF08A' },
  nodejs: { bg: '#F0FDF4', border: '#BBF7D0' },
  expressjs: { bg: '#F8FAFC', border: '#CBD5E1' },
  mongodb: { bg: '#ECFDF5', border: '#A7F3D0' },
  restapi: { bg: '#F5F3FF', border: '#DDD6FE' },
  auth: { bg: '#FFF1F2', border: '#FECDD3' },
  capstone: { bg: '#EEF2FF', border: '#C7D2FE' },
};

const DEFAULT_CARD_STYLE = { bg: '#FFFFFF', border: '#E2E8F0' };

const FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';
const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

export const FullStackRoadmapScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [fsProgress, setFsProgress] = useState<FullStackCourseProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadProgress = useCallback(async () => {
    try {
      const data = await fullstackApi.getFullStackProgress().catch(() => null);
      if (data) {
        setFsProgress(data);
      }
    } catch (err) {
      console.warn('Failed to load Full Stack progress', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProgress();
  };

  const handleOpenCourse = (techId: string) => {
    navigation.navigate('HtmlCourse', { tech: techId });
  };

  const completedModules = fsProgress?.completedModules || 0;
  const overallPercentage = fsProgress?.overallPercentage || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          Curriculum Courses
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Section Heading & Progress */}
        <View style={styles.sectionHeaderWrap}>
          <View style={styles.sectionHeaderTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Curriculum Courses</Text>
              <Text style={styles.sectionSubtitle}>
                9 Sequential Courses • {completedModules} of 9 finished
              </Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{overallPercentage}%</Text>
            </View>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${Math.max(4, overallPercentage)}%` }]} />
          </View>
        </View>

        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.coursesList}>
            {FULLSTACK_TRACKS.map((track, index) => {
              const courseNum = index + 1;
              const cardStyle = CARD_STYLES[track.id] || DEFAULT_CARD_STYLE;
              return (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.courseCard,
                    {
                      backgroundColor: cardStyle.bg,
                      borderColor: cardStyle.border,
                    }
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleOpenCourse(track.id)}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.courseIconBox}>
                      {COURSE_LOGOS[track.id] ? (
                        <Image
                          source={COURSE_LOGOS[track.id]}
                          style={styles.courseLogoImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <Icon name={track.icon as any || 'code'} size={22} color="#5653fe" />
                      )}
                    </View>

                    <View style={styles.cardHeaderCenter}>
                      <View style={styles.orderBadge}>
                        <Text style={styles.orderBadgeText}>COURSE {courseNum} OF 9</Text>
                      </View>
                      <Text style={styles.courseName}>{track.title}</Text>
                    </View>

                    <View style={styles.levelBadge}>
                      <Text style={styles.levelBadgeText}>{track.level || 'Beginner'}</Text>
                    </View>
                  </View>

                  <Text style={styles.courseSubtitle}>{track.subtitle}</Text>
                  <Text style={styles.courseDesc} numberOfLines={2}>
                    {track.description}
                  </Text>

                  {/* Metadata Chips Row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Icon name="book-open" size={12} color="#64748B" />
                      <Text style={styles.metaChipText}>{track.modulesCount || 4} Modules</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Icon name="file-text" size={12} color="#64748B" />
                      <Text style={styles.metaChipText}>{track.lessonsCount || 20} Lessons</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Icon name="clock" size={12} color="#64748B" />
                      <Text style={styles.metaChipText}>{track.duration || '4 hours'}</Text>
                    </View>
                  </View>

                  {/* Action CTA Button */}
                  <View style={styles.ctaButtonRow}>
                    <View style={styles.ctaButton}>
                      <Text style={styles.ctaButtonText}>Start {track.title} Course</Text>
                      <Icon name="arrow-right" size={14} color="#FFFFFF" />
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
    backgroundColor: '#F8FAFC'
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9'
  },
  topBarTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  sectionHeaderWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  sectionHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4
  },
  sectionSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#64748B'
  },
  progressBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  progressBadgeText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '700',
    color: '#059669'
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3
  },
  coursesList: {
    gap: 14
  },
  courseCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  courseIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    padding: 4
  },
  courseLogoImage: {
    width: 38,
    height: 38
  },
  cardHeaderCenter: {
    flex: 1
  },
  orderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2
  },
  orderBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B'
  },
  courseName: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A'
  },
  levelBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  levelBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B'
  },
  courseSubtitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    color: '#5653fe',
    marginBottom: 6
  },
  courseDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  metaChipText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  ctaButtonRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.06)',
    paddingTop: 10
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#5653fe',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#5653fe',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2
  },
  ctaButtonText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
