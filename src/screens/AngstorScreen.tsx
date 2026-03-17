import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  StatusBar,
  Platform,
  useWindowDimensions,
  ScrollView,
  Share,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ANGLER_STORIES, type AnglerStory } from '../data/anglerStories';

const BG = require('../assets/bg_raund.png');

type Phase = 'library' | 'reader';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function PillButton({
  label,
  onPress,
  width = 76,
}: {
  label: string;
  onPress: () => void;
  width?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pillBtn,
        {
          width,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Text style={styles.pillBtnText}>{label}</Text>
    </Pressable>
  );
}

function StoryMetaChip({ label }: { label: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipText}>{label}</Text>
    </View>
  );
}

export default function AnglerStoriesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmallH = height < 760;
  const isSmallW = width < 360;
  const isSmall = isSmallH || isSmallW;

  const padX = clamp(Math.round(width * (isSmall ? 0.05 : 0.06)), 14, 26);
  const cardW = width - padX * 2;
  const heroRadius = 24;
  const cardRadius = 22;

  const storyCardMinH = clamp(Math.round(height * (isSmall ? 0.13 : 0.14)), 96, 132);
  const readerMaxH = clamp(Math.round(height * (isSmall ? 0.68 : 0.72)), 440, 680);

  const [phase, setPhase] = useState<Phase>('library');
  const [selectedId, setSelectedId] = useState<string>(ANGLER_STORIES[0]?.id ?? 's1');

  const anim = useRef(new Animated.Value(1)).current;

  const runSwap = useCallback(() => {
    anim.stopAnimation();
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const fade = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const slide = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });

  const stories = ANGLER_STORIES ?? [];
  const hasStories = stories.length > 0;

  const selectedStory = useMemo<AnglerStory>(() => {
    const found = stories.find(item => item.id === selectedId);
    return found ?? stories[0];
  }, [selectedId, stories]);

  const featuredStory = useMemo<AnglerStory | null>(() => {
    if (!stories.length) return null;
    return stories[0];
  }, [stories]);

  const secondaryStories = useMemo(() => {
    if (!stories.length) return [];
    return stories.slice(1);
  }, [stories]);

  const onBack = useCallback(() => {
    if (phase === 'reader') {
      setPhase('library');
      runSwap();
      return;
    }
    navigation.goBack();
  }, [navigation, phase, runSwap]);

  const openStory = useCallback(
    (id: string) => {
      setSelectedId(id);
      setPhase('reader');
      runSwap();
    },
    [runSwap],
  );

  const onShare = useCallback(async () => {
    if (!selectedStory) return;

    try {
      await Share.share({
        message: `${selectedStory.title}\n\n${selectedStory.content}`,
      });
    } catch (e) {
     
    }
  }, [selectedStory]);

  const topInsetPadding = insets.top + 6;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.overlayA} pointerEvents="none" />
      <View style={styles.overlayB} pointerEvents="none" />

      <SafeAreaView style={styles.safe}>
        <View
          style={[
            styles.screen,
            {
              paddingTop: topInsetPadding,
              paddingHorizontal: padX,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <PillButton
              label={phase === 'reader' ? 'Back' : 'Exit'}
              onPress={onBack}
              width={80}
            />
            {phase === 'reader' ? (
              <PillButton label="Share" onPress={onShare} width={84} />
            ) : (
              <View style={{ width: 84 }} />
            )}
          </View>

          <Animated.View
            style={{
              flex: 1,
              opacity: fade,
              transform: [{ translateY: slide }, { scale }],
            }}
          >
            {!hasStories ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>No stories available</Text>
                <Text style={styles.emptyText}>
                  Add content to the ANGLER_STORIES source to display the reading library.
                </Text>
              </View>
            ) : phase === 'library' ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 28 + insets.bottom,
                }}
              >
                <View
                  style={[
                    styles.heroCard,
                    {
                      width: cardW,
                      borderRadius: heroRadius,
                      paddingHorizontal: isSmall ? 16 : 20,
                      paddingVertical: isSmall ? 16 : 20,
                    },
                  ]}
                >
                  <View style={styles.heroGlow} />

                  <Text style={[styles.eyebrow, { fontSize: isSmall ? 11 : 12 }]}>
                    Story Collection
                  </Text>

                  <Text style={[styles.heroTitle, { fontSize: isSmall ? 22 : 26 }]}>
                    Angler Notes
                  </Text>

                  <Text
                    style={[
                      styles.heroSubtitle,
                      {
                        fontSize: isSmall ? 12.5 : 13.5,
                        lineHeight: isSmall ? 18 : 20,
                        marginTop: 8,
                      },
                    ]}
                  >
                    Read atmospheric water-side stories, keep a calm pace, and explore one note at
                    a time.
                  </Text>

                  <View style={styles.heroMetaRow}>
                    <StoryMetaChip label={`${stories.length} stories`} />
                    <StoryMetaChip label="Offline reading" />
                    <StoryMetaChip label="Quiet mode" />
                  </View>
                </View>

                {featuredStory ? (
                  <Pressable
                    onPress={() => openStory(featuredStory.id)}
                    style={({ pressed }) => [
                      styles.featuredCard,
                      {
                        width: cardW,
                        borderRadius: cardRadius,
                        opacity: pressed ? 0.94 : 1,
                        transform: [{ scale: pressed ? 0.992 : 1 }],
                        paddingHorizontal: isSmall ? 16 : 18,
                        paddingVertical: isSmall ? 16 : 18,
                        marginTop: 18,
                      },
                    ]}
                  >
                    <Text style={styles.featuredLabel}>Featured Story</Text>
                    <Text style={[styles.featuredTitle, { fontSize: isSmall ? 16 : 17.5 }]}>
                      {featuredStory.title}
                    </Text>
                    <Text
                      style={[
                        styles.featuredPreview,
                        {
                          fontSize: isSmall ? 11.5 : 12.5,
                          lineHeight: isSmall ? 17 : 18,
                          marginTop: 8,
                        },
                      ]}
                      numberOfLines={3}
                    >
                      {featuredStory.preview}
                    </Text>

                    <View style={styles.featuredFooter}>
                      <View style={styles.readNowPill}>
                        <Text style={styles.readNowText}>Open Story</Text>
                      </View>
                    </View>
                  </Pressable>
                ) : null}

                <View style={[styles.sectionHeader, { marginTop: 22 }]}>
                  <Text style={styles.sectionTitle}>Library</Text>
                  <Text style={styles.sectionCount}>{stories.length}</Text>
                </View>

                <View style={{ marginTop: 12 }}>
                  {secondaryStories.map((story, index) => (
                    <Pressable
                      key={story.id}
                      onPress={() => openStory(story.id)}
                      style={({ pressed }) => [
                        styles.storyCard,
                        {
                          width: cardW,
                          minHeight: storyCardMinH,
                          borderRadius: cardRadius,
                          opacity: pressed ? 0.94 : 1,
                          transform: [{ scale: pressed ? 0.992 : 1 }],
                          paddingHorizontal: isSmall ? 16 : 18,
                          paddingVertical: isSmall ? 14 : 16,
                          marginBottom: 14,
                        },
                      ]}
                    >
                      <View style={styles.storyCardAccent} />
                      <View style={styles.storyTopRow}>
                        <Text style={styles.storyIndex}>
                          {String(index + 2).padStart(2, '0')}
                        </Text>
                        <View style={styles.storyDivider} />
                        <Text
                          numberOfLines={1}
                          style={[styles.storyTitle, { fontSize: isSmall ? 13.2 : 14.2 }]}
                        >
                          {story.title}
                        </Text>
                      </View>

                      <Text
                        numberOfLines={3}
                        style={[
                          styles.storyPreview,
                          {
                            fontSize: isSmall ? 11.3 : 12.2,
                            lineHeight: isSmall ? 17 : 18,
                            marginTop: 10,
                          },
                        ]}
                      >
                        {story.preview}
                      </Text>

                      <View style={styles.storyFooter}>
                        <Text style={styles.storyFooterText}>Tap to read</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View style={{ flex: 1 }}>
                <View
                  style={[
                    styles.readerShell,
                    {
                      width: cardW,
                      borderRadius: cardRadius,
                      marginTop: 8,
                      padding: isSmall ? 8 : 10,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.readerInner,
                      {
                        borderRadius: cardRadius - 4,
                        maxHeight: readerMaxH,
                        paddingHorizontal: isSmall ? 15 : 18,
                        paddingTop: isSmall ? 16 : 18,
                        paddingBottom: isSmall ? 14 : 16,
                      },
                    ]}
                  >
                    <Text style={styles.readerLabel}>Now Reading</Text>

                    <Text style={[styles.readerTitle, { fontSize: isSmall ? 16 : 18 }]}>
                      {selectedStory.title}
                    </Text>

                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 16 }}
                      style={{ marginTop: 12 }}
                    >
                      <Text
                        style={[
                          styles.readerBody,
                          {
                            fontSize: isSmall ? 11.8 : 12.8,
                            lineHeight: isSmall ? 19 : 21,
                          },
                        ]}
                      >
                        {selectedStory.content}
                      </Text>
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.readerBottomNote}>
                  <Text style={styles.readerBottomNoteText}>
                    A calm reading space with simple local sharing.
                  </Text>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#06121E',
  },

  safe: {
    flex: 1,
  },

  screen: {
    flex: 1,
  },

  overlayA: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(1, 12, 22, 0.40)',
  },

  overlayB: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },

  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  pillBtn: {
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(7, 26, 49, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pillBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: Platform.OS === 'android' ? -1 : 0,
  },

  heroCard: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(120,180,255,0.18)',
    backgroundColor: 'rgba(9, 27, 49, 0.72)',
  },

  heroGlow: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: 'rgba(79, 157, 255, 0.10)',
  },

  eyebrow: {
    color: 'rgba(186,218,255,0.82)',
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 8,
  },

  heroSubtitle: {
    color: 'rgba(232,241,255,0.78)',
    fontWeight: '600',
  },

  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },

  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 8,
    marginBottom: 8,
  },

  metaChipText: {
    color: '#EAF3FF',
    fontSize: 11,
    fontWeight: '700',
  },

  featuredCard: {
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(80, 160, 255, 0.40)',
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    overflow: 'hidden',
  },

  featuredLabel: {
    color: '#8FC3FF',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  featuredTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 8,
  },

  featuredPreview: {
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
  },

  featuredFooter: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  readNowPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(46, 125, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(111, 172, 255, 0.32)',
  },

  readNowText: {
    color: '#DDEEFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  sectionHeader: {
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  sectionCount: {
    minWidth: 34,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    textAlign: 'center',
    color: '#DDEEFF',
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  storyCard: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },

  storyCardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(84, 164, 255, 0.65)',
  },

  storyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  storyIndex: {
    color: 'rgba(145, 194, 255, 0.95)',
    fontSize: 12,
    fontWeight: '900',
    width: 24,
  },

  storyDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginRight: 10,
  },

  storyTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '900',
  },

  storyPreview: {
    color: 'rgba(255,255,255,0.74)',
    fontWeight: '600',
  },

  storyFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  storyFooterText: {
    color: '#8FC3FF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  readerShell: {
    alignSelf: 'center',
    backgroundColor: 'rgba(16, 86, 181, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(69, 146, 255, 0.45)',
  },

  readerInner: {
    backgroundColor: 'rgba(0, 0, 0, 0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },

  readerLabel: {
    color: '#8FC3FF',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },

  readerTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 8,
  },

  readerBody: {
    color: 'rgba(239,245,255,0.80)',
    fontWeight: '600',
  },

  readerBottomNote: {
    alignItems: 'center',
    paddingTop: 14,
  },

  readerBottomNoteText: {
    color: 'rgba(255,255,255,0.54)',
    fontSize: 11.5,
    fontWeight: '600',
    textAlign: 'center',
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});