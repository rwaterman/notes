---
title: "Using brew in a multi-user system"
source: "https://dev.to/cerico/using-brew-in-a-multi-user-system-2lnl"
author:
  - "cerico"
published: 2023-05-30
created: 2026-06-18
description: "Using brew in a multi-user system. Tagged with shell."
tags: ["clippings"]
---

# Using Brew in a Multi-user System

On a mac brew can get into a bit of a muddle on a multi-user system if you are not careful. The problem is that brew installs everything in `/usr/local` and if you have multiple users then the permissions can get a bit messed up. The answer to this is to install brew as normal for the first user, but any subsequent users shouldn't install their own version, but run the first users installation instead.

To do this, set up an alias in your **~/.zshrc** to run brew as that user.

```
# ~.zshrc
unalias brew 2>/dev/null
brewser=$(stat -f "%Su" $(which brew))
alias brew='sudo -Hu '$brewser' brew'
```

Lets break this down. The first line removes any existing alias for brew. This is because we need to 'real' brew in the second line to find the installation location (**which brew**).

The second line gets the user that brew is installed under. The third line creates an alias for brew that runs brew as the user that brew is installed under. The `2>/dev/null` just stops an error message if there is no existing alias (which we would get on the first sourcing of the file as in that instance brew would be the 'real' brew).[Sentry](https://dev.to/sentry)Promoted

[![Sentry image](https://media2.dev.to/dynamic/image/width=775%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fimages.ctfassets.net%2Fem6l9zw4tzag%2F1GYxa0VJ4TOkpKyV4TaIur%2F34e4f6e2f1068894f9d0738008646289%2Fmcp-config.png%3Fw%3D1500%26h%3D1003%26q%3D50%26fm%3Dwebp)](https://blog.sentry.io/smarter-debugging-sentry-mcp-cursor/?utm_source=devto&utm_medium=paid-community&utm_campaign=smarter-debugging-mcp-cursor-blog&bb=240309)

## Smarter Debugging with Sentry MCP and Cursor

No more copying and pasting error messages, logs, or trying to describe your distributed tracing setup or stack traces in chat. MCP can investigate real issues, understand their impact, and suggest fixes based on the actual production context.