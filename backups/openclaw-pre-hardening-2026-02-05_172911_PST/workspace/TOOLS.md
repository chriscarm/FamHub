# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

---

## 🧠 Brain + Muscles Architecture

Following the "brain and muscles" approach from the ClawdBot optimization video:

### Brain (Main Model)
- **Opus 4.5** - Primary reasoning, conversation, planning

### Muscles (Specialized Tools)

| Task | Tool | Notes |
|------|------|-------|
| **Coding** | Codex CLI (GPT 5.2 Extra High) | Premium. `--full-auto` for building. I'm brain, Codex is muscle. |
| **Web Search** | Brave API | Already configured |
| **Social/X Search** | Grok (`grok-search` skill) | For Twitter/X searches |
| **Image Gen** | Nano Banana Pro | Gemini-based |
| **Budget Coding** | Minimax 2.1 | Alternative to Codex, saves ~$250/mo if cost matters |

### Codex Usage (GPT 5.2 Extra High)

**Vibe Coding Approach:** I'm the brain that plans and reviews. Codex is the muscle that executes code directly via CLI.

```bash
# Quick coding task (always use pty:true!)
codex exec --full-auto "Your task"

# Background for longer work (yolo mode)
codex --yolo "Your task"

# With specific model
codex --model gpt-5.2-extra-high "Your task"
```

**Best Practices (from ClawdBot video):**
1. **Use Codex for ALL coding tasks** - Don't write code myself, delegate to Codex
2. **Full-auto for building** - Let it execute without asking permission
3. **Vanilla mode for code review** - More conservative, asks before changes
4. **Background long tasks** - Use `--yolo` and set up wake notification
5. **Always pty:true** - Codex needs a proper terminal

**Model Selection:**
- **GPT 5.2 Extra High** - Premium, best quality (current default)
- **Minimax 2.1** - Cost-effective alternative, saves ~$250/mo if needed

**Rules:**
- Always use `pty:true` for Codex
- Never run Codex in ~/projectfiles (my soul docs live here!)
- Use `--full-auto` for building, vanilla for reviewing
- Notify when done: `openclaw gateway wake --text "Done: summary" --mode now`
- **Don't code myself** - Use Codex as the coding muscle

---

## 🔧 Self-Healing Patterns (from OpenClaw Survival Guide)

### Subagent Timeouts
**Default timeouts kill Codex/Claude Code mid-task!** Always use longer timeouts:
```
sessions_spawn with:
  runTimeoutSeconds: 1200  (20 min)
  timeoutSeconds: 1200     (20 min)
```

### Daily Maintenance
- **5 AM cron** runs `openclaw doctor --fix` to auto-heal issues
- Already configured ✅

### After Subagent Completes
- **Always check git** - subagents skip final git push ~50% of the time
- Verify the work actually completed

### Rate Limit Survival
- Batch LLM calls into hourly heartbeats
- Don't schedule 12+ crons hitting LLM every few minutes

---

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
