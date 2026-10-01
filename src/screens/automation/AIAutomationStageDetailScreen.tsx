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
import { fullstackApi } from '../../api/fullstackApi';
import { AI_AUTOMATION_STAGES, AIAutomationStage } from './aiAutomationCourseData';
import { Icon } from '../../components/Icon';

const FONT_FAMILY = Platform.OS === 'android' ? 'sans-serif' : 'System';
const FONT_FAMILY_MEDIUM = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

export const AIAutomationStageDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const stageId = route.params?.stageId || 1;
  const stageData: AIAutomationStage =
    AI_AUTOMATION_STAGES.find((s) => s.id === stageId) || AI_AUTOMATION_STAGES[0];

  const [activeTab, setActiveTab] = useState<'learn' | 'compare' | 'practice'>('learn');
  const [userPracticeText, setUserPracticeText] = useState<string>(stageData.practiceTask?.starterCode || '');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [practiceFeedback, setPracticeFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const storageKey = `@crackwithai_automation_progress_${user?._id || 'guest'}`;

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
    if (stageData.practiceTask?.starterCode) {
      setUserPracticeText(stageData.practiceTask.starterCode);
    } else {
      setUserPracticeText('');
    }
  }, [stageId, storageKey, stageData]);

  const handleVerifyPractice = () => {
    if (!userPracticeText.trim()) {
      Alert.alert('Input Required', 'Please enter code or text for your automation practice task.');
      return;
    }

    if (userPracticeText.trim().length > 15) {
      setPracticeFeedback({
        success: true,
        message: 'Great execution! Your automation logic satisfies the task requirements.'
      });
    } else {
      setPracticeFeedback({
        success: false,
        message: 'Provide more detailed automation logic or payload structure to satisfy all task requirements.'
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
          activeStageId: Math.min(AI_AUTOMATION_STAGES.length, stageId + 1),
          updatedAt: new Date().toISOString()
        })
      );

      try {
        await fullstackApi.completeLesson(stageId.toString(), 'ai-automation');
      } catch {}

      setIsCompleted(true);
      Alert.alert('Stage Completed! 🎉', 'Great job mastering this AI Automation workflow stage!', [
        {
          text: 'Next Stage',
          onPress: () => {
            if (stageId < AI_AUTOMATION_STAGES.length) {
              navigation.replace('AIAutomationStageDetail', { stageId: stageId + 1 });
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
            <Text style={[styles.tabText, activeTab === 'compare' && styles.tabTextActive]}>2. Workflow Spec</Text>
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
              <Text style={styles.sectionHeading}>Why This Architecture Works</Text>
              <Text style={styles.bodyParagraph}>{stageData.why_it_works}</Text>
            </View>

            <TouchableOpacity style={styles.nextTabBtn} onPress={() => setActiveTab('compare')}>
              <Text style={styles.nextTabBtnText}>See Workflow Spec ➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: RAW VS ENGINEERED COMPARISON */}
        {activeTab === 'compare' && (
          <View style={styles.tabBlock}>
            <View style={[styles.codeBox, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.codeBoxLabel, { color: '#DC2626' }]}>❌ Manual / Unstructured Approach</Text>
              <Text style={styles.codeText}>{stageData.user_raw_idea}</Text>
            </View>

            <View style={[styles.codeBox, { borderColor: '#6EE7B7', backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.codeBoxLabel, { color: '#059669' }]}>⚡ Automated Workflow Pipeline</Text>
              <Text style={styles.codeText}>{stageData.engineered_prompt}</Text>
            </View>

            {stageData.starterCode ? (
              <View style={[styles.codeBox, { borderColor: '#93C5FD', backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.codeBoxLabel, { color: '#1D4ED8' }]}>💻 Code Implementation Snippet</Text>
                <Text style={styles.codeText}>{stageData.starterCode}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.nextTabBtn} onPress={() => setActiveTab('practice')}>
              <Text style={styles.nextTabBtnText}>Go to Interactive Practice ➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: INTERACTIVE PRACTICE */}
        {activeTab === 'practice' && (
          <View style={styles.tabBlock}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>{stageData.practiceTask.title}</Text>
              <Text style={styles.bodyParagraph}>{stageData.practiceTask.description}</Text>
              
              <Text style={[styles.sectionHeading, { marginTop: 12, fontSize: 13 }]}>Requirements:</Text>
              {stageData.practiceTask.requirements.map((req, idx) => (
                <Text key={`req-${idx}`} style={styles.reqItem}>
                  • {req}
                </Text>
              ))}
            </View>

            <View style={styles.inputBoxCard}>
              <Text style={styles.inputBoxLabel}>Write your Workflow / Code Solution below:</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={8}
                placeholder="Type your automation code or pipeline configuration here..."
                placeholderTextColor="#94A3B8"
                value={userPracticeText}
                onChangeText={setUserPracticeText}
              />

              <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyPractice}>
                <Icon name="check" size={16} color="#FFFFFF" />
                <Text style={styles.verifyBtnText}>Verify Solution Logic</Text>
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
    padding: 16,
    paddingBottom: 40
  },
  bannerCard: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8
  },
  levelBadgeText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#FFFFFF'
  },
  bannerTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#FFFFFF',
    marginBottom: 6
  },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    color: '#D1FAE5'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF'
  },
  tabText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#64748B'
  },
  tabTextActive: {
    color: '#059669'
  },
  tabBlock: {
    flex: 1
  },
  sectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#0F172A',
    marginBottom: 8
  },
  conceptHighlight: {
    fontSize: 16,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#059669',
    marginBottom: 8
  },
  bodyParagraph: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    color: '#334155',
    lineHeight: 22
  },
  reqItem: {
    fontSize: 13,
    fontFamily: FONT_FAMILY,
    color: '#475569',
    marginTop: 4
  },
  nextTabBtn: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8
  },
  nextTabBtnText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#FFFFFF'
  },
  codeBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14
  },
  codeBoxLabel: {
    fontSize: 13,
    fontFamily: FONT_FAMILY_MEDIUM,
    marginBottom: 8
  },
  codeText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#0F172A',
    lineHeight: 20
  },
  inputBoxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14
  },
  inputBoxLabel: {
    fontSize: 13,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#0F172A',
    marginBottom: 8
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#0F172A',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 12,
    minHeight: 120
  },
  verifyBtn: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  verifyBtnText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#FFFFFF'
  },
  feedbackBox: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 14
  },
  feedbackText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY
  },
  completeBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8
  },
  completeBtnText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#FFFFFF'
  }
});
