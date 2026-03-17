import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
  StatusBar,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const BG = require('../assets/bg_raund.png');

const IC_LURE = require('../assets/ic_lure.png');
const IC_LOG = require('../assets/ic_log.png');
const IC_STATS = require('../assets/ic_stats.png');
const IC_STORIES = require('../assets/ic_stories.png');

const AVATAR = require('../assets/angleres.png');

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

const TIPS: string[] = [
  'Fish are more active during low light.',
  'Wind pushes baitfish — fish follow.',
  'Slow down your retrieve in cold water.',
  'Use natural colors in clear water.',
  'Use bright colors in murky water.',
  'Pause your lure — strikes happen then.',
  'Track your successful lure patterns.',
  'Fish often strike near structure edges.',
  'Change depth before changing spots.',
  'Data beats memory — log every catch.',
];

function pickRandomTip(except?: string) {
  if (TIPS.length <= 1) return TIPS[0] ?? '';

  let next = TIPS[Math.floor(Math.random() * TIPS.length)];

  if (except && TIPS.length > 1) {
    let guard = 0;
    while (next === except && guard < 12) {
      next = TIPS[Math.floor(Math.random() * TIPS.length)];
      guard += 1;
    }
  }

  return next;
}

type MenuItem = {
  key: string;
  title: string;
  subtitle: string;
  icon: any;
  onPress: () => void;
};

function HeaderPill({
  title,
  width = 72,
}: {
  title: string;
  width?: number;
}) {
  return (
    <View style={[styles.headerPill, { width }]}>
      <Text style={styles.headerPillText}>{title}</Text>
    </View>
  );
}

