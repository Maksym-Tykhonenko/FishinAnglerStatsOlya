import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  StatusBar,
  useWindowDimensions,
  ScrollView,
  Share,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BAITS, type BaitId } from '../data/baits';

const BACKGROUND_IMAGE = require('../assets/bg_raund.png');

const BAIT_IMAGES: Record<BaitId, any> = {
  spinnerbait: require('../assets/spinnerbait.png'),
  soft_plastic_worm: require('../assets/soft_plastic_worm.png'),
  crankbait: require('../assets/crankbait.png'),
  topwater_popper: require('../assets/topwater_popper.png'),
  jerkbait: require('../assets/jerkbait.png'),
  jig: require('../assets/jig.png'),
  swimbait: require('../assets/swimbait.png'),
  spoon: require('../assets/spoon.png'),
  buzzbait: require('../assets/buzzbait.png'),
  blade_bait: require('../assets/blade_bait.png'),
  frog_lure: require('../assets/frog_lure.png'),
  lipless_crankbait: require('../assets/lipless_crankbait.png'),
  tube_bait: require('../assets/tube_bait.png'),
  inline_spinner: require('../assets/inline_spinner.png'),
  chatterbait: require('../assets/chatterbait.png'),
  carolina_rig: require('../assets/carolina_rig.png'),
  drop_shot_rig: require('../assets/drop_shot_rig.png'),
  glide_bait: require('../assets/glide_bait.png'),
  crawfish_imitation: require('../assets/crawfish_imitation.png'),
  umbrella_rig: require('../assets/umbrella_rig.png'),
};

type ScreenPhase = 'catalog' | 'detail';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function HeaderButton({
  title,
  onPress,
  width = 82,
}: {
  title: string;
  onPress: () => void;
  width?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerButton,
        {
          width,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Text style={styles.headerButtonText}>{title}</Text>
    </Pressable>
  );
}

function Chip({ title }: { title: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{title}</Text>
    </View>
  );
}

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function CatalogActionButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.catalogActionButton,
        {
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <Text style={styles.catalogActionButtonText}>{title}</Text>
    </Pressable>
  );
}

