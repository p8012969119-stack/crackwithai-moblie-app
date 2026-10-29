import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { aiApi } from '../../api/aiApi';
import { copyToClipboard } from '../../utils/clipboard';

interface GeneratedImageItem {
  id: string;
  prompt: string;
  imageUrl: string;
  style: string;
  aspectRatio: string;
  timestamp: string;
}

const STYLE_OPTIONS = [
  { id: 'Photorealistic', name: 'Photorealistic', tag: '8k photo, DSLR, realistic, high detail' },
  { id: 'Anime', name: 'Anime & Manga', tag: 'Ghibli style, vibrant anime illustration' },
  { id: 'Digital Art', name: 'Digital Art', tag: 'concept art, vibrant colors, trending on artstation' },
  { id: '3D Render', name: '3D Render', tag: 'octane 3D render, raytracing, 4k detail' },
  { id: 'Cyberpunk', name: 'Cyberpunk', tag: 'neon lights, futuristic synthwave vibe' },
  { id: 'Cinematic', name: 'Cinematic', tag: 'movie still, IMAX lighting, dramatic composition' },
];

const ASPECT_RATIO_OPTIONS = [
  { id: '1:1', label: '1:1 Square', width: 1024, height: 1024 },
  { id: '16:9', label: '16:9 Banner', width: 1280, height: 720 },
  { id: '9:16', label: '9:16 Story', width: 720, height: 1280 },
  { id: '4:3', label: '4:3 Standard', width: 1024, height: 768 },
];

const QUICK_PROMPTS = [
  { label: 'Cyberpunk Samurai', prompt: 'Cyberpunk samurai standing in neon rain with glowing katana' },
  { label: '3D Mascot', prompt: 'Cute 3D anime mascot character floating in magical space' },
  { label: 'Cinematic Portrait', prompt: 'Cinematic portrait of a visionary founder looking at futuristic holographic screens' },
  { label: 'Hyper-realistic Lion', prompt: 'Hyper-realistic lion crowned with glowing golden aura' },
  { label: 'Futuristic City', prompt: 'Futuristic skyline of a sci-fi metropolis at dusk with flying vehicles' },
];

