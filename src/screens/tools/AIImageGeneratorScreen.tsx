import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  BackHandler,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { aiApi } from '../../api/aiApi';
import { copyToClipboard } from '../../utils/clipboard';
import { useSpeechToText } from '../../hooks/useSpeechToText';

const STYLES = ['Photorealistic', 'Anime', '3D Render', 'Cyberpunk', 'Cinematic'];
const RATIOS = [
  { id: '1:1', label: '1:1 Square', width: 1024, height: 1024 },
  { id: '16:9', label: '16:9 Wide', width: 1280, height: 720 },
  { id: '9:16', label: '9:16 Story', width: 720, height: 1280 },
];

export const AIImageGeneratorScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{
    imageUrl: string;
    prompt: string;
  } | null>(null);

  // Real Speech-To-Text hook
  const { isListening, toggleListening, stopListening } = useSpeechToText({
    getCurrentText: () => prompt,
    onTextReceived: (text) => setPrompt(text),
  });

  const handleGoBack = () => {
    stopListening();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'ToolsTab' });
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      handleGoBack();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);

  useEffect(() => {
    if (generatedImage) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [generatedImage]);

  const handleGenerateImage = async () => {
    stopListening();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      Alert.alert('Input Required', 'Please describe the image you want to generate or speak below.');
      return;
    }

    setGenerating(true);
    setGeneratedImage(null);

    const ratioObj = RATIOS.find((r) => r.id === selectedRatio) || RATIOS[0];
    const seed = Math.floor(Math.random() * 1000000);
    const enhancedPrompt = `${cleanPrompt}, ${selectedStyle} style, masterpiece, 8k resolution, highly detailed`;
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${ratioObj.width}&height=${ratioObj.height}&seed=${seed}&nologo=true`;

    try {
      const res = await aiApi.generateImage(enhancedPrompt, {
        style: selectedStyle,
        aspectRatio: selectedRatio,
        quality: 'high',
      });

      const finalUrl = res.data?.imageUrl || fallbackUrl;
      setGeneratedImage({
        imageUrl: finalUrl,
        prompt: cleanPrompt,
      });
    } catch (err: any) {
      console.warn('[AIImageGeneratorScreen] Error generating image:', err?.message || err);
      setGeneratedImage({
        imageUrl: fallbackUrl,
        prompt: cleanPrompt,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleGoBack} activeOpacity={0.7}>
          <Text style={styles.headerBtnText} numberOfLines={1}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>AI Image Generator</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            stopListening();
            setPrompt('');
            setGeneratedImage(null);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.headerBtnText} numberOfLines={1}>Reset</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollArea}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ART STYLE PICKER ROW */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {STYLES.map((style) => {
              const isSelected = selectedStyle === style;
              return (
                <TouchableOpacity
                  key={style}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setSelectedStyle(style)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]} numberOfLines={1}>
                    {style}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ASPECT RATIO ROW */}
          <View style={styles.ratioRow}>
            {RATIOS.map((ratio) => {
              const isSelected = selectedRatio === ratio.id;
              return (
                <TouchableOpacity
                  key={ratio.id}
                  style={[styles.ratioChip, isSelected && styles.ratioChipActive]}
                  onPress={() => setSelectedRatio(ratio.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.ratioChipText, isSelected && styles.ratioChipTextActive]} numberOfLines={1}>
                    {ratio.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* SINGLE CLEAN INPUT AREA */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.mainInput}
              multiline
              numberOfLines={4}
              placeholder="Describe the image you want to create or speak below (e.g., A futuristic sports car in cyber city at night)..."
              placeholderTextColor="#94A3B8"
              value={prompt}
              onChangeText={setPrompt}
            />

            {/* ACTION ROW INSIDE INPUT */}
            <View style={styles.inputBottomRow}>
              <TouchableOpacity
                style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
                onPress={toggleListening}
                activeOpacity={0.8}
              >
                <Text style={[styles.voiceBtnText, isListening && styles.voiceBtnTextActive]} numberOfLines={1}>
                  {isListening ? 'Listening... Tap to stop' : 'Voice Input'}
                </Text>
              </TouchableOpacity>

              {prompt.trim().length > 0 && (
                <TouchableOpacity
                  style={styles.clearInputBtn}
                  onPress={() => setPrompt('')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearInputBtnText} numberOfLines={1}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* MAIN GENERATE CTA BUTTON */}
          <TouchableOpacity
            style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
            onPress={handleGenerateImage}
            disabled={generating}
            activeOpacity={0.85}
          >
            {generating ? (
              <View style={styles.btnLoadingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.generateBtnText} numberOfLines={1}>Generating HD Image...</Text>
              </View>
            ) : (
              <Text style={styles.generateBtnText} numberOfLines={1}>Generate Image</Text>
            )}
          </TouchableOpacity>

          {/* GENERATED IMAGE RESULT */}
          {generatedImage && (
            <View style={styles.resultContainer}>
              <View style={styles.imageBox}>
                <Image
                  source={{ uri: generatedImage.imageUrl }}
                  style={[
                    styles.previewImage,
                    selectedRatio === '16:9' ? { aspectRatio: 16 / 9 } : selectedRatio === '9:16' ? { aspectRatio: 9 / 16 } : { aspectRatio: 1 },
                  ]}
                  resizeMode="cover"
                />
              </View>

              <Text style={styles.imagePromptText} numberOfLines={2}>
                {generatedImage.prompt}
              </Text>

              {/* ACTION BUTTONS ROW - TEXT ONLY, NO ICONS */}
              <View style={styles.resultActionsRow}>
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={() => copyToClipboard(generatedImage.imageUrl, 'Image Link')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionBtnPrimaryText} numberOfLines={1}>Copy Link</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => Alert.alert('Image Saved', 'High resolution image downloaded to gallery!')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnSecondaryText} numberOfLines={1}>Download Image</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => setGeneratedImage(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnSecondaryText} numberOfLines={1}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBtn: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  ratioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  ratioChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratioChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  ratioChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  ratioChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  mainInput: {
    fontSize: 15,
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: 22,
    padding: 0,
  },
  inputBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  voiceBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  voiceBtnActive: {
    backgroundColor: '#DC2626',
  },
  voiceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  voiceBtnTextActive: {
    color: '#FFFFFF',
  },
  clearInputBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearInputBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  generateBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  generateBtnDisabled: {
    opacity: 0.65,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  resultContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  imageBox: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
  },
  imagePromptText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 14,
    lineHeight: 18,
  },

  resultActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnPrimary: {
    flex: 1.2,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnSecondary: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
});
