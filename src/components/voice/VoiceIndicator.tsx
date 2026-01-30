import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useAppStore } from '../../stores/appStore';
import { colors, typography, spacing, layout, borderRadius } from '../../theme';

export function VoiceIndicator() {
  const { voiceState } = useAppStore();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    if (voiceState === 'listening' || voiceState === 'processing') {
      // Show indicator
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });

      // Pulsing animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 0 })
        ),
        -1
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 0 }),
          withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) })
        ),
        -1
      );
    } else if (voiceState === 'confirming') {
      // Brief flash then hide
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 500 })
      );
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      pulseOpacity.value = 0;
    } else {
      // Hide
      opacity.value = withTiming(0, { duration: 200 });
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      pulseOpacity.value = 0;
    }
  }, [voiceState]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const statusText = {
    idle: '',
    listening: 'Listening...',
    processing: 'Processing...',
    confirming: 'Done',
  }[voiceState];

  if (voiceState === 'idle') {
    return null;
  }

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Pulse ring */}
      <Animated.View style={[styles.pulseRing, pulseStyle]} />

      {/* Main orb */}
      <View style={styles.orb}>
        <View style={styles.orbInner} />
      </View>

      {/* Status text */}
      <Text style={styles.statusText}>{statusText}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  pulseRing: {
    position: 'absolute',
    width: layout.voiceIndicatorSize,
    height: layout.voiceIndicatorSize,
    borderRadius: layout.voiceIndicatorSize / 2,
    backgroundColor: colors.voicePulse,
  },
  orb: {
    width: layout.voiceIndicatorSize * 0.6,
    height: layout.voiceIndicatorSize * 0.6,
    borderRadius: (layout.voiceIndicatorSize * 0.6) / 2,
    backgroundColor: colors.voiceActive,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.voiceActive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  orbInner: {
    width: layout.voiceIndicatorSize * 0.25,
    height: layout.voiceIndicatorSize * 0.25,
    borderRadius: (layout.voiceIndicatorSize * 0.25) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  statusText: {
    ...typography.body2,
    color: colors.textPrimary,
    marginTop: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
