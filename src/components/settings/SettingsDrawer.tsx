import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Switch, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, layout } from '../../theme';
import { AccountCard } from './AccountCard';

const AnimatedView = Animated.createAnimatedComponent(View);

interface GoogleAccount {
  id: string;
  email: string;
  name: string;
  picture?: string;
  color: string;
  calendars: Array<{
    id: string;
    summary: string;
    backgroundColor: string;
  }>;
  selectedCalendarIds: string[];
}

interface SyncSettings {
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  lastSyncTime: Date | null;
}

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: GoogleAccount[];
  syncSettings: SyncSettings;
  isSyncing: boolean;
  onAddAccount: () => void;
  onRemoveAccount: (accountId: string) => void;
  onToggleCalendar: (accountId: string, calendarId: string) => void;
  onUpdateAccountColor: (accountId: string, color: string) => void;
  onToggleAutoSync: (enabled: boolean) => void;
  onSyncNow: () => void;
}

const DRAWER_WIDTH = 360;

export function SettingsDrawer({
  isOpen,
  onClose,
  accounts,
  syncSettings,
  isSyncing,
  onAddAccount,
  onRemoveAccount,
  onToggleCalendar,
  onUpdateAccountColor,
  onToggleAutoSync,
  onSyncNow,
}: SettingsDrawerProps) {
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(isOpen ? 0 : DRAWER_WIDTH + 20, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        }),
      },
    ],
  }), [isOpen]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen ? 1 : 0, { duration: 200 }),
    pointerEvents: isOpen ? 'auto' : 'none',
  }), [isOpen]);

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <Pressable style={styles.overlayPressable} onPress={onClose} />
      </AnimatedView>

      {/* Drawer */}
      <AnimatedView style={[styles.drawer, drawerStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeIcon}>×</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Accounts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Google Accounts</Text>
            <Text style={styles.sectionDescription}>
              Connected accounts appear as family members on the calendar
            </Text>

            {accounts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👤</Text>
                <Text style={styles.emptyText}>No accounts connected</Text>
                <Text style={styles.emptySubtext}>
                  Add a Google account to sync calendars
                </Text>
              </View>
            ) : (
              <View style={styles.accountsList}>
                {accounts.map(account => (
                  <AccountCard
                    key={account.id}
                    {...account}
                    onRemove={() => onRemoveAccount(account.id)}
                    onToggleCalendar={(calendarId) => onToggleCalendar(account.id, calendarId)}
                    onColorChange={(color) => onUpdateAccountColor(account.id, color)}
                  />
                ))}
              </View>
            )}

            <Pressable style={styles.addAccountButton} onPress={onAddAccount}>
              <Text style={styles.addAccountIcon}>+</Text>
              <Text style={styles.addAccountText}>Add Google Account</Text>
            </Pressable>
          </View>

          {/* Sync Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sync Settings</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-sync</Text>
                <Text style={styles.settingDescription}>
                  Sync every {syncSettings.syncIntervalMinutes} minutes
                </Text>
              </View>
              <Switch
                value={syncSettings.autoSyncEnabled}
                onValueChange={onToggleAutoSync}
                trackColor={{ false: colors.surfaceLight, true: colors.chris }}
                thumbColor={colors.textPrimary}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Last synced</Text>
                <Text style={styles.settingDescription}>
                  {formatLastSync(syncSettings.lastSyncTime)}
                </Text>
              </View>
              <Pressable
                style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
                onPress={onSyncNow}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color={colors.textPrimary} />
                ) : (
                  <Text style={styles.syncButtonText}>Sync Now</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.aboutInfo}>
              <Text style={styles.aboutText}>Family Hub v1.0.0</Text>
              <Text style={styles.aboutSubtext}>
                Optimized for 13" tablets (1920×1200)
              </Text>
            </View>
          </View>
        </ScrollView>
      </AnimatedView>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    zIndex: 200,
  },
  overlayPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.surface,
    zIndex: 201,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  headerTitle: {
    ...typography.headline3,
    color: colors.textPrimary,
    fontSize: 18,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    ...typography.headline2,
    color: colors.textSecondary,
    lineHeight: 28,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  accountsList: {
    marginBottom: spacing.sm,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    backgroundColor: colors.chris,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  addAccountIcon: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  addAccountText: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    ...typography.body2,
    color: colors.textPrimary,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  syncButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  aboutInfo: {
    paddingVertical: spacing.sm,
  },
  aboutText: {
    ...typography.body2,
    color: colors.textPrimary,
  },
  aboutSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
