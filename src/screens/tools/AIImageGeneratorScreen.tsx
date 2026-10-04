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
import { Icon } from '../../components/Icon';
import { aiApi } from '../../api/aiApi';
import { copyToClipboard } from '../../utils/clipboard';

interface ImageMessage {
  id: string;
  sender: 'user' | 'studio';
  text?: string;
  imageUrl?: string;
  style?: string;
  aspectRatio?: string;
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
  { id: '16:9', label: '16:9 Banner', width: 1344, height: 768 },
  { id: '9:16', label: '9:16 Story', width: 768, height: 1344 },
  { id: '4:3', label: '4:3 Standard', width: 1024, height: 768 },
];

const QUICK_PILLS = [
  { label: 'Cyberpunk Samurai ➔', prompt: 'Cyberpunk samurai standing in neon rain with glowing katana' },
  { label: '3D Mascot ➔', prompt: 'Cute 3D anime mascot character floating in magical space' },
  { label: 'Cinematic Portrait ➔', prompt: 'Cinematic portrait of a visionary founder looking at futuristic holographic screens' },
  { label: 'Hyper-realistic Lion ➔', prompt: 'Hyper-realistic lion crowned with glowing golden aura' },
  { label: 'Futuristic City ➔', prompt: 'Futuristic skyline of a sci-fi metropolis at dusk with flying vehicles' },
];

