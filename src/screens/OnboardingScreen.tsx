import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Animated,
  Pressable,
  useWindowDimensions,
  StatusBar,
  Platform,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const BG = require('../assets/bg_raund.png');

const ON1 = require('../assets/ord1.png');
const ON2 = require('../assets/ord2.png');
const ON3 = require('../assets/ord3.png');
const ON4 = require('../assets/ord4.png');

type Slide = {
  key: string;
  image: any;
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  tags: string[];
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function HeaderPill({
  title,
  onPress,
  width = 84,
}: {
  title: string;
  onPress: () => void;
  width?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerPill,
        {
          width,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Text style={styles.headerPillText}>{title}</Text>
    </Pressable>
  );
}

function MetaTag({ title }: { title: string }) {
  return (
    <View style={styles.metaTag}>
      <Text style={styles.metaTagText}>{title}</Text>
    </View>
  );
}

export default function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 720 || width < 360;
  const padX = clamp(Math.round(width * (isSmall ? 0.05 : 0.06)), 14, 26);

  const slides: Slide[] = useMemo(
    () => [
      {
        key: '1',
        image: ON1,
        eyebrow: 'Quick Start',
        title: 'Track Every Catch',
        desc:
          'Save fish details, session notes, and lure information in a cleaner and faster way.',
        cta: 'Continue',
        tags: ['Fast logging', 'Personal history'],
      },
      {
        key: '2',
        image: ON2,
        eyebrow: 'Personal View',
        title: 'See Your Fishing Patterns',
        desc:
          'Review your activity over time and notice which habits, sessions, and choices work best.',
        cta: 'Continue',
        tags: ['Trends', 'Session review'],
      },
      {
        key: '3',
        image: ON3,
        eyebrow: 'Guided Support',
        title: 'Smarter Lure Suggestions',
        desc:
          'Use your own data as a reference point for more confident lure choices and session planning.',
        cta: 'Continue',
        tags: ['Data-based', 'Lure focus'],
      },
      {
        key: '4',
        image: ON4,
        eyebrow: 'Stay Ready',
        title: 'Prepare for the Next Session',
        desc:
          'Keep your workflow simple, organized, and ready whenever you want to log or review activity.',
        cta: "Let's Start",
        tags: ['Organized flow', 'Ready anytime'],
      },
    ],
    [],
  );

  const [index, setIndex] = useState(0);
  const slide = slides[index];

  const transition = useRef(new Animated.Value(1)).current;
  const cardGlow = useRef(new Animated.Value(0)).current;

  const imageW = clamp(Math.round(width * (isSmall ? 0.74 : 0.78)), 230, 410);
  const imageH = Math.round(imageW * (isSmall ? 0.88 : 0.94));

  const cardW = width - padX * 2;
  const cardRadius = 26;
  const cardPad = clamp(Math.round(width * (isSmall ? 0.05 : 0.055)), 14, 22);

  const btnH = clamp(Math.round(height * (isSmall ? 0.052 : 0.056)), 44, 56);
  const btnW = clamp(Math.round(cardW * (isSmall ? 0.78 : 0.76)), 220, 330);

  const topPadding = Platform.OS === 'android' ? insets.top + 6 : insets.top + 4;
  const heroTopGap = isSmall ? 20 : 28;
  const imageTop = topPadding + 54 + heroTopGap;
  const imageBottom = imageTop + imageH;

  const bottomReserved = 26 + insets.bottom;
  const estimatedCardH = isSmall ? 300 : 332;
  const cardTop = Math.min(
    Math.round(imageBottom - 8),
    height - bottomReserved - estimatedCardH,
  );

  const progress = ((index + 1) / slides.length) * 100;
  const progressWidth = Math.max(14, ((cardW - 32) * progress) / 100);

  const runSwap = useCallback(
    (nextIndex: number) => {
      transition.stopAnimation();
      cardGlow.stopAnimation();

      Animated.timing(transition, {
        toValue: 0,
        duration: 170,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setIndex(nextIndex);

        transition.setValue(0);
        Animated.parallel([
          Animated.timing(transition, {
            toValue: 1,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(cardGlow, {
              toValue: 1,
              duration: 220,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(cardGlow, {
              toValue: 0,
              duration: 520,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    },
    [cardGlow, transition],
  );

  const onPressCTA = useCallback(() => {
    if (index < slides.length - 1) {
      runSwap(index + 1);
    } else {
      navigation.replace('MainTabs');
    }
  }, [index, navigation, runSwap, slides.length]);

  const onSkip = useCallback(() => {
    navigation.replace('MainTabs');
  }, [navigation]);

  const imageOpacity = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const imageTranslateY = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  const imageScale = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });

  const cardOpacity = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const cardTranslateY = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const cardGlowOpacity = cardGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.22],
  });

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.dim} pointerEvents="none" />

      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, paddingHorizontal: padX, paddingTop: topPadding }}>
          <View style={styles.headerRow}>
            <HeaderPill title={`Step ${index + 1}`} onPress={() => {}} width={86} />
            <HeaderPill title="Skip" onPress={onSkip} width={78} />
          </View>

          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          </View>

          <View style={{ alignItems: 'center', marginTop: heroTopGap }}>
            <Animated.Image
              source={slide.image}
              style={{
                width: imageW,
                height: imageH,
                opacity: imageOpacity,
                transform: [{ translateY: imageTranslateY }, { scale: imageScale }],
              }}
              resizeMode="contain"
            />
          </View>

          <View
            style={{
              position: 'absolute',
              left: padX,
              right: padX,
              top: cardTop,
            }}
          >
            <Animated.View
              style={[
                styles.card,
                {
                  width: cardW,
                  borderRadius: cardRadius,
                  paddingHorizontal: cardPad,
                  paddingTop: cardPad,
                  paddingBottom: cardPad + 6,
                  opacity: cardOpacity,
                  transform: [{ translateY: cardTranslateY }],
                },
              ]}
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.cardGlow,
                  {
                    opacity: cardGlowOpacity,
                  },
                ]}
              />

              <Text style={styles.eyebrow}>{slide.eyebrow}</Text>

              <Text
                style={[
                  styles.h1,
                  {
                    fontSize: isSmall ? 22 : 24,
                    lineHeight: isSmall ? 26 : 29,
                    marginTop: 6,
                  },
                ]}
              >
                {slide.title}
              </Text>

              <Text
                style={[
                  styles.p,
                  {
                    marginTop: isSmall ? 10 : 12,
                    fontSize: isSmall ? 13 : 14,
                    lineHeight: isSmall ? 18 : 20,
                  },
                ]}
              >
                {slide.desc}
              </Text>

              <View style={styles.tagsRow}>
                {slide.tags.map(tag => (
                  <MetaTag key={tag} title={tag} />
                ))}
              </View>

              <View style={styles.footerRow}>
                <View style={styles.dotsRow}>
                  {slides.map((item, i) => {
                    const active = i === index;
                    return (
                      <View
                        key={item.key}
                        style={[
                          styles.dot,
                          active && styles.dotActive,
                        ]}
                      />
                    );
                  })}
                </View>

                <Pressable
                  onPress={onPressCTA}
                  style={({ pressed }) => [
                    styles.btn,
                    {
                      height: btnH,
                      width: btnW,
                      borderRadius: btnH / 2,
                      opacity: pressed ? 0.92 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.btnText, { fontSize: isSmall ? 16 : 17 }]}>
                    {slide.cta}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#030913',
  },

  safe: {
    flex: 1,
  },

  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },

  headerRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerPill: {
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(5,24,46,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: Platform.OS === 'android' ? -1 : 0,
  },

  progressWrap: {
    marginTop: 12,
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0A5CC5',
  },

  card: {
    alignSelf: 'center',
    backgroundColor: 'rgba(4,16,38,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },

  cardGlow: {
    position: 'absolute',
    top: -18,
    right: -12,
    width: 130,
    height: 130,
    borderRadius: 999,
    backgroundColor: 'rgba(72,135,255,0.18)',
  },

  eyebrow: {
    color: '#8EC2FF',
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },

  h1: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
  },

  p: {
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
    textAlign: 'center',
  },

  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 14,
  },

  metaTag: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: 4,
    marginBottom: 8,
  },

  metaTagText: {
    color: '#EAF3FF',
    fontSize: 11,
    fontWeight: '700',
  },

  footerRow: {
    marginTop: 12,
    alignItems: 'center',
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginHorizontal: 4,
  },

  dotActive: {
    width: 20,
    backgroundColor: '#0A5CC5',
  },

  btn: {
    backgroundColor: '#0A5CC5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },

  btnText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
