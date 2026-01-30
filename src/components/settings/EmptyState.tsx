import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface EmptyStateProps {
  onAddAccount: () => void;
}

export function EmptyState({ onAddAccount }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📅</Text>
        <Text style={styles.title}>Connect Your Calendar</Text>
        <Text style={styles.description}>
          Add a Google account to see your events and sync calendars across your family
        </Text>
        <Pressable style={styles.button} onPress={onAddAccount}>
          <Text style={styles.buttonIcon}>G</Text>
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headline3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.md,
  },
  buttonIcon: {
    ...typography.body1,
    color: colors.background,
    fontWeight: '700',
    fontSize: 20,
  },
  buttonText: {
    ...typography.body2,
    color: colors.background,
    fontWeight: '500',
  },
});
