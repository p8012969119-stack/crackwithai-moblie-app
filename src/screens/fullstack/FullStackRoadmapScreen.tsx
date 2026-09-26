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

export interface PremiumCardStyle {
  bg: string;
  border: string;
  subtitleColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  logoBoxBg: string;
  logoBoxBorder: string;
  metaChipBg: string;
  metaChipText: string;
  metaChipBorder: string;
}

const CARD_STYLES: Record<string, PremiumCardStyle> = {
  html: {
    bg: '#FFF3E0',
    border: '#FFB74D',
    subtitleColor: '#D84315',
    badgeBg: '#FFE0B2',
    badgeText: '#E65100',
    badgeBorder: '#FFB74D',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#FFB74D',
    metaChipBg: '#FFE0B2',
    metaChipText: '#BF360C',
    metaChipBorder: '#FFB74D',
  },
  css: {
    bg: '#E3F2FD',
    border: '#64B5F6',
    subtitleColor: '#1565C0',
    badgeBg: '#BBDEFB',
    badgeText: '#1565C0',
    badgeBorder: '#64B5F6',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#64B5F6',
    metaChipBg: '#BBDEFB',
    metaChipText: '#0D47A1',
    metaChipBorder: '#64B5F6',
  },
  javascript: {
    bg: '#FFFDE7',
    border: '#FDD835',
    subtitleColor: '#F57F17',
    badgeBg: '#FFF59D',
    badgeText: '#E65100',
    badgeBorder: '#FDD835',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#FDD835',
    metaChipBg: '#FFF59D',
    metaChipText: '#BF360C',
    metaChipBorder: '#FDD835',
  },
  nodejs: {
    bg: '#E8F5E9',
    border: '#81C784',
    subtitleColor: '#2E7D32',
    badgeBg: '#C8E6C9',
    badgeText: '#2E7D32',
    badgeBorder: '#81C784',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#81C784',
    metaChipBg: '#C8E6C9',
    metaChipText: '#1B5E20',
    metaChipBorder: '#81C784',
  },
  expressjs: {
    bg: '#ECEFF1',
    border: '#90A4AE',
    subtitleColor: '#37474F',
    badgeBg: '#CFD8DC',
    badgeText: '#37474F',
    badgeBorder: '#90A4AE',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#90A4AE',
    metaChipBg: '#CFD8DC',
    metaChipText: '#263238',
    metaChipBorder: '#90A4AE',
  },
  mongodb: {
    bg: '#E0F2F1',
    border: '#4DB6AC',
    subtitleColor: '#00695C',
    badgeBg: '#B2DFDB',
    badgeText: '#00695C',
    badgeBorder: '#4DB6AC',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#4DB6AC',
    metaChipBg: '#B2DFDB',
    metaChipText: '#004D40',
    metaChipBorder: '#4DB6AC',
  },
  restapi: {
    bg: '#F3E5F5',
    border: '#BA68C8',
    subtitleColor: '#6A1B9A',
    badgeBg: '#E1BEE7',
    badgeText: '#6A1B9A',
    badgeBorder: '#BA68C8',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#BA68C8',
    metaChipBg: '#E1BEE7',
    metaChipText: '#4A148C',
    metaChipBorder: '#BA68C8',
  },
  auth: {
    bg: '#FFEBEE',
    border: '#E57373',
    subtitleColor: '#C62828',
    badgeBg: '#FFCDD2',
    badgeText: '#C62828',
    badgeBorder: '#E57373',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#E57373',
    metaChipBg: '#FFCDD2',
    metaChipText: '#B71C1C',
    metaChipBorder: '#E57373',
  },
  capstone: {
    bg: '#E8EAF6',
    border: '#7986CB',
    subtitleColor: '#283593',
    badgeBg: '#C5CAE9',
    badgeText: '#283593',
    badgeBorder: '#7986CB',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#7986CB',
    metaChipBg: '#C5CAE9',
    metaChipText: '#1A237E',
    metaChipBorder: '#7986CB',
  },
};

const DEFAULT_CARD_STYLE: PremiumCardStyle = {
  bg: '#FFFFFF',
  border: '#E2E8F0',
  subtitleColor: '#5653fe',
  badgeBg: '#F1F5F9',
  badgeText: '#64748B',
  badgeBorder: '#CBD5E1',
  logoBoxBg: '#FFFFFF',
  logoBoxBorder: '#E2E8F0',
  metaChipBg: '#F8FAFC',
  metaChipText: '#64748B',
  metaChipBorder: '#E2E8F0',
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
                    <View style={[
                      styles.courseIconBox,
                      {
                        backgroundColor: cardStyle.logoBoxBg,
                        borderColor: cardStyle.logoBoxBorder,
                      }
                    ]}>
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
                      <View style={[
                        styles.orderBadge,
                        {
                          backgroundColor: cardStyle.badgeBg,
                          borderColor: cardStyle.badgeBorder,
                        }
                      ]}>
                        <Text style={[styles.orderBadgeText, { color: cardStyle.badgeText }]}>
                          COURSE {courseNum} OF 9
                        </Text>
                      </View>
                      <Text style={styles.courseName}>{track.title}</Text>
                    </View>

                    <View style={[
                      styles.levelBadge,
                      {
                        backgroundColor: cardStyle.badgeBg,
                        borderColor: cardStyle.badgeBorder,
                      }
                    ]}>
                      <Text style={[styles.levelBadgeText, { color: cardStyle.badgeText }]}>
                        {track.level || 'Beginner'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.courseSubtitle, { color: cardStyle.subtitleColor }]}>
                    {track.subtitle}
                  </Text>
                  <Text style={styles.courseDesc} numberOfLines={2}>
                    {track.description}
                  </Text>

                  {/* Metadata Chips Row */}
                  <View style={styles.metaRow}>
                    <View style={[
                      styles.metaChip,
                      {
                        backgroundColor: cardStyle.metaChipBg,
                        borderColor: cardStyle.metaChipBorder,
                      }
                    ]}>
                      <Icon name="book-open" size={12} color={cardStyle.metaChipText} />
                      <Text style={[styles.metaChipText, { color: cardStyle.metaChipText }]}>
                        {track.modulesCount || 4} Modules
                      </Text>
                    </View>
                    <View style={[
                      styles.metaChip,
                      {
                        backgroundColor: cardStyle.metaChipBg,
                        borderColor: cardStyle.metaChipBorder,
                      }
                    ]}>
                      <Icon name="file-text" size={12} color={cardStyle.metaChipText} />
                      <Text style={[styles.metaChipText, { color: cardStyle.metaChipText }]}>
                        {track.lessonsCount || 20} Lessons
                      </Text>
                    </View>
                    <View style={[
                      styles.metaChip,
                      {
                        backgroundColor: cardStyle.metaChipBg,
                        borderColor: cardStyle.metaChipBorder,
                      }
                    ]}>
                      <Icon name="clock" size={12} color={cardStyle.metaChipText} />
                      <Text style={[styles.metaChipText, { color: cardStyle.metaChipText }]}>
                        {track.duration || '4 hours'}
                      </Text>
                    </View>
                  </View>

                  {/* Action CTA Button - SAME color for all cards */}
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
    gap: 16
  },
  courseCard: {
    borderRadius: 18,
    borderWidth: 1.8,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10
  },
  courseIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4
  },
  orderBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '800'
  },
  courseName: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  levelBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700'
  },
  courseSubtitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6
  },
  courseDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 14
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  metaChipText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '700'
  },
  ctaButtonRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.08)',
    paddingTop: 12
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#5653fe',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#5653fe',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3
  },
  ctaButtonText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});
