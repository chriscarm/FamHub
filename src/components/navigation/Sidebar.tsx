import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface SidebarProps {
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    onOpenSettings?: () => void;
    onSwitchToFrame?: () => void;
}

export function Sidebar({
    activeTab,
    onTabChange,
    onOpenSettings,
    onSwitchToFrame
}: SidebarProps) {
    return (
        <View style={styles.container}>
            {/* Top: Branding or Date/Time? Let's keep it simple with Icons for now */}
            <View style={styles.topSection}>
                {/* Home/Dashboard Icon */}
                <Pressable
                    style={[styles.navItem, styles.activeNavItem]}
                    onPress={() => onTabChange?.('dashboard')}
                >
                    <Text style={styles.navIcon}>🏠</Text>
                    <Text style={styles.navLabel}>Home</Text>
                </Pressable>
            </View>

            {/* Middle: Actions */}
            <View style={styles.middleSection}>
                {/* Frame Mode Button */}
                <Pressable style={styles.navItem} onPress={onSwitchToFrame}>
                    <Text style={styles.navIcon}>🖼️</Text>
                    <Text style={styles.navLabel}>Frame</Text>
                </Pressable>
            </View>

            {/* Bottom: Settings */}
            <View style={styles.bottomSection}>
                <Pressable style={styles.navItem} onPress={onOpenSettings}>
                    <Text style={styles.navIcon}>⚙️</Text>
                    <Text style={styles.navLabel}>Settings</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 80, // Fixed width
        height: '100%',
        backgroundColor: colors.surface,
        borderRightWidth: 1,
        borderRightColor: colors.surfaceLight,
        paddingVertical: spacing.md,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topSection: {
        gap: spacing.lg,
        alignItems: 'center',
    },
    middleSection: {
        flex: 1,
        justifyContent: 'center',
        gap: spacing.lg,
        alignItems: 'center',
    },
    bottomSection: {
        gap: spacing.lg,
        alignItems: 'center',
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        width: 64,
        height: 64,
    },
    activeNavItem: {
        backgroundColor: colors.surfaceLight,
    },
    navIcon: {
        fontSize: 24,
        marginBottom: spacing.xs,
        color: colors.textPrimary,
    },
    navLabel: {
        ...typography.caption,
        fontSize: 10,
        color: colors.textSecondary,
    },
});
