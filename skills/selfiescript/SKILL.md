---
name: selfiescript
description: SelfieScript AI-powered script rehearsal platform. Use when working on the SelfieScript app - understanding architecture, testing workflows, deploying to Replit, or debugging issues. The app lets actors upload PDF scripts and practice with AI scene partners.
---

# SelfieScript

AI-powered script rehearsal platform for actors. Upload PDF screenplays, get AI scene partners.

## What It Does

1. **Upload PDF** - User uploads screenplay/sides
2. **AI Processing** - Claude 3.5 Sonnet analyzes via vision API
3. **Character Detection** - Identifies characters and dialogue
4. **Voice Assignment** - ElevenLabs TTS for each character
5. **Practice Mode** - User reads their lines, AI speaks other characters

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Shadcn/UI |
| Backend | Node.js + Express |
| Database | PostgreSQL (Neon serverless) + Drizzle ORM |
| AI Vision | Anthropic Claude 3.5 Sonnet |
| TTS | ElevenLabs API |
| Auth | Replit OAuth |
| Real-time | Server-Sent Events (SSE) |

## Repository

- **Location**: `/Users/fanny/projectfiles/selfiescript-fresh`
- **GitHub**: `chriscarm/selfiescript-fresh` (private)
- **Replit**: `selfiescript-fresh`

## Key Files

### Frontend (`client/src/`)
```
pages/
├── Home.tsx              # Landing page
├── Dashboard.tsx         # User dashboard
├── ScriptProcessing.tsx  # AI processing status
├── CharacterSelection.tsx # Assign voices
├── SceneSelection.tsx    # Pick scene to practice
├── PracticeScene.tsx     # Main rehearsal UI
├── Demo.tsx              # Zero-cost demo mode
└── UnifiedSetup.tsx      # Setup flow
```

### Backend (`server/`)
```
├── index.ts              # Express entry point
├── routes.ts             # API routes
├── claudeVision.ts       # PDF → AI analysis
├── elevenLabsVoices.ts   # TTS integration
├── storage.ts            # File handling
├── replitAuth.ts         # OAuth
└── db.ts                 # Database connection
```

### Demo Content
- `DemoScripts/` - 16 pre-loaded PDF scripts for testing
- `attached_assets/demo_audio/` - Pre-generated audio files

## User Flow

```
Landing → Upload PDF → Processing → Character Selection → Scene Selection → Practice
                ↓
            Demo Mode (zero API cost)
```

## API Dependencies

| Service | Purpose | Env Var |
|---------|---------|---------|
| Anthropic | PDF vision analysis | `ANTHROPIC_API_KEY` |
| ElevenLabs | Text-to-speech | `ELEVENLABS_API_KEY` |
| Neon | PostgreSQL database | `DATABASE_URL` |
| Replit | OAuth authentication | (auto-configured) |

## Testing Workflow

### Manual Test Flow
1. Start dev server: `npm run dev`
2. Navigate to landing page
3. Click "Try Demo" for zero-cost test
4. Or upload a PDF from `DemoScripts/`
5. Wait for processing (watch SSE updates)
6. Select character and voice
7. Choose scene
8. Practice (speak lines, AI responds)

### Automated Testing
```bash
# Run all script tests
./test_scripts_sequential.sh

# Or TypeScript test runner
npx tsx testAllScripts.ts
```

## Deployment (Replit)

1. Push to GitHub (auto-syncs to Replit)
2. In Replit: verify environment secrets
3. Run: `npm run build && npm run start`
4. Check deploy URL

## Common Issues

### PDF Processing Fails
- Check `ANTHROPIC_API_KEY` is set
- Verify PDF isn't corrupted
- Check Claude API quota

### No Audio Playing
- Check `ELEVENLABS_API_KEY`
- Verify voice IDs are valid
- Check browser audio permissions

### Auth Redirect Loop
- Clear cookies
- Verify Replit OAuth callback URL
- Check session storage

## Database Schema

Key tables (Drizzle ORM):
- `users` - Replit OAuth users
- `scripts` - Uploaded screenplays
- `characters` - Detected characters per script
- `sessions` - Practice session state
- `line_customizations` - User audio recordings + buffer times

## Development Commands

```bash
# Start dev server
npm run dev

# Type check
npm run check

# Build for production
npm run build

# Start production
npm run start

# Database push
npm run db:push
```
