import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SlideImage as SlideImageType } from '../../types';

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface SlideImageProps {
  image: SlideImageType;
  isActive: boolean;
  transitionDuration?: number;
}

export function SlideImage({
  image,
  isActive,
  transitionDuration = 1000,
}: SlideImageProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isActive ? 1 : 0, {
        duration: transitionDuration,
        easing: Easing.inOut(Easing.ease),
      }),
    };
  }, [isActive, transitionDuration]);

  return (
    <AnimatedImage
      source={{ uri: image.url }}
      style={[styles.image, animatedStyle]}
      contentFit="cover"
      transition={0}
      cachePolicy="memory-disk"
      placeholder={null}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
