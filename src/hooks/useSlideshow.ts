import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';

interface UseSlideshowOptions {
  enabled?: boolean;
  interval?: number;
}

export function useSlideshow(options: UseSlideshowOptions = {}) {
  const { enabled = true, interval } = options;

  const {
    images,
    currentImageIndex,
    slideshowInterval,
    nextImage,
    previousImage,
    setCurrentImage,
  } = useAppStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const effectiveInterval = interval ?? slideshowInterval;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    if (enabled && images.length > 1) {
      timerRef.current = setInterval(() => {
        nextImage();
      }, effectiveInterval);
    }
  }, [enabled, images.length, effectiveInterval, nextImage, clearTimer]);

  // Reset timer when manually changing slides
  const goToNext = useCallback(() => {
    nextImage();
    startTimer();
  }, [nextImage, startTimer]);

  const goToPrevious = useCallback(() => {
    previousImage();
    startTimer();
  }, [previousImage, startTimer]);

  const goToSlide = useCallback((index: number) => {
    setCurrentImage(index);
    startTimer();
  }, [setCurrentImage, startTimer]);

  // Auto-advance effect
  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  return {
    images,
    currentImage: images[currentImageIndex],
    currentIndex: currentImageIndex,
    totalImages: images.length,
    goToNext,
    goToPrevious,
    goToSlide,
    pauseSlideshow: clearTimer,
    resumeSlideshow: startTimer,
  };
}
