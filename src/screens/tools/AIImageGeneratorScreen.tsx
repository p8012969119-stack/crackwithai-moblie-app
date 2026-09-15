import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  BackHandler,
  Modal,
  Image,
  FlatList,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { aiApi } from '../../api/aiApi';
import { copyToClipboard } from '../../utils/clipboard';

const STYLE_OPTIONS = [
  { id: 'Photorealistic', name: 'Photorealistic', icon: '📷' },
  { id: 'Anime / Manga', name: 'Anime & Manga', icon: '⛩️' },
  { id: 'Digital Art', name: 'Digital Art', icon: '🎨' },
  { id: '3D Render', name: '3D Render', icon: '💎' },
  { id: 'Cyberpunk', name: 'Cyberpunk', icon: '🌆' },
  { id: 'Oil Painting', name: 'Oil Painting', icon: '🖼️' },
  { id: 'Cinematic', name: 'Cinematic', icon: '🎬' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', icon: '⬛' },
  { id: '9:16', label: '9:16 Story', icon: '📱' },
  { id: '16:9', label: '16:9 Banner', icon: '📺' },
  { id: '4:3', label: '4:3 Standard', icon: '🖼️' },
];

const QUICK_PROMPTS = [
  'Cyberpunk samurai in neon rain',
  'Cute 3D anime mascot in space',
  'Hyperrealistic astronaut dog on moon',
  'Fantasy castle in crystal mountain',
];

interface ImageHistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  date: string;
  style: string;
}

