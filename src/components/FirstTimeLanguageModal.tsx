import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Icon } from './Icon';
import { storage } from '../services/storage';
import { CONFIG } from '../constants/config';
import { userApi } from '../api/userApi';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  icon: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', icon: 'globe' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', icon: 'book-open' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', icon: 'award' },
];

interface Props {
  visible: boolean;
  userId?: string;
  onComplete: (selectedLang: string) => void;
}

export const FirstTimeLanguageModal: React.FC<Props> = ({
  visible,
  userId,
  onComplete,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>('en');

  const handleSaveAndContinue = async () => {
    await storage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, selectedLang);
    if (userId) {
      await storage.setItem(`@crackwithai_lang_configured_${userId}`, 'true');
      await userApi.updateProfile({ preferredLanguage: selectedLang as any });
    }
    onComplete(selectedLang);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>🌐</Text>
            </View>
            <Text style={styles.title}>Select Your Language</Text>
            <Text style={styles.subtitle}>
              Choose your preferred learning language for CrackWithAI. You can change this anytime later in Settings.
            </Text>
          </View>

          {/* Options */}
          <View style={styles.languageList}>
            {LANGUAGES.map(lang => {
              const isSelected = selectedLang === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  activeOpacity={0.8}
                  style={[styles.langItem, isSelected && styles.langItemSelected]}
                  onPress={() => setSelectedLang(lang.code)}
                >
                  <View style={styles.langLeft}>
                    <View
                      style={[
                        styles.iconCircle,
                        isSelected && styles.iconCircleSelected,
                      ]}
                    >
                      <Icon
                        name={lang.icon as any}
                        size={20}
                        color={isSelected ? '#FFFFFF' : '#5553FE'}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.langName,
                          isSelected && styles.langNameSelected,
                        ]}
                      >
                        {lang.name}
                      </Text>
                      <Text style={styles.langNative}>{lang.nativeName}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Continue CTA */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleSaveAndContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue to App →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#EEEDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  languageList: {
    gap: 10,
    marginTop: 6,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  langItemSelected: {
    backgroundColor: '#EEEDFF',
    borderColor: '#5553FE',
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: '#5553FE',
  },
  langName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  langNameSelected: {
    color: '#3730A3',
    fontWeight: '800',
  },
  langNative: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#5553FE',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5553FE',
  },
  continueBtn: {
    backgroundColor: '#5553FE',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#5553FE',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
