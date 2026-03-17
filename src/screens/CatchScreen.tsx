import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  StatusBar,
  Platform,
  useWindowDimensions,
  FlatList,
  Alert,
  Animated,
  Easing,
  PanResponder,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';

const BG = require('../assets/bg_raund.png');
const AVATAR = require('../assets/angleres.png');

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export type CatchItem = {
  id: string;
  fish: string;
  water: string;
  timeLabel: string;
  dateLabel: string;
  ts: number;
  photo?: string;
  weight?: string;
  length?: string;
  latitude?: number;
  longitude?: number;
};

const STORAGE_KEY = 'catches_v2';

const FISH_OPTIONS = [
  'Largemouth Bass',
  'Smallmouth Bass',
  'Northern Pike',
  'Walleye',
  'Rainbow Trout',
  'Brown Trout',
  'Common Carp',
  'Channel Catfish',
  'Yellow Perch',
  'Atlantic Salmon',
];

const WATER_OPTIONS = ['River', 'Lake', 'Pond', 'Reservoir', 'Ocean'];

type Phase = 'journal' | 'form';

function uuid() {
  return `${Date.now()}-${Math.random()}`;
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatTimeLabelFromHM(h: number, m: number) {
  const hh = ((h + 11) % 12) + 1;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${hh}:${pad2(m)} ${ampm}`;
}

function buildAndroidTimeOptions(stepMinutes: number) {
  const out: { label: string; h: number; m: number }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      out.push({ label: formatTimeLabelFromHM(h, m), h, m });
    }
  }
  return out;
}

function buildAndroidDateOptions(daysForward: number) {
  const out: { label: string; date: Date }[] = [];
  const base = new Date();
  base.setHours(12, 0, 0, 0);

  for (let i = 0; i <= daysForward; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);

    let label = d.toLocaleDateString([], { month: 'long', day: 'numeric' });
    if (i === 0) label = `Today • ${label}`;
    if (i === 1) label = `Tomorrow • ${label}`;

    out.push({ label, date: d });
  }
  return out;
}

function HeaderPill({
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

function PrimaryButton({
  title,
  onPress,
  width,
  height,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  width: number;
  height: number;
  disabled?: boolean;
  style?: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          width,
          height,
          borderRadius: height / 2,
          opacity: disabled ? 0.55 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
        style,
      ]}
    >
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

function StatChip({ title, value, compact = false }: { title: string; value: string; compact?: boolean }) {
  return (
    <View
      style={[
        styles.statChip,
        {
          borderRadius: compact ? 12 : 16,
          paddingVertical: compact ? 8 : 12,
          paddingHorizontal: compact ? 8 : 10,
        },
      ]}
    >
      <Text style={[styles.statChipValue, { fontSize: compact ? 13 : 15 }]}>{value}</Text>
      <Text style={[styles.statChipTitle, { fontSize: compact ? 10 : 11 }]}>{title}</Text>
    </View>
  );
}

function MiniTag({ title }: { title: string }) {
  return (
    <View style={styles.miniTag}>
      <Text style={styles.miniTagText}>{title}</Text>
    </View>
  );
}

type SwipeRowProps = {
  item: CatchItem;
  rowW: number;
  rowH: number;
  onDeleteConfirmed: () => void;
  onPhotoPress: () => void;
};

function SwipeRow({ item, rowW, rowH, onDeleteConfirmed, onPhotoPress }: SwipeRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpenRef = useRef(false);

  const actionW = clamp(rowW * 0.22, 88, 112);
  const maxLeft = -actionW;
  const openThreshold = maxLeft * 0.55;

  const animateTo = useCallback(
    (toValue: number) => {
      Animated.timing(translateX, {
        toValue,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        isOpenRef.current = toValue !== 0;
      });
    },
    [translateX],
  );

  const close = useCallback(() => animateTo(0), [animateTo]);
  const open = useCallback(() => animateTo(maxLeft), [animateTo, maxLeft]);

  const confirmDelete = useCallback(() => {
    Alert.alert('Remove entry?', 'Do you want to delete this journal entry?', [
      { text: 'Cancel', style: 'cancel', onPress: () => close() },
      { text: 'Delete', style: 'destructive', onPress: onDeleteConfirmed },
    ]);
  }, [close, onDeleteConfirmed]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) => {
        const dx = Math.abs(gesture.dx);
        const dy = Math.abs(gesture.dy);
        return dx > 8 && dx > dy;
      },
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_evt, gesture) => {
        let next = gesture.dx;
        if (isOpenRef.current) next = maxLeft + gesture.dx;
        if (next > 0) next = next * 0.22;
        if (next < maxLeft) next = maxLeft;
        translateX.setValue(next);
      },
      onPanResponderRelease: (_evt, gesture) => {
        const finalX = isOpenRef.current ? maxLeft + gesture.dx : gesture.dx;
        if (finalX < openThreshold) open();
        else close();
      },
      onPanResponderTerminate: () => close(),
    }),
  ).current;

  return (
    <View style={{ width: rowW, height: rowH, marginBottom: 12 }}>
      <View style={[styles.rowDeleteBackground, { width: rowW, height: rowH, borderRadius: 18 }]}>
        <Pressable
          onPress={confirmDelete}
          style={({ pressed }) => [
            styles.rowDeleteButton,
            {
              width: actionW,
              height: rowH,
              borderTopRightRadius: 18,
              borderBottomRightRadius: 18,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text style={styles.rowDeleteText}>Delete</Text>
        </Pressable>
      </View>

      <Animated.View
        {...pan.panHandlers}
        style={[
          styles.rowCard,
          {
            width: rowW,
            height: rowH,
            borderRadius: 18,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.rowAccent} />

        {item.photo ? (
          <Pressable onPress={onPhotoPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <Image
              source={{ uri: item.photo }}
              style={[styles.rowThumb, { width: rowH - 16, height: rowH - 16 }]}
            />
          </Pressable>
        ) : null}

        <View style={{ flex: 1, overflow: 'hidden', paddingLeft: item.photo ? 10 : 6 }}>
          <Text style={styles.rowFish}>{item.fish}</Text>
          <View style={styles.rowBottomLine}>
            <MiniTag title={item.water} />
            {item.weight ? <MiniTag title={`${item.weight}kg`} /> : null}
            {item.length ? <MiniTag title={`${item.length}cm`} /> : null}
            {item.latitude ? <MiniTag title="📍" /> : null}
          </View>
        </View>

        <View style={styles.rowMeta}>
          <Text style={styles.rowTime}>{item.timeLabel}</Text>
          <Text style={styles.rowDate}>{item.dateLabel}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function PickerModal({
  visible,
  title,
  options,
  selected,
  onClose,
  onPick,
  maxW,
  isSmall,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected: string | null;
  onClose: () => void;
  onPick: (v: string) => void;
  maxW: number;
  isSmall: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalCard,
            {
              width: maxW,
              paddingVertical: isSmall ? 10 : 12,
              paddingHorizontal: isSmall ? 12 : 14,
              maxHeight: 520,
            },
          ]}
          onPress={() => {}}
        >
          <Text style={[styles.modalTitle, { fontSize: isSmall ? 13 : 14 }]}>{title}</Text>
          <View style={{ height: 10 }} />
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((opt) => {
              const active = selected === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => onPick(opt)}
                  style={({ pressed }) => [
                    styles.modalRow,
                    {
                      opacity: pressed ? 0.92 : 1,
                      backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.modalRowText, { fontSize: isSmall ? 12.5 : 13 }]}>{opt}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function IOSDatePickerModal({
  visible,
  title,
  mode,
  value,
  onClose,
  onPick,
  maxW,
  isSmall,
}: {
  visible: boolean;
  title: string;
  mode: 'date' | 'time';
  value: Date;
  onClose: () => void;
  onPick: (d: Date) => void;
  maxW: number;
  isSmall: boolean;
}) {
  const [temp, setTemp] = useState<Date>(value);

  useEffect(() => {
    if (visible) setTemp(value);
  }, [visible, value]);

  const onChange = useCallback((e: DateTimePickerEvent, d?: Date) => {
    if (e.type === 'dismissed') return;
    if (d) setTemp(d);
  }, []);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.pickerCard,
            {
              width: maxW,
              paddingVertical: isSmall ? 10 : 12,
              paddingHorizontal: isSmall ? 12 : 14,
            },
          ]}
          onPress={() => {}}
        >
          <Text style={[styles.modalTitle, { fontSize: isSmall ? 13 : 14 }]}>{title}</Text>
          <View style={{ height: 10 }} />
          <View style={{ alignItems: 'center' }}>
            <DateTimePicker
              value={temp}
              mode={mode}
              display="spinner"
              onChange={onChange}
              themeVariant="dark"
              textColor="#FFFFFF"
              style={{ width: '100%' }}
            />
          </View>
          <View style={{ height: 12 }} />
          <PrimaryButton
            title={mode === 'time' ? 'Apply time' : 'Apply date'}
            onPress={() => {
              onPick(temp);
              onClose();
            }}
            width={clamp(maxW * 0.92, 240, 380)}
            height={clamp(isSmall ? 46 : 52, 44, 58)}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onPress: () => void;
  width: number;
  height: number;
  isTiny: boolean;
  rightChevron?: boolean;
};

function JournalField({
  label,
  value,
  onPress,
  width,
  height,
  isTiny,
  rightChevron,
}: FieldProps) {
  return (
    <View style={{ marginTop: isTiny ? 12 : 14 }}>
      <Text style={[styles.fieldLabel, { fontSize: isTiny ? 12 : 13 }]}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.fieldShell,
          {
            width,
            height,
            borderRadius: height / 2,
            opacity: pressed ? 0.93 : 1,
            paddingHorizontal: isTiny ? 14 : 16,
          },
        ]}
      >
        <Text style={[styles.fieldValue, { fontSize: isTiny ? 12.5 : 13 }]} numberOfLines={1}>
          {value}
        </Text>
        {rightChevron ? <Text style={styles.fieldChevron}>⌄</Text> : null}
      </Pressable>
    </View>
  );
}

export default function LogCatchScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isTiny = height < 680 || width < 350;
  const isSmall = height < 760 || width < 390;

  const padX = clamp(width * (isTiny ? 0.045 : isSmall ? 0.055 : 0.06), 12, 24);
  const rowW = width - padX * 2;
  const rowH = clamp(height * (isTiny ? 0.105 : 0.115), 78, 96);

  const buttonH = clamp(height * (isTiny ? 0.055 : 0.06), 42, 54);
  const buttonW = clamp(rowW * (isTiny ? 0.90 : isSmall ? 0.84 : 0.78), 220, 360);

  const heroCardW = rowW;
  const pickerCardW = clamp(rowW, 300, 420);
  const fieldH = clamp(height * (isTiny ? 0.065 : 0.07), 50, 62);

  const heroAvatarW = clamp(width * (isTiny ? 0.22 : 0.25), 70, 108);
  const heroAvatarH = clamp(heroAvatarW * 1.28, 90, 138);

  const emptyAvatarW = clamp(width * (isTiny ? 0.42 : isSmall ? 0.48 : 0.50), 150, 250);
  const emptyAvatarH = clamp(height * (isTiny ? 0.20 : isSmall ? 0.23 : 0.26), 150, 260);

  const [phase, setPhase] = useState<Phase>('journal');
  const [items, setItems] = useState<CatchItem[]>([]);

  const [fish, setFish] = useState<string | null>(null);
  const [water, setWater] = useState<string | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [viewPhotoUri, setViewPhotoUri] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [fishModal, setFishModal] = useState(false);
  const [waterModal, setWaterModal] = useState(false);

  const [timeModalIOS, setTimeModalIOS] = useState(false);
  const [dateModalIOS, setDateModalIOS] = useState(false);

  const [androidTimeModal, setAndroidTimeModal] = useState(false);
  const [androidDateModal, setAndroidDateModal] = useState(false);

  const androidTimeOptions = useMemo(() => buildAndroidTimeOptions(15), []);
  const androidDateOptions = useMemo(() => buildAndroidDateOptions(14), []);

  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  const runEnter = useCallback(() => {
    fade.setValue(0);
    translateY.setValue(12);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, translateY]);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setItems([]);
        return;
      }
      const parsed = JSON.parse(raw) as CatchItem[];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    }
  }, []);

  const save = useCallback(async (list: CatchItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }, []);

  useEffect(() => {
    load();
    runEnter();
    const unsub = navigation?.addListener?.('focus', () => {
      load();
    });
    return unsub;
  }, [load, navigation, runEnter]);

  const resetForm = useCallback(() => {
    setFish(null);
    setWater(null);
    setTime(null);
    setDate(null);
    setPhotoUri(null);
    setWeight('');
    setLength('');
    setCoords(null);
    setFishModal(false);
    setWaterModal(false);
    setTimeModalIOS(false);
    setDateModalIOS(false);
    setAndroidTimeModal(false);
    setAndroidDateModal(false);
  }, []);

  const pickPhoto = useCallback(() => {
    Alert.alert('Add Photo', 'Choose source', [
      {
        text: 'Camera',
        onPress: () =>
          launchCamera({ mediaType: 'photo', quality: 0.8 }, (res) => {
            if (!res.didCancel && res.assets?.[0]?.uri) {
              setPhotoUri(res.assets[0].uri);
            }
          }),
      },
      {
        text: 'Gallery',
        onPress: () =>
          launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
            if (!res.didCancel && res.assets?.[0]?.uri) {
              setPhotoUri(res.assets[0].uri);
            }
          }),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  const openForm = useCallback(() => {
    resetForm();
    setPhase('form');
    runEnter();
    Geolocation.getCurrentPosition(
      (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, [resetForm, runEnter]);

  const goBack = useCallback(() => {
    if (phase === 'form') {
      setPhase('journal');
      runEnter();
      return;
    }
    navigation.goBack();
  }, [navigation, phase, runEnter]);

  const formatTime = useCallback((d: Date) => {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }, []);

  const formatDate = useCallback((d: Date) => {
    return d.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  const canSave = useMemo(() => Boolean(fish && water && time && date), [fish, water, time, date]);

  const addCatch = useCallback(() => {
    if (!fish || !water || !time || !date) return;

    const merged = new Date(date);
    merged.setHours(time.getHours(), time.getMinutes(), 0, 0);

    const newItem: CatchItem = {
      id: uuid(),
      fish,
      water,
      timeLabel: formatTime(merged),
      dateLabel: formatDate(merged),
      ts: merged.getTime(),
      ...(photoUri ? { photo: photoUri } : {}),
      ...(weight.trim() ? { weight: weight.trim() } : {}),
      ...(length.trim() ? { length: length.trim() } : {}),
      ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
    };

    const next = [newItem, ...items].sort((a, b) => b.ts - a.ts);
    setItems(next);
    save(next);

    setPhase('journal');
    runEnter();
  }, [date, fish, formatDate, formatTime, items, runEnter, save, time, water]);

  const deleteCatch = useCallback(
    (id: string) => {
      const next = items.filter((x) => x.id !== id);
      setItems(next);
      save(next);
    },
    [items, save],
  );

  const totalEntries = items.length;
  const uniqueWaters = useMemo(() => String(new Set(items.map((x) => x.water)).size), [items]);
  const latestLabel = useMemo(() => {
    if (!items.length) return 'No entries';
    return items[0]?.dateLabel ?? 'No entries';
  }, [items]);

  const timeValueLabel = useMemo(() => {
    if (!time) return 'Choose time';
    if (Platform.OS === 'android') {
      return formatTimeLabelFromHM(time.getHours(), time.getMinutes());
    }
    return formatTime(time);
  }, [formatTime, time]);

  const dateValueLabel = useMemo(() => {
    if (!date) return 'Choose date';
    if (Platform.OS === 'android') {
      return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
    }
    return formatDate(date);
  }, [date, formatDate]);

  const onPickTime = useCallback(() => {
    if (Platform.OS === 'ios') setTimeModalIOS(true);
    else setAndroidTimeModal(true);
  }, []);

  const onPickDate = useCallback(() => {
    if (Platform.OS === 'ios') setDateModalIOS(true);
    else setAndroidDateModal(true);
  }, []);

  const renderJournalHeader = () => (
    <>
      <View
        style={[
          styles.heroCard,
          {
            width: heroCardW,
            borderRadius: isTiny ? 20 : 24,
            paddingHorizontal: isTiny ? 12 : 16,
            paddingVertical: isTiny ? 12 : 16,
            marginBottom: isTiny ? 10 : 14,
          },
        ]}
      >
        <View style={styles.heroGlow} />

        <View style={styles.heroTopRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[styles.heroEyebrow, { fontSize: isTiny ? 10.5 : 11.5 }]}>Personal Journal</Text>
            <Text style={[styles.heroTitle, { fontSize: isTiny ? 20 : 24 }]}>Catch Log</Text>
            <Text
              style={[
                styles.heroSubtitle,
                {
                  fontSize: isTiny ? 11.5 : 12.8,
                  lineHeight: isTiny ? 16 : 19,
                  marginTop: isTiny ? 6 : 8,
                },
              ]}
            >
              Keep short notes and build a simple personal timeline.
            </Text>
          </View>

          <Image
            source={AVATAR}
            resizeMode="contain"
            style={{ width: heroAvatarW, height: heroAvatarH }}
          />
        </View>

        <View style={[styles.statsRow, { marginTop: isTiny ? 10 : 14, gap: isTiny ? 6 : 10 }]}>
          <StatChip title="Entries" value={String(totalEntries)} compact={isTiny} />
          <StatChip title="Waters" value={uniqueWaters} compact={isTiny} />
          <StatChip title="Latest" value={items.length ? 'Saved' : 'None'} compact={isTiny} />
        </View>
      </View>

      <View style={[styles.sectionHeader, { marginBottom: isTiny ? 10 : 14 }]}>
        <Text style={[styles.sectionTitle, { fontSize: isTiny ? 16 : 18 }]}>Journal Timeline</Text>
        <PrimaryButton
          title="Add Entry"
          onPress={openForm}
          width={buttonW * (isTiny ? 0.52 : 0.48)}
          height={isTiny ? 42 : 46}
        />
      </View>
    </>
  );

  return (
    <ImageBackground source={BG} style={styles.background} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.overlayA} pointerEvents="none" />
      <View style={styles.overlayB} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.screen,
            {
              paddingTop: insets.top + 4,
              paddingHorizontal: padX,
            },
          ]}
        >
          <View style={[styles.headerRow, { height: isTiny ? 44 : 52, marginBottom: isTiny ? 6 : 10 }]}>
            <HeaderPill title={phase === 'form' ? 'Back' : 'Exit'} onPress={goBack} width={isTiny ? 74 : 82} />
            <View style={{ width: isTiny ? 74 : 82 }} />
          </View>

          <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY }] }}>
            {phase === 'journal' ? (
              <>
                {items.length === 0 ? (
                  <View style={{ flex: 1 }}>
                    {renderJournalHeader()}

                    <View
                      style={[
                        styles.emptyStateCard,
                        {
                          flex: 1,
                          borderRadius: isTiny ? 22 : 26,
                          paddingHorizontal: isTiny ? 14 : 18,
                          paddingTop: isTiny ? 14 : 18,
                          paddingBottom: isTiny ? 14 : 18,
                        },
                      ]}
                    >
                      <Text style={[styles.emptyStateTitle, { fontSize: isTiny ? 16 : 20 }]}>
                        Your journal is still empty
                      </Text>

                      <Text
                        style={[
                          styles.emptyStateText,
                          {
                            fontSize: isTiny ? 11.5 : 13,
                            lineHeight: isTiny ? 16 : 19,
                            marginTop: isTiny ? 6 : 8,
                            maxWidth: isTiny ? 250 : 280,
                          },
                        ]}
                      >
                        Add your first catch entry to start a clean personal record.
                      </Text>

                      <View style={styles.emptyIllustrationWrap}>
                        <Image
                          source={AVATAR}
                          resizeMode="contain"
                          style={{ width: emptyAvatarW, height: emptyAvatarH }}
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
                    ListHeaderComponent={
                      <View>
                        {renderJournalHeader()}
                        <View style={styles.latestNoteCard}>
                          <Text style={styles.latestNoteLabel}>Latest saved date</Text>
                          <Text style={styles.latestNoteValue}>{latestLabel}</Text>
                        </View>
                      </View>
                    }
                    renderItem={({ item }) => (
                      <SwipeRow
                        item={item}
                        rowW={rowW}
                        rowH={rowH}
                        onDeleteConfirmed={() => deleteCatch(item.id)}
                        onPhotoPress={() => item.photo && setViewPhotoUri(item.photo)}
                      />
                    )}
                  />
                )}
              </>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 22 + insets.bottom }}
              >
                <View
                  style={[
                    styles.formCard,
                    {
                      width: rowW,
                      borderRadius: isTiny ? 22 : 26,
                      paddingHorizontal: isTiny ? 12 : 14,
                      paddingTop: isTiny ? 14 : 18,
                      paddingBottom: isTiny ? 18 : 22,
                    },
                  ]}
                >
                  <View style={styles.formGlow} />

                  <Text style={[styles.formEyebrow, { fontSize: isTiny ? 10.5 : 11.5 }]}>New Journal Entry</Text>
                  <Text style={[styles.formTitle, { fontSize: isTiny ? 20 : 24 }]}>Add Catch Record</Text>
                  <Text
                    style={[
                      styles.formSubtitle,
                      {
                        fontSize: isTiny ? 11.5 : 12.8,
                        lineHeight: isTiny ? 16 : 19,
                        marginTop: isTiny ? 6 : 8,
                      },
                    ]}
                  >
                    Save a short entry with fish, water, time, and date.
                  </Text>

                  <View style={{ marginTop: isTiny ? 12 : 14 }}>
                    <Text style={[styles.fieldLabel, { fontSize: isTiny ? 12 : 13 }]}>Photo (optional)</Text>
                    <Pressable
                      onPress={pickPhoto}
                      style={({ pressed }) => [
                        styles.photoPickerBtn,
                        {
                          width: rowW - (isTiny ? 24 : 28),
                          height: photoUri ? clamp(rowW * 0.55, 160, 240) : clamp(fieldH * 1.4, 70, 90),
                          borderRadius: 16,
                          opacity: pressed ? 0.9 : 1,
                        },
                      ]}
                    >
                      {photoUri ? (
                        <Image
                          source={{ uri: photoUri }}
                          style={{ width: '100%', height: '100%', borderRadius: 16 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.photoPickerText}>📷  Add Photo</Text>
                      )}
                    </Pressable>
                  </View>

                  <View style={{ marginTop: isTiny ? 12 : 14, flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.fieldLabel, { fontSize: isTiny ? 12 : 13 }]}>Weight (kg)</Text>
                      <TextInput
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="decimal-pad"
                        placeholder="e.g. 1.5"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        style={[styles.fieldShell, styles.textInput, { height: fieldH, borderRadius: fieldH / 2 }]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.fieldLabel, { fontSize: isTiny ? 12 : 13 }]}>Length (cm)</Text>
                      <TextInput
                        value={length}
                        onChangeText={setLength}
                        keyboardType="decimal-pad"
                        placeholder="e.g. 42"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        style={[styles.fieldShell, styles.textInput, { height: fieldH, borderRadius: fieldH / 2 }]}
                      />
                    </View>
                  </View>

                  <JournalField
                    label="Fish name"
                    value={fish ?? 'Choose a fish'}
                    onPress={() => setFishModal(true)}
                    width={rowW - (isTiny ? 24 : 28)}
                    height={fieldH}
                    isTiny={isTiny}
                    rightChevron
                  />

                  <JournalField
                    label="Water"
                    value={water ?? 'Choose water'}
                    onPress={() => setWaterModal(true)}
                    width={rowW - (isTiny ? 24 : 28)}
                    height={fieldH}
                    isTiny={isTiny}
                    rightChevron
                  />

                  <JournalField
                    label="Time"
                    value={timeValueLabel}
                    onPress={onPickTime}
                    width={rowW - (isTiny ? 24 : 28)}
                    height={fieldH}
                    isTiny={isTiny}
                    rightChevron={Platform.OS === 'android'}
                  />

                  <JournalField
                    label="Date"
                    value={dateValueLabel}
                    onPress={onPickDate}
                    width={rowW - (isTiny ? 24 : 28)}
                    height={fieldH}
                    isTiny={isTiny}
                    rightChevron={Platform.OS === 'android'}
                  />

                  <View style={[styles.formBottom, { marginTop: isTiny ? 18 : 24 }]}>
                    <PrimaryButton
                      title="Save Entry"
                      onPress={addCatch}
                      width={buttonW}
                      height={buttonH}
                      disabled={!canSave}
                    />
                  </View>
                </View>

                <PickerModal
                  visible={fishModal}
                  title="Fish name"
                  options={FISH_OPTIONS}
                  selected={fish}
                  onClose={() => setFishModal(false)}
                  onPick={(v) => {
                    setFish(v);
                    setFishModal(false);
                  }}
                  maxW={pickerCardW}
                  isSmall={isSmall}
                />

                <PickerModal
                  visible={waterModal}
                  title="Water"
                  options={WATER_OPTIONS}
                  selected={water}
                  onClose={() => setWaterModal(false)}
                  onPick={(v) => {
                    setWater(v);
                    setWaterModal(false);
                  }}
                  maxW={pickerCardW}
                  isSmall={isSmall}
                />

                {Platform.OS === 'ios' ? (
                  <>
                    <IOSDatePickerModal
                      visible={timeModalIOS}
                      title="Time"
                      mode="time"
                      value={time ?? new Date()}
                      onClose={() => setTimeModalIOS(false)}
                      onPick={(d) => setTime(d)}
                      maxW={pickerCardW}
                      isSmall={isSmall}
                    />

                    <IOSDatePickerModal
                      visible={dateModalIOS}
                      title="Date"
                      mode="date"
                      value={date ?? new Date()}
                      onClose={() => setDateModalIOS(false)}
                      onPick={(d) => setDate(d)}
                      maxW={pickerCardW}
                      isSmall={isSmall}
                    />
                  </>
                ) : null}

                {Platform.OS === 'android' ? (
                  <>
                    <PickerModal
                      visible={androidTimeModal}
                      title="Time"
                      options={androidTimeOptions.map((x) => x.label)}
                      selected={time ? formatTimeLabelFromHM(time.getHours(), time.getMinutes()) : null}
                      onClose={() => setAndroidTimeModal(false)}
                      onPick={(label) => {
                        const found = androidTimeOptions.find((x) => x.label === label);
                        if (!found) return;
                        const t = new Date();
                        t.setHours(found.h, found.m, 0, 0);
                        setTime(t);
                        setAndroidTimeModal(false);
                      }}
                      maxW={pickerCardW}
                      isSmall={isSmall}
                    />

                    <PickerModal
                      visible={androidDateModal}
                      title="Date"
                      options={androidDateOptions.map((x) => x.label)}
                      selected={date ? date.toLocaleDateString([], { month: 'long', day: 'numeric' }) : null}
                      onClose={() => setAndroidDateModal(false)}
                      onPick={(label) => {
                        const found = androidDateOptions.find((x) => x.label === label);
                        if (!found) return;
                        setDate(found.date);
                        setAndroidDateModal(false);
                      }}
                      maxW={pickerCardW}
                      isSmall={isSmall}
                    />
                  </>
                ) : null}
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </SafeAreaView>

      <Modal visible={!!viewPhotoUri} transparent animationType="fade" onRequestClose={() => setViewPhotoUri(null)}>
        <Pressable style={styles.photoViewOverlay} onPress={() => setViewPhotoUri(null)}>
          {viewPhotoUri ? (
            <Image
              source={{ uri: viewPhotoUri }}
              style={styles.photoViewImage}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#030913',
  },

  safeArea: {
    flex: 1,
  },

  screen: {
    flex: 1,
  },

  overlayA: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.20)',
  },

  overlayB: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,16,32,0.16)',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerPill: {
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(5,24,46,0.65)',
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

  heroCard: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(94,154,255,0.18)',
    backgroundColor: 'rgba(8,23,42,0.74)',
    overflow: 'hidden',
  },

  heroGlow: {
    position: 'absolute',
    top: -22,
    right: -12,
    width: 130,
    height: 130,
    borderRadius: 999,
    backgroundColor: 'rgba(72,135,255,0.12)',
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
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

  heroSubtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontWeight: '600',
  },

  statsRow: {
    flexDirection: 'row',
  },

  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },

  statChipValue: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  statChipTitle: {
    color: 'rgba(255,255,255,0.58)',
    fontWeight: '700',
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  emptyStateCard: {
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    overflow: 'hidden',
  },

  emptyStateTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyStateText: {
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '600',
    textAlign: 'center',
  },

  emptyIllustrationWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  latestNoteCard: {
    marginBottom: 12,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  latestNoteLabel: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },

  latestNoteValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 5,
  },

  primaryButton: {
    backgroundColor: '#0A5CC5',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 18,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  rowDeleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  rowDeleteButton: {
    backgroundColor: 'rgba(170,40,54,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowDeleteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  rowCard: {
    backgroundColor: 'rgba(0,0,0,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  rowAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(76, 151, 255, 0.52)',
  },

  rowFish: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14.5,
  },

  rowBottomLine: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },

  miniTag: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.53)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  miniTagText: {
    color: '#E8F2FF',
    fontSize: 10.2,
    fontWeight: '800',
  },

  rowMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingVertical: 8,
    gap: 6,
  },

  rowTime: {
    color: 'rgba(255,255,255,0.74)',
    fontWeight: '800',
    fontSize: 12,
  },

  rowDate: {
    color: 'rgba(255,255,255,0.42)',
    fontWeight: '700',
    fontSize: 11,
    textAlign: 'right',
  },

  formCard: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(92,154,255,0.18)',
    backgroundColor: 'rgba(8,23,42,0.72)',
    overflow: 'hidden',
  },

  formGlow: {
    position: 'absolute',
    top: -22,
    right: -12,
    width: 130,
    height: 130,
    borderRadius: 999,
    backgroundColor: 'rgba(72,135,255,0.10)',
  },

  formEyebrow: {
    color: '#8EC2FF',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  formTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 4,
  },

  formSubtitle: {
    color: 'rgba(255,255,255,0.74)',
    fontWeight: '600',
  },

  fieldLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '800',
    marginBottom: 8,
  },

  fieldShell: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  fieldValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    flex: 1,
    paddingRight: 10,
  },

  fieldChevron: {
    color: 'rgba(255,255,255,0.68)',
    fontWeight: '900',
    fontSize: 16,
    marginTop: Platform.OS === 'android' ? -2 : 0,
  },

  formBottom: {},

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  modalCard: {
    backgroundColor: 'rgba(0,0,0,0.93)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
  },

  pickerCard: {
    backgroundColor: 'rgba(0,0,0,0.93)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.19)',
    borderRadius: 18,
    alignItems: 'center',
  },

  modalTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
  },

  modalRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  modalRowText: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '800',
  },

  rowThumb: {
    borderRadius: 10,
    marginLeft: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  photoPickerBtn: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  photoPickerText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    fontWeight: '800',
  },

  photoViewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoViewImage: {
    width: '92%',
    height: '72%',
    borderRadius: 18,
  },

  textInput: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    paddingHorizontal: 16,
  },
});