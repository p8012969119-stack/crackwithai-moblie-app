import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { storage } from '../../services/storage';
import { CONFIG } from '../../constants/config';

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

export const LanguageSelectionScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const isFromProfile = route?.params?.fromProfile || false;
  const [selectedLang, setSelectedLang] = useState<string>('en');

  useEffect(() => {
    const loadSavedLanguage = async () => {
      const saved = await storage.getItem(CONFIG.STORAGE_KEYS.LANGUAGE);
      if (saved) {
        setSelectedLang(saved);
      }
    };
    loadSavedLanguage();
  }, []);

  const handleGoBack = () => {
    if (isFromProfile) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Profile');
      }
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Profile');
    }
  };

  const handleContinue = async () => {
    await storage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, selectedLang);
    if (isFromProfile) {
      handleGoBack();
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top Header Bar with Back Button */}
      <View style={styles.topHeaderBar}>
        <TouchableOpacity
          style={styles.backButtonCircle}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Logo & Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🤖</Text>
          </View>
          <Text style={styles.brandTitle}>CrackWithAI</Text>
          <Text style={styles.tagline}>Learn. Practice. Master. AI.</Text>
          <Text style={styles.subtitle}>Choose your preferred learning language</Text>
        </View>

        {/* Language Selection Cards */}
        <View style={styles.languageList}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                activeOpacity={0.8}
                style={[styles.langCard, isSelected && styles.langCardSelected]}
                onPress={() => setSelectedLang(lang.code)}
              >
                <View style={styles.langLeft}>
                  <View style={[styles.langIconBg, isSelected && styles.langIconBgSelected]}>
                    <Icon
                      name={lang.icon as any}
                      size={22}
                      color={isSelected ? '#FFFFFF' : COLORS.primary}
                    />
                  </View>
                  <View>
                    <Text style={[styles.langName, isSelected && styles.langNameSelected]}>
                      {lang.name}
                    </Text>
                    <Text style={styles.langNative}>{lang.nativeName}</Text>
                  </View>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          variant="primary"
          size="large"
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeaderBar: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  logoEmoji: {
    fontSize: 42,
  },
  brandTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  tagline: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  languageList: {
    marginTop: SPACING.md,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  langCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.badgePurpleBg,
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  langIconBgSelected: {
    backgroundColor: COLORS.primary,
  },
  langName: {
    ...TYPOGRAPHY.h3,
    fontSize: 17,
    color: COLORS.textPrimary,
  },
  langNameSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  langNative: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  continueBtn: {
    borderRadius: RADIUS.lg,
  },
});
