import React, { useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SlideImage } from './SlideImage';
import { useSlideshow } from '../../hooks/useSlideshow';
import { useAppStore } from '../../stores/appStore';
import { colors } from '../../theme';

interface SlideshowProps {
  onTap?: () => void;
}

export function Slideshow({ onTap }: SlideshowProps) {
  const { images, currentIndex } = useSlideshow();
  const { toggleCalendar, isCalendarVisible, isTodoListVisible, hideTodos } = useAppStore();

  const handleTap = useCallback(() => {
    if (onTap) {
      onTap();
    } else if (isTodoListVisible) {
      hideTodos();
    } else {
      toggleCalendar();
    }
  }, [onTap, toggleCalendar, isTodoListVisible, hideTodos]);

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      <View style={styles.imageContainer}>
        {images.map((image, index) => (
          <SlideImage
            key={image.id}
            image={image}
            isActive={index === currentIndex}
            transitionDuration={1000}
          />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
});
