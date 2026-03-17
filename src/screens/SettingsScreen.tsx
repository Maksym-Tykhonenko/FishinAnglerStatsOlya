import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  StatusBar,
  Platform,
  useWindowDimensions,
  Animated,
  Easing,
  Share,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = require('../assets/bg_raund.png');

const KEY_VIBRATION = 'settings_vibration_v2';
const KEY_NOTIF = 'settings_notifications_v2';

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function HeaderPill({
  title,
  width = 84,
  compact = false,
}: {
  title: string;
  width?: number;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.headerPill,
        {
          width,
          height: compact ? 38 : 42,
        },
      ]}
    >
      <Text style={[styles.headerPillText, { fontSize: compact ? 12 : 13 }]}>{title}</Text>
    </View>
  );
}

function InfoChip({
  title,
  compact = false,
}: {
  title: string;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoChip,
        {
          paddingHorizontal: compact ? 8 : 10,
          paddingVertical: compact ? 5 : 7,
          marginRight: compact ? 6 : 8,
          marginBottom: compact ? 6 : 8,
        },
      ]}
    >
      <Text style={[styles.infoChipText, { fontSize: compact ? 10 : 11 }]}>{title}</Text>
    </View>
  );
}

function StatTile({
  value,
  label,
  compact = false,
}: {
  value: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.statTile,
        {
          borderRadius: compact ? 14 : 18,
          paddingVertical: compact ? 8 : 12,
          paddingHorizontal: compact ? 8 : 10,
        },
      ]}
    >
      <Text style={[styles.statTileValue, { fontSize: compact ? 13 : 15 }]}>{value}</Text>
      <Text style={[styles.statTileLabel, { fontSize: compact ? 10 : 11 }]}>{label}</Text>
    </View>
  );
}

