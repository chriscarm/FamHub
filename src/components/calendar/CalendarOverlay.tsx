import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppStore } from '../../stores/appStore';
import { colors, typography, spacing, layout, borderRadius } from '../../theme';
import { CalendarEvent, Person } from '../../types';

const AnimatedView = Animated.createAnimatedComponent(View);

interface CalendarOverlayProps {
  onClose?: () => void;
}

export function CalendarOverlay({ onClose }: CalendarOverlayProps) {
  const { isCalendarVisible, hideCalendar, events } = useAppStore();

  const handleClose = () => {
    hideCalendar();
    onClose?.();
  };

  // Group events by date for marking
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    events.forEach((event) => {
      if (!marks[event.date]) {
        marks[event.date] = {
          dots: [],
        };
      }
      marks[event.date].dots.push({
        key: event.id,
        color: event.person === 'chris' ? colors.chris : colors.christy,
      });
    });

    // Add marking style
    Object.keys(marks).forEach((date) => {
      marks[date].marked = true;
    });

    return marks;
  }, [events]);

  // Get events for today and upcoming
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter((event) => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8);
  }, [events]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(isCalendarVisible ? 0 : layout.calendarWidth + 20, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
          }),
        },
      ],
      opacity: withTiming(isCalendarVisible ? 1 : 0, {
        duration: 250,
      }),
    };
  }, [isCalendarVisible]);

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isCalendarVisible ? 1 : 0, {
        duration: 200,
      }),
      pointerEvents: isCalendarVisible ? 'auto' : 'none',
    };
  }, [isCalendarVisible]);

  const calendarTheme = {
    backgroundColor: colors.calendarBackground,
    calendarBackground: colors.calendarBackground,
    textSectionTitleColor: colors.textSecondary,
    selectedDayBackgroundColor: colors.chris,
    selectedDayTextColor: colors.textPrimary,
    todayTextColor: colors.chris,
    todayBackgroundColor: colors.calendarToday,
    dayTextColor: colors.calendarDayText,
    textDisabledColor: colors.textTertiary,
    monthTextColor: colors.calendarMonthText,
    arrowColor: colors.calendarArrow,
    textDayFontSize: 16,
    textMonthFontSize: 20,
    textDayHeaderFontSize: 14,
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <Pressable style={styles.overlayPressable} onPress={handleClose} />
      </AnimatedView>

      {/* Calendar Panel */}
      <AnimatedView style={[styles.container, containerStyle]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.chris }]} />
              <Text style={styles.legendText}>Chris</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.christy }]} />
              <Text style={styles.legendText}>Christy</Text>
            </View>
          </View>
        </View>

        <Calendar
          style={styles.calendar}
          theme={calendarTheme}
          markedDates={markedDates}
          markingType="multi-dot"
          enableSwipeMonths
        />

        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>Upcoming</Text>
          <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
            {upcomingEvents.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Today</Text>
                {upcomingEvents
                  .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
                  .map(event => (
                    <EventRow key={event.id} event={event} />
                  ))}
              </View>
            )}

            {upcomingEvents.filter(e => new Date(e.date).toDateString() !== new Date().toDateString()).length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Rest of the Week</Text>
                {upcomingEvents
                  .filter(e => new Date(e.date).toDateString() !== new Date().toDateString())
                  .map(event => (
                    <EventRow key={event.id} event={event} />
                  ))}
              </View>
            )}

            {upcomingEvents.length === 0 && (
              <Text style={styles.noEvents}>No upcoming events</Text>
            )}
          </ScrollView>
        </View>
      </AnimatedView>
    </>
  );
}

interface EventRowProps {
  event: CalendarEvent;
}

function EventRow({ event }: EventRowProps) {
  const personColor = event.person === 'chris' ? colors.chris : colors.christy;

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
    <View style={styles.eventRow}>
      <View style={[styles.eventIndicator, { backgroundColor: personColor }]} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDate}>
          {formatDate(event.date)}
          {event.time && ` at ${event.time}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    zIndex: 100,
  },
  overlayPressable: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: layout.calendarWidth,
    backgroundColor: colors.surface,
    zIndex: 101,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.headline2,
    color: colors.textPrimary,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  calendar: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  eventsSection: {
    flex: 1,
    marginTop: spacing.lg,
  },
  eventsTitle: {
    ...typography.headline3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  eventsList: {
    flex: 1,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  eventIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    ...typography.body2,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  eventDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  noEvents: {
    ...typography.body2,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
