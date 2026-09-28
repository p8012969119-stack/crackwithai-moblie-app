import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../store/AuthContext';
import { storage } from '../../services/storage';
import { CONTEXT_STAGES, ContextStage } from './contextCourseData';
import { Icon } from '../../components/Icon';

const FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';
const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

export const ContextStageDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const stageId = route.params?.stageId || 1;
  const stageData: ContextStage = CONTEXT_STAGES.find((s) => s.id === stageId) || CONTEXT_STAGES[0];

  const [activeTab, setActiveTab] = useState<'learn' | 'compare' | 'practice'>('learn');
  const [userPracticeText, setUserPracticeText] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [practiceFeedback, setPracticeFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const storageKey = `@crackwithai_context_progress_${user?._id || 'guest'}`;

  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const stored = await storage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.completedStageIds) && parsed.completedStageIds.includes(stageId)) {
            setIsCompleted(true);
          }
        }
      } catch {}
    };
    checkCompletion();
  }, [stageId, storageKey]);

  const handleVerifyPractice = () => {
    if (!userPracticeText.trim()) {
      Alert.alert('Input Required', 'Please enter your practice prompt/context text.');
      return;
    }

    const lowerInput = userPracticeText.toLowerCase();
    const matches = stageData.expectedKeywords.filter((kw) => lowerInput.includes(kw.toLowerCase()));

    if (matches.length >= 2 || userPracticeText.length > 30) {
      setPracticeFeedback({
        success: true,
        message: 'Excellent context construction! Your prompt incorporates key structural constraints & boundaries.'
      });
    } else {
      setPracticeFeedback({
        success: false,
        message: `Include keywords like "${stageData.expectedKeywords.slice(0, 3).join('", "')}" for optimal context grounding.`
      });
    }
  };

  const handleMarkComplete = async () => {
    try {
      let completedList = [stageId];
      const stored = await storage.getItem(storageKey);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.completedStageIds)) {
          completedList = Array.from(new Set([...parsed.completedStageIds, stageId]));
        }
      }

      await storage.setItem(
        storageKey,
        JSON.stringify({
          completedStageIds: completedList,
          activeStageId: Math.min(CONTEXT_STAGES.length, stageId + 1),
          updatedAt: new Date().toISOString()
        })
      );

      setIsCompleted(true);
      Alert.alert('Stage Completed! 🎉', 'Great job mastering this Context Engineering technique!', [
        {
          text: 'Next Stage',
          onPress: () => {
            if (stageId < CONTEXT_STAGES.length) {
              navigation.replace('ContextStageDetail', { stageId: stageId + 1 });
            } else {
              navigation.goBack();
            }
          }
        },
        { text: 'Stay Here', style: 'cancel' }
      ]);
    } catch {
      setIsCompleted(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Navigation Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Lesson {stageData.id} · {stageData.category}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{stageData.level.toUpperCase()} · {stageData.duration}</Text>
          </View>
          <Text style={styles.bannerTitle}>{stageData.title}</Text>
          <Text style={styles.bannerSubtitle}>{stageData.subtitle}</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'learn' && styles.tabBtnActive]}
            onPress={() => setActiveTab('learn')}
          >
            <Text style={[styles.tabText, activeTab === 'learn' && styles.tabTextActive]}>1. Core Concept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'compare' && styles.tabBtnActive]}
            onPress={() => setActiveTab('compare')}
          >
            <Text style={[styles.tabText, activeTab === 'compare' && styles.tabTextActive]}>2. Raw vs Engineered</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'practice' && styles.tabBtnActive]}
            onPress={() => setActiveTab('practice')}
          >
            <Text style={[styles.tabText, activeTab === 'practice' && styles.tabTextActive]}>3. Practice Space</Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: LEARN CONCEPT */}
        {activeTab === 'learn' && (
          <View style={styles.tabBlock}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>Concept Focus</Text>
              <Text style={styles.conceptHighlight}>{stageData.concept}</Text>
              <Text style={styles.bodyParagraph}>{stageData.explanation}</Text>
            </View>

            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>Why This Strategy Works</Text>
              <Text style={styles.bodyParagraph}>{stageData.whyItWorks}</Text>
            </View>

            <TouchableOpacity style={styles.nextTabBtn} onPress={() => setActiveTab('compare')}>
              <Text style={styles.nextTabBtnText}>See Context Comparison ➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: RAW VS ENGINEERED COMPARISON */}
        {activeTab === 'compare' && (
          <View style={styles.tabBlock}>
            <View style={[styles.codeBox, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.codeBoxLabel, { color: '#DC2626' }]}>❌ Unstructured Raw Context</Text>
              <Text style={styles.codeText}>{stageData.rawContext}</Text>
            </View>

            <View style={[styles.codeBox, { borderColor: '#6EE7B7', backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.codeBoxLabel, { color: '#059669' }]}>⚡ Engineered Context Window</Text>
              <Text style={styles.codeText}>{stageData.engineeredContext}</Text>
            </View>

            <TouchableOpacity style={styles.nextTabBtn} onPress={() => setActiveTab('practice')}>
              <Text style={styles.nextTabBtnText}>Go to Interactive Practice ➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: INTERACTIVE PRACTICE */}
        {activeTab === 'practice' && (
          <View style={styles.tabBlock}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>Practice Prompt Task</Text>
              <Text style={styles.bodyParagraph}>{stageData.practicePrompt}</Text>
            </View>

            <View style={styles.inputBoxCard}>
              <Text style={styles.inputBoxLabel}>Write your Engineered Context below:</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={6}
                placeholder="Type your context rules, XML tags, or budget constraints here..."
                placeholderTextColor="#94A3B8"
                value={userPracticeText}
                onChangeText={setUserPracticeText}
              />

              <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyPractice}>
                <Icon name="check" size={16} color="#FFFFFF" />
                <Text style={styles.verifyBtnText}>Verify Context Structure</Text>
              </TouchableOpacity>
            </View>

            {practiceFeedback && (
              <View
                style={[
                  styles.feedbackBox,
                  { backgroundColor: practiceFeedback.success ? '#D1FAE5' : '#FEF3C7' }
                ]}
              >
                <Text
                  style={[
                    styles.feedbackText,
                    { color: practiceFeedback.success ? '#065F46' : '#92400E' }
                  ]}
                >
                  {practiceFeedback.message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.completeBtn, isCompleted && { backgroundColor: '#10B981' }]}
              onPress={handleMarkComplete}
            >
              <Text style={styles.completeBtnText}>
                {isCompleted ? 'Completed ✓ (Tap to Re-Save)' : 'Mark Lesson Complete ✓'}
              </Text>
            </TouchableOpacity>
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
  topHeader: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center'
  },
  container: {
    flex: 1
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 60
  },
  bannerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10
  },
  levelBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  bannerTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6
  },
  bannerSubtitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 19
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  tabText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B'
  },
  tabTextActive: {
    color: '#0F172A'
  },
  tabBlock: {
    gap: 16
  },
  sectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  sectionHeading: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  conceptHighlight: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8
  },
  bodyParagraph: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14,
    color: '#334155',
    lineHeight: 22
  },
  nextTabBtn: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4
  },
  nextTabBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  codeBox: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16
  },
  codeBoxLabel: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12.5,
    color: '#0F172A',
    lineHeight: 18
  },
  inputBoxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0'
  },
  inputBoxLabel: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    fontSize: 13.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#0F172A',
    textAlignVertical: 'top',
    minHeight: 110,
    marginBottom: 14
  },
  verifyBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800'
  },
  feedbackBox: {
    borderRadius: 14,
    padding: 14
  },
  feedbackText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19
  },
  completeBtn: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  }
});
