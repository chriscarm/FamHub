# SelfieScript Architecture Details

## Processing Pipeline

```
PDF Upload
    ↓
Multer (multipart handling)
    ↓
Local file storage (uploads/)
    ↓
Claude Vision API
├── PDF pages → images
├── OCR + structure analysis
└── Character/dialogue extraction
    ↓
Database (PostgreSQL)
├── Script metadata
├── Characters
└── Lines with speaker attribution
    ↓
ElevenLabs Voice Assignment
├── Auto-suggest voices by character
└── User can customize
    ↓
Practice Mode
├── Audio pre-generation
├── Speech recognition (browser)
└── Real-time playback
```

## SSE (Server-Sent Events)

Used for real-time processing updates:

```typescript
// Server sends events during PDF processing
event: progress
data: {"stage": "parsing", "percent": 25}

event: character
data: {"name": "SARAH", "lineCount": 42}

event: complete
data: {"scriptId": "abc123"}
```

Client subscribes via EventSource API.

## Voice Generation

ElevenLabs integration:
- Text-to-speech for AI character lines
- Speech-to-speech for user recordings (custom voices)
- Voice cloning for consistent character voices

Key files:
- `server/elevenLabsVoices.ts` - API wrapper
- `server/services/` - Audio processing

## Database Schema (Drizzle)

```typescript
// Key relations
users (1) → (*) scripts
scripts (1) → (*) characters
scripts (1) → (*) lines
lines (*) → (1) characters
users (1) → (*) line_customizations
```

## Frontend State

- **React Query** - Server state (scripts, characters)
- **Local state** - UI state (current scene, playback position)
- **Session storage** - Auth tokens

## File Structure Conventions

- Components: `client/src/components/`
- Pages: `client/src/pages/`
- Hooks: `client/src/hooks/`
- API lib: `client/src/lib/`
- Server routes: `server/routes/` (modular) or `server/routes.ts` (main)

## Environment Requirements

Development:
- Node.js 18+
- PostgreSQL (or Neon connection string)
- Anthropic API key
- ElevenLabs API key

Production (Replit):
- All above as Replit Secrets
- Replit OAuth auto-configured
