import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Icon } from './Icon';

interface QuickMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screenName: string) => void;
}

export const QuickMenuModal: React.FC<QuickMenuModalProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  const handleItemPress = (screenName: string) => {
    onClose();
    setTimeout(() => {
      onNavigate(screenName);
    }, 150);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              {/* Header */}
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Quick Menu</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Menu Items */}
              <View style={styles.menuItemsList}>
                {/* 1. Profile */}
                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.75}
                  onPress={() => handleItemPress('Profile')}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                    <Icon name="user" size={18} color="#4F46E5" />
                  </View>
                  <View style={styles.itemTextCol}>
                    <Text style={styles.itemTitle}>Profile</Text>
                    <Text style={styles.itemSubtitle}>View & edit account settings</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                {/* 2. Settings & Language */}
                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.75}
                  onPress={() => handleItemPress('LanguageSelection')}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <Icon name="settings" size={18} color="#D97706" />
                  </View>
                  <View style={styles.itemTextCol}>
                    <Text style={styles.itemTitle}>Settings & Language</Text>
                    <Text style={styles.itemSubtitle}>App preferences & language</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                {/* 3. Certificates */}
                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.75}
                  onPress={() => handleItemPress('Certificates')}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <Icon name="award" size={18} color="#059669" />
                  </View>
                  <View style={styles.itemTextCol}>
                    <Text style={styles.itemTitle}>Certificates</Text>
                    <Text style={styles.itemSubtitle}>View earned accomplishments</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                {/* 4. Notifications & Bookmarks */}
                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.75}
                  onPress={() => handleItemPress('Bookmarks')}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                    <Icon name="bell" size={18} color="#9333EA" />
                  </View>
                  <View style={styles.itemTextCol}>
                    <Text style={styles.itemTitle}>Notifications</Text>
                    <Text style={styles.itemSubtitle}>Saved items & updates</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingRight: 16,
  },
  menuContainer: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : undefined,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  menuItemsList: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : undefined,
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : undefined,
  },
  chevron: {
    fontSize: 18,
    color: '#CBD5E1',
    fontWeight: '600',
  },
});
