import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  Animated,
  Easing,
  useWindowDimensions,
  StatusBar,
  Platform,
  Text,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
const BG = require('../assets/bg_raund.png');
const LOGO = require('../assets/log.png');

const LOADER_MS = 2600;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type Phase = 'loader' | 'logo';

export default function LoaderScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 700 || width < 360;
  const [phase, setPhase] = useState<Phase>('loader');

  const containerFade = useRef(new Animated.Value(0)).current;
  const containerLift = useRef(new Animated.Value(18)).current;

  const ringRotate = useRef(new Animated.Value(0)).current;
  const centerPulse = useRef(new Animated.Value(0.84)).current;

  const p1 = useRef(new Animated.Value(0.2)).current;
  const p2 = useRef(new Animated.Value(0.2)).current;
  const p3 = useRef(new Animated.Value(0.2)).current;
  const p4 = useRef(new Animated.Value(0.2)).current;
  const p5 = useRef(new Animated.Value(0.2)).current;
  const p6 = useRef(new Animated.Value(0.2)).current;

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoLift = useRef(new Animated.Value(20)).current;

  const captionOpacity = useRef(new Animated.Value(0)).current;

  const centerSize = useMemo(() => {
    return clamp(Math.round(Math.min(width, height) * 0.13), isSmall ? 58 : 68, isSmall ? 74 : 88);
  }, [width, height, isSmall]);

  const orbitRadius = useMemo(() => {
    return clamp(Math.round(Math.min(width, height) * 0.12), 54, 78);
  }, [width, height]);

  const dotSize = useMemo(() => {
    return clamp(Math.round(centerSize * 0.22), 11, 18);
  }, [centerSize]);

  const loaderWrapSize = useMemo(() => {
    return orbitRadius * 2 + dotSize * 2 + 30;
  }, [orbitRadius, dotSize]);

  const logoW = useMemo(() => {
    return clamp(Math.round(width * (isSmall ? 0.46 : 0.5)), 160, 250);
  }, [width, isSmall]);

  const brandCardW = useMemo(() => {
    return clamp(width * 0.82, 260, 380);
  }, [width]);

  const rotateInterpolate = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(containerFade, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(containerLift, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const makePulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 520,
            delay,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.24,
            duration: 520,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );

    const orbitAnim = Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 5200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const corePulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(centerPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(centerPulse, {
          toValue: 0.84,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const loops = [
      makePulse(p1, 0),
      makePulse(p2, 110),
      makePulse(p3, 220),
      makePulse(p4, 330),
      makePulse(p5, 440),
      makePulse(p6, 550),
    ];

    orbitAnim.start();
    corePulseAnim.start();
    loops.forEach(loop => loop.start());

    const captionTimer = setTimeout(() => {
      Animated.timing(captionOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, 500);

    const phaseTimer = setTimeout(() => {
      setPhase('logo');

      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoLift, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, LOADER_MS);

    return () => {
      orbitAnim.stop();
      corePulseAnim.stop();
      loops.forEach(loop => loop.stop());
      clearTimeout(captionTimer);
      clearTimeout(phaseTimer);
    };
  }, [
    captionOpacity,
    centerPulse,
    containerFade,
    containerLift,
    logoLift,
    logoOpacity,
    logoScale,
    p1,
    p2,
    p3,
    p4,
    p5,
    p6,
    ringRotate,
  ]);

  return (
    <ImageBackground source={BG} style={styles.background} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.overlayA} pointerEvents="none" />
      <View style={styles.overlayB} pointerEvents="none" />

      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
        <Animated.View
          style={[
            styles.centerWrap,
            {
              opacity: containerFade,
              transform: [{ translateY: containerLift }],
            },
          ]}
        >
          {phase === 'loader' ? (
            <View style={{ alignItems: 'center' }}>
              <View
                style={[
                  styles.loaderCard,
                  {
                    width: brandCardW,
                    borderRadius: 26,
                    paddingVertical: isSmall ? 22 : 26,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.loaderOrbitWrap,
                    {
                      width: loaderWrapSize,
                      height: loaderWrapSize,
                      transform: [{ rotate: rotateInterpolate }],
                    },
                  ]}
                >
                  <OrbitDot opacity={p1} size={dotSize} radius={orbitRadius} angle={0} />
                  <OrbitDot opacity={p2} size={dotSize} radius={orbitRadius} angle={60} />
                  <OrbitDot opacity={p3} size={dotSize} radius={orbitRadius} angle={120} />
                  <OrbitDot opacity={p4} size={dotSize} radius={orbitRadius} angle={180} />
                  <OrbitDot opacity={p5} size={dotSize} radius={orbitRadius} angle={240} />
                  <OrbitDot opacity={p6} size={dotSize} radius={orbitRadius} angle={300} />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.centerCore,
                    {
                      width: centerSize,
                      height: centerSize,
                      borderRadius: centerSize / 2,
                      transform: [{ scale: centerPulse }],
                    },
                  ]}
                />

                <Animated.Text
                  style={[
                    styles.loaderCaption,
                    {
                      opacity: captionOpacity,
                      marginTop: isSmall ? 20 : 24,
                    },
                  ]}
                >
           
                </Animated.Text>

           
              </View>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.logoPanel,
                {
                  width: brandCardW,
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }, { translateY: logoLift }],
                },
              ]}
            >
              <Image
                source={LOGO}
                style={{
                  width: logoW,
                  height: Math.round(logoW * 0.6),
                }}
                resizeMode="contain"
              />
            </Animated.View>
          )}
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function OrbitDot({
  opacity,
  size,
  radius,
  angle,
}: {
  opacity: Animated.Value;
  size: number;
  radius: number;
  angle: number;
}) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: size,
        height: size,
        marginLeft: -size / 2 + x,
        marginTop: -size / 2 + y,
        borderRadius: size / 2,
        backgroundColor: '#E8EEF6',
        opacity,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOpacity: 0.14,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          },
          android: {
            elevation: 2,
          },
        }),
      }}
    />
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

  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  overlayA: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },

  overlayB: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,16,32,0.12)',
  },

  loaderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7, 22, 42, 0.54)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },

  loaderOrbitWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerCore: {
    position: 'absolute',
    backgroundColor: 'rgba(225,235,245,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  loaderCaption: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },

  loaderSubcaption: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
  },

  logoPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    borderRadius: 26,
    backgroundColor: 'rgba(7, 22, 42, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
});