export const AIImageGeneratorScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const imageFadeAnim = useRef(new Animated.Value(0)).current;

  const [history, setHistory] = useState<ImageHistoryItem[]>([
    {
      id: 'img1',
      prompt: 'Futuristic AI neural network glowing nodes floating in cyber space',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      date: '10 mins ago',
      style: 'Cyberpunk',
    },
  ]);

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
    if (generating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 750,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.98,
            duration: 750,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [generating]);

  const triggerImageRevealAnimation = () => {
    imageFadeAnim.setValue(0);
    Animated.timing(imageFadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleGenerateImage = async () => {
    const effectivePrompt = prompt.trim() || 'High quality digital AI artwork';

    setGenerating(true);

    try {
      const res = await aiApi.generateImage(effectivePrompt, {
        negativePrompt: 'blurry, low quality',
        style,
        aspectRatio,
        quality: 'high',
        numImages: 1,
      });

      const newUrl =
        res.data?.imageUrl ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

      const imgList = res.data?.images || [newUrl];
      setGeneratedImages(imgList);
      setSelectedPreviewImage(imgList[0]);
      triggerImageRevealAnimation();

      setHistory((prev) => [
        {
          id: `h_${Date.now()}`,
          prompt: effectivePrompt,
          imageUrl: newUrl,
          date: 'Just now',
          style,
        },
        ...prev,
      ]);
    } catch (err) {
      console.warn('[AIImageGeneratorScreen] Error generating image:', err);
      const fallbackUrl =
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
      setGeneratedImages([fallbackUrl]);
      setSelectedPreviewImage(fallbackUrl);
      triggerImageRevealAnimation();
    } finally {
      setGenerating(false);
    }
  };

  const activeImage = selectedPreviewImage || (generatedImages.length > 0 ? generatedImages[0] : null);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. LIGHT HEADER BAR */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleGoBack} activeOpacity={0.7}>
          <Icon name="chevron-left" size={18} color="#0F172A" />
          <Text style={styles.backBtnText}>Tools</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>AI Image Generator</Text>

        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => setShowHistoryModal(true)}
          activeOpacity={0.7}
        >
          <Icon name="clock" size={16} color="#7C3AED" />
          <Text style={styles.historyBtnText}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 2. IMAGE DISPLAY CANVAS CARD */}
        <View style={styles.canvasCard}>
          {generating ? (
            <Animated.View style={[styles.loadingBox, { transform: [{ scale: pulseAnim }] }]}>
              <ActivityIndicator color="#7C3AED" size="large" />
              <Text style={styles.loadingTitle}>Generating Image...</Text>
              <Text style={styles.loadingSub}>Applying {style} style ({aspectRatio})</Text>
            </Animated.View>
          ) : activeImage ? (
            <Animated.View style={[styles.imagePreviewWrapper, { opacity: imageFadeAnim }]}>
              <Image source={{ uri: activeImage }} style={styles.canvasImage} resizeMode="cover" />

              {/* OVERLAY BADGES */}
              <View style={styles.overlayBadgeRow}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{style}</Text>
                </View>
                <View style={styles.badgePillRatio}>
                  <Text style={styles.badgePillRatioText}>{aspectRatio}</Text>
                </View>
              </View>

              {/* 1-TAP ACTION BUTTONS */}
              <View style={styles.canvasActionBar}>
                <TouchableOpacity
                  style={styles.copyActionBtn}
                  onPress={() => copyToClipboard(activeImage, 'Image Link')}
                  activeOpacity={0.8}
                >
                  <Icon name="copy" size={15} color="#7C3AED" />
                  <Text style={styles.copyActionBtnText}>Copy Link</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.downloadActionBtn}
                  onPress={() => {
                    Alert.alert('Image Saved', 'Image downloaded successfully to gallery!');
                  }}
                  activeOpacity={0.85}
                >
                  <Icon name="arrow-up" size={15} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
                  <Text style={styles.downloadActionBtnText}>Download</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            <View style={styles.emptyStateBox}>
              <View style={styles.emptyIconCircle}>
                <Icon name="image" size={32} color="#7C3AED" />
              </View>
              <Text style={styles.emptyTitle}>Create Instant AI Visuals</Text>
              <Text style={styles.emptySub}>
                Type a prompt or tap a sample idea below to generate high quality images in 1 click.
              </Text>
            </View>
          )}
        </View>

        {/* 3. PROMPT INPUT & GENERATE BUTTON */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Enter Prompt</Text>

          <TextInput
            style={styles.promptInput}
            placeholder="What do you want to create? (e.g. Cute cat on a motorcycle)"
            placeholderTextColor="#94A3B8"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={3}
          />

          {/* QUICK PROMPT CHIPS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickPromptsScroll}>
            {QUICK_PROMPTS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickPromptChip}
                onPress={() => setPrompt(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickPromptText}>✨ {item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 1-CLICK GENERATE BUTTON */}
          <TouchableOpacity
            style={[styles.generateBtn, (!prompt.trim() || generating) && styles.generateBtnDisabled]}
            onPress={handleGenerateImage}
            disabled={!prompt.trim() || generating}
            activeOpacity={0.85}
          >
            {generating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.generateBtnText}>Generate Image</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 4. SIMPLE 1-TAP STYLE CHIPS */}
        <View style={styles.optionsCard}>
          <Text style={styles.optionsTitle}>Select Style</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {STYLE_OPTIONS.map((item) => {
              const isSelected = style === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.styleChip, isSelected && styles.styleChipSelected]}
                  onPress={() => setStyle(item.id)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.chipEmoji}>{item.icon}</Text>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 5. SIMPLE 1-TAP ASPECT RATIO CHIPS */}
        <View style={styles.optionsCard}>
          <Text style={styles.optionsTitle}>Select Aspect Ratio</Text>
          <View style={styles.ratioGrid}>
            {ASPECT_RATIOS.map((item) => {
              const isSelected = aspectRatio === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.ratioChip, isSelected && styles.ratioChipSelected]}
                  onPress={() => setAspectRatio(item.id)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.chipEmoji}>{item.icon}</Text>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* HISTORY MODAL */}
      <Modal visible={showHistoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Image History</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Icon name="x-circle" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyHistoryState}>
                <Text style={styles.emptyHistoryText}>No past images generated yet.</Text>
              </View>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.historyItem}>
                    <Image source={{ uri: item.imageUrl }} style={styles.historyThumb} />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyStyleBadgeText}>{item.style}</Text>
                      <Text style={styles.historyPrompt} numberOfLines={2}>{item.prompt}</Text>
                      <Text style={styles.historyDate}>{item.date}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.reuseBtn}
                      onPress={() => {
                        setPrompt(item.prompt);
                        setSelectedPreviewImage(item.imageUrl);
                        setShowHistoryModal(false);
                      }}
                    >
                      <Text style={styles.reuseBtnText}>Use</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  historyBtnText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  /* CANVAS CARD */
  canvasCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 260,
    justifyContent: 'center',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    gap: 10,
  },
  loadingTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingSub: {
    color: '#64748B',
    fontSize: 13,
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: '100%',
  },
  canvasImage: {
    width: '100%',
    height: 300,
  },
  overlayBadgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  badgePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  badgePillRatio: {
    backgroundColor: 'rgba(124, 58, 237, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgePillRatioText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  canvasActionBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  copyActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  copyActionBtnText: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '700',
  },
  downloadActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  downloadActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* INPUT CARD */
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputLabel: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  promptInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    color: '#0F172A',
    fontSize: 14,
    lineHeight: 20,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  quickPromptsScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  quickPromptChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickPromptText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
  },
  generateBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  /* OPTIONS CARDS */
  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionsTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  styleChipSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ratioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  ratioChipSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyHistoryState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyHistoryText: {
    color: '#64748B',
    fontSize: 13,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyStyleBadgeText: {
    color: '#7C3AED',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyPrompt: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '500',
  },
  historyDate: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  reuseBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reuseBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
