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
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fullstackApi } from '../../api/fullstackApi';
import { Notice, ui } from '../../components/fullstack/CurriculumUI';
import { Icon } from '../../components/Icon';
import { useAuth } from '../../store/AuthContext';

// Omit invalid font strings on Android to prevent system cursive theme fallback
const FONT_FAMILY = Platform.OS === 'android' ? undefined : 'System';

export const FullStackOverviewScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  const handleComingSoon = (courseName: string) => {
    Alert.alert(
      courseName,
      `${courseName} course is coming soon.`
    );
  };

  return (
    <SafeAreaView style={[ui.safe, { backgroundColor: '#F8FAFC' }]} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => setRevision(x => x + 1)}
          />
        }
        contentContainerStyle={[ui.page, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={ui.back}
        >
          <Text style={[ui.backText, { color: '#5653FE', fontWeight: '700' }]}>‹ Back to dashboard</Text>
        </TouchableOpacity>

        {/* Learning Header */}
        <Text style={[ui.eyebrow, { color: '#5653FE', fontWeight: '800', letterSpacing: 1.2 }]}>CRACKWITHAI / COURSES</Text>
        <Text style={[ui.title, { color: '#0F172A', fontWeight: '800' }]}>LEARNING</Text>
        <Text style={[ui.body, { marginTop: 4, color: '#475569', fontSize: 14, marginBottom: 24 }]}>
          Learn practical technology and AI skills with hands-on courses.
        </Text>

        {error ? <Notice message={error} retry={() => setRevision(x => x + 1)} /> : null}

        {/* ==================================================
            CARD 1: FULL STACK DEVELOPMENT (MINIMALIST PREMIUM)
            ================================================== */}
        <TouchableOpacity
          style={styles.fullstackCard}
          activeOpacity={0.92}
          onPress={() => navigation.navigate('FullStackRoadmap')}
        >
          <View style={[styles.cardLogoBox, { backgroundColor: '#EEEDFF' }]}>
            <Icon name="code" size={26} color="#5653FE" />
          </View>

          <Text style={styles.fullstackTitle}>Full Stack Development</Text>

          <TouchableOpacity
            style={styles.fullstackBtnPill}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FullStackRoadmap')}
          >
            <Text style={styles.btnPillText}>Explore Courses</Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ==================================================
            CARD 2: PROMPT ENGINEERING (ACTIVE & PLAYABLE)
            ================================================== */}
        <TouchableOpacity
          style={styles.promptCard}
          activeOpacity={0.92}
          onPress={() => navigation.navigate('PromptEngineering')}
        >
          <View style={[styles.cardLogoBox, { backgroundColor: '#EDE9FE' }]}>
            <Icon name="sparkles" size={26} color="#7C3AED" />
          </View>

          <Text style={styles.promptTitle}>Prompt Engineering</Text>

          <TouchableOpacity
            style={styles.promptBtnPill}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PromptEngineering')}
          >
            <Text style={styles.btnPillText}>Explore Course</Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ==================================================
            CARD 3: CONTEXT ENGINEERING (MINIMALIST PREMIUM)
            ================================================== */}
        <TouchableOpacity
          style={styles.contextCard}
          activeOpacity={0.92}
          onPress={() => handleComingSoon('Context Engineering')}
        >
          <View style={[styles.cardLogoBox, { backgroundColor: '#E0F2FE' }]}>
            <Icon name="database" size={26} color="#0284C7" />
          </View>

          <Text style={styles.contextTitle}>Context Engineering</Text>

          <TouchableOpacity
            style={styles.contextBtnPill}
            activeOpacity={0.85}
            onPress={() => handleComingSoon('Context Engineering')}
          >
            <Icon name="clock" size={14} color="#FFFFFF" />
            <Text style={styles.btnPillText}>Coming Soon</Text>
          </TouchableOpacity>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardLogoBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  btnPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },

  /* CARD 1: FULL STACK DEVELOPMENT */
  fullstackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#5653FE',
    padding: 22,
    marginBottom: 20,
    shadowColor: '#5653FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4
  },
  fullstackTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 18
  },
  fullstackBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#5653FE',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 9999,
    shadowColor: '#5653FE',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },

  /* CARD 2: PROMPT ENGINEERING */
  promptCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    padding: 22,
    marginBottom: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  promptTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4C1D95',
    marginBottom: 18
  },
  promptBtnPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },

  /* CARD 3: CONTEXT ENGINEERING */
  contextCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    padding: 22,
    marginBottom: 20,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  contextTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0C4A6E',
    marginBottom: 18
  },
  contextBtnPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  }
});
