import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../constants/theme';
import { Header } from '../../components/Header';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'welcome' | 'streak' | 'milestone' | 'certificate' | 'ai';
  targetScreen?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Welcome to CrackWithAI! 🎉',
    message: 'Your Full Stack Development journey is active. Start exploring modern lessons and interactive AI tools.',
    time: 'Just now',
    unread: true,
    type: 'welcome',
    targetScreen: 'MainTabs',
  },
  {
    id: '2',
    title: 'Daily Streak In Progress 🔥',
    message: 'Consistency is the key to mastery! Complete today’s lesson to keep your streak alive and earn XP.',
    time: '2 hours ago',
    unread: true,
    type: 'streak',
    targetScreen: 'MainTabs',
  },
  {
    id: '3',
    title: 'Course Milestone: 3% Complete 🚀',
    message: 'You made progress in Full Stack Development with AI. Continue your next topic now.',
    time: '5 hours ago',
    unread: false,
    type: 'milestone',
    targetScreen: 'FullStackOverview',
  },
  {
    id: '4',
    title: 'Official Certificates Available 🏆',
    message: 'Finish all course modules and pass the final certification project to claim your verified certificate.',
    time: '1 day ago',
    unread: false,
    type: 'certificate',
    targetScreen: 'Certificates',
  },
  {
    id: '5',
    title: '24/7 AI Study Assistant Ready 🤖',
    message: 'Stuck on coding syntax or concept explanation? Ask your AI Study Buddy in the AI Workspace.',
    time: '2 days ago',
    unread: false,
    type: 'ai',
    targetScreen: 'MainTabs',
  },
];

export const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const handlePressItem = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    if (item.targetScreen) {
      navigation.navigate(item.targetScreen);
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