function MetaChip({ title }: { title: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipText}>{title}</Text>
    </View>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function MainMenuScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isTiny = height < 690 || width < 350;
  const isSmall = height < 760 || width < 390;

  const padX = clamp(Math.round(width * 0.042), 10, 20);
  const [tip, setTip] = useState<string>(() => pickRandomTip());

  const appear = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  const runEntrance = useCallback(() => {
    appear.stopAnimation();
    glowPulse.stopAnimation();

    appear.setValue(0);
    glowPulse.setValue(0);

    Animated.timing(appear, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [appear, glowPulse]);

  useFocusEffect(
    useCallback(() => {
      setTip((prev) => pickRandomTip(prev));
      runEntrance();

      return () => {
        glowPulse.stopAnimation();
      };
    }, [glowPulse, runEntrance]),
  );

  const contentW = width - padX * 2;

  const heroH = clamp(
    Math.round(height * (isTiny ? 0.165 : isSmall ? 0.18 : 0.19)),
    118,
    158,
  );

  const avatarW = clamp(Math.round(width * (isTiny ? 0.14 : 0.15)), 48, 76);
  const avatarH = clamp(Math.round(avatarW * 1.22), 62, 94);

  const shareH = clamp(Math.round(height * 0.036), 30, 36);
  const shareW = clamp(Math.round(contentW * 0.42), 118, 180);

  const navCardH = clamp(
    Math.round(height * (isTiny ? 0.062 : isSmall ? 0.067 : 0.07)),
    48,
    62,
  );

  const iconWrapSize = clamp(navCardH - 16, 30, 42);
  const iconSize = clamp(iconWrapSize - 12, 14, 22);

  const sectionGap = 2;
  const rowGap = 4;

  const heroTranslate = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  const listTranslate = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.06, 0.14],
  });

  const glowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.015],
  });

  const onShareTip = useCallback(async () => {
    try {
      await Share.share({
        message: `Pro Tip\n\n${tip}`,
      });
    } catch {}
  }, [tip]);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        key: 'lure',
        title: 'Lure Match',
        subtitle: 'Pick a lure',
        icon: IC_LURE,
        onPress: () => navigation.navigate('FindFishingLure'),
      },
      {
        key: 'log',
        title: 'Catch Journal',
        subtitle: 'Save catches',
        icon: IC_LOG,
        onPress: () => navigation.navigate('LogCatch'),
      },
      {
        key: 'stats',
        title: 'Stats Overview',
        subtitle: 'View patterns',
        icon: IC_STATS,
        onPress: () => navigation.navigate('Stats'),
      },
      {
        key: 'stories',
        title: 'Angler Notes',
        subtitle: 'Read stories',
        icon: IC_STORIES,
        onPress: () => navigation.navigate('AnglerStories'),
      },
      {
        key: 'map',
        title: 'Fishing Map',
        subtitle: 'Your spots',
        icon: IC_STATS,
        onPress: () => navigation.navigate('FishingMap'),
      },
    ],
    [navigation],
  );

  const renderMenuCard = useCallback(
    (item: MenuItem, index: number) => {
      const rowTranslate = appear.interpolate({
        inputRange: [0, 1],
        outputRange: [8 + index * 2, 0],
      });

      return (
        <Animated.View
          key={item.key}
          style={{
            opacity: appear,
            transform: [{ translateY: rowTranslate }],
            marginBottom: index === menuItems.length - 1 ? 0 : rowGap,
          }}
        >
          <Pressable
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.navCard,
              {
                height: navCardH,
                borderRadius: 16,
                paddingHorizontal: 10,
                opacity: pressed ? 0.94 : 1,
                transform: [{ scale: pressed ? 0.992 : 1 }],
              },
            ]}
          >
            <View style={styles.navLeft}>
              <View
                style={[
                  styles.iconPanel,
                  {
                    width: iconWrapSize,
                    height: iconWrapSize,
                    borderRadius: 10,
                  },
                ]}
              >
                <Image
                  source={item.icon}
                  style={{ width: iconSize, height: iconSize }}
                  resizeMode="contain"
                />
              </View>

              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.navTitle} numberOfLines={1}>
                  {item.title}
                </Text>

                <Text style={styles.navSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
            </View>

            <View style={styles.arrowBubble}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Pressable>
        </Animated.View>
      );
    },
    [appear, iconSize, iconWrapSize, menuItems.length, navCardH, rowGap],
  );

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.dim} pointerEvents="none" />

      <SafeAreaView style={styles.safe}>
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 2,
            paddingHorizontal: padX,
            paddingBottom: 4,
          }}
        >
          <View style={styles.headerRow}>
            <HeaderPill title="Menu" width={72} />
            <View style={{ width: 72 }} />
          </View>

          <View style={styles.mainContent}>
            <Animated.View
              style={{
                opacity: appear,
                transform: [{ translateY: heroTranslate }],
              }}
            >
              <View
                style={[
                  styles.heroCard,
                  {
                    width: contentW,
                    height: heroH,
                    borderRadius: 18,
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                  },
                ]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.heroGlow,
                    {
                      opacity: glowOpacity,
                      transform: [{ scale: glowScale }],
                    },
                  ]}
                />

                <View style={{ flex: 1, paddingRight: avatarW + 6 }}>
                  <Text style={styles.heroEyebrow}>FEATURED INSIGHT</Text>

                  <Text style={styles.heroTitle}>Daily Pro Tip</Text>

                  <Text style={styles.heroText} numberOfLines={2}>
                    {tip}
                  </Text>

                  <View style={styles.heroChipsRow}>
                    <MetaChip title="Quick" />
                    <MetaChip title="Share" />
                  </View>

                  <Pressable
                    onPress={onShareTip}
                    style={({ pressed }) => [
                      styles.heroButton,
                      {
                        width: shareW,
                        height: shareH,
                        borderRadius: shareH / 2,
                        marginTop: 4,
                        opacity: pressed ? 0.92 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.heroButtonText}>Share Tip</Text>
                    <Text style={styles.heroButtonIcon}>↗</Text>
                  </Pressable>
                </View>

                <Image
                  source={AVATAR}
                  style={{
                    position: 'absolute',
                    right: 2,
                    bottom: 0,
                    width: avatarW,
                    height: avatarH,
                  }}
                  resizeMode="contain"
                />
              </View>

              <View style={[styles.statsRow, { marginTop: sectionGap }]}>
                <StatCard value="5" label="Sections" />
                <StatCard value="1" label="Tip" />
                <StatCard value="Local" label="Style" />
              </View>
            </Animated.View>

            <Animated.View
              style={{
                marginTop: sectionGap,
                opacity: appear,
                transform: [{ translateY: listTranslate }],
                flexShrink: 1,
              }}
            >
              <View style={[styles.sectionHeader, { marginBottom: 2 }]}>
                <Text style={styles.sectionTitle}>Explore</Text>
                <Text style={styles.sectionHint}>Modules</Text>
              </View>

              <View style={styles.menuList}>
                {menuItems.map((item, index) => renderMenuCard(item, index))}
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
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },

  mainContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  headerPill: {
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(5,24,46,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: Platform.OS === 'android' ? -1 : 0,
  },

  heroCard: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(94,154,255,0.16)',
    backgroundColor: 'rgba(8,23,42,0.74)',
  },

  heroGlow: {
    position: 'absolute',
    top: -18,
    right: -10,
    width: 90,
    height: 90,
    borderRadius: 999,
    backgroundColor: 'rgba(72,135,255,0.18)',
  },

  heroEyebrow: {
    color: '#8EC2FF',
    fontSize: 8.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },

  heroText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10,
    lineHeight: 12.5,
    fontWeight: '600',
    marginTop: 3,
  },

  heroChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },

  metaChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginRight: 5,
    marginBottom: 3,
  },

  metaChipText: {
    color: '#EAF3FF',
    fontSize: 8.5,
    fontWeight: '700',
  },

  heroButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 8,
    backgroundColor: '#0A5CC5',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },

  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  heroButtonIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: Platform.OS === 'android' ? -1 : 0,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 4,
  },

  statCard: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  statLabel: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 8.5,
    fontWeight: '700',
    marginTop: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  sectionHint: {
    color: 'rgba(255,255,255,0.54)',
    fontSize: 10,
    fontWeight: '700',
  },

  menuList: {

  },

  navCard: {
    borderWidth: 1,
    borderColor: 'rgba(120,210,255,0.18)',
    backgroundColor: 'rgba(3,18,42,0.48)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 6,
  },

  iconPanel: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  navTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },

  navSubtitle: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 1,
    lineHeight: 11,
  },

  arrowBubble: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexShrink: 0,
  },

  chevron: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 15,
    fontWeight: '900',
    marginTop: Platform.OS === 'android' ? -2 : 0,
  },
});