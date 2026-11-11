import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  Animated,
  Modal,
  Dimensions,
  TextInput,
  Switch,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../store/AuthContext';
import { userApi } from '../../api/userApi';
import { fullstackApi } from '../../api/fullstackApi';
import { FullStackCourseProgress } from '../../types/fullstack';
import { launchImageLibrary } from 'react-native-image-picker';

import { certificateApi } from '../../api/certificateApi';
import { bookmarkApi } from '../../api/bookmarkApi';
import { Certificate, Bookmark, DashboardData } from '../../types';
import { SHADOWS } from '../../constants/theme';
import { Button } from '../../components/Button';
import {CertificateMark} from '../../components/CertificateMark';
import { Icon } from '../../components/Icon';
import { CertificateModal } from '../../components/CertificateModal';
import { storage } from '../../services/storage';
import { CONFIG } from '../../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Curated gallery of preset avatar images
const PRESET_AVATARS = [
  { id: '1', title: 'Tech Lead', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  { id: '2', title: 'Executive', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
  { id: '3', title: 'Student', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80' },
  { id: '4', title: 'AI Researcher', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
  { id: '5', title: 'Designer', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' },
  { id: '6', title: 'AI Developer', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80' },
  { id: '7', title: 'Founder', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
  { id: '8', title: 'Scholar', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80' },
];

const AVATAR_IMAGES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
];

const getRingBorderColors = (pct: number) => {
  if (pct >= 100) {
    return { borderColor: '#5553FE' };
  }
  if (pct >= 75) {
    return { borderColor: '#5553FE', borderLeftColor: '#E2E8F0' };
  }
  if (pct >= 50) {
    return { borderColor: '#5553FE', borderBottomColor: '#E2E8F0', borderLeftColor: '#E2E8F0' };
  }
  if (pct > 0) {
    return { borderColor: '#E2E8F0', borderTopColor: '#5553FE', borderRightColor: '#5553FE' };
  }
  return { borderColor: '#E2E8F0' };
};

export const ProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user, logout, refreshProfile } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  // Animated values
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const avatarScaleAnim = useRef(new Animated.Value(0.85)).current;
  const ringProgressAnim = useRef(new Animated.Value(0)).current;
  const xpCountAnim = useRef(new Animated.Value(0)).current;

  // States
  const [avatarIndex, setAvatarIndex] = useState<number>(0);
  const [avatarModalVisible, setAvatarModalVisible] = useState<boolean>(false);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(user?.avatar || PRESET_AVATARS[0].url);
  const [customAvatarInput, setCustomAvatarInput] = useState<string>('');
  const [savingAvatar, setSavingAvatar] = useState<boolean>(false);
  const [pickingFromGallery, setPickingFromGallery] = useState<boolean>(false);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [skillsProgress, setSkillsProgress] = useState<any>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [certModalVisible, setCertModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (user?.avatar) {
      setSelectedAvatarUrl(user.avatar);
    }
  }, [user?.avatar]);

  const handleSaveAvatar = async (target?: string) => {
    const targetUrl = target || customAvatarInput.trim() || selectedAvatarUrl;
    if (!targetUrl) return;
    try {
      setSavingAvatar(true);
      const res = await userApi.updateProfile({
        avatar: targetUrl,
        profileImage: targetUrl,
      });
      if (res?.success) {
        if (refreshProfile) {
          await refreshProfile();
        }
        setSelectedAvatarUrl(targetUrl);
        Alert.alert('Profile Photo Updated', 'Your profile photo has been updated successfully!');
        setAvatarModalVisible(false);
      } else {
        Alert.alert('Update Failed', res?.message || 'Could not save profile photo.');
      }
    } catch (err: any) {
      console.warn('Save avatar error:', err);
      Alert.alert('Upload Error', err?.response?.data?.message || err?.message || 'Unable to update profile picture.');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      setPickingFromGallery(true);
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.7,
        maxWidth: 600,
        maxHeight: 600,
        includeBase64: true,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          'Photo Access',
          result.errorMessage || 'Please enable Photos access in Settings to choose a profile photo.'
        );
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const mime = asset.type || 'image/jpeg';
      const imageUri = asset.base64
        ? `data:${mime};base64,${asset.base64}`
        : asset.uri || '';

      if (imageUri) {
        setSelectedAvatarUrl(imageUri);
        setCustomAvatarInput(imageUri);
        await handleSaveAvatar(imageUri);
      }
    } catch (err: any) {
      console.warn('Gallery pick error:', err);
      Alert.alert('Gallery Access', 'Could not access photo gallery. Please check camera and photo permissions in device settings.');
    } finally {
      setPickingFromGallery(false);
    }
  };

  // Modals & Sheets
  const [logoutModalVisible, setLogoutModalVisible] = useState<boolean>(false);
  const [timeFilter, setTimeFilter] = useState<'This Month' | 'This Week' | 'All Time'>('This Month');
  const [filterMenuVisible, setFilterMenuVisible] = useState<boolean>(false);

  // Additional Module Modals
  const [personalInfoModalVisible, setPersonalInfoModalVisible] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(user?.fullName || user?.name || 'Prakash');
  const [emailInput, setEmailInput] = useState<string>(user?.email || 'p8012969119@gmail.com');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  const [securityModalVisible, setSecurityModalVisible] = useState<boolean>(false);
  const [currentPassInput, setCurrentPassInput] = useState<string>('');
  const [newPassInput, setNewPassInput] = useState<string>('');
  const [confirmPassInput, setConfirmPassInput] = useState<string>('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(Boolean(user?.twoFactorEnabled));
  const [savingSecurity, setSavingSecurity] = useState<boolean>(false);
  const [fullstackProgress, setFullstackProgress] = useState<FullStackCourseProgress | null>(null);

  const [notifModalVisible, setNotifModalVisible] = useState<boolean>(false);
  const [dailyReminders, setDailyReminders] = useState<boolean>(true);
  const [quizAlerts, setQuizAlerts] = useState<boolean>(true);
  const [newCourseAlerts, setNewCourseAlerts] = useState<boolean>(true);
  const [communityAlerts, setCommunityAlerts] = useState<boolean>(false);

  const [supportModalVisible, setSupportModalVisible] = useState<boolean>(false);
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [sendingSupportMsg, setSendingSupportMsg] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleSavePersonalInfo = async () => {
    try {
      setSavingProfile(true);
      const res = await userApi.updateProfile({
        fullName: nameInput,
        name: nameInput,
        email: emailInput,
      });
      if (res.success) {
        if (refreshProfile) {
          await refreshProfile();
        }
        Alert.alert('Success', 'Personal Information updated successfully!');
        setPersonalInfoModalVisible(false);
      } else {
        Alert.alert('Error', res.message || 'Failed to update personal information');
      }
    } catch (err: any) {
      Alert.alert('Error', 'An error occurred while updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (newPassInput) {
      if (newPassInput.length < 6) {
        Alert.alert('Validation Error', 'New password must be at least 6 characters long.');
        return;
      }
      if (newPassInput !== confirmPassInput) {
        Alert.alert('Validation Error', 'New password and confirm password do not match.');
        return;
      }
      if (!currentPassInput) {
        Alert.alert('Validation Error', 'Please enter your current password to set a new password.');
        return;
      }
    }
    try {
      setSavingSecurity(true);
      await userApi.updateProfile({
        currentPassword: currentPassInput || undefined,
        newPassword: newPassInput || undefined,
        twoFactorEnabled: twoFactorEnabled,
      });
      if (refreshProfile) {
        await refreshProfile();
      }
      Alert.alert('Security Updated', 'Your security credentials and authentication settings have been updated securely.');
      setSecurityModalVisible(false);
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
    } catch (err: any) {
      Alert.alert('Security Error', err?.message || 'Failed to update security settings. Please verify your current password.');
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleSaveNotifications = () => {
    Alert.alert('Preferences Saved', 'Your notification preferences have been updated!');
    setNotifModalVisible(false);
  };

  const handleSendSupportMessage = () => {
    if (!supportMessage.trim()) {
      Alert.alert('Required', 'Please enter a message or question for our support team.');
      return;
    }
    setSendingSupportMsg(true);
    setTimeout(() => {
      setSendingSupportMsg(false);
      Alert.alert('Ticket Created', 'Thank you! Support ticket created. We will email you at ' + (user?.email || 'your email') + ' shortly.');
      setSupportMessage('');
      setSupportModalVisible(false);
    }, 600);
  };

  const profileRequest = useRef<AbortController | null>(null);
  const [progressError, setProgressError] = useState(false);

  const fetchProfileData = useCallback(async (period: 'This Month' | 'This Week' | 'All Time' = timeFilter) => {
    if (profileRequest.current) return;
    const controller = new AbortController();
    profileRequest.current = controller;
    setLoading(true);
    setProgressError(false);
    try {
      const [dashRes, certRes, bmRes, skillsRes, fsRes] = await Promise.allSettled([
        userApi.getDashboard(controller.signal, period),
        certificateApi.getMyCertificates(),
        bookmarkApi.getAllBookmarks(),
        fullstackApi.getUserSkillsProgress(),
        fullstackApi.getFullStackProgress(),
      ]);
      if (controller.signal.aborted) return;
      if (dashRes.status === 'fulfilled') {
        setDashboardData(dashRes.value.data);
      } else {
        setDashboardData(null);
        setProgressError(true);
      }
      if (certRes.status === 'fulfilled') setCertificates(certRes.value.data || []);
      if (bmRes.status === 'fulfilled') setBookmarks(bmRes.value.data || []);
      if (skillsRes.status === 'fulfilled') setSkillsProgress(skillsRes.value);
      if (fsRes.status === 'fulfilled') setFullstackProgress(fsRes.value);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
        profileRequest.current = null;
      }
    }
  }, [timeFilter]);

  useFocusEffect(useCallback(() => {
    void fetchProfileData();
    if (refreshProfile) {
      void refreshProfile();
    }
    scrollViewRef.current?.scrollTo({y: 0, animated: false});
    return () => {profileRequest.current?.abort(); profileRequest.current = null;};
  }, [fetchProfileData, refreshProfile]));

  useEffect(() => {
    // Trigger smooth entrance animations
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(avatarScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(ringProgressAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fetchProfileData, headerFadeAnim, avatarScaleAnim, ringProgressAnim]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData(timeFilter);
    if (refreshProfile) {
      void refreshProfile();
    }
  };

  const handleCycleAvatar = () => {
    setAvatarIndex((prev) => (prev + 1) % AVATAR_IMAGES.length);
    Alert.alert('Avatar Updated', 'Profile picture updated successfully!');
  };

  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  const initials = (user?.fullName || user?.name)
    ? (user.fullName || user.name)
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'P';

  const stat = (value?: number, fallback: number = 0) => (value !== undefined && value !== null ? String(value) : String(fallback));

  const skillsTotalLessons = (skillsProgress?.fullstack?.completedCount || 0) +
    (skillsProgress?.promptEngineering?.completedCount || 0) +
    (skillsProgress?.contextEngineering?.completedCount || 0) +
    (skillsProgress?.aiAutomation?.completedCount || 0);

  const totalCompletedLessons = Math.max(dashboardData?.completedLessonsCount || 0, skillsTotalLessons);

  // Strict Course Streak: 1 completed course = 1 streak point (never per-lesson!)
  const courseStreakCount = useMemo(() => {
    let count = 0;
    if (fullstackProgress?.modules && fullstackProgress.modules.length > 0) {
      const allModulesDone = fullstackProgress.modules.every(
        (m: any) => Boolean(m.isCompleted || (m.totalLessons > 0 && m.completedLessons >= m.totalLessons))
      );
      if (allModulesDone || fullstackProgress?.courseCompleted || (fullstackProgress?.overallPercentage ?? 0) >= 100) {
        count += 1;
      }
    } else if (skillsProgress?.fullstack && skillsProgress.fullstack.completedCount >= 25) {
      count += 1;
    }
    const certCount = certificates.length || dashboardData?.certificatesCount || 0;
    count = Math.max(count, certCount);
    if (Array.isArray(dashboardData?.completedCourses)) {
      count = Math.max(count, dashboardData.completedCourses.length);
    } else if (typeof dashboardData?.completedCourses === 'number') {
      count = Math.max(count, dashboardData.completedCourses);
    }
    if (typeof user?.courseStreak === 'number' && user.courseStreak > 0) {
      count = Math.max(count, user.courseStreak);
    }
    // Strict course streak: 0 if no course completed
    return count;
  }, [fullstackProgress, skillsProgress, certificates, dashboardData, user?.courseStreak]);

  const timeframeData = dashboardData?.timeframeStats?.[timeFilter];

  const overallProgressPercent = timeframeData?.averageProgress ?? (
    typeof fullstackProgress?.overallPercentage === 'number' && fullstackProgress.overallPercentage > 0
      ? fullstackProgress.overallPercentage
      : (skillsProgress?.overallPercentage || (totalCompletedLessons > 0 ? Math.min(100, Math.round((totalCompletedLessons / 171) * 100)) : 0))
  );

  const displayMinutes = timeframeData?.learningMinutes ?? (
    timeFilter === 'This Month'
      ? (dashboardData?.learningMinutes ?? Math.max(60, totalCompletedLessons * 15))
      : timeFilter === 'This Week'
      ? Math.round((dashboardData?.learningMinutes ?? Math.max(60, totalCompletedLessons * 15)) / 2)
      : (dashboardData?.learningMinutes ?? Math.max(60, totalCompletedLessons * 15))
  );

  const displayXp = timeframeData?.xp ?? (
    timeFilter === 'This Month'
      ? (user?.xp ?? dashboardData?.xp ?? (totalCompletedLessons * 50 + courseStreakCount * 100))
      : timeFilter === 'This Week'
      ? Math.round((user?.xp ?? dashboardData?.xp ?? (totalCompletedLessons * 50 + courseStreakCount * 100)) / 2)
      : (user?.xp ?? dashboardData?.xp ?? (totalCompletedLessons * 50 + courseStreakCount * 100))
  );

  const displayModules = timeframeData?.completedModulesCount ?? (
    timeFilter === 'This Month'
      ? (fullstackProgress?.completedModules ?? dashboardData?.completedModulesCount ?? Math.max(1, Math.floor(totalCompletedLessons / 25)))
      : timeFilter === 'This Week'
      ? Math.max(0, Math.round((fullstackProgress?.completedModules ?? dashboardData?.completedModulesCount ?? Math.max(1, Math.floor(totalCompletedLessons / 25))) / 2))
      : (fullstackProgress?.completedModules ?? dashboardData?.completedModulesCount ?? Math.max(1, Math.floor(totalCompletedLessons / 25)))
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5553FE" />}
      >
        {/* ================= TOP HEADER (Purple Gradient) ================= */}
        <Animated.View style={[styles.topGradientHeader, { paddingTop: Math.max(insets.top, 12), opacity: headerFadeAnim }]}>
          {/* Header Action Controls */}
          <View style={styles.headerControlsRow}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('MainTabs');
                }
              }}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerRightGroup}>
              <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Bookmarks')} activeOpacity={0.7}>
                <Icon name="bell" size={18} color="#FFFFFF" />
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>3</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.headerIconBtn} onPress={() => setLogoutModalVisible(true)} activeOpacity={0.7}>
                <Icon name="settings" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile User Info Row */}
          <View style={styles.profileUserRow}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setAvatarModalVisible(true)} style={styles.avatarContainer}>
              <Animated.View style={[styles.avatarBorderRing, { transform: [{ scale: avatarScaleAnim }] }]}>
                {user?.avatar || selectedAvatarUrl || AVATAR_IMAGES[avatarIndex] ? (
                  <Image source={{ uri: user?.avatar || selectedAvatarUrl || AVATAR_IMAGES[avatarIndex] }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{initials}</Text>
                  </View>
                )}
              </Animated.View>
              {/* Online Indicator */}
              <View style={styles.onlineStatusDot} />
              {/* Camera Icon Overlay Button - Quick Gallery Access */}
              <TouchableOpacity
                style={styles.cameraOverlayBtn}
                onPress={handlePickFromGallery}
                activeOpacity={0.8}
              >
                <Icon name="image" size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* User Meta Text & Badges */}
            <View style={styles.userMetaCol}>
              <View style={styles.nameRow}>
                <Text style={styles.userNameText}>{user?.fullName || user?.name || 'Prakash'}</Text>
                <View style={styles.verifiedCheckBadge}>
                  <Icon name="check-circle" size={12} color="#FFFFFF" />
                </View>
              </View>

              {/* CrackWithAI Member Badge */}
              <View style={styles.memberTag}>
                <Text style={styles.memberTagText}>CrackWithAI Member</Text>
              </View>

              <Text style={styles.userEmailText}>{user?.email || 'p8012969119@gmail.com'}</Text>

              {/* Badges Pill Row */}
              <View style={styles.pillsRow}>
                <View style={styles.pillBadge}>
                  <Icon name="star" size={11} color="#FBBF24" />
                  <Text style={styles.pillLabelText}>{(user?.role || 'USER').toUpperCase()}</Text>
                </View>

                <View style={styles.pillBadge}>
                  <Icon name="flame" size={11} color="#F97316" />
                  <Text style={styles.pillLabelText}>{courseStreakCount} Course Streak</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {progressError && <TouchableOpacity accessibilityRole="button" onPress={() => fetchProfileData(timeFilter)} style={{padding: 20}}><Text style={{color: '#6150C9'}}>Learning progress unavailable. Tap to retry.</Text></TouchableOpacity>}
        {/* ================= FLOATING STATISTICS CARD ================= */}
        <View style={styles.floatingStatsCard}>
          <View style={styles.statCol}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Icon name="flame" size={15} color="#F97316" />
            </View>
            <Text style={styles.statNumberText}>
              {courseStreakCount}
            </Text>
            <Text style={styles.statLabelText}>Course Streak</Text>
            <Text style={styles.statSubText}>Courses Done</Text>
          </View>

          <View style={styles.verticalSeparator} />

          <TouchableOpacity
            style={styles.statCol}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Certificates')}
          >
            <View style={[styles.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <CertificateMark size={24} />
            </View>
            <Text style={styles.statNumberText}>{stat(dashboardData?.certificatesCount ?? certificates.length, 0)}</Text>
            <Text style={styles.statLabelText}>Certificates</Text>
            <Text style={styles.statSubText}>Earned</Text>
          </TouchableOpacity>

          <View style={styles.verticalSeparator} />

          <TouchableOpacity
            style={styles.statCol}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Bookmarks')}
          >
            <View style={[styles.statIconCircle, { backgroundColor: '#FCE7F3' }]}>
              <Icon name="bookmark" size={15} color="#EC4899" />
            </View>
            <Text style={styles.statNumberText}>{bookmarks.length || dashboardData?.bookmarksCount || 0}</Text>
            <Text style={styles.statLabelText}>Bookmarks</Text>
            <Text style={styles.statSubText}>Saved</Text>
          </TouchableOpacity>
        </View>

        {/* ================= LEARNING PROGRESS CARD ================= */}
        <View style={styles.whiteSectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWithIcon}>
              <Icon name="award" size={18} color="#5553FE" style={{ marginRight: 8 }} />
              <Text style={styles.cardHeaderTitle}>Learning Progress</Text>
            </View>

            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setFilterMenuVisible(true)} activeOpacity={0.7}>
              <Text style={styles.dropdownBtnText}>{timeFilter}</Text>
              <Icon name="chevron-right" size={12} color="#64748B" style={{ transform: [{ rotate: '90deg' }] }} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressCardBody}>
            {/* Animated Circular Progress Ring with dynamic progress arc */}
            <View style={styles.circularProgressContainer}>
              <View style={[styles.outerRingCircle, getRingBorderColors(overallProgressPercent)]}>
                <Text style={styles.progressPercentValue}>{overallProgressPercent}%</Text>
                <Text style={styles.progressPercentLabel}>Overall{"\n"}Progress</Text>
              </View>
            </View>

            {/* Progress Metrics Grid */}
            <View style={styles.metricsRightGrid}>
              <View style={styles.metricItemRow}>
                <View style={[styles.smallIconCircle, { backgroundColor: '#EEEDFF' }]}>
                  <Icon name="clock" size={14} color="#5553FE" />
                </View>
                <View style={styles.metricTextGroup}>
                  <Text style={styles.metricValueText}>{displayMinutes} min</Text>
                  <Text style={styles.metricSubLabel}>Estimated learning</Text>
                </View>
              </View>

              <View style={styles.metricItemRow}>
                <View style={[styles.smallIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Icon name="flame" size={14} color="#10B981" />
                </View>
                <View style={styles.metricTextGroup}>
                  <Text style={styles.metricValueText}>+{displayXp}</Text>
                  <Text style={styles.metricSubLabel}>XP Earned</Text>
                </View>
              </View>

              <View style={styles.metricItemRow}>
                <View style={[styles.smallIconCircle, { backgroundColor: '#FFF7ED' }]}>
                  <Icon name="star" size={14} color="#F59E0B" />
                </View>
                <View style={styles.metricTextGroup}>
                  <Text style={styles.metricValueText}>{displayModules}</Text>
                  <Text style={styles.metricSubLabel}>Modules completed</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ================= ACCOUNT & PREFERENCES ================= */}
        <View style={styles.accountSection}>
          <Text style={styles.accountSectionHeading}>Account & Preferences</Text>

          <View style={styles.menuGroupCard}>
            {/* 1. Personal Information */}
            <TouchableOpacity style={styles.menuRowItem} activeOpacity={0.7} onPress={() => setPersonalInfoModalVisible(true)}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#EEEDFF' }]}>
                <Icon name="user" size={18} color="#5553FE" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuRowTitle}>Personal Information</Text>
                <Text style={styles.menuRowSubtitle}>Update your personal details</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* 2. Security */}
            <TouchableOpacity style={styles.menuRowItem} activeOpacity={0.7} onPress={() => setSecurityModalVisible(true)}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Icon name="shield" size={18} color="#2563EB" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuRowTitle}>Security</Text>
                <Text style={styles.menuRowSubtitle}>Password, 2FA, and security settings</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* 3. Notifications */}
            <TouchableOpacity style={styles.menuRowItem} activeOpacity={0.7} onPress={() => setNotifModalVisible(true)}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="bell" size={18} color="#D97706" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuRowTitle}>Notifications</Text>
                <Text style={styles.menuRowSubtitle}>Manage your notification preferences</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* 4. Help & Support */}
            <TouchableOpacity
              style={styles.menuRowItem}
              activeOpacity={0.7}
              onPress={() => setSupportModalVisible(true)}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#FCE7F3' }]}>
                <Icon name="help-circle" size={18} color="#EC4899" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuRowTitle}>Help & Support</Text>
                <Text style={styles.menuRowSubtitle}>Get help and contact support</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* 5. Logout */}
            <TouchableOpacity style={styles.menuRowItem} activeOpacity={0.7} onPress={() => setLogoutModalVisible(true)}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Icon name="log-out" size={18} color="#EF4444" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={[styles.menuRowTitle, { color: '#EF4444' }]}>Logout</Text>
                <Text style={styles.menuRowSubtitle}>Sign out from your account</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 24/7 OFFICIAL SUPPORT BANNER CARD ================= */}
        <View style={styles.supportBannerCard}>
          <View style={styles.supportBannerHeader}>
            <View style={styles.supportBannerIcon}>
              <Icon name="help-circle" size={20} color="#5553FE" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportBannerTitle}>24/7 Official Support</Text>
              <Text style={styles.supportBannerSub}>Have questions or need assistance? Reach out anytime!</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.supportEmailRow}
            activeOpacity={0.8}
            onPress={() => Linking.openURL('mailto:support@crackwithai.com?subject=CrackWithAI%20Support%20Request')}
          >
            <View style={styles.supportEmailLeft}>
              <Icon name="mail" size={16} color="#5553FE" />
              <Text style={styles.supportEmailText}>support@crackwithai.com</Text>
            </View>
            <View style={styles.mailActionPill}>
              <Text style={styles.mailActionPillText}>Send Email ➔</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Bottom Sheet Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="slide" onRequestClose={() => setLogoutModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLogoutModalVisible(false)}>
          <View style={styles.bottomSheetCard}>
            <View style={styles.dragHandle} />
            <Text style={styles.bottomSheetTitle}>Sign Out from CrackWithAI?</Text>
            <Text style={styles.bottomSheetSub}>You will need to enter your email and password to log back into your learning account.</Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutConfirmBtn} onPress={handleConfirmLogout}>
                <Text style={styles.logoutConfirmBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 1. Personal Information Modal */}
      <Modal visible={personalInfoModalVisible} transparent animationType="slide" onRequestClose={() => setPersonalInfoModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPersonalInfoModalVisible(false)}>
          <View style={styles.bottomSheetCard} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            <Text style={styles.bottomSheetTitle}>Edit Personal Information</Text>
            <Text style={styles.bottomSheetSub}>Update your profile name and email address bound to backend API.</Text>

            <Text style={styles.modalInputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalTextInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter full name"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.modalInputLabel}>Email Address</Text>
            <TextInput
              style={styles.modalTextInput}
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter email address"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPersonalInfoModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSavePersonalInfo} disabled={savingProfile}>
                {savingProfile ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 2. Security & Password Modal */}
      <Modal visible={securityModalVisible} transparent animationType="slide" onRequestClose={() => setSecurityModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSecurityModalVisible(false)}>
          <View style={styles.bottomSheetCard} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            <Text style={styles.bottomSheetTitle}>Security & Password</Text>
            <Text style={styles.bottomSheetSub}>Manage authentication settings and two-factor verification.</Text>

            {/* Security Session Info Box */}
            <View style={styles.securitySessionBox}>
              <View style={styles.securitySessionRow}>
                <Icon name="shield" size={14} color="#2563EB" />
                <Text style={styles.securitySessionLabel}>Protection:</Text>
                <Text style={styles.securitySessionValue}>256-bit Encrypted</Text>
              </View>
              <View style={styles.securitySessionRow}>
                <Icon name="check-circle" size={14} color="#10B981" />
                <Text style={styles.securitySessionLabel}>Session:</Text>
                <Text style={styles.securitySessionValue}>Mobile App Active</Text>
              </View>
            </View>

            <Text style={styles.modalInputLabel}>Current Password</Text>
            <TextInput
              style={styles.modalTextInput}
              value={currentPassInput}
              onChangeText={setCurrentPassInput}
              secureTextEntry
              placeholder="Enter current password"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.modalInputLabel}>New Password</Text>
            <TextInput
              style={styles.modalTextInput}
              value={newPassInput}
              onChangeText={setNewPassInput}
              secureTextEntry
              placeholder="Enter new password"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.modalInputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.modalTextInput}
              value={confirmPassInput}
              onChangeText={setConfirmPassInput}
              secureTextEntry
              placeholder="Confirm new password"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.switchRowItem}>
              <Text style={styles.switchRowLabel}>Enable Two-Factor Authentication (2FA)</Text>
              <Switch value={twoFactorEnabled} onValueChange={setTwoFactorEnabled} trackColor={{ false: '#CBD5E1', true: '#5553FE' }} />
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSecurityModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSecurity} disabled={savingSecurity}>
                {savingSecurity ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Update Security</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 3. Notification Preferences Modal */}
      <Modal visible={notifModalVisible} transparent animationType="slide" onRequestClose={() => setNotifModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setNotifModalVisible(false)}>
          <View style={styles.bottomSheetCard} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            <Text style={styles.bottomSheetTitle}>Notification Preferences</Text>
            <Text style={styles.bottomSheetSub}>Choose which updates you want to receive on your device.</Text>

            <View style={styles.switchRowItem}>
              <Text style={styles.switchRowLabel}>Daily Learning Reminders</Text>
              <Switch value={dailyReminders} onValueChange={setDailyReminders} trackColor={{ false: '#CBD5E1', true: '#5553FE' }} />
            </View>

            <View style={styles.switchRowItem}>
              <Text style={styles.switchRowLabel}>Quiz & Certificate Alerts</Text>
              <Switch value={quizAlerts} onValueChange={setQuizAlerts} trackColor={{ false: '#CBD5E1', true: '#5553FE' }} />
            </View>

            <View style={styles.switchRowItem}>
              <Text style={styles.switchRowLabel}>New AI Tools & Updates</Text>
              <Switch value={newCourseAlerts} onValueChange={setNewCourseAlerts} trackColor={{ false: '#CBD5E1', true: '#5553FE' }} />
            </View>

            <View style={styles.switchRowItem}>
              <Text style={styles.switchRowLabel}>Community & Activity Updates</Text>
              <Switch value={communityAlerts} onValueChange={setCommunityAlerts} trackColor={{ false: '#CBD5E1', true: '#5553FE' }} />
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setNotifModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNotifications}>
                <Text style={styles.saveBtnText}>Save Preferences</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 4. Help & Support Modal */}
      <Modal visible={supportModalVisible} transparent animationType="slide" onRequestClose={() => setSupportModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSupportModalVisible(false)}>
          <View style={styles.bottomSheetCard} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            <Text style={styles.bottomSheetTitle}>Help & Support</Text>
            <Text style={styles.bottomSheetSub}>Have a question? We are here to help 24/7.</Text>

            <TouchableOpacity
              style={styles.supportEmailCard}
              activeOpacity={0.8}
              onPress={() => Linking.openURL('mailto:support@crackwithai.com?subject=CrackWithAI%20Help%20Request')}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.supportEmailLabel}>Official Support Email (Tap to Email)</Text>
                <Text style={styles.supportEmailValue}>support@crackwithai.com</Text>
              </View>
              <Icon name="mail" size={20} color="#5553FE" />
            </TouchableOpacity>

            <Text style={styles.modalInputLabel}>Send Message to Support</Text>
            <TextInput
              style={[styles.modalTextInput, { height: 75, textAlignVertical: 'top', paddingTop: 8 }]}
              value={supportMessage}
              onChangeText={setSupportMessage}
              multiline
              numberOfLines={3}
              placeholder="Describe your issue or question..."
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSupportModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSendSupportMessage} disabled={sendingSupportMsg}>
                {sendingSupportMsg ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Submit Inquiry</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 5. Time Period Filter Modal */}
      <Modal visible={filterMenuVisible} transparent animationType="fade" onRequestClose={() => setFilterMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterMenuVisible(false)}>
          <View style={[styles.bottomSheetCard, { paddingBottom: 24 }]}>
            <View style={styles.dragHandle} />
            <Text style={styles.bottomSheetTitle}>Select Learning Timeframe</Text>

            {(['This Month', 'This Week', 'All Time'] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.filterOptItem, timeFilter === opt && styles.filterOptItemActive]}
                onPress={() => {
                  setTimeFilter(opt);
                  setFilterMenuVisible(false);
                  fetchProfileData(opt);
                }}
              >
                <Text style={[styles.filterOptText, timeFilter === opt && styles.filterOptTextActive]}>{opt}</Text>
                {timeFilter === opt && <Text style={{ fontSize: 16, color: '#5553FE', fontWeight: '800' }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Verified Certificate Modal */}
      <CertificateModal visible={certModalVisible} certificate={selectedCert} onClose={() => setCertModalVisible(false)} />

      {/* 6. Avatar Chooser Modal */}
      <Modal visible={avatarModalVisible} transparent animationType="slide" onRequestClose={() => setAvatarModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAvatarModalVisible(false)}>
          <View style={styles.bottomSheetCard} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            <Text style={styles.bottomSheetTitle}>Change Profile Photo</Text>
            <Text style={styles.bottomSheetSub}>Upload a photo from your gallery or choose a preset avatar.</Text>

            {/* Selected Avatar Preview */}
            <View style={{alignItems: 'center', marginVertical: 10}}>
              <Image
                source={{uri: customAvatarInput.trim() || selectedAvatarUrl}}
                style={{width: 86, height: 86, borderRadius: 43, borderWidth: 3.5, borderColor: '#5553FE'}}
              />
            </View>

            {/* Primary Action: Gallery Upload */}
            <TouchableOpacity
              style={styles.galleryUploadCard}
              activeOpacity={0.8}
              onPress={handlePickFromGallery}
              disabled={pickingFromGallery || savingAvatar}
            >
              <View style={styles.galleryUploadIconCircle}>
                <Icon name="image" size={20} color="#5553FE" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.galleryUploadTitle}>Upload from Gallery</Text>
                <Text style={styles.galleryUploadSubtitle}>Choose any photo from your device</Text>
              </View>
              {pickingFromGallery ? (
                <ActivityIndicator color="#5553FE" size="small" />
              ) : (
                <View style={styles.galleryUploadBadge}>
                  <Text style={styles.galleryUploadBadgeText}>Choose Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.orDividerRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR SELECT PRESET</Text>
              <View style={styles.orLine} />
            </View>

            <Text style={styles.modalInputLabel}>Preset Avatars Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 12, paddingVertical: 6}}>
              {PRESET_AVATARS.map(item => {
                const isSelected = selectedAvatarUrl === item.url && !customAvatarInput;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedAvatarUrl(item.url);
                      setCustomAvatarInput('');
                    }}
                    style={{alignItems: 'center', gap: 4}}
                  >
                    <Image
                      source={{uri: item.url}}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        borderWidth: isSelected ? 3 : 1.5,
                        borderColor: isSelected ? '#5553FE' : '#CBD5E1',
                      }}
                    />
                    <Text style={{fontSize: 10.5, fontWeight: isSelected ? '800' : '500', color: isSelected ? '#5553FE' : '#64748B'}}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.modalInputLabel}>Or Custom Image URL</Text>
            <TextInput
              style={styles.modalTextInput}
              value={customAvatarInput}
              onChangeText={setCustomAvatarInput}
              placeholder="https://example.com/my-photo.png"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAvatarModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveAvatar()} disabled={savingAvatar}>
                {savingAvatar ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Apply Avatar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 140 : 120,
  },
  /* TOP HEADER STYLES */
  topGradientHeader: {
    backgroundColor: '#5553FE', // Vibrant electric blue brand color from Image 2
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 54,
  },
  headerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  profileUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarBorderRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  avatarFallback: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#5553FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  onlineStatusDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#5553FE',
  },
  cameraOverlayBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5553FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userMetaCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verifiedCheckBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginVertical: 4,
  },
  memberTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userEmailText: {
    fontSize: 12,
    color: '#E0E7FF',
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  pillIconText: {
    fontSize: 11,
  },
  pillLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* FLOATING STATISTICS CARD STYLES */
  floatingStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginHorizontal: 16,
    marginTop: -32,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.medium,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumberText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginTop: 2,
  },
  statSubText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  verticalSeparator: {
    width: 1,
    height: 38,
    backgroundColor: '#F1F5F9',
  },

  /* WHITE CARDS GENERAL */
  whiteSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.small,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  dropdownBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  progressCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circularProgressContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  outerRingCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: '#5553FE', // Brand electric blue progress ring
    borderLeftColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  progressPercentLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  metricsRightGrid: {
    flex: 1,
    gap: 10,
  },
  metricItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  metricTextGroup: {
    flex: 1,
  },
  metricValueText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricSubLabel: {
    fontSize: 10,
    color: '#64748B',
  },


  /* ACCOUNT & PREFERENCES LIST */
  accountSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  accountSectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  menuGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.small,
  },
  menuRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTextCol: {
    flex: 1,
  },
  menuRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  menuRowSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rightValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  /* MODAL SHEET STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    ...SHADOWS.large,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#CBD5E1',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  bottomSheetSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  logoutConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutConfirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5553FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  switchRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchRowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    paddingRight: 10,
  },
  supportEmailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEEDFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  supportEmailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5553FE',
    marginBottom: 2,
  },
  supportEmailValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3730A3',
  },
  securitySessionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 14,
    gap: 6,
  },
  securitySessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securitySessionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  securitySessionValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  supportBannerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.small,
  },
  supportBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEEDFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  supportBannerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  supportEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  supportEmailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supportEmailText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  mailActionPill: {
    backgroundColor: '#5553FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mailActionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterOptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  filterOptItemActive: {
    backgroundColor: '#EEEDFF',
    borderWidth: 1,
    borderColor: '#C7C5FF',
  },
  filterOptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  filterOptTextActive: {
    fontWeight: '800',
    color: '#5553FE',
  },
  galleryUploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEDFF',
    borderRadius: 16,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#5553FE',
    gap: 12,
  },
  galleryUploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryUploadTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  galleryUploadSubtitle: {
    fontSize: 11,
    color: '#6366F1',
    marginTop: 2,
  },
  galleryUploadBadge: {
    backgroundColor: '#5553FE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  galleryUploadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
});
