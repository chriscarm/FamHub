---
name: startup-notify
description: "Send a Discord notification when gateway starts"
metadata:
  {
    "moltbot":
      {
        "emoji": "🦞",
        "events": ["gateway:startup"]
      }
  }
---

# Startup Notification Hook

Sends a message to the configured Discord channel every time the gateway starts.
