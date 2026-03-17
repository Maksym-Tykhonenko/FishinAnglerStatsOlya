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
  Share,
  Animated,
  Easing,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = require('../assets/bg_raund.png');
const AVATAR = require('../assets/angleres.png');

type Mode = 'week' | 'month';

type CatchItem = {
  id: string;
  fish: string;
  water: string;
  timeLabel: string;
  dateLabel: string;
  ts: number;
};

const STORAGE_KEY = 'catches_v2';
const DAY = 24 * 60 * 60 * 1000;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfWeekMonday(ts: number) {
  const d = new Date(ts);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function addDays(ts: number, days: number) {
  return ts + days * DAY;
}

function formatShortDay(ts: number) {
  return new Date(ts).toLocaleDateString([], { weekday: 'short' });
}

function formatShortDate(ts: number) {
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatWeekLabel(weekStartTs: number) {
  const a = formatShortDate(weekStartTs);
  const b = formatShortDate(addDays(weekStartTs, 6));
  return `${a}–${b}`;
}

function sameMonth(ts: number, year: number, monthIndex: number) {
  const d = new Date(ts);
  return d.getFullYear() === year && d.getMonth() === monthIndex;
}

function monthWeekStarts(nowTs: number) {
  const now = new Date(nowTs);
  const y = now.getFullYear();
  const m = now.getMonth();

  const firstDay = new Date(y, m, 1).getTime();
  const lastDay = new Date(y, m + 1, 0).getTime();

  let w = startOfWeekMonday(firstDay);
  const out: number[] = [];

  while (w <= lastDay) {
    out.push(w);
    w = addDays(w, 7);
  }

  return { year: y, monthIndex: m, weekStarts: out };
}

function topByKey(list: CatchItem[], key: 'fish' | 'water') {
  const m = new Map<string, number>();

  for (const item of list) {
    const value = (item[key] || '').trim();
    if (!value) continue;
    m.set(value, (m.get(value) ?? 0) + 1);
  }

  let best = '';
  let bestN = 0;

  for (const [k, n] of m.entries()) {
    if (n > bestN) {
      best = k;
      bestN = n;
    }
  }

  return bestN > 0 ? { label: best, count: bestN } : null;
}

function BackPill({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.backBtn,
        {
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Text style={styles.backIcon}>↩</Text>
    </Pressable>
  );
}

function InsightChip({ title }: { title: string }) {
  return (
    <View style={styles.insightChip}>
      <Text style={styles.insightChipText}>{title}</Text>
    </View>
  );
}

function SegmentPill({
  mode,
  onChange,
  width,
  height,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  width: number;
  height: number;
}) {
  const knobX = useRef(new Animated.Value(mode === 'week' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(knobX, {
      toValue: mode === 'week' ? 0 : 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [knobX, mode]);

  const pad = 3;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const halfW = innerW / 2;

  const translateX = knobX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, halfW],
  });

  return (
    <View style={[styles.segmentWrap, { width, height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.segmentKnob,
          {
            width: halfW,
            height: innerH,
            borderRadius: innerH / 2,
            left: pad,
            top: pad,
            transform: [{ translateX }],
          },
        ]}
      />
      <Pressable style={styles.segmentHalf} onPress={() => onChange('week')}>
        <Text style={[styles.segmentText, mode === 'week' ? styles.segmentTextOn : styles.segmentTextOff]}>
          Week
        </Text>
      </Pressable>
      <Pressable style={styles.segmentHalf} onPress={() => onChange('month')}>
        <Text style={[styles.segmentText, mode === 'month' ? styles.segmentTextOn : styles.segmentTextOff]}>
          Month
        </Text>
      </Pressable>
    </View>
  );
}

function Bars({
  values,
  labels,
  width,
  height,
}: {
  values: number[];
  labels: string[];
  width: number;
  height: number;
}) {
  const max = Math.max(...values, 1);
  const gap = clamp(Math.round(width * 0.03), 10, 14);
  const barW = Math.floor((width - gap * (values.length - 1)) / values.length);

  return (
    <View style={{ width }}>
      <View style={{ width, height, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
        {values.map((value, index) => {
          const barH = Math.round((value / max) * height);

          return (
            <View
              key={String(index)}
              style={{
                width: barW,
                marginRight: index === values.length - 1 ? 0 : gap,
              }}
            >
              <Text style={styles.barNum}>{value}</Text>
              <View style={[styles.bar, { height: Math.max(8, barH), borderRadius: 8 }]} />
            </View>
          );
        })}
      </View>

      <View style={{ height: 10 }} />

      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {labels.map((label, index) => (
          <View
            key={`${label}-${index}`}
            style={{
              width: barW,
              marginRight: index === labels.length - 1 ? 0 : gap,
              alignItems: 'center',
            }}
          >
            <Text style={styles.barLabel} numberOfLines={1}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SummaryTile({
  title,
  value,
  subtitle,
  width,
}: {
  title: string;
  value: string;
  subtitle?: string;
  width: number;
}) {
  return (
    <View style={[styles.summaryTile, { width }]}>
      <Text style={styles.summaryTileTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.summaryTileValue} numberOfLines={1}>
        {value}
      </Text>
      {subtitle ? (
        <Text style={styles.summaryTileSub} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function WideInsightCard({
  title,
  value,
  subtitle,
  width,
}: {
  title: string;
  value: string;
  subtitle?: string;
  width: number;
}) {
  return (
    <View style={[styles.wideInsightCard, { width }]}>
      <Text style={styles.wideInsightTitle}>{title}</Text>
      <Text style={styles.wideInsightValue} numberOfLines={1}>
        {value}
      </Text>
      {subtitle ? (
        <Text style={styles.wideInsightSub} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export default function StatsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isTiny = height < 680 || width < 350;
  const isSmall = height < 740 || width < 380;

  const padX = clamp(Math.round(width * (isTiny ? 0.05 : isSmall ? 0.06 : 0.065)), 14, 28);

  const [mode, setMode] = useState<Mode>('week');
  const [items, setItems] = useState<CatchItem[]>([]);

  const segW = clamp(Math.round(width * (isTiny ? 0.86 : isSmall ? 0.78 : 0.74)), 260, 360);
  const segH = clamp(Math.round(height * 0.06), 44, 52);

  const chartW = clamp(Math.round(width * (isTiny ? 0.92 : isSmall ? 0.88 : 0.82)), 280, 400);
  const chartH = clamp(Math.round(height * (isTiny ? 0.16 : isSmall ? 0.17 : 0.18)), 110, 160);

  const heroW = width - padX * 2;
  const btnH = clamp(Math.round(height * (isTiny ? 0.06 : 0.065)), 44, 58);
  const btnW = clamp(Math.round(width * (isTiny ? 0.92 : isSmall ? 0.78 : 0.72)), 260, 380);

  const avatarW = clamp(width * (isTiny ? 0.58 : isSmall ? 0.50 : 0.44), 170, 270);
  const avatarH = clamp(height * (isTiny ? 0.23 : isSmall ? 0.25 : 0.27), 170, 250);

  const summaryW = clamp(Math.round(chartW * 0.49), 130, 210);

  const swap = useRef(new Animated.Value(1)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  const runSwap = useCallback(() => {
    swap.setValue(0);
    Animated.timing(swap, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [swap]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => {
      glowPulse.stopAnimation();
    };
  }, [glowPulse]);

  const opacity = swap.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = swap.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  const heroGlowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.10, 0.20],
  });

  const heroGlowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);

      if (!raw) {
        setItems([]);
        return;
      }

      const parsed = JSON.parse(raw) as unknown;

      if (!Array.isArray(parsed)) {
        setItems([]);
        return;
      }

      const cleaned: CatchItem[] = parsed
        .map((x: any) => ({
          id: String(x?.id ?? ''),
          fish: String(x?.fish ?? ''),
          water: String(x?.water ?? ''),
          timeLabel: String(x?.timeLabel ?? ''),
          dateLabel: String(x?.dateLabel ?? ''),
          ts: Number(x?.ts ?? 0),
        }))
        .filter((x) => x.id && Number.isFinite(x.ts) && x.ts > 0);

      cleaned.sort((a, b) => b.ts - a.ts);
      setItems(cleaned);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
    const unsub = navigation?.addListener?.('focus', () => load());
    return unsub;
  }, [load, navigation]);

  const onToggle = useCallback(
    (nextMode: Mode) => {
      if (nextMode === mode) return;
      setMode(nextMode);
      runSwap();
    },
    [mode, runSwap],
  );

  const hasData = items.length > 0;
  const nowTs = Date.now();

  const weekData = useMemo(() => {
    const weekStart = startOfWeekMonday(nowTs);
    const labels = new Array(7).fill('').map((_, i) => formatShortDay(addDays(weekStart, i)));
    const values = new Array(7).fill(0);

    for (const item of items) {
      const d0 = startOfDay(item.ts);
      const diff = Math.floor((d0 - weekStart) / DAY);
      if (diff >= 0 && diff < 7) values[diff] += 1;
    }

    return {
      values,
      labels,
      rangeLabel: formatWeekLabel(weekStart),
    };
  }, [items, nowTs]);

  const monthData = useMemo(() => {
    const { year, monthIndex, weekStarts } = monthWeekStarts(nowTs);
    const values = new Array(weekStarts.length).fill(0);
    const labels = weekStarts.map((ws) => formatShortDate(ws));

    for (const item of items) {
      if (!sameMonth(item.ts, year, monthIndex)) continue;
      const ws = startOfWeekMonday(item.ts);
      const idx = weekStarts.findIndex((x) => x === ws);
      if (idx >= 0) values[idx] += 1;
    }

    let bestIdx = 0;
    let bestVal = -1;

    for (let i = 0; i < values.length; i++) {
      if (values[i] > bestVal) {
        bestVal = values[i];
        bestIdx = i;
      }
    }

    const bestLabel = weekStarts[bestIdx] ? formatWeekLabel(weekStarts[bestIdx]) : '—';

    return {
      values,
      labels,
      bestText: bestVal > 0 ? `${bestLabel} (${bestVal})` : '—',
    };
  }, [items, nowTs]);

  const values = mode === 'week' ? weekData.values : monthData.values;
  const labels = mode === 'week' ? weekData.labels : monthData.labels;

  const totalAll = items.length;
  const totalInView = values.reduce((a, b) => a + b, 0);

  const topFish = useMemo(() => topByKey(items, 'fish'), [items]);
  const topWater = useMemo(() => topByKey(items, 'water'), [items]);

  const bestText = useMemo(() => {
    if (mode === 'week') {
      let bestIndex = 0;
      let bestValue = -1;

      for (let i = 0; i < weekData.values.length; i++) {
        if (weekData.values[i] > bestValue) {
          bestValue = weekData.values[i];
          bestIndex = i;
        }
      }

      const value = Math.max(bestValue, 0);
      const label = weekData.labels[bestIndex] || '—';
      return value > 0 ? `${label} (${value})` : '—';
    }

    return monthData.bestText;
  }, [mode, monthData.bestText, weekData.labels, weekData.values]);

  const onShare = useCallback(async () => {
    try {
      const title = mode === 'week' ? `Week (${weekData.rangeLabel})` : 'Month';
      const lines = [
        'Fishing Angler Stats',
        title,
        `Total in view: ${totalInView}`,
        `All time: ${totalAll}`,
        topFish ? `Top fish: ${topFish.label} (${topFish.count})` : 'Top fish: —',
        topWater ? `Top water: ${topWater.label} (${topWater.count})` : 'Top water: —',
        mode === 'week' ? `Best day: ${bestText}` : `Best week: ${bestText}`,
      ];

      await Share.share({ message: lines.join('\n') });
    } catch {}
  }, [bestText, mode, topFish, topWater, totalAll, totalInView, weekData.rangeLabel]);

  const strongestLabel = mode === 'week' ? weekData.rangeLabel : 'Current month';
  const dominantFish = topFish ? `${topFish.label} (${topFish.count})` : '—';
  const dominantWater = topWater ? `${topWater.label} (${topWater.count})` : '—';

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.dim} pointerEvents="none" />

      <SafeAreaView style={styles.safe}>
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 8,
            paddingHorizontal: padX,
          }}
        >
          <View style={styles.headerRow}>
            <BackPill onPress={() => navigation.goBack()} />
            <View style={{ width: 68 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 18 + insets.bottom }}
          >
            <View style={{ alignItems: 'center', marginTop: isSmall ? 4 : 8 }}>
              <SegmentPill mode={mode} onChange={onToggle} width={segW} height={segH} />
            </View>

            <Animated.View
              style={{
                opacity,
                transform: [{ translateY }],
                alignItems: 'center',
              }}
            >
              {!hasData ? (
                <>
                  <View
                    style={[
                      styles.emptyHero,
                      {
                        width: heroW,
                        borderRadius: 28,
                        paddingHorizontal: isSmall ? 16 : 18,
                        paddingVertical: isSmall ? 18 : 20,
                        marginTop: isSmall ? 18 : 22,
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

                    <Text style={styles.heroEyebrow}>Statistics</Text>
                    <Text style={[styles.heroTitle, { fontSize: isSmall ? 22 : 24 }]}>
                      Your activity view
                    </Text>
                    <Text
                      style={[
                        styles.heroText,
                        {
                          fontSize: isSmall ? 12.8 : 13.5,
                          lineHeight: isSmall ? 18 : 20,
                        },
                      ]}
                    >
                      Add catches in your journal to unlock weekly and monthly insights.
                    </Text>

                    <View style={styles.heroChipRow}>
                      <InsightChip title="Weekly view" />
                      <InsightChip title="Monthly view" />
                      <InsightChip title="Simple summaries" />
                    </View>

                    <View style={styles.emptyAvatarWrap}>
                      <Image source={AVATAR} style={{ width: avatarW, height: avatarH }} resizeMode="contain" />
                    </View>

                    <Text style={styles.emptyHint}>
                      Start logging catches to see charts, highlights, and trends.
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View
                    style={[
                      styles.heroCard,
                      {
                        width: heroW,
                        borderRadius: 28,
                        paddingHorizontal: isSmall ? 16 : 18,
                        paddingVertical: isSmall ? 18 : 20,
                        marginTop: isSmall ? 18 : 22,
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

                    <Text style={styles.heroEyebrow}>Analytics</Text>
                    <Text style={[styles.heroTitle, { fontSize: isSmall ? 22 : 24 }]}>
                      Catch Overview
                    </Text>
                    <Text
                      style={[
                        styles.heroText,
                        {
                          fontSize: isSmall ? 12.8 : 13.5,
                          lineHeight: isSmall ? 18 : 20,
                        },
                      ]}
                    >
                      Review your recent results and notice which fish, water types, and periods stand out most.
                    </Text>

                    <View style={styles.heroChipRow}>
                      <InsightChip title={mode === 'week' ? 'Week focus' : 'Month focus'} />
                      <InsightChip title={`${totalInView} in view`} />
                      <InsightChip title={`${totalAll} total`} />
                    </View>
                  </View>

                  <View style={[styles.sectionHeader, { width: chartW, marginTop: 18 }]}>
                    <Text style={styles.sectionTitle}>Activity chart</Text>
                    <Text style={styles.sectionHint}>{strongestLabel}</Text>
                  </View>

                  <View style={[styles.chartCard, { width: chartW, borderRadius: 24 }]}>
                    <Bars values={values} labels={labels} width={chartW - 28} height={chartH} />
                  </View>

                  <View style={[styles.sectionHeader, { width: chartW, marginTop: 16 }]}>
                    <Text style={styles.sectionTitle}>Highlights</Text>
                    <Text style={styles.sectionHint}>Current insights</Text>
                  </View>

                  <View style={{ width: chartW, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <SummaryTile
                      title="In View"
                      value={String(totalInView)}
                      subtitle={mode === 'week' ? 'Current week' : 'Current month'}
                      width={summaryW}
                    />
                    <SummaryTile
                      title="All Time"
                      value={String(totalAll)}
                      subtitle="Saved entries"
                      width={summaryW}
                    />
                  </View>

                  <View style={{ height: 10 }} />

                  <View style={{ width: chartW, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <SummaryTile
                      title="Top Fish"
                      value={topFish ? topFish.label : '—'}
                      subtitle={topFish ? `${topFish.count} entries` : 'No data'}
                      width={summaryW}
                    />
                    <SummaryTile
                      title="Top Water"
                      value={topWater ? topWater.label : '—'}
                      subtitle={topWater ? `${topWater.count} entries` : 'No data'}
                      width={summaryW}
                    />
                  </View>

                  <View style={{ height: 10 }} />

                  <WideInsightCard
                    title={mode === 'week' ? 'Best Day' : 'Best Week'}
                    value={bestText}
                    subtitle={
                      mode === 'week'
                        ? `Dominant fish: ${dominantFish}`
                        : `Preferred water: ${dominantWater}`
                    }
                    width={chartW}
                  />

                  <View style={{ marginTop: 18 }}>
                    <Pressable
                      onPress={onShare}
                      style={({ pressed }) => [
                        styles.primaryBtn,
                        {
                          width: btnW,
                          height: btnH,
                          borderRadius: btnH / 2,
                          opacity: pressed ? 0.92 : 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                        },
                      ]}
                    >
                      <Text style={styles.primaryBtnText}>Share Stats</Text>
                      <Text style={[styles.primaryBtnText, { fontSize: 18 }]}>↗</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </Animated.View>
          </ScrollView>
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
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backBtn: {
    width: 68,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(3,18,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    marginTop: Platform.OS === 'android' ? -2 : 0,
  },

  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(3,18,42,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },

  segmentKnob: {
    position: 'absolute',
    backgroundColor: 'rgba(10,92,197,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },

  segmentHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentText: {
    fontWeight: '900',
    fontSize: 13.5,
  },

  segmentTextOn: {
    color: '#FFFFFF',
  },

  segmentTextOff: {
    color: 'rgba(255,255,255,0.55)',
  },

  heroCard: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(94,154,255,0.18)',
    backgroundColor: 'rgba(8,23,42,0.74)',
  },

  emptyHero: {
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
    backgroundColor: 'rgba(72,135,255,0.16)',
  },

  heroEyebrow: {
    color: '#8EC2FF',
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 6,
  },

  heroText: {
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
    marginTop: 8,
  },

  heroChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },

  insightChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginRight: 8,
    marginBottom: 8,
  },

  insightChipText: {
    color: '#EAF3FF',
    fontSize: 11,
    fontWeight: '700',
  },

  emptyAvatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 10,
  },

  emptyHint: {
    color: 'rgba(255,255,255,0.64)',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  sectionHint: {
    color: 'rgba(255,255,255,0.54)',
    fontSize: 12,
    fontWeight: '700',
  },

  chartCard: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: 'rgba(0,0,0,0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  barNum: {
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 6,
  },

  bar: {
    backgroundColor: 'rgba(10,92,197,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },

  barLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '800',
    fontSize: 11,
  },

  summaryTile: {
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  summaryTileTitle: {
    color: 'rgba(255,255,255,0.58)',
    fontWeight: '800',
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  summaryTileValue: {
    marginTop: 7,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14.5,
  },

  summaryTileSub: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.54)',
    fontWeight: '600',
    fontSize: 11.5,
  },

  wideInsightCard: {
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    alignSelf: 'center',
  },

  wideInsightTitle: {
    color: 'rgba(255,255,255,0.58)',
    fontWeight: '800',
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  wideInsightValue: {
    marginTop: 7,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },

  wideInsightSub: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.54)',
    fontWeight: '600',
    fontSize: 11.8,
    lineHeight: 17,
  },

  primaryBtn: {
    backgroundColor: '#0A5CC5',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 18,
  },

  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
});