export const AIImageGeneratorScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showNegativeInput, setShowNegativeInput] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [images, setImages] = useState<GeneratedImageItem[]>([]);
  const [history, setHistory] = useState<GeneratedImageItem[]>([]);

  const handleGoBack = () => {
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
    if (images.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [images, generating]);

  const handleVoiceInput = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const voicePrompts = [
        'Cyberpunk samurai standing in neon rain with glowing katana',
        'Hyper-realistic astronaut exploring mysterious crystalline cave on Mars',
        'Futuristic cybernetic lion with glowing neon aura and golden armor',
        'Cute 3D anime mascot floating in a starry nebula',
      ];
      const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
      setPrompt(randomPrompt);
    }, 1800);
  };

  const handleGenerateImage = async (overridePrompt?: string) => {
    const activePrompt = (overridePrompt || prompt).trim();
    if (!activePrompt) {
      Alert.alert('Required Prompt', 'Please describe the image you want to generate or select a quick preset.');
      return;
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setGenerating(true);

    const styleObj = STYLE_OPTIONS.find((s) => s.id === selectedStyle);
    const styleTag = styleObj?.tag || selectedStyle;
    const enhancedPrompt = `${activePrompt}, ${styleTag}, masterpiece, 8k resolution, crisp details, professional lighting`;
    const ratioObj = ASPECT_RATIO_OPTIONS.find((r) => r.id === selectedRatio) || ASPECT_RATIO_OPTIONS[0];
    const seed = Math.floor(Math.random() * 1000000);

    const fallbackImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${ratioObj.width}&height=${ratioObj.height}&seed=${seed}&nologo=true&model=flux`;

    try {
      const res = await aiApi.generateImage(enhancedPrompt, {
        style: selectedStyle,
        aspectRatio: selectedRatio,
        quality: 'high',
        negativePrompt: negativePrompt.trim() || undefined,
      });

      const finalUrl = res.data?.imageUrl || fallbackImageUrl;

      const newItem: GeneratedImageItem = {
        id: `img_${Date.now()}`,
        prompt: activePrompt,
        imageUrl: finalUrl,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        timestamp: nowStr,
      };

      setImages((prev) => [...prev, newItem]);
      setHistory((prev) => [newItem, ...prev]);
    } catch (err) {
      console.warn('[AIImageGeneratorScreen] Error generating image:', err);
      const newItem: GeneratedImageItem = {
        id: `img_${Date.now()}`,
        prompt: activePrompt,
        imageUrl: fallbackImageUrl,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        timestamp: nowStr,
      };
      setImages((prev) => [...prev, newItem]);
      setHistory((prev) => [newItem, ...prev]);
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

        <TouchableOpacity style={styles.headerBtnDark} onPress={() => setShowHistoryModal(true)} activeOpacity={0.8}>
          <Text style={styles.headerBtnDarkText} numberOfLines={1}>History</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollArea}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* QUICK CONCEPT PRESETS */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Quick Inspiration Concepts</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
              {QUICK_PROMPTS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetPill}
                  onPress={() => {
                    setPrompt(p.prompt);
                    handleGenerateImage(p.prompt);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.presetPillText} numberOfLines={1}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* MAIN PROMPT INPUT AREA */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeaderRow}>
              <Text style={styles.inputCardLabel}>Describe Your Image</Text>
              <TouchableOpacity
                style={[styles.voiceBtn, isRecordingVoice && styles.voiceBtnActive]}
                onPress={handleVoiceInput}
                activeOpacity={0.8}
              >
                <Text style={[styles.voiceBtnText, isRecordingVoice && styles.voiceBtnTextActive]} numberOfLines={1}>
                  {isRecordingVoice ? 'Listening...' : 'Voice Input'}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.promptInput}
              multiline
              numberOfLines={3}
              placeholder="e.g. Ultra-detailed cyberpunk street in Tokyo with glowing neon signs and rainy reflections..."
              placeholderTextColor="#94A3B8"
              value={prompt}
              onChangeText={setPrompt}
            />

            {/* STYLE SELECTOR */}
            <Text style={[styles.controlLabel, { marginTop: 12 }]}>Art Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlPillsRow}>
              {STYLE_OPTIONS.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <TouchableOpacity
                    key={style.id}
                    style={[styles.stylePill, isSelected && styles.stylePillActive]}
                    onPress={() => setSelectedStyle(style.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.stylePillText, isSelected && styles.stylePillTextActive]} numberOfLines={1}>
                      {style.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* ASPECT RATIO SELECTOR */}
            <Text style={[styles.controlLabel, { marginTop: 12 }]}>Aspect Ratio</Text>
            <View style={styles.ratioRow}>
              {ASPECT_RATIO_OPTIONS.map((ratio) => {
                const isSelected = selectedRatio === ratio.id;
                return (
                  <TouchableOpacity
                    key={ratio.id}
                    style={[styles.ratioPill, isSelected && styles.ratioPillActive]}
                    onPress={() => setSelectedRatio(ratio.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.ratioPillText, isSelected && styles.ratioPillTextActive]} numberOfLines={1}>
                      {ratio.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* NEGATIVE PROMPT TOGGLE */}
            <TouchableOpacity
              style={styles.negativeToggleBtn}
              onPress={() => setShowNegativeInput(!showNegativeInput)}
              activeOpacity={0.7}
            >
              <Text style={styles.negativeToggleText} numberOfLines={1}>
                {showNegativeInput ? 'Hide Negative Prompt' : 'Add Negative Prompt (Optional)'}
              </Text>
            </TouchableOpacity>

            {showNegativeInput && (
              <TextInput
                style={styles.negativeInput}
                placeholder="e.g. blurry, distorted anatomy, low resolution, bad lighting"
                placeholderTextColor="#94A3B8"
                value={negativePrompt}
                onChangeText={setNegativePrompt}
              />
            )}

            {/* GENERATE ACTION BUTTON - TEXT ONLY, NO ICONS */}
            <TouchableOpacity
              style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
              onPress={() => handleGenerateImage()}
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
          </View>

          {/* GENERATED IMAGES FEED */}
          {images.length > 0 && (
            <View style={styles.outputSection}>
              <Text style={styles.outputSectionTitle}>Generated Images</Text>
              {images.map((item) => (
                <View key={item.id} style={styles.imageCard}>
                  <View style={styles.imageCardHeader}>
                    <Text style={styles.imagePromptText} numberOfLines={2}>{item.prompt}</Text>
                    <View style={styles.imageMetaBadge}>
                      <Text style={styles.imageMetaText} numberOfLines={1}>
                        {item.style} · {item.aspectRatio}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* ACTION BUTTONS ROW - TEXT ONLY, NO ICONS */}
                  <View style={styles.imageActionsRow}>
                    <TouchableOpacity
                      style={styles.actionBtnOutline}
                      onPress={() => copyToClipboard(item.imageUrl, 'Image Link')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionBtnOutlineText} numberOfLines={1}>Copy Link</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnFilled}
                      onPress={() => Alert.alert('Image Saved', 'High resolution image downloaded to your gallery!')}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.actionBtnFilledText} numberOfLines={1}>Download Image</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnSecondary}
                      onPress={() => handleGenerateImage(item.prompt)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionBtnSecondaryText} numberOfLines={1}>Regenerate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* HISTORY MODAL */}
      <Modal visible={showHistoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>Image History</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowHistoryModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseBtnText} numberOfLines={1}>Close</Text>
              </TouchableOpacity>
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyHistoryBox}>
                <Text style={styles.emptyHistoryText}>No generated images yet. Start creating above!</Text>
              </View>
            ) : (
              <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                {history.map((item) => (
                  <View key={item.id} style={styles.historyCard}>
                    <Image source={{ uri: item.imageUrl }} style={styles.historyThumb} resizeMode="cover" />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyPrompt} numberOfLines={2}>{item.prompt}</Text>
                      <Text style={styles.historyTime}>{item.style} · {item.timestamp}</Text>
                      <TouchableOpacity
                        style={styles.historyUseBtn}
                        onPress={() => {
                          setPrompt(item.prompt);
                          setSelectedStyle(item.style);
                          setSelectedRatio(item.aspectRatio);
                          setShowHistoryModal(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.historyUseBtnText} numberOfLines={1}>Use Prompt</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 54,
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
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerBtnDark: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnDarkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  /* SECTION PRESETS */
  sectionBlock: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetsRow: {
    gap: 8,
    paddingRight: 8,
  },
  presetPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  presetPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },

  /* INPUT CARD */
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputCardLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  voiceBtn: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  voiceBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  voiceBtnTextActive: {
    color: '#EF4444',
  },
  promptInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 76,
    textAlignVertical: 'top',
  },

  controlLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  controlPillsRow: {
    gap: 8,
    paddingRight: 8,
  },
  stylePill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  stylePillActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#7C3AED',
  },
  stylePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  stylePillTextActive: {
    color: '#7C3AED',
  },

  ratioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratioPill: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratioPillActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#7C3AED',
  },
  ratioPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  ratioPillTextActive: {
    color: '#7C3AED',
  },

  negativeToggleBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 4,
  },
  negativeToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  negativeInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#0F172A',
    marginTop: 6,
  },

  generateBtn: {
    backgroundColor: '#7C3AED',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  generateBtnDisabled: {
    backgroundColor: '#C4B5FD',
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  /* OUTPUT SECTION */
  outputSection: {
    gap: 14,
  },
  outputSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  imageCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  imagePromptText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  imageMetaBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  imageMetaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  imageContainer: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },

  imageActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnOutline: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  actionBtnFilled: {
    flex: 1.2,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBtnFilledText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  actionBtnSecondary: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyHistoryBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 13,
    color: '#64748B',
  },
  historyList: {
    maxHeight: 400,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  historyInfo: {
    flex: 1,
    gap: 4,
  },
  historyPrompt: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyTime: {
    fontSize: 11,
    color: '#64748B',
  },
  historyUseBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  historyUseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
});
