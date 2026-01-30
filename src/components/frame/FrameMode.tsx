import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, Image, ScrollView } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Slideshow } from '../slideshow/Slideshow';
import { useAppStore } from '../../stores/appStore';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { CalendarEvent } from '../../types';

interface FrameModeProps {
  onSwitchToDashboard?: () => void;
  onOpenSettings?: () => void;
}

export function FrameMode({ onSwitchToDashboard, onOpenSettings }: FrameModeProps) {
  const { events, showCalendar } = useAppStore();

  // Get today's and upcoming events
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6);
  }, [events]);

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Background Slideshow */}
      <Slideshow />

      {/* Tap to show calendar */}
      <Pressable style={styles.tapLayer} onPress={showCalendar}>
        <View style={styles.overlayGradient} />
      </Pressable>

      {/* Top bar with time and controls */}
      <View style={styles.topBar}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{currentTime}</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>
        <View style={styles.controls}>
          <Pressable style={styles.controlButton} onPress={onSwitchToDashboard}>
            <Text style={styles.controlIcon}>📅</Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={onOpenSettings}>
            <Text style={styles.controlIcon}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      {/* Events sidebar */}
      {upcomingEvents.length > 0 && (
        <Animated.View
          style={styles.eventsSidebar}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
        >
          <Text style={styles.eventsTitle}>Upcoming</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

interface EventCardProps {
  event: CalendarEvent;
}

function EventCard({ event }: EventCardProps) {
  // Get color based on account/person
  const getEventColor = () => {
    if ('accountId' in event && (event as any).accountColor) {
      return (event as any).accountColor;
    }
    return event.person === 'chris' ? colors.chris : colors.christy;
  };

  // Get avatar
  const getAvatar = () => {
    if ('accountPicture' in event && (event as any).accountPicture) {
      return { uri: (event as any).accountPicture };
    }
    return null;
  };

  const eventColor = getEventColor();
  const avatar = getAvatar();
  const personInitial = event.person.charAt(0).toUpperCase();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.eventCard}>
      <View style={[styles.eventIndicator, { backgroundColor: eventColor }]} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.eventMeta}>
          {formatDate(event.date)}
          {event.time && ` • ${event.time}`}
        </Text>
      </View>
      <View style={styles.eventAvatar}>
        {avatar ? (
          <Image source={avatar} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: eventColor }]}>
            <Text style={styles.avatarText}>{personInitial}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tapLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  timeContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  timeText: {
    ...typography.headline2,
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '300',
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: {
    fontSize: 18,
  },
  eventsSidebar: {
    position: 'absolute',
    right: spacing.md,
    top: 72,
    bottom: spacing.md,
    width: 260,
    backgroundColor: 'rgba(26,26,26,0.9)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  eventsTitle: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  eventIndicator: {
    width: 3,
    height: 32,
    borderRadius: 1.5,
    marginRight: spacing.sm,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 12,
    marginBottom: 2,
  },
  eventMeta: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 10,
  },
  eventAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    marginLeft: spacing.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.label,
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
});
