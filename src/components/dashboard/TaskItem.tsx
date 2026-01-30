import React from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { TodoItem } from '../../types';

interface TaskItemProps {
  task: TodoItem;
  onComplete: () => void;
  compact?: boolean;
}

export function TaskItem({ task, onComplete, compact = true }: TaskItemProps) {
  // Get color based on account/person
  const getColor = () => {
    if ('accountId' in task && (task as any).accountColor) {
      return (task as any).accountColor;
    }
    return task.person === 'chris' ? colors.chris : colors.christy;
  };

  const personColor = getColor();

  // Get avatar - could be Google profile pic or fallback
  const getAvatar = () => {
    if ('accountPicture' in task && (task as any).accountPicture) {
      return { uri: (task as any).accountPicture };
    }
    return null;
  };

  const avatar = getAvatar();
  const personInitial = task.person.charAt(0).toUpperCase();

  return (
    <Pressable
      style={[
        styles.container,
        compact && styles.containerCompact,
        task.completed && styles.containerCompleted,
      ]}
      onPress={task.completed ? undefined : onComplete}
    >
      {/* Checkbox */}
      <Pressable
        style={[
          styles.checkbox,
          compact && styles.checkboxCompact,
          { borderColor: personColor },
          task.completed && styles.checkboxCompleted,
        ]}
        onPress={task.completed ? undefined : onComplete}
      >
        {task.completed && (
          <View style={[styles.checkmark, { backgroundColor: personColor }]} />
        )}
      </Pressable>

      {/* Task text */}
      <Text
        style={[
          styles.text,
          compact && styles.textCompact,
          task.completed && styles.textCompleted,
        ]}
        numberOfLines={1}
      >
        {task.text}
      </Text>

      {/* Avatar indicator */}
      <View style={[styles.avatar, compact && styles.avatarCompact]}>
        {avatar ? (
          <Image source={avatar} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: personColor }]}>
            <Text style={styles.avatarText}>{personInitial}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    height: 56,
  },
  containerCompact: {
    height: 40,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  containerCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxCompact: {
    width: 18,
    height: 18,
    borderRadius: 3,
    marginRight: spacing.sm,
  },
  checkboxCompleted: {
    backgroundColor: 'transparent',
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  text: {
    ...typography.body2,
    color: colors.textPrimary,
    flex: 1,
    fontSize: 16,
  },
  textCompact: {
    fontSize: 13,
  },
  textCompleted: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    marginLeft: spacing.sm,
  },
  avatarCompact: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