export default function BaitsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmallH = height < 720;
  const isSmallW = width < 360;
  const isCompact = isSmallH || isSmallW;
  const isVerySmall = height < 700;

  const sidePadding = clamp(width * 0.05, 16, 24);
  const contentWidth = width - sidePadding * 2;
  const bottomNavSpace = 96 + insets.bottom;

  const heroRadius = 24;
  const cardRadius = 22;
  const listImageHeight = clamp(isCompact ? height * 0.16 : height * 0.18, 130, 190);
  const featuredImageHeight = clamp(isCompact ? height * 0.22 : height * 0.24, 180, 240);

  const detailTitleFont = isVerySmall ? 18 : 22;
  const detailCardTopGap = isVerySmall ? 10 : 14;
  const detailOuterBottomGap = isVerySmall ? 18 : 24;
  const detailAreaHeight = clamp(
    height - insets.top - bottomNavSpace - (isVerySmall ? 162 : 176),
    isVerySmall ? 300 : 340,
    isVerySmall ? 470 : 560,
  );
  const detailImageHeight = clamp(
    isVerySmall ? detailAreaHeight * 0.22 : detailAreaHeight * 0.28,
    isVerySmall ? 110 : 135,
    isVerySmall ? 145 : 180,
  );

  const [phase, setPhase] = useState<ScreenPhase>('catalog');
  const [selectedBaitId, setSelectedBaitId] = useState<BaitId>(BAITS[0]?.id);

  const transition = useRef(new Animated.Value(1)).current;

  const animatePhaseSwap = useCallback(() => {
    transition.stopAnimation();
    transition.setValue(0);
    Animated.timing(transition, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [transition]);

  const containerOpacity = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const containerTranslateY = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const containerScale = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });

  const currentBait = useMemo(() => {
    return BAITS.find(item => item.id === selectedBaitId) ?? BAITS[0];
  }, [selectedBaitId]);

  const featuredBait = useMemo(() => BAITS[0], []);
  const otherBaits = useMemo(() => BAITS.slice(1), []);

  const openBait = useCallback(
    (id: BaitId) => {
      setSelectedBaitId(id);
      setPhase('detail');
      animatePhaseSwap();
    },
    [animatePhaseSwap],
  );

  const handleBack = useCallback(() => {
    if (phase === 'detail') {
      setPhase('catalog');
      animatePhaseSwap();
      return;
    }
    navigation.goBack();
  }, [animatePhaseSwap, navigation, phase]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${currentBait.title}\n\n${currentBait.description}\n\nWhy it works: ${currentBait.whyItWorks}`,
      });
    } catch (error) {}
  }, [currentBait]);

  const handleRandomPick = useCallback(() => {
    if (!BAITS.length) return;
    const randomIndex = Math.floor(Math.random() * BAITS.length);
    openBait(BAITS[randomIndex].id);
  }, [openBait]);

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.background} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.overlayPrimary} pointerEvents="none" />
      <View style={styles.overlaySecondary} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View
          style={[
            styles.screen,
            {
              paddingHorizontal: sidePadding,
              paddingTop: insets.top + 6,
            },
          ]}
        >


          <Animated.View
            style={{
              flex: 1,
              opacity: containerOpacity,
              transform: [{ translateY: containerTranslateY }, { scale: containerScale }],
            }}
          >
            {phase === 'catalog' ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: bottomNavSpace + 14 }}
              >
                <View
                  style={[
                    styles.heroCard,
                    {
                      width: contentWidth,
                      borderRadius: heroRadius,
                      paddingHorizontal: isCompact ? 16 : 20,
                      paddingVertical: isCompact ? 16 : 20,
                    },
                  ]}
                >
                  <View style={styles.heroGlow} />

                  <Text style={styles.heroEyebrow}>Bait Reference</Text>
                  <Text style={[styles.heroTitle, { fontSize: isCompact ? 24 : 28 }]}>
                    Lure Catalog
                  </Text>
                  <Text
                    style={[
                      styles.heroSubtitle,
                      {
                        fontSize: isCompact ? 12.5 : 13.5,
                        lineHeight: isCompact ? 18 : 20,
                      },
                    ]}
                  >
                    Explore different lure styles, compare their strengths, and open a detailed
                    view for quick practical reading.
                  </Text>

                  <View style={styles.heroChipsRow}>
                    <Chip title={`${BAITS.length} entries`} />
                    <Chip title="Quick reference" />
                    <Chip title="Visual catalog" />
                  </View>
                </View>

                {featuredBait ? (
                  <Pressable
                    onPress={() => openBait(featuredBait.id)}
                    style={({ pressed }) => [
                      styles.featuredCard,
                      {
                        width: contentWidth,
                        borderRadius: cardRadius,
                        marginTop: 18,
                        opacity: pressed ? 0.93 : 1,
                        transform: [{ scale: pressed ? 0.992 : 1 }],
                      },
                    ]}
                  >
                    <View style={[styles.featuredImageWrap, { height: featuredImageHeight }]}>
                      <Image
                        source={BAIT_IMAGES[featuredBait.imageKey]}
                        style={styles.imageFull}
                        resizeMode="cover"
                      />
                      <View style={styles.featuredImageOverlay} />
                    </View>

                    <View style={styles.featuredBody}>
                      <Text style={styles.featuredTag}>Featured Pick</Text>
                      <Text style={styles.featuredTitle}>{featuredBait.title}</Text>
                      <Text style={styles.featuredPreview} numberOfLines={3}>
                        {featuredBait.description}
                      </Text>

                      <View style={styles.featuredFooterRow}>
                        <Chip title={featuredBait.bestFor} />
                        <View style={styles.openIndicator}>
                          <Text style={styles.openIndicatorText}>Open</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ) : null}

                <View style={[styles.catalogToolsCard, { width: contentWidth }]}>
                  <View style={styles.catalogToolsTextWrap}>
                    <Text style={styles.catalogToolsTitle}>Need a quick suggestion?</Text>
                    <Text style={styles.catalogToolsSubtitle}>
                      Open a random lure profile and browse ideas in a less predictable way.
                    </Text>
                  </View>

                  <CatalogActionButton title="PICK RANDOM" onPress={handleRandomPick} />
                </View>

                <View style={[styles.catalogSectionHeader, { width: contentWidth }]}>
                  <Text style={styles.catalogSectionTitle}>All Entries</Text>
                  <View style={styles.catalogSectionCount}>
                    <Text style={styles.catalogSectionCountText}>{BAITS.length}</Text>
                  </View>
                </View>

                {otherBaits.map((bait, index) => (
                  <Pressable
                    key={bait.id}
                    onPress={() => openBait(bait.id)}
                    style={({ pressed }) => [
                      styles.catalogItemCard,
                      {
                        width: contentWidth,
                        borderRadius: cardRadius,
                        opacity: pressed ? 0.94 : 1,
                        transform: [{ scale: pressed ? 0.992 : 1 }],
                      },
                    ]}
                  >
                    <View style={[styles.catalogItemImageWrap, { height: listImageHeight }]}>
                      <Image
                        source={BAIT_IMAGES[bait.imageKey]}
                        style={styles.imageFull}
                        resizeMode="cover"
                      />
                    </View>

                    <View style={styles.catalogItemBody}>
                      <View style={styles.catalogItemTopRow}>
                        <Text style={styles.catalogItemIndex}>
                          {String(index + 2).padStart(2, '0')}
                        </Text>
                        <View style={styles.catalogItemDivider} />
                        <Text style={styles.catalogItemTitle} numberOfLines={1}>
                          {bait.title}
                        </Text>
                      </View>

                      <Text style={styles.catalogItemSubtitle} numberOfLines={2}>
                        {bait.bestFor}
                      </Text>

                      <View style={styles.catalogMetaRow}>
                        <Chip title={bait.depth} />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-start',
                  paddingBottom: bottomNavSpace + detailOuterBottomGap,
                }}
              >
                <View style={[styles.detailHeadingWrap, { marginBottom: detailCardTopGap }]}>
                  <Text style={styles.detailEyebrow}>Lure Profile</Text>
                  <Text style={[styles.detailTitle, { fontSize: detailTitleFont }]}>
                    {currentBait.title}
                  </Text>
                </View>

                <View
                  style={[
                    styles.detailShell,
                    {
                      borderRadius: 26,
                      width: contentWidth,
                      alignSelf: 'center',
                      height: detailAreaHeight,
                    },
                  ]}
                >
                  <View style={[styles.detailImageWrap, { height: detailImageHeight }]}>
                    <Image
                      source={BAIT_IMAGES[currentBait.imageKey]}
                      style={styles.detailImage}
                      resizeMode="cover"
                    />
                    <View style={styles.detailImageShade} />
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingHorizontal: isVerySmall ? 14 : 16,
                      paddingTop: isVerySmall ? 12 : 16,
                      paddingBottom: isVerySmall ? 24 : 28,
                    }}
                  >
                    <View style={styles.detailQuickInfoGrid}>
                      <View style={[styles.detailInfoCard, isVerySmall && styles.detailInfoCardCompact]}>
                        <SectionLabel title="Best For" />
                        <Text style={[styles.detailInfoValue, isVerySmall && styles.detailInfoValueCompact]}>
                          {currentBait.bestFor}
                        </Text>
                      </View>

                      <View style={[styles.detailInfoCard, isVerySmall && styles.detailInfoCardCompact]}>
                        <SectionLabel title="Depth" />
                        <Text style={[styles.detailInfoValue, isVerySmall && styles.detailInfoValueCompact]}>
                          {currentBait.depth}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.contentBlock, isVerySmall && styles.contentBlockCompact]}>
                      <Text style={[styles.contentBlockTitle, isVerySmall && styles.contentBlockTitleCompact]}>
                        Overview
                      </Text>
                      <Text style={[styles.contentBlockText, isVerySmall && styles.contentBlockTextCompact]}>
                        {currentBait.description}
                      </Text>
                    </View>

                    <View style={[styles.contentBlock, isVerySmall && styles.contentBlockCompact]}>
                      <Text style={[styles.contentBlockTitle, isVerySmall && styles.contentBlockTitleCompact]}>
                        Why It Works
                      </Text>
                      <Text style={[styles.contentBlockText, isVerySmall && styles.contentBlockTextCompact]}>
                        {currentBait.whyItWorks}
                      </Text>
                    </View>

                    <View style={[styles.tipCard, isVerySmall && styles.tipCardCompact]}>
                      <Text style={[styles.tipCardTitle, isVerySmall && styles.tipCardTitleCompact]}>
                        Field Note
                      </Text>
                      <Text style={[styles.tipCardText, isVerySmall && styles.tipCardTextCompact]}>
                        {currentBait.proTip}
                      </Text>
                    </View>
                  </ScrollView>
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
  background: {
    flex: 1,
    backgroundColor: '#02060C',
  },

  safeArea: {
    flex: 1,
  },

  screen: {
    flex: 1,
  },

  overlayPrimary: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },

  overlaySecondary: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,16,32,0.22)',
  },

  headerRow: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  headerButton: {
    height: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(8, 34, 66, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  heroCard: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.18)',
    backgroundColor: 'rgba(8, 23, 43, 0.76)',
  },

  heroGlow: {
    position: 'absolute',
    top: -22,
    right: -12,
    width: 130,
    height: 130,
    borderRadius: 999,
    backgroundColor: 'rgba(65, 136, 255, 0.12)',
  },

  heroEyebrow: {
    color: '#98C7FF',
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginBottom: 8,
  },

  heroSubtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontWeight: '600',
  },

  heroChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },

  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginRight: 8,
    marginBottom: 8,
  },

  chipText: {
    color: '#EAF3FF',
    fontSize: 11,
    fontWeight: '700',
  },

  featuredCard: {
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1.4,
    borderColor: 'rgba(74, 151, 255, 0.36)',
  },

  featuredImageWrap: {
    width: '100%',
    backgroundColor: '#0B1017',
  },

  featuredImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },

  imageFull: {
    width: '100%',
    height: '100%',
  },

  featuredBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  featuredTag: {
    color: '#7DB7FF',
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },

  featuredPreview: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    marginTop: 8,
  },

  featuredFooterRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  openIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(33, 104, 218, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(95, 161, 255, 0.24)',
  },

  openIndicatorText: {
    color: '#DDEEFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  catalogToolsCard: {
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 15, 28, 0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  catalogToolsTextWrap: {
    marginBottom: 14,
  },

  catalogToolsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  catalogToolsSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '600',
    marginTop: 6,
  },

  catalogActionButton: {
    height: 50,
    borderRadius: 999,
    backgroundColor: '#0A5CC5',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  catalogActionButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 1,
  },

  catalogSectionHeader: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  catalogSectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  catalogSectionCount: {
    minWidth: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  catalogSectionCountText: {
    color: '#DDEEFF',
    fontSize: 12,
    fontWeight: '800',
  },

  catalogItemCard: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.54)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    marginBottom: 16,
  },

  catalogItemImageWrap: {
    width: '100%',
    backgroundColor: '#0B1017',
  },

  catalogItemBody: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  catalogItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  catalogItemIndex: {
    color: '#8EC2FF',
    fontSize: 12,
    fontWeight: '900',
    width: 24,
  },

  catalogItemDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginRight: 10,
  },

  catalogItemTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  catalogItemSubtitle: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 9,
  },

  catalogMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },

  detailHeadingWrap: {
    alignItems: 'center',
  },

  detailEyebrow: {
    color: '#8EC2FF',
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },

  detailTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
  },

  detailShell: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderWidth: 1.2,
    borderColor: 'rgba(67, 143, 248, 0.34)',
  },

  detailImageWrap: {
    width: '100%',
    backgroundColor: '#0B1017',
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailImage: {
    width: '100%',
    height: '100%',
  },

  detailImageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },

  detailQuickInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },

  detailInfoCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  detailInfoCardCompact: {
    padding: 12,
  },

  sectionLabel: {
    color: 'rgba(255,255,255,0.44)',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },

  detailInfoValue: {
    color: '#6CB7FF',
    fontSize: 15,
    fontWeight: '900',
  },

  detailInfoValueCompact: {
    fontSize: 13,
  },

  contentBlock: {
    marginBottom: 20,
  },

  contentBlockCompact: {
    marginBottom: 16,
  },

  contentBlockTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },

  contentBlockTitleCompact: {
    fontSize: 15,
    marginBottom: 6,
  },

  contentBlockText: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
  },

  contentBlockTextCompact: {
    fontSize: 13,
    lineHeight: 19,
  },

  tipCard: {
    marginTop: 2,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(10,92,197,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(77, 171, 255, 0.22)',
  },

  tipCardCompact: {
    padding: 14,
    borderRadius: 16,
  },

  tipCardTitle: {
    color: '#73B7FF',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  tipCardTitleCompact: {
    fontSize: 11.5,
    marginBottom: 6,
  },

  tipCardText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },

  tipCardTextCompact: {
    fontSize: 13,
    lineHeight: 19,
  },
});