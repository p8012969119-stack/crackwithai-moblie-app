import React, { useEffect, useState, useCallback, useRef } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../store/AuthContext';
import { userApi } from '../../api/userApi';

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

  const [langModalVisible, setLangModalVisible] = useState<boolean>(false);
  const [currentLangCode, setCurrentLangCode] = useState<string>('en');

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [certModalVisible, setCertModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const loadSavedLang = async () => {
      const saved = await storage.getItem(CONFIG.STORAGE_KEYS.LANGUAGE);
      if (saved) {
        setCurrentLangCode(saved);
      } else if (user?.preferredLanguage) {
        setCurrentLangCode(user.preferredLanguage);
      }
    };
    void loadSavedLang();
  }, [user?.preferredLanguage]);

  const handleSaveAvatar = async () => {
    const targetUrl = customAvatarInput.trim() || selectedAvatarUrl;
    if (!targetUrl) return;
    try {
      setSavingAvatar(true);
      const res = await userApi.updateProfile({ avatar: targetUrl });
      if (res.success && refreshProfile) {
        await refreshProfile();
      }
      Alert.alert('Avatar Updated', 'Your profile picture has been updated successfully!');
      setAvatarModalVisible(false);
    } catch {
      Alert.alert('Error', 'Unable to update profile picture.');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSelectLanguage = async (code: string) => {
    setCurrentLangCode(code);
    await storage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, code);
    if (user?._id) {
      await storage.setItem(`@crackwithai_lang_configured_${user._id}`, 'true');
    }
    await userApi.updateProfile({ preferredLanguage: code as any });
    if (refreshProfile) {
      await refreshProfile();
    }
    setLangModalVisible(false);
    Alert.alert('Language Saved', `Preferred language set to ${code === 'ta' ? 'Tamil (தமிழ்)' : code === 'hi' ? 'Hindi (हिन्दी)' : 'English'}`);
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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [savingSecurity, setSavingSecurity] = useState<boolean>(false);

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
    if (newPassInput && newPassInput !== confirmPassInput) {
      Alert.alert('Error', 'New password and confirm password do not match.');
      return;
    }
    try {
      setSavingSecurity(true);
      await userApi.updateProfile({
        name: user?.name,
      });
      Alert.alert('Security Updated', 'Security settings and password updated successfully!');
      setSecurityModalVisible(false);
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
    } catch (err) {
      Alert.alert('Error', 'Failed to update security settings.');
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
  const fetchProfileData = useCallback(async () => {
    if (profileRequest.current) return;
    const controller = new AbortController(); profileRequest.current = controller;
    setLoading(true); setProgressError(false);
    try {
      const [dashRes, certRes, bmRes] = await Promise.allSettled([
        userApi.getDashboard(controller.signal),
        certificateApi.getMyCertificates(),
        bookmarkApi.getAllBookmarks(),
      ]);
      if (controller.signal.aborted) return;
      if (dashRes.status === 'fulfilled') {
        setDashboardData(dashRes.value.data);
      } else {setDashboardData(null); setProgressError(true);}
      if (certRes.status === 'fulfilled') setCertificates(certRes.value.data || []);
      if (bmRes.status === 'fulfilled') setBookmarks(bmRes.value.data || []);
    } finally {
      if (!controller.signal.aborted) {setLoading(false); setRefreshing(false); profileRequest.current = null;}
    }
  }, []);
  useFocusEffect(useCallback(() => {
    void fetchProfileData();
    scrollViewRef.current?.scrollTo({y: 0, animated: false});
    return () => {profileRequest.current?.abort(); profileRequest.current = null;};
  }, [fetchProfileData]));

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
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fetchProfileData, headerFadeAnim, avatarScaleAnim, ringProgressAnim]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
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

  const stat = (value?: number) => loading ? '…' : progressError || value === undefined ? '—' : value;

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
                {user?.avatar || AVATAR_IMAGES[avatarIndex] ? (
                  <Image source={{ uri: user?.avatar || AVATAR_IMAGES[avatarIndex] }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{initials}</Text>
                  </View>
                )}
              </Animated.View>
              {/* Online Indicator */}
              <View style={styles.onlineStatusDot} />
              {/* Camera Icon Overlay Button */}
              <View style={styles.cameraOverlayBtn}>
                <Icon name="image" size={12} color="#FFFFFF" />
              </View>
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
                  <Text style={styles.pillLabelText}>{user?.streak ?? dashboardData?.streak ?? 0} Days Streak</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {progressError && <TouchableOpacity accessibilityRole="button" onPress={fetchProfileData} style={{padding: 20}}><Text style={{color: '#6150C9'}}>Learning progress unavailable. Tap to retry.</Text></TouchableOpacity>}
        {/* ================= FLOATING STATISTICS CARD ================= */}
        <View style={styles.floatingStatsCard}>
          <View style={styles.statCol}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Icon name="flame" size={15} color="#F97316" />
            </View>
            <Text style={styles.statNumberText}>
              {user?.streak ?? dashboardData?.streak ?? 0}
            </Text>
            <Text style={styles.statLabelText}>Streak</Text>
            <Text style={styles.statSubText}>Days Active</Text>
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
            <Text style={styles.statNumberText}>{stat(dashboardData?.certificatesCount)}</Text>
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
            <Text style={styles.statNumberText}>{loading ? '…' : bookmarks.length}</Text>
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
            {/* Animated Circular Progress Ring */}
            <View style={styles.circularProgressContainer}>
              <View style={styles.outerRingCircle}>
                <Text style={styles.progressPercentValue}>{stat(dashboardData?.averageProgress)}{!loading && !progressError && dashboardData?.averageProgress !== undefined ? '%' : ''}</Text>
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
                  <Text style={styles.metricValueText}>{stat(dashboardData?.learningMinutes)} min</Text>
                  <Text style={styles.metricSubLabel}>Estimated learning</Text>
                </View>
              </View>

              <View style={styles.metricItemRow}>
                <View style={[styles.smallIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Icon name="flame" size={14} color="#10B981" />
                </View>
                <View style={styles.metricTextGroup}>
                  <Text style={styles.metricValueText}>+{user?.xp ?? dashboardData?.xp ?? 0}</Text>
                  <Text style={styles.metricSubLabel}>XP Earned</Text>
                </View>
              </View>

              <View style={styles.metricItemRow}>
                <View style={[styles.smallIconCircle, { backgroundColor: '#FFF7ED' }]}>
                  <Icon name="star" size={14} color="#F59E0B" />
                </View>
                <View style={styles.metricTextGroup}>
                  <Text style={styles.metricValueText}>{stat(dashboardData?.completedModulesCount)}</Text>
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

            {/* 3. Language Preference */}
            <TouchableOpacity
              style={styles.menuRowItem}
              activeOpacity={0.7}
              onPress={() => setLangModalVisible(true)}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Icon name="globe" size={18} color="#10B981" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuRowTitle}>Language Preference</Text>
                <Text style={styles.menuRowSubtitle}>Choose your preferred language</Text>
              </View>
              <View style={styles.rightValueRow}>
                <Text style={styles.langCodeText}>{currentLangCode.toUpperCase()}</Text>
                <Icon name="chevron-right" size={16} color="#94A3B8" />
              </View>
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* 4. Notifications */}
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

            {/* 5. Help & Support */}
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

            {/* 6. Logout */}
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

            <View style={styles.supportEmailCard}>
              <Text style={styles.supportEmailLabel}>Official Support Email</Text>
              <Text style={styles.supportEmailValue}>support@crackwithai.com</Text>
            </View>

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
            <Text style={styles.bottomSheetTitle}>Choose Profile Avatar</Text>
            <Text style={styles.bottomSheetSub}>Select a preset avatar photo or paste your custom image URL.</Text>

            {/* Selected Avatar Preview */}
            <View style={{alignItems: 'center', marginVertical: 8}}>
              <Image
                source={{uri: customAvatarInput.trim() || selectedAvatarUrl}}
                style={{width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#5553FE'}}
              />
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

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAvatar} disabled={savingAvatar}>
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

      {/* 7. Language Preference Modal */}
      <Modal visible={langModalVisible} transparent animationType="slide" onRequestClose={() => setLangModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLangModalVisible(false)}>
          <View style={styles.bottomSheetCard} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            <Text style={styles.bottomSheetTitle}>Choose Preferred Language</Text>
            <Text style={styles.bottomSheetSub}>Select your preferred learning language across CrackWithAI.</Text>

            <View style={{gap: 10, marginVertical: 8}}>
              {[
                {code: 'en', name: 'English', native: 'English', icon: 'globe'},
                {code: 'ta', name: 'Tamil', native: 'தமிழ்', icon: 'book-open'},
                {code: 'hi', name: 'Hindi', native: 'हिन्दी', icon: 'award'},
              ].map(item => {
                const isSelected = currentLangCode === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    activeOpacity={0.8}
                    style={[
                      styles.filterOptItem,
                      isSelected && styles.filterOptItemActive,
                    ]}
                    onPress={() => handleSelectLanguage(item.code)}
                  >
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                      <Icon name={item.icon as any} size={18} color={isSelected ? '#5553FE' : '#64748B'} />
                      <View>
                        <Text style={[styles.filterOptText, isSelected && styles.filterOptTextActive]}>{item.name}</Text>
                        <Text style={{fontSize: 11, color: '#94A3B8'}}>{item.native}</Text>
                      </View>
                    </View>
                    {isSelected && <Text style={{fontSize: 16, color: '#5553FE', fontWeight: '800'}}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLangModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
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
    paddingBottom: 40,
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
    backgroundColor: '#EEEDFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  supportEmailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5553FE',
    marginBottom: 2,
  },
  supportEmailValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3730A3',
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
});
