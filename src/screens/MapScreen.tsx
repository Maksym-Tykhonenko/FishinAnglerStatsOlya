import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CatchItem } from './CatchScreen';

const STORAGE_KEY = 'catches_v2';

function HeaderPill({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerPill,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <Text style={styles.headerPillText}>{title}</Text>
    </Pressable>
  );
}

export default function FishingMapScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [catches, setCatches] = useState<CatchItem[]>([]);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CatchItem[];
      setCatches(Array.isArray(parsed) ? parsed.filter((c) => c.latitude && c.longitude) : []);
    } catch {}
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hasSpots = catches.length > 0;

  const initialRegion = hasSpots
    ? {
        latitude: catches[0].latitude!,
        longitude: catches[0].longitude!,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }
    : {
        latitude: 48.3794,
        longitude: 31.1656,
        latitudeDelta: 8,
        longitudeDelta: 8,
      };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <MapView style={styles.map} initialRegion={initialRegion} mapType="hybrid">
        {catches.map((item) =>
          item.latitude && item.longitude ? (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              pinColor="#0A5CC5"
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutFish}>{item.fish}</Text>
                  <Text style={styles.calloutMeta}>{item.water}</Text>
                  {item.weight ? <Text style={styles.calloutMeta}>{item.weight} kg</Text> : null}
                  {item.length ? <Text style={styles.calloutMeta}>{item.length} cm</Text> : null}
                  <Text style={styles.calloutDate}>{item.dateLabel}</Text>
                </View>
              </Callout>
            </Marker>
          ) : null,
        )}
      </MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View
          style={[
            styles.headerRow,
            { paddingTop: insets.top + 4, paddingHorizontal: 16 },
          ]}
        >
          <HeaderPill title="Back" onPress={() => navigation.goBack()} />
          <View style={styles.titlePill}>
            <Text style={styles.titlePillText}>Fishing Map</Text>
          </View>
          <View style={{ width: 82 }} />
        </View>

        {!hasSpots && (
          <View style={styles.emptyBadge}>
            <Text style={styles.emptyBadgeText}>
              No spots yet — save catches with location enabled
            </Text>
          </View>
        )}

        <View style={[styles.counterBadge, { bottom: insets.bottom + 16 }]}>
          <Text style={styles.counterText}>
            {hasSpots ? `${catches.length} spot${catches.length > 1 ? 's' : ''}` : 'No spots'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030913',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerPill: {
    width: 82,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(5,24,46,0.80)',
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

  titlePill: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(5,24,46,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  titlePillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  emptyBadge: {
    alignSelf: 'center',
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(5,24,46,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    maxWidth: 300,
  },

  emptyBadgeText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
  },

  counterBadge: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(10,92,197,0.90)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },

  counterText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  callout: {
    minWidth: 130,
    padding: 8,
  },

  calloutFish: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
  },

  calloutMeta: {
    fontSize: 11,
    color: '#444',
    marginTop: 2,
  },

  calloutDate: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },
});
