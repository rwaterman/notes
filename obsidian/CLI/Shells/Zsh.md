---
tags: [cli, zsh, shell]
---

# Zsh

The default macOS shell. Compatible enough with [[Bash]] for most scripts, with a richer interactive experience (completion, globbing, themes via Oh My Zsh).

## Startup Files (load order)

| File | When | Use for |
|---|---|---|
| `~/.zshenv` | **Always** (incl. non-interactive) | Env vars needed everywhere; keep it minimal |
| `~/.zprofile` | Login shells | `PATH`, login-time setup |
| `~/.zshrc` | Interactive shells | Aliases, prompt, completion, plugins — most config |
| `~/.zlogin` | Login (after `.zshrc`) | Commands to run at login end |
| `~/.zlogout` | Logout | Cleanup |

System-wide equivalents live in `/etc/zsh*` (`/etc/zshenv` is where XDG config home is often set).

> [!tip] Where does PATH go?
> Set `PATH` in `~/.zprofile` (login) so it isn't re-appended on every subshell. Putting it in `~/.zshenv` can duplicate entries; in `~/.zshrc` it won't apply to non-interactive login shells.

## Handy Features
```zsh
setopt EXTENDED_GLOB              # **/, ^pattern, etc.
ls **/*.ts                        # recursive glob
print -l ~/Downloads/*(.om[1,5])  # 5 newest regular files
take newdir                       # mkdir + cd (Oh My Zsh)
```

- **Completion:** `autoload -Uz compinit && compinit`.
- **Oh My Zsh** manages plugins/themes; keep custom tweaks in `~/.zshrc`.