function SettingsRow({
  title,
  subtitle,
  leftIcon,
  right,
  onPress,
  width,
  minHeight,
  isSmall,
  isTiny,
}: {
  title: string;
  subtitle?: string;
  leftIcon: string;
  right?: React.ReactNode;
  onPress?: () => void;
  width: number;
  minHeight: number;
  isSmall: boolean;
  isTiny: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.rowCard,
        {
          width,
          minHeight,
          borderRadius: isTiny ? 18 : 22,
          paddingHorizontal: isTiny ? 12 : isSmall ? 14 : 16,
          paddingVertical: isTiny ? 10 : isSmall ? 12 : 14,
          opacity: pressed ? 0.94 : 1,
          transform: [{ scale: pressed ? 0.994 : 1 }],
        },
      ]}
    >
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.iconBubble,
            {
              width: isTiny ? 36 : 42,
              height: isTiny ? 36 : 42,
              marginRight: isTiny ? 10 : 12,
            },
          ]}
        >
          <Text style={[styles.rowLeftIcon, { fontSize: isTiny ? 14 : isSmall ? 15 : 16 }]}>
            {leftIcon}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[styles.rowTitle, { fontSize: isTiny ? 12.5 : isSmall ? 13.5 : 14.5 }]}
            numberOfLines={1}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              style={[
                styles.rowSubtitle,
                {
                  fontSize: isTiny ? 10.5 : isSmall ? 11.5 : 12.2,
                  lineHeight: isTiny ? 14 : 17,
                  marginTop: isTiny ? 3 : 4,
                },
              ]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {right ? <View style={{ marginLeft: isTiny ? 8 : 12 }}>{right}</View> : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isTiny = height < 680 || width < 350;
  const isSmall = height < 740 || width < 390;

  const padX = clamp(Math.round(width * (isTiny ? 0.045 : isSmall ? 0.055 : 0.06)), 12, 24);
  const rowW = width - padX * 2;

  const rowMinH = clamp(
    Math.round(height * (isTiny ? 0.078 : isSmall ? 0.088 : 0.095)),
    60,
    86,
  );

  const gap = isTiny ? 8 : isSmall ? 10 : 14;
  const topGap = isTiny ? 8 : isSmall ? 12 : 18;

  const [vibrationOn, setVibrationOn] = useState(true);
  const [notifOn, setNotifOn] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  const runEnter = useCallback(() => {
    fade.setValue(0);
    translateY.setValue(14);
    glowPulse.setValue(0);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fade, glowPulse, translateY]);

  const load = useCallback(async () => {
    try {
      const vibration = await AsyncStorage.getItem(KEY_VIBRATION);
      const notification = await AsyncStorage.getItem(KEY_NOTIF);

      if (vibration != null) setVibrationOn(vibration === '1');
      if (notification != null) setNotifOn(notification === '1');
    } catch {}
  }, []);

  const saveVibration = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem(KEY_VIBRATION, value ? '1' : '0');
    } catch {}
  }, []);

  const saveNotification = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem(KEY_NOTIF, value ? '1' : '0');
    } catch {}
  }, []);

  useEffect(() => {
    runEnter();
    load();

    return () => {
      glowPulse.stopAnimation();
    };
  }, [glowPulse, load, runEnter]);

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message: 'Fishine Angler Stats',
      });
    } catch {}
  }, []);

  const switchScale = useMemo(() => {
    if (Platform.OS === 'ios') return isTiny ? 0.82 : isSmall ? 0.88 : 0.93;
    return isTiny ? 0.9 : isSmall ? 0.96 : 1;
  }, [isTiny, isSmall]);

  const enabledCount = useMemo(() => {
    return [vibrationOn, notifOn].filter(Boolean).length;
  }, [notifOn, vibrationOn]);

  const heroGlowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.10, 0.20],
  });

  const heroGlowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.dim} pointerEvents="none" />

      <SafeAreaView style={styles.safe}>
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 4,
            paddingHorizontal: padX,
            paddingBottom: Math.max(8, insets.bottom + 8),
          }}
        >
          <View style={[styles.headerRow, { height: isTiny ? 44 : 52 }]}>
            <HeaderPill title="Settings" width={isTiny ? 82 : 94} compact={isTiny} />
            <View style={{ width: isTiny ? 82 : 94 }} />
          </View>

          <Animated.View
            style={{
              flex: 1,
              opacity: fade,
              transform: [{ translateY }],
            }}
          >
            <View
              style={[
                styles.heroCard,
                {
                  width: rowW,
                  borderRadius: isTiny ? 20 : 26,
                  paddingHorizontal: isTiny ? 12 : isSmall ? 14 : 18,
                  paddingVertical: isTiny ? 12 : isSmall ? 14 : 18,
                  marginTop: topGap,
                },
              ]}
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.heroGlow,
                  {
                    opacity: heroGlowOpacity,
                    transform: [{ scale: heroGlowScale }],
                  },
                ]}
              />

              <Text style={[styles.heroEyebrow, { fontSize: isTiny ? 10.5 : 11.5 }]}>Preferences</Text>

              <Text style={[styles.heroTitle, { fontSize: isTiny ? 18 : isSmall ? 21 : 24 }]}>
                App Settings
              </Text>

              <Text
                style={[
                  styles.heroText,
                  {
                    fontSize: isTiny ? 11.5 : isSmall ? 12.6 : 13.5,
                    lineHeight: isTiny ? 16 : isSmall ? 18 : 20,
                    marginTop: isTiny ? 6 : 8,
                  },
                ]}
              >
                Manage a few simple preferences and keep your experience consistent across sessions.
              </Text>

              <View style={[styles.heroChipsRow, { marginTop: isTiny ? 10 : 14 }]}>
                <InfoChip title="Local storage" compact={isTiny} />
                <InfoChip title="Simple controls" compact={isTiny} />
                <InfoChip title="Quick access" compact={isTiny} />
              </View>

              <View style={[styles.statsRow, { gap: isTiny ? 6 : 10, marginTop: isTiny ? 10 : 14 }]}>
                <StatTile value="3" label="Actions" compact={isTiny} />
                <StatTile value={String(enabledCount)} label="Enabled" compact={isTiny} />
                <StatTile value="Saved" label="State" compact={isTiny} />
              </View>
            </View>

            <View style={[styles.sectionHeader, { marginTop: isTiny ? 10 : isSmall ? 14 : 18 }]}>
              <Text style={[styles.sectionTitle, { fontSize: isTiny ? 16 : 18 }]}>Preferences</Text>
              <Text style={[styles.sectionHint, { fontSize: isTiny ? 11 : 12 }]}>Update options</Text>
            </View>

            <SettingsRow
              title="Share App"
              subtitle="Send the app title through the native share sheet."
              leftIcon="🔗"
              width={rowW}
              minHeight={rowMinH}
              onPress={onShare}
              isSmall={isSmall}
              isTiny={isTiny}
            />

            <View style={{ height: gap }} />

            <SettingsRow
              title="Vibration"
              subtitle="Keep interaction vibration enabled while using the app."
              leftIcon="📳"
              width={rowW}
              minHeight={rowMinH}
              isSmall={isSmall}
              isTiny={isTiny}
              right={
                <View style={{ transform: [{ scale: switchScale }] }}>
                  <Switch
                    value={vibrationOn}
                    onValueChange={(value) => {
                      setVibrationOn(value);
                      saveVibration(value);
                    }}
                    trackColor={{
                      false: 'rgba(255,255,255,0.20)',
                      true: 'rgba(10,92,197,0.95)',
                    }}
                    thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                  />
                </View>
              }
            />

            <View style={{ height: gap }} />

            <SettingsRow
              title="Notifications"
              subtitle="Store your alert preference for future app sessions."
              leftIcon="🔔"
              width={rowW}
              minHeight={rowMinH}
              isSmall={isSmall}
              isTiny={isTiny}
              right={
                <View style={{ transform: [{ scale: switchScale }] }}>
                  <Switch
                    value={notifOn}
                    onValueChange={(value) => {
                      setNotifOn(value);
                      saveNotification(value);
                    }}
                    trackColor={{
                      false: 'rgba(255,255,255,0.20)',
                      true: 'rgba(10,92,197,0.95)',
                    }}
                    thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                  />
                </View>
              }
            />

            <View style={{ flex: 1 }} />
            <View style={{ height: Math.max(6, insets.bottom) }} />
          </Animated.View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(5,24,46,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerPillText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: Platform.OS === 'android' ? -1 : 0,
  },

  heroCard: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(94,154,255,0.18)',
    backgroundColor: 'rgba(8,23,42,0.74)',
  },

  heroGlow: {
    position: 'absolute',
    top: -16,
    right: -10,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(72,135,255,0.18)',
  },

  heroEyebrow: {
    color: '#8EC2FF',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 4,
  },

  heroText: {
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
  },

  heroChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  infoChip: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  infoChipText: {
    color: '#EAF3FF',
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
  },

  statTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statTileValue: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  statTileLabel: {
    color: 'rgba(255,255,255,0.56)',
    fontWeight: '700',
    marginTop: 3,
  },

  sectionHeader: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  sectionHint: {
    color: 'rgba(255,255,255,0.54)',
    fontWeight: '700',
  },

  rowCard: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },

  iconBubble: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  rowLeftIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: Platform.OS === 'android' ? -1 : 0,
  },

  rowTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  rowSubtitle: {
    color: 'rgba(255,255,255,0.64)',
    fontWeight: '600',
  },
});