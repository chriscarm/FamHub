import { create } from 'zustand';
import {
  AppState,
  VoiceCommand,
  VoiceState,
  Person,
  TodoItem,
  GoogleAccount,
  GoogleCalendar,
  CalendarEvent,
  AppMode,
} from '../types';
import { mockImages, mockEvents, mockTodos } from '../services/mockData';

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state - App mode
  mode: 'dashboard' as AppMode,

  // Slideshow
  images: mockImages,
  currentImageIndex: 0,
  slideshowInterval: 10000, // 10 seconds

  // Calendar
  isCalendarVisible: false,
  events: mockEvents,

  // Todos
  todos: mockTodos,
  isTodoListVisible: false,
  selectedTodoPerson: null,

  // Voice
  voiceState: 'idle',
  lastCommand: null,
  confirmationMessage: null,

  // Google Accounts
  accounts: [],
  syncSettings: {
    autoSyncEnabled: true,
    syncIntervalMinutes: 5,
    lastSyncTime: null,
  },
  isSyncing: false,

  // Settings
  isSettingsOpen: false,

  // Mode actions
  setMode: (mode: AppMode) => set({ mode }),
  toggleMode: () =>
    set((state) => ({ mode: state.mode === 'dashboard' ? 'frame' : 'dashboard' })),

  // Slideshow actions
  nextImage: () => {
    const { images, currentImageIndex } = get();
    const nextIndex = (currentImageIndex + 1) % images.length;
    set({ currentImageIndex: nextIndex });
  },

  previousImage: () => {
    const { images, currentImageIndex } = get();
    const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    set({ currentImageIndex: prevIndex });
  },

  setCurrentImage: (index: number) => {
    const { images } = get();
    if (index >= 0 && index < images.length) {
      set({ currentImageIndex: index });
    }
  },

  // Calendar actions
  showCalendar: () => set({ isCalendarVisible: true }),
  hideCalendar: () => set({ isCalendarVisible: false }),
  toggleCalendar: () => set((state) => ({ isCalendarVisible: !state.isCalendarVisible })),

  // Todo actions
  addTodo: (person: Person, text: string) => {
    const { accounts } = get();
    // Try to find matching account by first name
    const matchingAccount = accounts.find(
      (a) => a.name.toLowerCase().split(' ')[0] === person.toLowerCase()
    );

    const newTodo: TodoItem = {
      id: generateId(),
      text,
      person,
      completed: false,
      createdAt: new Date().toISOString(),
      accountId: matchingAccount?.id,
      accountColor: matchingAccount?.color,
      accountPicture: matchingAccount?.picture,
    };
    set((state) => ({ todos: [...state.todos, newTodo] }));
  },

  completeTodo: (id: string) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: true } : todo
      ),
    }));
  },

  showTodos: (person?: Person) => {
    set({
      isTodoListVisible: true,
      selectedTodoPerson: person || null,
      isCalendarVisible: false,
    });
  },

  hideTodos: () => {
    set({
      isTodoListVisible: false,
      selectedTodoPerson: null,
    });
  },

  // Voice actions
  setVoiceState: (state: VoiceState) => set({ voiceState: state }),

  executeCommand: (command: VoiceCommand) => {
    const {
      addTodo,
      showCalendar,
      hideCalendar,
      nextImage,
      previousImage,
      showTodos,
      showConfirmation,
      completeTodo,
      todos,
      toggleMode,
      openSettings,
    } = get();

    set({ lastCommand: command });

    switch (command.type) {
      case 'ADD_TODO':
        addTodo(command.person, command.text);
        showConfirmation(`Added "${command.text}" to ${command.person}'s list`);
        break;

      case 'SHOW_CALENDAR':
        showCalendar();
        showConfirmation('Showing calendar');
        break;

      case 'HIDE_CALENDAR':
        hideCalendar();
        showConfirmation('Hiding calendar');
        break;

      case 'NEXT_SLIDE':
        nextImage();
        showConfirmation('Next slide');
        break;

      case 'PREVIOUS_SLIDE':
        previousImage();
        showConfirmation('Previous slide');
        break;

      case 'SHOW_TODOS':
        showTodos(command.person);
        showConfirmation(command.person ? `Showing ${command.person}'s todos` : 'Showing all todos');
        break;

      case 'COMPLETE_TODO':
        const todoToComplete = todos.find(
          (t) => t.text.toLowerCase().includes(command.todoText.toLowerCase()) && !t.completed
        );
        if (todoToComplete) {
          completeTodo(todoToComplete.id);
          showConfirmation(`Completed: ${todoToComplete.text}`);
        } else {
          showConfirmation(`Couldn't find todo: ${command.todoText}`);
        }
        break;

      case 'SWITCH_MODE':
        toggleMode();
        showConfirmation('Switching view mode');
        break;

      case 'OPEN_SETTINGS':
        openSettings();
        showConfirmation('Opening settings');
        break;

      case 'UNKNOWN':
        showConfirmation(`Didn't understand: "${command.rawText}"`);
        break;
    }

    set({ voiceState: 'confirming' });

    // Reset voice state after confirmation
    setTimeout(() => {
      set({ voiceState: 'idle' });
    }, 2000);
  },

  showConfirmation: (message: string) => {
    set({ confirmationMessage: message });
    // Auto-clear after 3 seconds
    setTimeout(() => {
      set({ confirmationMessage: null });
    }, 3000);
  },

  clearConfirmation: () => set({ confirmationMessage: null }),

  // Account actions
  addAccount: (account: GoogleAccount) => {
    set((state) => ({
      accounts: [...state.accounts, account],
    }));
  },

  removeAccount: (id: string) => {
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
      // Remove events from this account
      events: state.events.filter((e) => e.accountId !== id),
    }));
  },

  updateAccountColor: (id: string, color: string) => {
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? { ...a, color } : a)),
      // Update event colors too
      events: state.events.map((e) =>
        e.accountId === id ? { ...e, accountColor: color } : e
      ),
    }));
  },

  updateAccountCalendars: (id: string, calendars: GoogleCalendar[]) => {
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id
          ? {
              ...a,
              calendars,
              // Auto-select primary calendar if no selection
              selectedCalendarIds:
                a.selectedCalendarIds.length === 0
                  ? calendars.filter((c) => c.primary).map((c) => c.id)
                  : a.selectedCalendarIds,
            }
          : a
      ),
    }));
  },

  toggleAccountCalendar: (accountId: string, calendarId: string) => {
    set((state) => ({
      accounts: state.accounts.map((a) => {
        if (a.id !== accountId) return a;
        const isSelected = a.selectedCalendarIds.includes(calendarId);
        return {
          ...a,
          selectedCalendarIds: isSelected
            ? a.selectedCalendarIds.filter((id) => id !== calendarId)
            : [...a.selectedCalendarIds, calendarId],
        };
      }),
    }));
  },

  // Sync actions
  setEvents: (events: CalendarEvent[]) => {
    set((state) => {
      // Merge with existing non-Google events
      const localEvents = state.events.filter((e) => !e.accountId);
      return { events: [...localEvents, ...events] };
    });
  },

  setSyncing: (syncing: boolean) => set({ isSyncing: syncing }),

  updateSyncTime: () => {
    set((state) => ({
      syncSettings: {
        ...state.syncSettings,
        lastSyncTime: new Date(),
      },
    }));
  },

  toggleAutoSync: (enabled: boolean) => {
    set((state) => ({
      syncSettings: {
        ...state.syncSettings,
        autoSyncEnabled: enabled,
      },
    }));
  },

  // Settings actions
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
}));
