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
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LURE_QUESTIONS, type OptionKey } from '../data/lureQuestions';

const BG = require('../assets/bg_raund.png');
const AVATAR = require('../assets/angleres.png');
const IMG_SPINNER = require('../assets/lure_spinnerbait.png');
const IMG_WORM = require('../assets/lure_worm.png');
const IMG_CRANK = require('../assets/lure_crankbait.png');
const IMG_POPPER = require('../assets/lure_popper.png');

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

type Phase = 'intro' | 'quiz' | 'result';
type LureKey = 'spinnerbait' | 'worm' | 'crankbait' | 'popper';

type LureResult = {
  key: LureKey;
  title: string;
  bestFor: string;
  waterType: string;
  depth: string;
  description: string;
  why: string;
  tip: string;
  image: any;
};

const RESULTS: Record<LureKey, LureResult> = {
  spinnerbait: {
    key: 'spinnerbait',
    title: 'Spinnerbait',
    bestFor: 'Bass, Pike',
    waterType: 'Murky or windy conditions',
    depth: 'Shallow to mid-depth',
    description:
      'A spinnerbait uses spinning blades to create flash and vibration. This helps active fish notice the presentation quickly and react with confidence.',
    why:
      'The lure stands out well in moving water, low visibility, or windy conditions where extra vibration can help fish track it.',
    tip:
      'Keep a steady retrieve, then vary speed slightly near cover to encourage a reaction strike.',
    image: IMG_SPINNER,
  },
  worm: {
    key: 'worm',
    title: 'Soft Plastic Worm',
    bestFor: 'Bass',
    waterType: 'Clear to slightly stained',
    depth: 'Bottom-focused presentation',
    description:
      'A soft plastic worm offers subtle movement and a natural profile. It is flexible, versatile, and useful when a slower presentation feels more appropriate.',
    why:
      'Its quiet, lifelike movement makes it a dependable option when fish are cautious or less willing to chase.',
    tip:
      'Work it slowly around structure and let pauses do part of the work.',
    image: IMG_WORM,
  },
  crankbait: {
    key: 'crankbait',
    title: 'Crankbait',
    bestFor: 'Bass, Walleye',
    waterType: 'Clear to moderately stained',
    depth: 'Mid to deep zones',
    description:
      'A crankbait uses built-in wobble and diving action to cover water efficiently. It helps search active zones and target fish holding at a chosen depth.',
    why:
      'Its movement creates strong visual and motion cues, especially when it deflects off structure.',
    tip:
      'Match the diving range to where fish are holding and keep contact with cover when possible.',
    image: IMG_CRANK,
  },
  popper: {
    key: 'popper',
    title: 'Topwater Popper',
    bestFor: 'Bass',
    waterType: 'Calm water or quiet surface periods',
    depth: 'Surface',
    description:
      'A popper stays on top and creates sound and splash during short pulls. It is often chosen for visible surface activity and energetic strikes.',
    why:
      'The surface commotion can trigger immediate reaction strikes, especially in low-light periods.',
    tip:
      'Use short pulls followed by pauses. Many strikes happen during the pause, not the movement.',
    image: IMG_POPPER,
  },
};

function decideResult(answers: OptionKey[]): LureKey {
  const score: Record<OptionKey, number> = { A: 0, B: 0, C: 0, D: 0 };

  for (const answer of answers) {
    score[answer] += 1;
  }

  const ranked = (Object.keys(score) as OptionKey[])
    .map(key => [key, score[key]] as const)
    .sort((a, b) => b[1] - a[1]);

  const top = ranked[0]?.[0] ?? 'A';

  if (top === 'A') return 'spinnerbait';
  if (top === 'B') return 'worm';
  if (top === 'C') return 'crankbait';
  return 'popper';
}

const QUESTIONS_PER_LEVEL = 3;
const TOTAL_LEVELS = 10;
const TOTAL_QUESTIONS = QUESTIONS_PER_LEVEL * TOTAL_LEVELS;

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
}: {
  title: string;
  onPress: () => void;
  width: number;
  height: number;
  disabled?: boolean;
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
      ]}
    >
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  title,
  onPress,
  width,
  height,
}: {
  title: string;
  onPress: () => void;
  width: number;
  height: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        {
          width,
          height,
          borderRadius: height / 2,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
}

function InfoChip({ title }: { title: string }) {
  return (
    <View style={styles.infoChip}>
      <Text style={styles.infoChipText}>{title}</Text>
    </View>
  );
}

function StatTile({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statTileValue}>{value}</Text>
      <Text style={styles.statTileTitle}>{title}</Text>
    </View>
  );
}

