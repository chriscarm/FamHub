# Smart Display App

A React Native Expo app for a 13" Android tablet that displays a fullscreen image slideshow with a tap-to-reveal calendar overlay and voice commands ("Hey Droid").

## Features

- **Image Slideshow**: Fullscreen photos with smooth crossfade transitions
- **Calendar Overlay**: Tap anywhere to show a calendar with two-person color coding
- **Voice Commands**: Say "Hey Droid" followed by a command
- **Todo Lists**: Per-person todo lists manageable via voice

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Picovoice (for Voice Commands)

1. Create a free account at [console.picovoice.ai](https://console.picovoice.ai/)
2. Get your Access Key
3. Train a custom wake word "Hey Droid"
4. Download the `.ppn` file to `assets/wake-word/`
5. Set your access key:
   ```bash
   export EXPO_PUBLIC_PICOVOICE_KEY="your-key-here"
   ```

### 3. Development

```bash
# Start development server
npx expo start

# For development build (required for native voice modules)
npx expo start --dev-client
```

### 4. Build for Tablet

```bash
# Configure EAS
eas build:configure

# Build development APK
eas build --profile development --platform android

# Build production APK
eas build --profile production --platform android
```

## Voice Commands

- **"Hey Droid, show calendar"** - Opens the calendar overlay
- **"Hey Droid, hide calendar"** - Closes the calendar
- **"Hey Droid, next slide"** - Advances to next image
- **"Hey Droid, add [item] to Chris's list"** - Adds a todo
- **"Hey Droid, add [item] to Christy's list"** - Adds a todo
- **"Hey Droid, show todos"** - Opens the todo list
- **"Hey Droid, show Chris's todos"** - Shows specific person's todos

## Project Structure

```
smart-display/
├── app/
│   ├── _layout.tsx          # Root layout + providers
│   └── index.tsx            # Main screen
├── src/
│   ├── components/
│   │   ├── slideshow/       # Image slideshow
│   │   ├── calendar/        # Calendar overlay
│   │   ├── voice/           # Voice UI components
│   │   └── todos/           # Todo list
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state management
│   ├── services/            # Business logic
│   └── theme/               # Design system
└── assets/
    ├── fonts/               # Inter font family
    └── wake-word/           # Picovoice .ppn files
```

## Design System

- **Colors**: Dark theme optimized for always-on display
  - Background: `#0A0A0A`
  - Chris: Teal (`#4A90A4`)
  - Christy: Gold (`#D4A574`)
- **Typography**: Inter font family
- **Spacing**: 8px grid system

## Development Notes

- Long-press anywhere in dev mode to simulate wake word detection
- Images are placeholders from Unsplash (will be replaced with API)
- Calendar events are mock data (will connect to Google Calendar)
- Todos are in-memory (will be persisted via backend API)

## Tech Stack

- Expo SDK 52
- React Native Reanimated for animations
- Picovoice Porcupine for wake word detection
- expo-speech-recognition for speech-to-text
- Zustand for state management
- react-native-calendars for calendar UI
