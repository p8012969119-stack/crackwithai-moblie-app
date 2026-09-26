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

const CARD_BG_COLORS: Record<string, string> = {
  html: '#FFB870',       // Apricot Orange (matching reference image 1)
  css: '#74C0FC',        // Vibrant Sky Blue
  javascript: '#FEE140', // Golden Sun Yellow
  nodejs: '#C0EB75',     // Vibrant Lime Green (matching reference image 1 & 2)
  expressjs: '#70E0D6',  // Cool Mint Cyan
  mongodb: '#6EE7B7',    // Fresh Emerald
  restapi: '#B197FC',    // Soft Lavender Violet
  auth: '#FF8787',       // Vibrant Coral Red (matching reference image 1 & 2)
  capstone: '#C490FF',   // Vibrant Lavender Purple (matching reference image 2)
};

const DEFAULT_CARD_BG = '#C490FF';

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
        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.coursesList}>
            {FULLSTACK_TRACKS.map((track) => {
              const cardBgColor = CARD_BG_COLORS[track.id] || DEFAULT_CARD_BG;
              return (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.courseCard,
                    {
                      backgroundColor: cardBgColor,
                    }
                  ]}
                  activeOpacity={0.88}
                  onPress={() => handleOpenCourse(track.id)}
                >
                  {/* Direct Logo rendering on card background - NO white icon box! */}
                  <View style={styles.cardHeaderRow}>
                    {COURSE_LOGOS[track.id] ? (
                      <Image
                        source={COURSE_LOGOS[track.id]}
                        style={styles.courseLogoImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Icon name={track.icon as any || 'code'} size={32} color="#0F172A" />
                    )}

                    <View style={styles.cardHeaderCenter}>
                      <Text style={styles.courseName}>{track.title}</Text>
                      <Text style={styles.courseSubtitle}>{track.subtitle}</Text>
                    </View>
                  </View>

                  {/* Polished Dark Pill Action Button */}
                  <View style={styles.ctaButton}>
                    <Text style={styles.ctaButtonText}>Start</Text>
                    <Icon name="arrow-right" size={15} color="#FFFFFF" />
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
  coursesList: {
    gap: 16
  },
  courseCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16
  },
  courseLogoImage: {
    width: 44,
    height: 44
  },
  cardHeaderCenter: {
    flex: 1
  },
  courseName: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2
  },
  courseSubtitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B'
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 4
  },
  ctaButtonText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2
  }
});
