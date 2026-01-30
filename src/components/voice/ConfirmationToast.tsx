import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useAppStore } from '../../stores/appStore';
import { colors, typography, spacing, borderRadius } from '../../theme';

export function ConfirmationToast() {
  const { confirmationMessage, clearConfirmation } = useAppStore();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (confirmationMessage) {
      // Animate in
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
      translateY.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });

      // Animate out after delay
      opacity.value = withDelay(
        2500,
        withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(clearConfirmation)();
          }
        })
      );
      translateY.value = withDelay(
        2500,
        withTiming(-10, { duration: 300 })
      );
    } else {
      opacity.value = 0;
      translateY.value = 20;
    }
  }, [confirmationMessage]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!confirmationMessage) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.message}>{confirmationMessage}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 300,
  },
  message: {
    ...typography.body1,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
