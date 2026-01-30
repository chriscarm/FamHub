import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { DashboardMode } from '../src/components/dashboard';
import { FrameMode } from '../src/components/frame';
import { SettingsDrawer } from '../src/components/settings';
import { CalendarOverlay } from '../src/components/calendar/CalendarOverlay';
import { VoiceListener } from '../src/components/voice/VoiceListener';
import { TodoList } from '../src/components/todos/TodoList';
import { useAppStore } from '../src/stores/appStore';
import { useGoogleCalendarSync } from '../src/hooks/useGoogleCalendarSync';
import { colors, typography, spacing } from '../src/theme';

// Optional: Set your Picovoice access key here or via environment variable
const PICOVOICE_ACCESS_KEY = process.env.EXPO_PUBLIC_PICOVOICE_KEY || '';

export default function HomeScreen() {
  const {
    mode,
    setMode,
    voiceState,
    isSettingsOpen,
    openSettings,
    closeSettings,
  } = useAppStore();

  // Google Calendar sync hook
  const {
    accounts,
    syncSettings,
    isSyncing,
    addGoogleAccount,
    removeGoogleAccount,
    syncAllCalendars,
    updateAccountColor,
    toggleAccountCalendar,
    toggleAutoSync,
  } = useGoogleCalendarSync();

  // Development helper: Long press to simulate wake word
  const handleLongPress = useCallback(() => {
    if (__DEV__ && voiceState === 'idle') {
      console.log('Dev: Simulating wake word');
      if ((global as any).simulateWakeWord) {
        (global as any).simulateWakeWord();
      }
    }
  }, [voiceState]);

  // Switch between modes
  const handleSwitchToFrame = useCallback(() => {
    setMode('frame');
  }, [setMode]);

  const handleSwitchToDashboard = useCallback(() => {
    setMode('dashboard');
  }, [setMode]);

  // Handle opening settings
  const handleOpenSettings = useCallback(() => {
    openSettings();
  }, [openSettings]);

  return (
    <View style={styles.container}>
      {/* Main Content based on mode */}
      {mode === 'dashboard' ? (
        <DashboardMode
          onOpenSettings={handleOpenSettings}
          onSwitchToFrame={handleSwitchToFrame}
        />
      ) : (
        <Pressable style={styles.frameContainer} onLongPress={handleLongPress} delayLongPress={500}>
          <FrameMode
            onSwitchToDashboard={handleSwitchToDashboard}
            onOpenSettings={handleOpenSettings}
          />
        </Pressable>
      )}

      {/* Calendar Overlay (for Frame mode) */}
      {mode === 'frame' && <CalendarOverlay />}

      {/* Todo List Overlay */}
      <TodoList />

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        accounts={accounts}
        syncSettings={syncSettings}
        isSyncing={isSyncing}
        onAddAccount={addGoogleAccount}
        onRemoveAccount={removeGoogleAccount}
        onToggleCalendar={toggleAccountCalendar}
        onUpdateAccountColor={updateAccountColor}
        onToggleAutoSync={toggleAutoSync}
        onSyncNow={syncAllCalendars}
      />

      {/* Voice Command System */}
      <VoiceListener
        picovoiceAccessKey={PICOVOICE_ACCESS_KEY}
        enabled={true}
      />

      {/* Development mode indicator */}
      {__DEV__ && (
        <View style={styles.devIndicator}>
          <Text style={styles.devText}>DEV MODE - Long press to test voice</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  frameContainer: {
    flex: 1,
  },
  devIndicator: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.md,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  devText: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 10,
  },
});
