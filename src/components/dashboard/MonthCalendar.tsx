import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { CalendarEvent } from '../../types';

interface MonthCalendarProps {
  events: CalendarEvent[];
  onDayPress?: (date: string) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthCalendar({ events, onDayPress }: MonthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { year, month, days, today } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const todayDate = new Date();
    const today = todayDate.getFullYear() === year && todayDate.getMonth() === month
      ? todayDate.getDate()
      : null;

    // Create array of days with padding
    const days: (number | null)[] = [];
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    // Pad to complete last row
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return { year, month, days, today };
  }, [currentDate]);

  // Group events by date string
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });
    return map;
  }, [events]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateString = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.monthText}>{MONTHS[month]} {year}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.navButton} onPress={goToToday}>
            <Text style={styles.navButtonText}>Today</Text>
          </Pressable>
          <Pressable style={styles.navButton} onPress={goToPrevMonth}>
            <Text style={styles.navButtonText}>‹</Text>
          </Pressable>
          <Pressable style={styles.navButton} onPress={goToNextMonth}>
            <Text style={styles.navButtonText}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaders}>
        {DAYS.map(day => (
          <View key={day} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {Array.from({ length: days.length / 7 }).map((_, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {days.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => {
              const dateStr = day ? formatDateString(day) : '';
              const dayEvents = day ? (eventsByDate[dateStr] || []) : [];
              const isToday = day === today;

              return (
                <Pressable
                  key={dayIndex}
                  style={[styles.dayCell, isToday && styles.todayCell]}
                  onPress={() => day && onDayPress?.(dateStr)}
                >
                  {day && (
                    <>
                      <Text style={[styles.dayNumber, isToday && styles.todayNumber]}>
                        {day}
                      </Text>
                      <View style={styles.eventsContainer}>
                        {dayEvents.slice(0, 4).map((event, i) => (
                          <EventPill key={event.id} event={event} isLast={i === 3 && dayEvents.length > 4} />
                        ))}
                        {dayEvents.length > 4 && (
                          <Text style={styles.moreEvents}>+{dayEvents.length - 4}</Text>
                        )}
                      </View>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

interface EventPillProps {
  event: CalendarEvent;
  isLast?: boolean;
}

function EventPill({ event, isLast }: EventPillProps) {
  // Get color based on account/person
  const getEventColor = () => {
    if ('accountId' in event && (event as any).accountColor) {
      return (event as any).accountColor;
    }
    // Fallback to person colors
    return event.person === 'chris' ? colors.chris : colors.christy;
  };

  return (
    <View style={[styles.eventPill, { backgroundColor: getEventColor() }]}>
      <Text style={styles.eventPillText} numberOfLines={1}>
        {event.time ? `${event.time} ` : ''}{event.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  monthText: {
    ...typography.headline3,
    color: colors.textPrimary,
    fontSize: 18,
  },
  navButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    minWidth: 32,
    alignItems: 'center',
  },
  navButtonText: {
    ...typography.body2,
    color: colors.textPrimary,
    fontSize: 14,
  },
  dayHeaders: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 11,
  },
  grid: {
    flex: 1,
  },
  week: {
    flex: 1,
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: colors.surfaceLight,
    padding: 2,
    // Removed minHeight to allow flexible sizing
  },
  todayCell: {
    backgroundColor: colors.calendarToday,
  },
  dayNumber: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 12,
    marginBottom: 2,
  },
  todayNumber: {
    color: colors.chris,
    fontWeight: '600',
  },
  eventsContainer: {
    flex: 1,
    gap: 1,
  },
  eventPill: {
    borderRadius: 2,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  eventPillText: {
    ...typography.label,
    color: colors.textPrimary,
    fontSize: 9,
    lineHeight: 11,
  },
  moreEvents: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 8,
    textAlign: 'center',
  },
});
