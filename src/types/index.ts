export type Person = 'chris' | 'christy' | string;

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  person: Person;
  time?: string; // HH:MM format, optional
  // Extended properties for Google Calendar integration
  accountId?: string;
  accountColor?: string;
  accountName?: string;
  accountPicture?: string;
  googleEventId?: string;
  calendarId?: string;
  location?: string;
  description?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  person: Person;
  completed: boolean;
  createdAt: string;
  // Extended properties for account integration
  accountId?: string;
  accountColor?: string;
  accountPicture?: string;
}

export interface SlideImage {
  id: string;
  url: string;
  title?: string;
}

export type VoiceCommand =
  | { type: 'ADD_TODO'; person: Person; text: string }
  | { type: 'SHOW_CALENDAR' }
  | { type: 'HIDE_CALENDAR' }
  | { type: 'NEXT_SLIDE' }
  | { type: 'PREVIOUS_SLIDE' }
  | { type: 'SHOW_TODOS'; person?: Person }
  | { type: 'COMPLETE_TODO'; todoText: string }
  | { type: 'SWITCH_MODE' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'UNKNOWN'; rawText: string };

export type VoiceState = 'idle' | 'listening' | 'processing' | 'confirming';

// Google Calendar types
export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor: string;
  foregroundColor?: string;
  accessRole: 'owner' | 'writer' | 'reader' | 'freeBusyReader';
  primary?: boolean;
  selected?: boolean;
}

export interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;  // For timed events
    date?: string;      // For all-day events
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  organizer?: {
    email: string;
    displayName?: string;
    self?: boolean;
  };
  status: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
  calendarId?: string;
}

export interface GoogleAccount {
  id: string;
  email: string;
  name: string;
  picture?: string;
  color: string;
  calendars: GoogleCalendar[];
  selectedCalendarIds: string[];
}

export interface SyncSettings {
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  lastSyncTime: Date | null;
}

export type AppMode = 'dashboard' | 'frame';

export interface AppState {
  // App mode
  mode: AppMode;

  // Slideshow
  images: SlideImage[];
  currentImageIndex: number;
  slideshowInterval: number; // milliseconds

  // Calendar
  isCalendarVisible: boolean;
  events: CalendarEvent[];

  // Todos
  todos: TodoItem[];
  isTodoListVisible: boolean;
  selectedTodoPerson: Person | null;

  // Voice
  voiceState: VoiceState;
  lastCommand: VoiceCommand | null;
  confirmationMessage: string | null;

  // Google Accounts (replaces FAMILY_MEMBERS)
  accounts: GoogleAccount[];
  syncSettings: SyncSettings;
  isSyncing: boolean;

  // Settings
  isSettingsOpen: boolean;

  // Mode actions
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;

  // Slideshow actions
  nextImage: () => void;
  previousImage: () => void;
  setCurrentImage: (index: number) => void;

  // Calendar actions
  showCalendar: () => void;
  hideCalendar: () => void;
  toggleCalendar: () => void;

  // Todo actions
  addTodo: (person: Person, text: string) => void;
  completeTodo: (id: string) => void;
  showTodos: (person?: Person) => void;
  hideTodos: () => void;

  // Voice actions
  setVoiceState: (state: VoiceState) => void;
  executeCommand: (command: VoiceCommand) => void;
  showConfirmation: (message: string) => void;
  clearConfirmation: () => void;

  // Account actions
  addAccount: (account: GoogleAccount) => void;
  removeAccount: (id: string) => void;
  updateAccountColor: (id: string, color: string) => void;
  updateAccountCalendars: (id: string, calendars: GoogleCalendar[]) => void;
  toggleAccountCalendar: (accountId: string, calendarId: string) => void;

  // Sync actions
  setEvents: (events: CalendarEvent[]) => void;
  setSyncing: (syncing: boolean) => void;
  updateSyncTime: () => void;
  toggleAutoSync: (enabled: boolean) => void;

  // Settings actions
  openSettings: () => void;
  closeSettings: () => void;
}
