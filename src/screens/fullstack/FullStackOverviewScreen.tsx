import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { Icon } from '../../components/Icon';
import { useAuth } from '../../store/AuthContext';

const FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';
const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

export const FullStackOverviewScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Navigation Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          My Progress
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => setRevision(x => x + 1)}
          />
        }
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO OVERALL PROGRESS BANNER (MATCHING SCREENSHOT) */}
        <View style={styles.heroProgressCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Great Progress! 🎉</Text>
            <Text style={styles.heroSubtitle}>You're doing awesome.</Text>
          </View>

          <View style={styles.heroRightCircle}>
            <Text style={styles.circlePercentageText}>68%</Text>
            <Text style={styles.circleSubLabel}>Overall Progress</Text>
          </View>
        </View>

        {/* SECTION HEADING */}
        <Text style={styles.sectionHeaderTitle}>Skills Progress</Text>

        {/* 3 CLEAN WHITE COURSE CARDS */}
        <View style={styles.coursesList}>
          {/* CARD 1: FULL STACK DEVELOPMENT */}
          <TouchableOpacity
            style={styles.cleanWhiteCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('FullStackRoadmap')}
          >
            <View style={styles.cardMainRow}>
              <View style={styles.logoSquareContainer}>
                <Icon name="code" size={26} color="#5653FE" />
              </View>

              <View style={styles.cardCenterBlock}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.courseName}>Full Stack Development</Text>
                  <Text style={styles.percentText}>90%</Text>
                </View>

                <View style={styles.progressTrackBar}>
                  <View style={[styles.progressFillBar, { width: '90%', backgroundColor: '#5653FE' }]} />
                </View>
              </View>
            </View>

            <View style={styles.cardFooterRow}>
              <Text style={styles.startCourseBtnText}>Explore Course</Text>
              <Icon name="chevron-right" size={16} color="#5653FE" />
            </View>
          </TouchableOpacity>

          {/* CARD 2: PROMPT ENGINEERING */}
          <TouchableOpacity
            style={styles.cleanWhiteCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('PromptEngineering')}
          >
            <View style={styles.cardMainRow}>
              <View style={[styles.logoSquareContainer, { backgroundColor: '#EDE9FE' }]}>
                <Icon name="sparkles" size={26} color="#7C3AED" />
              </View>

              <View style={styles.cardCenterBlock}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.courseName}>Prompt Engineering</Text>
                  <Text style={styles.percentText}>75%</Text>
                </View>

                <View style={styles.progressTrackBar}>
                  <View style={[styles.progressFillBar, { width: '75%', backgroundColor: '#7C3AED' }]} />
                </View>
              </View>
            </View>

            <View style={styles.cardFooterRow}>
              <Text style={[styles.startCourseBtnText, { color: '#7C3AED' }]}>Explore Course</Text>
              <Icon name="chevron-right" size={16} color="#7C3AED" />
            </View>
          </TouchableOpacity>

          {/* CARD 3: CONTEXT ENGINEERING */}
          <TouchableOpacity
            style={styles.cleanWhiteCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('ContextEngineering')}
          >
            <View style={styles.cardMainRow}>
              <View style={[styles.logoSquareContainer, { backgroundColor: '#E0F2FE' }]}>
                <Icon name="database" size={26} color="#0284C7" />
              </View>

              <View style={styles.cardCenterBlock}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.courseName}>Context Engineering</Text>
                  <Text style={styles.percentText}>60%</Text>
                </View>

                <View style={styles.progressTrackBar}>
                  <View style={[styles.progressFillBar, { width: '60%', backgroundColor: '#0284C7' }]} />
                </View>
              </View>
            </View>

            <View style={styles.cardFooterRow}>
              <Text style={[styles.startCourseBtnText, { color: '#0284C7' }]}>Explore Course</Text>
              <Icon name="chevron-right" size={16} color="#0284C7" />
            </View>
          </TouchableOpacity>

          {/* CARD 4: AI AUTOMATION */}
          <TouchableOpacity
            style={styles.cleanWhiteCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('AIAutomation')}
          >
            <View style={styles.cardMainRow}>
              <View style={[styles.logoSquareContainer, { backgroundColor: '#D1FAE5' }]}>
                <Icon name="zap" size={26} color="#10B981" />
              </View>

              <View style={styles.cardCenterBlock}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.courseName}>AI Automation</Text>
                  <Text style={styles.percentText}>80%</Text>
                </View>

                <View style={styles.progressTrackBar}>
                  <View style={[styles.progressFillBar, { width: '80%', backgroundColor: '#10B981' }]} />
                </View>
              </View>
            </View>

            <View style={styles.cardFooterRow}>
              <Text style={[styles.startCourseBtnText, { color: '#10B981' }]}>Explore Course</Text>
              <Icon name="chevron-right" size={16} color="#10B981" />
            </View>
          </TouchableOpacity>
        </View>
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
  contentContainer: {
    padding: 18,
    paddingBottom: 60
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

  /* CLEAN WHITE COURSE CARDS */
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
    backgroundColor: '#EEEDFF',
    alignItems: 'center',
    justifyContent: 'center'
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