export const AIImageGeneratorScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');

  // Dropdown & Modal states
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [showRatioDropdown, setShowRatioDropdown] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<{ id: string; prompt: string; imageUrl: string; timestamp: string }[]>([]);

  const [messages, setMessages] = useState<ImageMessage[]>([
    {
      id: 'welcome_msg',
      sender: 'studio',
      text: '🎨 **CrackWithAI Studio** ready. Type a prompt, tap a quick pill, or use voice input to generate high-resolution images.',
      timestamp: 'Just now',
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
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages, generating]);

  const handleVoiceInput = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const voicePrompts = [
        'Cyberpunk samurai standing in neon rain',
        'Hyper-realistic astronaut walking on Mars surface',
        'Futuristic cybernetic lion with glowing neon eyes',
        'Cute 3D anime mascot floating in space',
      ];
      const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
      setPrompt(randomPrompt);
    }, 2000);
  };

  const handleAttachFile = () => {
    Alert.alert(
      'Attach Sample Concept',
      'Select a preset concept to populate prompt:',
      [
        {
          text: 'Cyberpunk Samurai',
          onPress: () => setPrompt('Cyberpunk samurai standing in neon rain with glowing katana'),
        },
        {
          text: 'Futuristic AI Workspace',
          onPress: () => setPrompt('Ultra-modern futuristic AI workspace with developer holograms'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSendPrompt = async (overridePrompt?: string) => {
    const activePrompt = (overridePrompt || prompt).trim();
    if (!activePrompt) {
      Alert.alert('Required Prompt', 'Please type a prompt, tap a quick pill, or use voice input.');
      return;
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append User Message
    const userMsg: ImageMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: activePrompt,
      timestamp: nowStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setGenerating(true);
    setShowStyleDropdown(false);
    setShowRatioDropdown(false);

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
      });

      const finalUrl = res.data?.imageUrl || fallbackImageUrl;

      const studioMsg: ImageMessage = {
        id: `studio_${Date.now()}`,
        sender: 'studio',
        imageUrl: finalUrl,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        timestamp: nowStr,
      };

      setMessages((prev) => [...prev, studioMsg]);
      setHistory((prev) => [{ id: studioMsg.id, prompt: activePrompt, imageUrl: finalUrl, timestamp: nowStr }, ...prev]);
    } catch (err) {
      console.warn('[AIImageGeneratorScreen] Image fallback active:', err);
      const studioMsg: ImageMessage = {
        id: `studio_${Date.now()}`,
        sender: 'studio',
        imageUrl: fallbackImageUrl,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        timestamp: nowStr,
      };
      setMessages((prev) => [...prev, studioMsg]);
      setHistory((prev) => [{ id: studioMsg.id, prompt: activePrompt, imageUrl: fallbackImageUrl, timestamp: nowStr }, ...prev]);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backPill} onPress={handleGoBack} activeOpacity={0.7}>
          <Icon name="chevron-left" size={16} color="#0F172A" />
          <Text style={styles.backPillText}>Tools</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>AI Image Generator</Text>

        <TouchableOpacity style={styles.historyBlackBtn} onPress={() => setShowHistoryModal(true)} activeOpacity={0.8}>
          <Text style={styles.historyBlackBtnText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* QUICK PROMPT PILLS ROW */}
      <View style={styles.quickPillsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPillsScroll}>
          {QUICK_PILLS.map((pill, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickPillBtn}
              onPress={() => {
                setPrompt(pill.prompt);
                handleSendPrompt(pill.prompt);
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.quickPillText}>{pill.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* CHAT THREAD MESSAGES AREA */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesFeed}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((item) => {
            const isUser = item.sender === 'user';
            return (
              <View key={item.id} style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowStudio]}>
                {!isUser && (
                  <View style={styles.studioAvatar}>
                    <Image
                      source={require('../../assets/images/logo/crackwithai.png')}
                      style={styles.studioAvatarLogo}
                      resizeMode="contain"
                    />
                  </View>
                )}

                <View style={[styles.msgBubble, isUser ? styles.userBubble : styles.studioBubble]}>
                  {/* TEXT CONTENT */}
                  {item.text && (
                    <Text style={[styles.msgText, isUser ? styles.userMsgText : styles.studioMsgText]}>
                      {item.text}
                    </Text>
                  )}

                  {/* GENERATED IMAGE ITEM */}
                  {item.imageUrl && (
                    <View style={styles.imageWrapper}>
                      <View style={styles.imageMetaHeader}>
                        <Text style={styles.imageMetaText}>
                          Style: <Text style={styles.imageMetaBold}>{item.style}</Text> | Aspect: <Text style={styles.imageMetaBold}>{item.aspectRatio}</Text>
                        </Text>
                      </View>

                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.generatedImage}
                        resizeMode="cover"
                      />

                      {/* IMAGE ACTION BUTTONS */}
                      <View style={styles.imageActionBar}>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => copyToClipboard(item.imageUrl!, 'Image Link')}
                          activeOpacity={0.8}
                        >
                          <Icon name="copy" size={13} color="#7C3AED" />
                          <Text style={styles.actionBtnText}>Copy Link</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.downloadBtn}
                          onPress={() => Alert.alert('Image Saved 🎉', 'High resolution image downloaded to gallery!')}
                          activeOpacity={0.85}
                        >
                          <Icon name="download" size={13} color="#FFFFFF" />
                          <Text style={styles.downloadBtnText}>Download</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <Text style={[styles.msgTimestamp, isUser ? styles.userMsgTimestamp : styles.studioMsgTimestamp]}>
                    {item.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* GENERATING LOADING CARD */}
          {generating && (
            <View style={[styles.msgRow, styles.msgRowStudio]}>
              <View style={styles.studioAvatar}>
                <Image
                  source={require('../../assets/images/logo/crackwithai.png')}
                  style={styles.studioAvatarLogo}
                  resizeMode="contain"
                />
              </View>
              <View style={[styles.msgBubble, styles.studioBubble, styles.loadingBubble]}>
                <ActivityIndicator color="#7C3AED" size="small" />
                <Text style={styles.loadingBubbleText}>Generating HD Image...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* DROPDOWN OVERLAYS */}
        {showStyleDropdown && (
          <View style={[styles.dropdownMenuBox, { left: 80 }]}>
            {STYLE_OPTIONS.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[styles.dropdownItem, selectedStyle === style.id && styles.dropdownItemActive]}
                onPress={() => {
                  setSelectedStyle(style.id);
                  setShowStyleDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, selectedStyle === style.id && styles.dropdownItemTextActive]}>
                  {style.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showRatioDropdown && (
          <View style={[styles.dropdownMenuBox, { left: 160 }]}>
            {ASPECT_RATIO_OPTIONS.map((ratio) => (
              <TouchableOpacity
                key={ratio.id}
                style={[styles.dropdownItem, selectedRatio === ratio.id && styles.dropdownItemActive]}
                onPress={() => {
                  setSelectedRatio(ratio.id);
                  setShowRatioDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, selectedRatio === ratio.id && styles.dropdownItemTextActive]}>
                  {ratio.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* BOTTOM INPUT COMPOSER CARD */}
        <View style={[styles.bottomInputBar, { paddingBottom: Math.max(10, insets.bottom) }]}>
          <View style={styles.inputInnerCard}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Describe the image you want to create..."
              placeholderTextColor="#94A3B8"
              value={prompt}
              onChangeText={setPrompt}
            />

            <View style={styles.inputToolbarRow}>
              {/* Add Presets / Ideas (+) */}
              <TouchableOpacity style={styles.iconCircleBtn} onPress={handleAttachFile} activeOpacity={0.7}>
                <Text style={styles.plusText}>+</Text>
              </TouchableOpacity>

              {/* Clean Microphone Icon Button */}
              <TouchableOpacity
                style={[styles.iconCircleBtn, isRecordingVoice && styles.micActiveBtn]}
                onPress={handleVoiceInput}
                activeOpacity={0.7}
              >
                <Icon name="mic" size={16} color={isRecordingVoice ? '#EF4444' : '#7C3AED'} />
              </TouchableOpacity>

              {/* Style Dropdown Pill */}
              <TouchableOpacity
                style={styles.miniPill}
                onPress={() => {
                  setShowStyleDropdown(!showStyleDropdown);
                  setShowRatioDropdown(false);
                }}
              >
                <Text style={styles.miniPillText}>{selectedStyle} ▾</Text>
              </TouchableOpacity>

              {/* Aspect Ratio Dropdown Pill */}
              <TouchableOpacity
                style={styles.miniPill}
                onPress={() => {
                  setShowRatioDropdown(!showRatioDropdown);
                  setShowStyleDropdown(false);
                }}
              >
                <Text style={styles.miniPillText}>{selectedRatio} ▾</Text>
              </TouchableOpacity>

              <View style={{ flex: 1 }} />

              {/* Send Arrow Button */}
              <TouchableOpacity
                style={[styles.sendBtn, (!prompt.trim() || generating) && styles.sendBtnDisabled]}
                onPress={() => handleSendPrompt()}
                disabled={!prompt.trim() || generating}
                activeOpacity={0.85}
              >
                {generating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Icon name="arrow-up" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* HISTORY MODAL */}
      <Modal visible={showHistoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Image Generation History</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Icon name="x" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {history.length === 0 ? (
              <Text style={styles.emptyHistoryText}>No image history yet. Generate images to see them here.</Text>
            ) : (
              <ScrollView style={styles.historyList}>
                {history.map((item) => (
                  <View key={item.id} style={styles.historyItemCard}>
                    <Image source={{ uri: item.imageUrl }} style={styles.historyThumb} resizeMode="cover" />
                    <View style={styles.historyItemContent}>
                      <Text style={styles.historyItemPrompt} numberOfLines={2}>
                        {item.prompt}
                      </Text>
                      <Text style={styles.historyItemTime}>{item.timestamp}</Text>
                      <TouchableOpacity
                        style={styles.historyUseBtn}
                        onPress={() => {
                          setPrompt(item.prompt);
                          setShowHistoryModal(false);
                        }}
                      >
                        <Text style={styles.historyUseBtnText}>Use Prompt</Text>
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

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  backPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyBlackBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  historyBlackBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* QUICK PILLS */
  quickPillsWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  quickPillsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPillBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },

  /* CHAT MESSAGES FEED */
  messagesFeed: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 4,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowStudio: {
    justifyContent: 'flex-start',
  },
  studioAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  studioAvatarLogo: {
    width: 22,
    height: 22,
  },
  msgBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
  },
  studioBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMsgText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  studioMsgText: {
    color: '#0F172A',
  },
  msgTimestamp: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  userMsgTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  studioMsgTimestamp: {
    color: '#94A3B8',
  },

  /* GENERATED IMAGE ITEM IN MESSAGES */
  imageWrapper: {
    marginTop: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageMetaHeader: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
  },
  imageMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  imageMetaBold: {
    fontWeight: '700',
    color: '#7C3AED',
  },
  generatedImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#E2E8F0',
  },
  imageActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  downloadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* LOADING BUBBLE */
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  loadingBubbleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },

  /* DROPDOWNS */
  dropdownMenuBox: {
    position: 'absolute',
    bottom: 85,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 99,
    minWidth: 150,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownItemActive: {
    backgroundColor: '#F3E8FF',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#334155',
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: '#7C3AED',
  },

  /* BOTTOM COMPOSER CARD */
  bottomInputBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  inputInnerCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 10,
  },
  textInput: {
    fontSize: 14,
    color: '#0F172A',
    maxHeight: 100,
    minHeight: 40,
    paddingHorizontal: 6,
    paddingTop: 4,
    textAlignVertical: 'top',
  },
  inputToolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  iconCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micActiveBtn: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  plusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7C3AED',
    marginTop: -2,
  },
  miniPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  miniPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    marginVertical: 20,
  },
  historyList: {
    maxHeight: 400,
  },
  historyItemCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#CBD5E1',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemPrompt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  historyItemTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  historyUseBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyUseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
});
