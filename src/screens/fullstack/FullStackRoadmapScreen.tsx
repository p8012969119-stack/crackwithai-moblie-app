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

  const overallPercentage = fsProgress?.overallPercentage || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Navigation Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          My Progress
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* TOP HERO OVERALL PROGRESS CARD (MATCHING USER SCREENSHOT) */}
        <View style={styles.heroProgressCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Great Progress! 🎉</Text>
            <Text style={styles.heroSubtitle}>You're doing awesome.</Text>
          </View>

          <View style={styles.heroRightCircle}>
            <Text style={styles.circlePercentageText}>{overallPercentage}%</Text>
            <Text style={styles.circleSubLabel}>Overall Progress</Text>
          </View>
        </View>

        {/* SECTION TITLE */}
        <Text style={styles.sectionHeaderTitle}>Skills Progress</Text>

        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 30 }} />
        ) : (
          /* CLEAN WHITE MODULE CARDS (MATCHING USER SCREENSHOT) */
          <View style={styles.coursesList}>
            {FULLSTACK_TRACKS.map((track) => {
              // Get track specific completion percentage if available
              const trackPercent = (fsProgress as any)?.trackProgress?.[track.id] ?? (overallPercentage > 0 ? Math.round(overallPercentage * 0.8) : 0);

              return (
                <TouchableOpacity
                  key={track.id}
                  style={styles.cleanWhiteCard}
                  activeOpacity={0.88}
                  onPress={() => handleOpenCourse(track.id)}
                >
                  <View style={styles.cardMainRow}>
                    {/* Left Tech Logo */}
                    <View style={styles.logoSquareContainer}>
                      {COURSE_LOGOS[track.id] ? (
                        <Image
                          source={COURSE_LOGOS[track.id]}
                          style={styles.courseLogoImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <Icon name={track.icon as any || 'code'} size={28} color="#0F172A" />
                      )}
                    </View>

                    {/* Middle Info & Progress Bar */}
                    <View style={styles.cardCenterBlock}>
                      <View style={styles.cardTitleRow}>
                        <Text style={styles.courseName}>{track.title}</Text>
                        <Text style={styles.percentText}>{trackPercent}%</Text>
                      </View>

                      {/* Thin Sleek Progress Line */}
                      <View style={styles.progressTrackBar}>
                        <View
                          style={[
                            styles.progressFillBar,
                            { width: `${Math.max(6, trackPercent)}%` }
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Start Course Action Footer */}
                  <View style={styles.cardFooterRow}>
                    <Text style={styles.startCourseBtnText}>Start Course</Text>
                    <Icon name="chevron-right" size={16} color="#5653FE" />
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 40
  },

  /* HERO OVERALL PROGRESS BANNER */
  heroProgressCard: {
    backgroundColor: '#2A1F86',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#2A1F86',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10
  },
  heroTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6
  },
  heroSubtitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    color: '#C7D2FE'
  },
  heroRightCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  },
  circlePercentageText: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  circleSubLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#A5B4FC',
    marginTop: 1,
    textAlign: 'center'
  },

  /* SECTION HEADING */
  sectionHeaderTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14
  },

  /* CLEAN WHITE COURSE CARDS (MATCHING USER SCREENSHOT) */
  coursesList: {
    gap: 14
  },
  cleanWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  logoSquareContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  courseLogoImage: {
    width: 36,
    height: 36
  },
  cardCenterBlock: {
    flex: 1
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  courseName: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A'
  },
  percentText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  progressTrackBar: {
    height: 6,
    backgroundColor: '#EEEDFF',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFillBar: {
    height: '100%',
    backgroundColor: '#5653FE',
    borderRadius: 3
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC'
  },
  startCourseBtnText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#5653FE'
  }
});
