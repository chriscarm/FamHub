---
name: discord-bot-creator
description: Create Discord bots for the Moltbot ecosystem. Use when setting up new bot instances with their own Discord apps, channels, gateway configs, and launchd services. Covers the full flow from Discord Developer Portal to running gateway.
---

# Discord Bot Creator

Create new Moltbot-powered Discord bots with their own identity, channel, and gateway process.

## Prerequisites

- Discord account with Developer Portal access
- Moltbot installed (`moltbot` CLI available)
- macOS (for launchd services) or Linux (for systemd)

## Quick Reference

### Discord Developer Portal Steps

1. **Create Application**: discord.com/developers/applications → New Application
2. **⚠️ CRITICAL: Set Install Link FIRST**
   - Go to **Installation** → Install Link → **None** → Save
   - Must do this BEFORE configuring Bot settings or they won't save!
3. **Configure Bot**:
   - Go to **Bot** section
   - Turn OFF "Public Bot"
   - Turn ON "Message Content Intent"
   - Turn ON "Server Members Intent" (recommended)
   - Save Changes
4. **Get Token**: Reset Token → Copy (requires MFA)
5. **Create Invite URL**:
   - OAuth2 → URL Generator
   - Scopes: `bot`, `applications.commands`
   - Permissions: View Channels, Send Messages, Read Message History, Embed Links, Attach Files, Add Reactions
6. **Add to Server**: Open invite URL, select server

### Moltbot Gateway Setup

#### Directory Structure
```
/Users/fanny/projectfiles/bots/<botname>/
├── .moltbot/
│   ├── moltbot.json          # Gateway config
│   ├── agents/main/agent/
│   │   └── auth-profiles.json # API credentials
│   └── agents/main/sessions/  # Session storage
├── SOUL.md                    # Bot personality
├── AGENTS.md                  # Operating instructions
├── USER.md                    # User context
├── MEMORY.md                  # Long-term memory
├── TOOLS.md                   # Tool-specific notes
└── IDENTITY.md                # Bot identity
```

#### Multi-Gateway Port Spacing

Each bot needs unique ports. Space by 20+:
- Bot 1: 18789 (default Fanny)
- Bot 2: 18790
- Bot 3: 18810
- etc.

#### Required Environment Variables

```bash
CLAWDBOT_CONFIG_PATH=/path/to/bot/.moltbot/moltbot.json
CLAWDBOT_STATE_DIR=/path/to/bot/.moltbot
CLAWDBOT_GATEWAY_PORT=<unique port>
CLAWDBOT_SKIP_CANVAS_HOST=1  # Prevents canvas port conflicts!
```

### Config Template (moltbot.json)

```json
{
  "agents": {
    "defaults": {
      "model": { "primary": "anthropic/claude-sonnet-4-20250514" },
      "workspace": "/Users/fanny/projectfiles/bots/<botname>",
      "compaction": { "mode": "safeguard" }
    }
  },
  "channels": {
    "discord": {
      "enabled": true,
      "token": "<BOT_TOKEN>",
      "dm": { "enabled": false },
      "allowBots": true,
      "guilds": {
        "<GUILD_ID>": {
          "channels": {
            "<CHANNEL_ID>": {
              "allow": true,
              "requireMention": false
            }
          }
        }
      }
    }
  },
  "gateway": {
    "port": <UNIQUE_PORT>,
    "mode": "local",
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "<botname>-gateway-token-2026"
    }
  }
}
```

### Auth Profiles (auth-profiles.json)

Copy from existing bot or create:
```json
{
  "version": 1,
  "profiles": {
    "anthropic:claude-cli": {
      "type": "oauth",
      "provider": "anthropic",
      "access": "<ANTHROPIC_TOKEN>"
    }
  },
  "lastGood": { "anthropic": "anthropic:claude-cli" }
}
```

### LaunchAgent Service (macOS)

Create `~/Library/LaunchAgents/bot.molt.<botname>.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>bot.molt.<botname></string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/node</string>
        <string>/opt/homebrew/lib/node_modules/moltbot/dist/index.js</string>
        <string>gateway</string>
        <string>run</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
        <key>CLAWDBOT_CONFIG_PATH</key>
        <string>/Users/fanny/projectfiles/bots/<botname>/.moltbot/moltbot.json</string>
        <key>CLAWDBOT_STATE_DIR</key>
        <string>/Users/fanny/projectfiles/bots/<botname>/.moltbot</string>
        <key>CLAWDBOT_GATEWAY_PORT</key>
        <string><PORT></string>
        <key>CLAWDBOT_SKIP_CANVAS_HOST</key>
        <string>1</string>
    </dict>
    <key>WorkingDirectory</key>
    <string>/Users/fanny/projectfiles/bots/<botname></string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/moltbot-<botname>.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/moltbot-<botname>.log</string>
</dict>
</plist>
```

Load with: `launchctl load ~/Library/LaunchAgents/bot.molt.<botname>.plist`

### Channel Restrictions

**⚠️ Moltbot config filtering doesn't reliably block channels!**

Use Discord permissions instead:
1. Channel Settings → Permissions
2. Add bot role/user
3. Deny "View Channel"

Or via API:
```bash
curl -X PUT "https://discord.com/api/v10/channels/<CHANNEL_ID>/permissions/<BOT_USER_ID>" \
  -H "Authorization: Bot <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"deny": "1024", "type": 1}'
```

### Troubleshooting

**Bot not responding:**
- Check logs: `tail -50 /tmp/moltbot-<botname>.log`
- Verify Discord token is valid
- Check Message Content Intent is enabled

**Config files disappearing:**
- Session crashes can corrupt state
- Keep backups of moltbot.json and auth-profiles.json

**Port conflicts:**
- Use `lsof -i :<port>` to check what's using the port
- Kill old process: `kill -9 <pid>`

**Gateway won't start:**
- Check for existing process: `ps aux | grep <port>`
- Ensure CLAWDBOT_SKIP_CANVAS_HOST=1 is set

## Full Creation Checklist

1. [ ] Create Discord Application
2. [ ] Set Install Link to None
3. [ ] Configure Bot (Public OFF, Intents ON)
4. [ ] Get bot token
5. [ ] Create invite URL and add to server
6. [ ] Create Discord channel for bot
7. [ ] Set channel permissions (deny bot access to other channels)
8. [ ] Create workspace directory
9. [ ] Create moltbot.json config
10. [ ] Copy auth-profiles.json
11. [ ] Create SOUL.md, AGENTS.md, etc.
12. [ ] Create LaunchAgent plist
13. [ ] Load service and verify logs