export default function FindFishingLureScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 720 || width < 360;
  const padX = clamp(Math.round(width * (isSmall ? 0.05 : 0.06)), 14, 26);
  const cardW = width - padX * 2;

  const primaryBtnH = clamp(Math.round(height * (isSmall ? 0.052 : 0.056)), 44, 56);
  const primaryBtnW = clamp(Math.round(cardW * (isSmall ? 0.78 : 0.76)), 220, 340);
  const answerH = clamp(Math.round(height * (isSmall ? 0.062 : 0.066)), 48, 60);

  const heroImageW = clamp(Math.round(width * (isSmall ? 0.52 : 0.56)), 180, 250);
  const heroImageH = clamp(Math.round(height * (isSmall ? 0.26 : 0.30)), 170, 250);
  const resultImageH = clamp(Math.round(height * (isSmall ? 0.18 : 0.22)), 120, 180);

  const bottomPad = 18 + insets.bottom;

  const [phase, setPhase] = useState<Phase>('intro');
  const [level, setLevel] = useState(0);
  const [stepInLevel, setStepInLevel] = useState(0);
  const [answers, setAnswers] = useState<OptionKey[]>([]);
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [resultKey, setResultKey] = useState<LureKey>('spinnerbait');

  const transition = useRef(new Animated.Value(1)).current;

  const runSwap = useCallback(() => {
    transition.stopAnimation();
    transition.setValue(0);
    Animated.timing(transition, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [transition]);

  const opacity = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const scale = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });

  const globalIndex = level * QUESTIONS_PER_LEVEL + stepInLevel;
  const currentQuestion = useMemo(() => LURE_QUESTIONS[globalIndex], [globalIndex]);
  const result = RESULTS[resultKey];

  const answeredCount = globalIndex;
  const progressValue = TOTAL_QUESTIONS > 0 ? (answeredCount / TOTAL_QUESTIONS) * 100 : 0;
  const progressWidth = Math.max(8, (cardW - 32) * (progressValue / 100));

  const onBack = useCallback(() => {
    if (phase === 'intro') {
      navigation.goBack();
      return;
    }

    setPhase('intro');
    setLevel(0);
    setStepInLevel(0);
    setAnswers([]);
    setSelected(null);
    setResultKey('spinnerbait');
    runSwap();
  }, [navigation, phase, runSwap]);

  const onStart = useCallback(() => {
    setPhase('quiz');
    setLevel(0);
    setStepInLevel(0);
    setAnswers([]);
    setSelected(null);
    setResultKey('spinnerbait');
    runSwap();
  }, [runSwap]);

  const goForward = useCallback(
    (chosen: OptionKey) => {
      const nextAnswers = [...answers];
      nextAnswers[globalIndex] = chosen;

      const isLastQuestion = globalIndex >= TOTAL_QUESTIONS - 1;

      if (isLastQuestion) {
        const nextResult = decideResult(nextAnswers);
        setAnswers(nextAnswers);
        setResultKey(nextResult);
        setPhase('result');
        setSelected(null);
        runSwap();
        return;
      }

      setAnswers(nextAnswers);

      if (stepInLevel < QUESTIONS_PER_LEVEL - 1) {
        setStepInLevel(stepInLevel + 1);
      } else {
        setLevel(level + 1);
        setStepInLevel(0);
      }

      setSelected(null);
      runSwap();
    },
    [answers, globalIndex, level, runSwap, stepInLevel],
  );

  const onNext = useCallback(() => {
    if (!selected) return;
    goForward(selected);
  }, [goForward, selected]);

  const onRestart = useCallback(() => {
    setPhase('intro');
    setLevel(0);
    setStepInLevel(0);
    setAnswers([]);
    setSelected(null);
    setResultKey('spinnerbait');
    runSwap();
  }, [runSwap]);

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message:
          `${result.title}\n\n` +
          `Best for: ${result.bestFor}\n` +
          `Water type: ${result.waterType}\n` +
          `Depth: ${result.depth}\n\n` +
          `Overview: ${result.description}\n\n` +
          `Why it works: ${result.why}\n\n` +
          `Field tip: ${result.tip}`,
      });
    } catch {}
  }, [result]);

  const levelLabel = `Level ${level + 1} of ${TOTAL_LEVELS}`;
  const stepLabel = `Question ${globalIndex + 1} of ${TOTAL_QUESTIONS}`;

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
              paddingHorizontal: padX,
              paddingTop: insets.top + 6,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <HeaderPill title={phase === 'intro' ? 'Exit' : 'Back'} onPress={onBack} />
            <View style={{ width: 82 }} />
          </View>

          <Animated.View
            style={{
              flex: 1,
              opacity,
              transform: [{ translateY }, { scale }],
            }}
          >
            {phase === 'intro' ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: bottomPad }}
              >
                <View style={[styles.heroCard, { width: cardW, borderRadius: 24 }]}>
                  <View style={styles.heroGlow} />

                  <Text style={styles.heroEyebrow}>Selection Assistant</Text>
                  <Text style={styles.heroTitle}>Lure Match</Text>
                  <Text style={styles.heroSubtitle}>
                    Answer a guided set of short prompts and get a lure profile that best fits your
                    style of choice.
                  </Text>

                  <View style={styles.heroChipRow}>
                    <InfoChip title="Guided quiz" />
                    <InfoChip title="Quick result" />
                    <InfoChip title="Shareable match" />
                  </View>

                  <View style={styles.heroImageWrap}>
                    <Image
                      source={AVATAR}
                      resizeMode="contain"
                      style={{ width: heroImageW, height: heroImageH }}
                    />
                  </View>

                  <View style={styles.heroStatsRow}>
                    <StatTile title="Levels" value={String(TOTAL_LEVELS)} />
                    <StatTile title="Questions" value={String(TOTAL_QUESTIONS)} />
                    <StatTile title="Profiles" value="4" />
                  </View>

                  <View style={{ marginTop: 18 }}>
                    <PrimaryButton
                      title="Start Selection"
                      onPress={onStart}
                      width={primaryBtnW}
                      height={primaryBtnH}
                    />
                  </View>
                </View>
              </ScrollView>
            ) : null}

            {phase === 'quiz' ? (
              <View style={{ flex: 1 }}>
                <View style={[styles.progressCard, { width: cardW, borderRadius: 22 }]}>
                  <View style={styles.progressTopRow}>
                    <Text style={styles.progressLevelText}>{levelLabel}</Text>
                    <Text style={styles.progressStepText}>{stepLabel}</Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: progressWidth }]} />
                  </View>
                </View>

                <View style={[styles.questionCard, { width: cardW, borderRadius: 24 }]}>
                  <Text style={styles.questionEyebrow}>Current Prompt</Text>
                  <Text style={[styles.questionText, { fontSize: isSmall ? 13 : 14.2 }]}>
                    {currentQuestion.title}
                  </Text>
                </View>

                <View style={{ marginTop: 18 }}>
                  {currentQuestion.options.map((option, index) => {
                    const isActive = selected === option.key;

                    return (
                      <Pressable
                        key={`${currentQuestion.id}-${option.key}`}
                        onPress={() => setSelected(option.key)}
                        style={({ pressed }) => [
                          styles.answerCard,
                          {
                            width: cardW,
                            minHeight: answerH,
                            borderRadius: 18,
                            opacity: pressed ? 0.94 : 1,
                            transform: [{ scale: pressed ? 0.992 : 1 }],
                            backgroundColor: isActive
                              ? 'rgba(10,92,197,0.92)'
                              : 'rgba(3,18,42,0.55)',
                            borderColor: isActive
                              ? 'rgba(255,255,255,0.22)'
                              : 'rgba(255,255,255,0.08)',
                          },
                        ]}
                      >
                        <View style={styles.answerTopRow}>
                          <View
                            style={[
                              styles.answerIndex,
                              {
                                backgroundColor: isActive
                                  ? 'rgba(255,255,255,0.16)'
                                  : 'rgba(255,255,255,0.08)',
                              },
                            ]}
                          >
                            <Text style={styles.answerIndexText}>{index + 1}</Text>
                          </View>

                          <Text
                            style={[
                              styles.answerText,
                              { fontSize: isSmall ? 13 : 14 },
                            ]}
                          >
                            {option.label}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={{ flex: 1 }} />

                <View style={{ paddingBottom: bottomPad }}>
                  <PrimaryButton
                    title={
                      level === TOTAL_LEVELS - 1 && stepInLevel === QUESTIONS_PER_LEVEL - 1
                        ? 'Finish Session'
                        : 'Continue'
                    }
                    onPress={onNext}
                    width={primaryBtnW}
                    height={primaryBtnH}
                    disabled={!selected}
                  />
                </View>
              </View>
            ) : null}

            {phase === 'result' ? (
              <View style={{ flex: 1 }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: bottomPad }}
                >
                  <View style={[styles.resultHeroCard, { width: cardW, borderRadius: 24 }]}>
                    <View style={styles.resultHeroGlow} />

                    <Text style={styles.resultEyebrow}>Recommended Profile</Text>
                    <Text style={styles.resultMainTitle}>{result.title}</Text>

                    <Image
                      source={result.image}
                      resizeMode="contain"
                      style={{
                        width: cardW - 48,
                        height: resultImageH,
                        alignSelf: 'center',
                        marginTop: 10,
                      }}
                    />

                    <View style={styles.resultChipRow}>
                      <InfoChip title={result.bestFor} />
                      <InfoChip title={result.depth} />
                    </View>
                  </View>

                  <View style={[styles.profileCard, { width: cardW, borderRadius: 22 }]}>
                    <Text style={styles.profileSectionLabel}>Best For</Text>
                    <Text style={styles.profileSectionValue}>{result.bestFor}</Text>

                    <View style={styles.sectionDivider} />

                    <Text style={styles.profileSectionLabel}>Water Type</Text>
                    <Text style={styles.profileSectionValue}>{result.waterType}</Text>

                    <View style={styles.sectionDivider} />

                    <Text style={styles.profileSectionLabel}>Depth</Text>
                    <Text style={styles.profileSectionValue}>{result.depth}</Text>
                  </View>

                  <View style={[styles.textCard, { width: cardW, borderRadius: 22 }]}>
                    <Text style={styles.textCardTitle}>Overview</Text>
                    <Text style={styles.textCardBody}>{result.description}</Text>
                  </View>

                  <View style={[styles.textCard, { width: cardW, borderRadius: 22 }]}>
                    <Text style={styles.textCardTitle}>Why This Match Works</Text>
                    <Text style={styles.textCardBody}>{result.why}</Text>
                  </View>

                  <View style={[styles.tipCard, { width: cardW, borderRadius: 22 }]}>
                    <Text style={styles.tipCardTitle}>Field Tip</Text>
                    <Text style={styles.tipCardBody}>{result.tip}</Text>
                  </View>

                  <View style={{ marginTop: 16, gap: 10 }}>
                    <PrimaryButton
                      title="Share Result"
                      onPress={onShare}
                      width={primaryBtnW}
                      height={primaryBtnH}
                    />
                    <SecondaryButton
                      title="Start Again"
                      onPress={onRestart}
                      width={primaryBtnW}
                      height={primaryBtnH}
                    />
                  </View>
                </ScrollView>
              </View>
            ) : null}
          </Animated.View>
        </View>
      </SafeAreaView>
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
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    paddingHorizontal: 18,
    paddingVertical: 18,
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

  heroEyebrow: {
    color: '#8EC2FF',
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 6,
  },

  heroSubtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    marginTop: 8,
  },

  heroChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },

  heroImageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  statTile: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },

  statTileValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  statTileTitle: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  infoChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginRight: 8,
    marginBottom: 8,
  },

  infoChipText: {
    color: '#EAF3FF',
    fontSize: 11,
    fontWeight: '700',
  },

  progressCard: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(8,23,42,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  progressLevelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  progressStepText: {
    color: 'rgba(255,255,255,0.64)',
    fontSize: 12,
    fontWeight: '700',
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 12,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0A5CC5',
  },

  questionCard: {
    alignSelf: 'center',
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: 'rgba(0,0,0,0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  questionEyebrow: {
    color: '#8EC2FF',
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  questionText: {
    color: '#FFFFFF',
    fontWeight: '900',
    lineHeight: 20,
  },

  answerCard: {
    alignSelf: 'center',
    borderWidth: 1,
    marginBottom: 10,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },

  answerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  answerIndex: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  answerIndexText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  answerText: {
    color: '#FFFFFF',
    fontWeight: '800',
    flex: 1,
  },

  resultHeroCard: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(94,154,255,0.18)',
    backgroundColor: 'rgba(8,23,42,0.74)',
    overflow: 'hidden',
  },

  resultHeroGlow: {
    position: 'absolute',
    top: -22,
    right: -12,
    width: 130,
    height: 130,
    borderRadius: 999,
    backgroundColor: 'rgba(72,135,255,0.12)',
  },

  resultEyebrow: {
    color: '#8EC2FF',
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  resultMainTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
    textAlign: 'center',
  },

  resultChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 14,
  },

  profileCard: {
    alignSelf: 'center',
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  profileSectionLabel: {
    color: 'rgba(255,255,255,0.54)',
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  profileSectionValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 6,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 14,
  },

  textCard: {
    alignSelf: 'center',
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  textCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },

  textCardBody: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13.2,
    lineHeight: 20,
    fontWeight: '600',
  },

  tipCard: {
    alignSelf: 'center',
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(10,92,197,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(77,171,255,0.22)',
  },

  tipCardTitle: {
    color: '#73B7FF',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  tipCardBody: {
    color: '#FFFFFF',
    fontSize: 13.2,
    lineHeight: 20,
    fontWeight: '600',
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

  secondaryButton: {
    backgroundColor: 'rgba(3,18,42,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(120,210,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 18,
  },

  secondaryButtonText: {
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.2,
  },
});