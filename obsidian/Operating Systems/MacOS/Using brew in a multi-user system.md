---
tags: [macos, homebrew, snippet]
---

# Using brew in a multi-user system

Homebrew is single-owner: everything under its prefix belongs to whoever installed it. A second user running `brew install` hits permission errors or ends up with a second prefix. Fix: other users run `brew` *as* the owner.

```zsh
# ~/.zshrc of each non-owner user (owner's prefix must be on PATH first)
unalias brew 2>/dev/null
brewser=$(stat -f "%Su" "$(which brew)")
alias brew='sudo -Hu '$brewser' brew'
```

`stat -f "%Su"` prints the owner of the `brew` binary; `sudo -H` sets `HOME` to that user's so caches and config land in the right place. The non-owner needs `sudo` (Admin group).

Adapted from [cerico, dev.to](https://dev.to/cerico/using-brew-in-a-multi-user-system-2lnl).
