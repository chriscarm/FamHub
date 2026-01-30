#!/bin/bash
# Generate a LaunchAgent plist for a Moltbot bot
# Usage: ./create-launchd-plist.sh <botname> <port> [workspace_path]

set -e

BOTNAME="${1:?Usage: $0 <botname> <port> [workspace_path]}"
PORT="${2:?Usage: $0 <botname> <port> [workspace_path]}"
WORKSPACE="${3:-/Users/fanny/projectfiles/bots/$BOTNAME}"

PLIST_PATH="$HOME/Library/LaunchAgents/bot.molt.$BOTNAME.plist"

cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>bot.molt.$BOTNAME</string>
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
        <string>$WORKSPACE/.moltbot/moltbot.json</string>
        <key>CLAWDBOT_STATE_DIR</key>
        <string>$WORKSPACE/.moltbot</string>
        <key>CLAWDBOT_GATEWAY_PORT</key>
        <string>$PORT</string>
        <key>CLAWDBOT_SKIP_CANVAS_HOST</key>
        <string>1</string>
    </dict>
    <key>WorkingDirectory</key>
    <string>$WORKSPACE</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/moltbot-$BOTNAME.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/moltbot-$BOTNAME.log</string>
</dict>
</plist>
EOF

echo "Created: $PLIST_PATH"
echo ""
echo "To load:   launchctl load $PLIST_PATH"
echo "To unload: launchctl unload $PLIST_PATH"
echo "To check:  launchctl list | grep $BOTNAME"
echo "Logs:      tail -f /tmp/moltbot-$BOTNAME.log"
