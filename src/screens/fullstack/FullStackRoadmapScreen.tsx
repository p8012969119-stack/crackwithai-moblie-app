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

export interface RainbowCardStyle {
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
  buttonBg: string;
  buttonText: string;
}

const CARD_STYLES: Record<string, RainbowCardStyle> = {
  // 1. HTML: Sunset Coral Red
  html: {
    bg: '#FFF5F5',
    border: '#FEB2B2',
    subtitleColor: '#C53030',
    badgeBg: '#FED7D7',
    badgeText: '#9B2C2C',
    badgeBorder: '#FEB2B2',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#FEB2B2',
    metaChipBg: '#FED7D7',
    metaChipText: '#9B2C2C',
    metaChipBorder: '#FEB2B2',
    buttonBg: '#E53E3E',
    buttonText: '#FFFFFF',
  },
  // 2. CSS: Tangy Orange
  css: {
    bg: '#FFFAF0',
    border: '#FBD38D',
    subtitleColor: '#C05621',
    badgeBg: '#FEEBC8',
    badgeText: '#7B341E',
    badgeBorder: '#FBD38D',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#FBD38D',
    metaChipBg: '#FEEBC8',
    metaChipText: '#7B341E',
    metaChipBorder: '#FBD38D',
    buttonBg: '#DD6B20',
    buttonText: '#FFFFFF',
  },
  // 3. JavaScript: Golden Sun Yellow
  javascript: {
    bg: '#FFFFF0',
    border: '#F6E05E',
    subtitleColor: '#B7791F',
    badgeBg: '#FEFCBF',
    badgeText: '#744210',
    badgeBorder: '#F6E05E',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#F6E05E',
    metaChipBg: '#FEFCBF',
    metaChipText: '#744210',
    metaChipBorder: '#F6E05E',
    buttonBg: '#D69E2E',
    buttonText: '#FFFFFF',
  },
  // 4. Node.js: Fresh Emerald Green
  nodejs: {
    bg: '#F0FFF4',
    border: '#9AE6B4',
    subtitleColor: '#276749',
    badgeBg: '#C6F6D5',
    badgeText: '#1C4532',
    badgeBorder: '#9AE6B4',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#9AE6B4',
    metaChipBg: '#C6F6D5',
    metaChipText: '#1C4532',
    metaChipBorder: '#9AE6B4',
    buttonBg: '#38A169',
    buttonText: '#FFFFFF',
  },
  // 5. Express.js: Ocean Teal Cyan
  expressjs: {
    bg: '#E6FFFA',
    border: '#81E6D9',
    subtitleColor: '#2C7A7B',
    badgeBg: '#B2F5EA',
    badgeText: '#1D4044',
    badgeBorder: '#81E6D9',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#81E6D9',
    metaChipBg: '#B2F5EA',
    metaChipText: '#1D4044',
    metaChipBorder: '#81E6D9',
    buttonBg: '#319795',
    buttonText: '#FFFFFF',
  },
  // 6. MongoDB: Electric Royal Blue
  mongodb: {
    bg: '#EBF8FF',
    border: '#90CDF4',
    subtitleColor: '#2B6CB0',
    badgeBg: '#BEE3F8',
    badgeText: '#1A365D',
    badgeBorder: '#90CDF4',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#90CDF4',
    metaChipBg: '#BEE3F8',
    metaChipText: '#1A365D',
    metaChipBorder: '#90CDF4',
    buttonBg: '#3182CE',
    buttonText: '#FFFFFF',
  },
  // 7. REST APIs: Deep Royal Indigo
  restapi: {
    bg: '#EBF4FF',
    border: '#A3BFFA',
    subtitleColor: '#3C366B',
    badgeBg: '#C3DAFE',
    badgeText: '#2C5282',
    badgeBorder: '#A3BFFA',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#A3BFFA',
    metaChipBg: '#C3DAFE',
    metaChipText: '#2C5282',
    metaChipBorder: '#A3BFFA',
    buttonBg: '#4C51BF',
    buttonText: '#FFFFFF',
  },
  // 8. Auth: Mystic Purple Violet
  auth: {
    bg: '#FAF5FF',
    border: '#D6BCFA',
    subtitleColor: '#6B46C1',
    badgeBg: '#E9D8FD',
    badgeText: '#322659',
    badgeBorder: '#D6BCFA',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#D6BCFA',
    metaChipBg: '#E9D8FD',
    metaChipText: '#322659',
    metaChipBorder: '#D6BCFA',
    buttonBg: '#805AD5',
    buttonText: '#FFFFFF',
  },
  // 9. Capstone: Electric Magenta Pink
  capstone: {
    bg: '#FFF5F7',
    border: '#FEB2C2',
    subtitleColor: '#B83280',
    badgeBg: '#FED7E2',
    badgeText: '#521B41',
    badgeBorder: '#FEB2C2',
    logoBoxBg: '#FFFFFF',
    logoBoxBorder: '#FEB2C2',
    metaChipBg: '#FED7E2',
    metaChipText: '#521B41',
    metaChipBorder: '#FEB2C2',
    buttonBg: '#D53F8C',
    buttonText: '#FFFFFF',
  },
};

const DEFAULT_CARD_STYLE: RainbowCardStyle = {
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
  buttonBg: '#5653fe',
  buttonText: '#FFFFFF',
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
                        <Icon name={track.icon as any || 'code'} size={22} color={cardStyle.buttonBg} />
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

                  {/* Action CTA Button - Matched Rainbow Color for each card */}
                  <View style={styles.ctaButtonRow}>
                    <View style={[styles.ctaButton, { backgroundColor: cardStyle.buttonBg, shadowColor: cardStyle.buttonBg }]}>
                      <Text style={[styles.ctaButtonText, { color: cardStyle.buttonText }]}>
                        Start {track.title} Course
                      </Text>
                      <Icon name="arrow-right" size={14} color={cardStyle.buttonText} />
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
