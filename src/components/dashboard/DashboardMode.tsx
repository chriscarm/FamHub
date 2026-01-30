import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAppStore } from '../../stores/appStore';
import { MonthCalendar } from './MonthCalendar';
import { TaskItem } from './TaskItem';
import { Sidebar } from '../navigation/Sidebar';

interface DashboardModeProps {
  onOpenSettings?: () => void;
  onSwitchToFrame?: () => void;
}

type TodoFilter = 'all' | 'chris' | 'christy';

export function DashboardMode({ onOpenSettings, onSwitchToFrame }: DashboardModeProps) {
  const { events, todos, completeTodo } = useAppStore();
  const [todoFilter, setTodoFilter] = useState<TodoFilter>('all');

  // Filter incomplete todos only (Shopping list removed)
  const activeTodos = useMemo(() => {
    return todos.filter(t => !t.completed).slice(0, 15);
  }, [todos]);

  return (
    <View style={styles.container}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab="dashboard"
        onSwitchToFrame={onSwitchToFrame}
        onOpenSettings={onOpenSettings}
      />

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Calendar Section - Fixed Aspect Ratio or Flex */}
        <View style={styles.calendarSection}>
          <MonthCalendar events={events} />
        </View>

        {/* To-Do Section (Split View) */}
        <View style={styles.todoSection}>
          <View style={styles.todoColumns}>
            {/* Dad's List (Chris) */}
            <View style={styles.todoColumn}>
              <View style={styles.columnHeader}>
                <Text style={styles.columnTitle}>Dad 👨🏻</Text>
              </View>
              <ScrollView style={styles.listContent} showsVerticalScrollIndicator={false}>
                {todos.filter(t => !t.completed && t.person === 'chris').length > 0 ? (
                  <View style={styles.taskList}>
                    {todos.filter(t => !t.completed && t.person === 'chris').slice(0, 10).map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onComplete={() => completeTodo(task.id)}
                        compact
                      />
                    ))}
                  </View>
                ) : (
                  <EmptyState icon="✓" title="All done!" subtitle="" />
                )}
              </ScrollView>
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Mom's List (Christy) */}
            <View style={styles.todoColumn}>
              <View style={styles.columnHeader}>
                <Text style={styles.columnTitle}>Mom 👩🏼</Text>
              </View>
              <ScrollView style={styles.listContent} showsVerticalScrollIndicator={false}>
                {todos.filter(t => !t.completed && t.person === 'christy').length > 0 ? (
                  <View style={styles.taskList}>
                    {todos.filter(t => !t.completed && t.person === 'christy').slice(0, 10).map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onComplete={() => completeTodo(task.id)}
                        compact
                      />
                    ))}
                  </View>
                ) : (
                  <EmptyState icon="✓" title="All done!" subtitle="" />
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
}

function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Horizontal layout
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  calendarSection: {
    flex: 3, // Adjust ratio as needed
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  todoSection: {
    flex: 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    padding: spacing.sm, // Reduced padding for more space
  },
  todoColumns: {
    flex: 1,
    flexDirection: 'row',
  },
  todoColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  columnHeader: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
    marginBottom: spacing.xs,
  },
  columnTitle: {
    ...typography.headline4,
    color: colors.textPrimary,
    fontSize: 14,
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: colors.surfaceLight,
    marginHorizontal: spacing.sm,
  },
  listContent: {
    flex: 1,
  },
  taskList: {
    gap: spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  emptyTitle: {
    ...typography.body2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
