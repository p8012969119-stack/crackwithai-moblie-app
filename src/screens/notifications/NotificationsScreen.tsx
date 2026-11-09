import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../constants/theme';
import { Header } from '../../components/Header';
import { apiClient } from '../../api/client';
import { useAuth } from '../../store/AuthContext';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'welcome' | 'streak' | 'milestone' | 'certificate' | 'ai';
  targetScreen?: string;
}

export const NotificationsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const courseStreak = 2; // Strict course streak (HTML + Certificate completed)

  const buildDefaultNotifications = useCallback((): NotificationItem[] => {
    return [
      {
        id: 'notif-streak',
        title: `Course Streak Active: ${courseStreak} Courses 🔥`,
        message: `Great dedication! You have a streak of ${courseStreak} completed courses. Keep finishing modules to earn more certificates and XP!`,
        time: 'Just now',
        unread: true,
        type: 'streak',
        targetScreen: 'Profile',
      },
      {
        id: 'notif-milestone',
        title: 'Learning Track In Progress 🚀',
        message: 'Your progress in Full Stack Development & AI Skills is advancing. Dive into today’s practice tasks!',
        time: '1 hour ago',
        unread: true,
        type: 'milestone',
        targetScreen: 'FullStackOverview',
      },
      {
        id: 'notif-ai',
        title: 'AI Workshop Assistant Ready 🤖',
        message: 'Need help with code syntax, debugging, or concept explanation? Chat with your AI study buddy anytime.',
        time: '4 hours ago',
        unread: false,
        type: 'ai',
        targetScreen: 'AITab',
      },
      {
        id: 'notif-certificate',
        title: 'Certification Progress 🏆',
        message: 'Complete all module checkpoints and quizzes to claim your official verified course certificate.',
        time: '1 day ago',
        unread: false,
        type: 'certificate',
        targetScreen: 'Certificates',
      },
      {
        id: 'notif-welcome',
        title: 'Welcome to CrackWithAI 🎉',
        message: 'Explore courses, hands-on code playgrounds, interactive quizzes, and career-ready AI tools.',
        time: '3 days ago',
        unread: false,
        type: 'welcome',
        targetScreen: 'HomeTab',
      },
    ];
  }, [courseStreak]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiClient.get('/notification/my');
      const items = res?.data?.data || res?.data;
      if (Array.isArray(items) && items.length > 0) {
        const mapped: NotificationItem[] = items.map((n: any) => ({
          id: String(n._id || n.id),
          title: n.title || 'Notification',
          message: n.message || '',
          time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent',
          unread: !n.isRead,
          type: n.type || 'welcome',
          targetScreen: n.targetScreen || 'HomeTab',
        }));
        setNotifications(mapped);
      } else {
        setNotifications(buildDefaultNotifications());
      }
    } catch {
      setNotifications(buildDefaultNotifications());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildDefaultNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
    try {
      await apiClient.patch('/notification/my/read-all');
    } catch {}
  };

  const handlePressItem = async (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    try {
      if (item.id && !item.id.startsWith('notif-')) {
        await apiClient.patch(`/notification/my/${item.id}/read`);
      }
    } catch {}

    if (item.targetScreen) {
      if (item.targetScreen === 'HomeTab' || item.targetScreen === 'AITab' || item.targetScreen === 'FullStackTab') {
        navigation.navigate('MainTabs', { screen: item.targetScreen });
      } else {
        navigation.navigate(item.targetScreen);
      }
    }
  };

  const displayedList =
    activeTab === 'unread'
      ? notifications.filter((n) => n.unread)
      : notifications;

  const getTypeColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'welcome':
      case 'ai':
        return '#6D28D9';
      case 'streak':
        return '#D97706';
      case 'milestone':
        return '#0284C7';
      case 'certificate':
        return '#059669';
      default:
        return '#6D28D9';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title="Notifications"
        showBack
        onBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('MainTabs');
          }
        }}
        rightElement={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markReadBtn}>
              <Text style={styles.markReadText}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'all' && styles.tabBtnTextActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'unread' && styles.tabBtnActive]}
          onPress={() => setActiveTab('unread')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'unread' && styles.tabBtnTextActive]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={displayedList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6D28D9" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={{ fontSize: 32 }}>🔔</Text>
            </View>
            <Text style={styles.emptyTitle}>No unread notifications</Text>
            <Text style={styles.emptySubtitle}>You’re completely caught up with all updates!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const typeColor = getTypeColor(item.type);
          return (
            <TouchableOpacity
              style={[styles.notifCard, item.unread && styles.notifCardUnread]}
              activeOpacity={0.8}
              onPress={() => handlePressItem(item)}
            >
              <View style={[styles.badgeIndicator, { backgroundColor: typeColor }]} />
              <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <Text style={[styles.itemTitle, item.unread && styles.itemTitleUnread]}>
                    {item.title}
                  </Text>
                  {item.unread && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.itemMessage}>{item.message}</Text>
                <Text style={styles.itemTime}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  markReadBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markReadText: {
    fontSize: 13,
    color: '#6D28D9',
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: '#6D28D9',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'flex-start',
    gap: 12,
  },
  notifCardUnread: {
    borderColor: '#E0E7FF',
    backgroundColor: '#FAF5FF',
  },
  badgeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  itemTitleUnread: {
    fontWeight: '700',
    color: '#0F172A',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6D28D9',
    marginLeft: 6,
  },
  itemMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 8,
  },
  itemTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});
