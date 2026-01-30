import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface GoogleCalendar {
  id: string;
  summary: string;
  backgroundColor: string;
}

interface AccountCardProps {
  id: string;
  email: string;
  name: string;
  picture?: string;
  color: string;
  calendars: GoogleCalendar[];
  selectedCalendarIds: string[];
  onRemove: () => void;
  onToggleCalendar: (calendarId: string) => void;
  onColorChange?: (color: string) => void;
}

const COLOR_OPTIONS = [
  '#4A90A4', // Teal
  '#D4A574', // Gold
  '#9B59B6', // Purple
  '#E74C3C', // Red
  '#27AE60', // Green
  '#F39C12', // Orange
  '#3498DB', // Blue
  '#1ABC9C', // Turquoise
];

export function AccountCard({
  id,
  email,
  name,
  picture,
  color,
  calendars,
  selectedCalendarIds,
  onRemove,
  onToggleCalendar,
  onColorChange,
}: AccountCardProps) {
  const [showCalendars, setShowCalendars] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const selectedCount = selectedCalendarIds.length;
  const totalCount = calendars.length;

  return (
    <View style={styles.container}>
      {/* Account header */}
      <View style={styles.header}>
        <Pressable
          style={[styles.colorIndicator, { backgroundColor: color }]}
          onPress={() => setShowColorPicker(!showColorPicker)}
        />
        <View style={styles.avatar}>
          {picture ? (
            <Image source={{ uri: picture }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: color }]}>
              <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.email} numberOfLines={1}>{email}</Text>
        </View>
        <Pressable style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeIcon}>×</Text>
        </Pressable>
      </View>

      {/* Color picker */}
      {showColorPicker && onColorChange && (
        <View style={styles.colorPicker}>
          {COLOR_OPTIONS.map(c => (
            <Pressable
              key={c}
              style={[
                styles.colorOption,
                { backgroundColor: c },
                color === c && styles.colorOptionSelected,
              ]}
              onPress={() => {
                onColorChange(c);
                setShowColorPicker(false);
              }}
            />
          ))}
        </View>
      )}

      {/* Calendars toggle */}
      <Pressable
        style={styles.calendarsToggle}
        onPress={() => setShowCalendars(!showCalendars)}
      >
        <Text style={styles.calendarsLabel}>
          Calendars ({selectedCount}/{totalCount} selected)
        </Text>
        <Text style={styles.toggleIcon}>{showCalendars ? '▲' : '▼'}</Text>
      </Pressable>

      {/* Calendar list */}
      {showCalendars && (
        <View style={styles.calendarList}>
          {calendars.map(calendar => {
            const isSelected = selectedCalendarIds.includes(calendar.id);
            return (
              <Pressable
                key={calendar.id}
                style={styles.calendarItem}
                onPress={() => onToggleCalendar(calendar.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: calendar.backgroundColor },
                    isSelected && { backgroundColor: calendar.backgroundColor },
                  ]}
                >
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View
                  style={[styles.calendarColor, { backgroundColor: calendar.backgroundColor }]}
                />
                <Text style={styles.calendarName} numberOfLines={1}>
                  {calendar.summary}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: spacing.sm,
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
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  email: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    ...typography.headline3,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    paddingTop: 0,
    gap: spacing.xs,
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.textPrimary,
  },
  calendarsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  calendarsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  toggleIcon: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  calendarList: {
    padding: spacing.sm,
    paddingTop: spacing.xs,
    backgroundColor: colors.surface,
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    ...typography.label,
    color: colors.textPrimary,
    fontSize: 11,
  },
  calendarColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  calendarName: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
});
