import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { useAppStore } from '../../stores/appStore';
import { colors, typography, spacing, layout, borderRadius } from '../../theme';
import { Person, TodoItem } from '../../types';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TodoList() {
  const { isTodoListVisible, selectedTodoPerson, todos, hideTodos, completeTodo } = useAppStore();

  // Filter todos based on selected person
  const filteredTodos = useMemo(() => {
    const filtered = selectedTodoPerson
      ? todos.filter((t) => t.person === selectedTodoPerson)
      : todos;

    // Sort: incomplete first, then by creation date
    return [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [todos, selectedTodoPerson]);

  const chrisTodos = useMemo(() => filteredTodos.filter((t) => t.person === 'chris'), [filteredTodos]);
  const christyTodos = useMemo(() => filteredTodos.filter((t) => t.person === 'christy'), [filteredTodos]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(isTodoListVisible ? 0 : layout.calendarWidth + 20, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
          }),
        },
      ],
      opacity: withTiming(isTodoListVisible ? 1 : 0, { duration: 250 }),
    };
  }, [isTodoListVisible]);

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isTodoListVisible ? 1 : 0, { duration: 200 }),
      pointerEvents: isTodoListVisible ? 'auto' : 'none',
    };
  }, [isTodoListVisible]);

  return (
    <>
      {/* Backdrop */}
      <AnimatedView style={[styles.overlay, overlayStyle]}>
        <Pressable style={styles.overlayPressable} onPress={hideTodos} />
      </AnimatedView>

      {/* Todo Panel */}
      <AnimatedView style={[styles.container, containerStyle]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {selectedTodoPerson
              ? `${selectedTodoPerson.charAt(0).toUpperCase() + selectedTodoPerson.slice(1)}'s Todos`
              : 'All Todos'}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Show both lists if no person selected */}
          {!selectedTodoPerson ? (
            <>
              <PersonSection
                person="chris"
                todos={chrisTodos}
                onComplete={completeTodo}
              />
              <View style={styles.divider} />
              <PersonSection
                person="christy"
                todos={christyTodos}
                onComplete={completeTodo}
              />
            </>
          ) : (
            <View style={styles.todoList}>
              {filteredTodos.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onComplete={() => completeTodo(todo.id)}
                />
              ))}
              {filteredTodos.length === 0 && (
                <Text style={styles.emptyText}>No todos yet</Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Say "Hey Droid, add [item] to [name]'s list"
          </Text>
        </View>
      </AnimatedView>
    </>
  );
}

interface PersonSectionProps {
  person: Person;
  todos: TodoItem[];
  onComplete: (id: string) => void;
}

function PersonSection({ person, todos, onComplete }: PersonSectionProps) {
  const personColor = person === 'chris' ? colors.chris : colors.christy;
  const personName = person.charAt(0).toUpperCase() + person.slice(1);

  return (
    <View style={styles.personSection}>
      <View style={styles.personHeader}>
        <View style={[styles.personDot, { backgroundColor: personColor }]} />
        <Text style={styles.personName}>{personName}</Text>
        <Text style={styles.todoCount}>
          {todos.filter((t) => !t.completed).length} active
        </Text>
      </View>
      <View style={styles.todoList}>
        {todos.map((todo) => (
          <TodoRow key={todo.id} todo={todo} onComplete={() => onComplete(todo.id)} />
        ))}
        {todos.length === 0 && <Text style={styles.emptyText}>No todos</Text>}
      </View>
    </View>
  );
}

interface TodoRowProps {
  todo: TodoItem;
  onComplete: () => void;
}

function TodoRow({ todo, onComplete }: TodoRowProps) {
  const personColor = todo.person === 'chris' ? colors.chris : colors.christy;

  return (
    <AnimatedPressable
      style={styles.todoRow}
      onPress={todo.completed ? undefined : onComplete}
      layout={Layout.springify()}
    >
      <Pressable
        style={[
          styles.checkbox,
          todo.completed && styles.checkboxCompleted,
          { borderColor: personColor },
        ]}
        onPress={todo.completed ? undefined : onComplete}
      >
        {todo.completed && (
          <View style={[styles.checkmark, { backgroundColor: personColor }]} />
        )}
      </Pressable>
      <Text
        style={[
          styles.todoText,
          todo.completed && styles.todoTextCompleted,
        ]}
      >
        {todo.text}
      </Text>
    </AnimatedPressable>
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
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.headline2,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  personSection: {
    marginBottom: spacing.lg,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  personDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  personName: {
    ...typography.headline3,
    color: colors.textPrimary,
    flex: 1,
  },
  todoCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceLight,
    marginVertical: spacing.lg,
  },
  todoList: {
    gap: spacing.sm,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: 'transparent',
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  todoText: {
    ...typography.body2,
    color: colors.textPrimary,
    flex: 1,
  },
  todoTextCompleted: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  emptyText: {
    ...typography.body2,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  footerText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
