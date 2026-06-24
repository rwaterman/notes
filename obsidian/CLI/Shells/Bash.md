---
tags: [cli, bash, shell]
---

# Bash

The default shell on most Linux and CI environments (macOS now defaults to [[Zsh]]). Worth knowing well because scripts run *somewhere* on Bash.

## Startup Files

| File | Loaded for |
|---|---|
| `/etc/profile`, `~/.bash_profile`, `~/.bash_login`, `~/.profile` | **Login** shells (first match wins for the user files) |
| `~/.bashrc` | **Interactive non-login** shells |
| `BASH_ENV` | Non-interactive (scripts) |

> Common pattern: source `~/.bashrc` from `~/.bash_profile` so interactive login shells get both.

## Script Safety Header

```bash
#!/usr/bin/env bash
set -euo pipefail   # exit on error, unset vars are errors, fail on pipe errors
IFS=$'\n\t'         # safer word splitting
```

## Idioms

```bash
# Default value / required value
: "${NAME:=default}"          # set if unset
: "${REQUIRED:?must be set}"   # error if unset

# Conditionals (prefer [[ ]] in bash)
if [[ -f "$f" && "$x" == prod ]]; then ...; fi

# C-style loop / arrays
for ((i=0; i<5; i++)); do echo "$i"; done
arr=(a b c); echo "${arr[@]}"; echo "${#arr[@]}"

# Command substitution + here-doc
now=$(date +%F)
cat <<EOF
host=$(hostname)
EOF

# Parameter expansion
echo "${path##*/}"   # basename
echo "${path%/*}"    # dirname
echo "${var:-fallback}"
```

> [!warning] Portability
> `[[ ]]`, arrays, and `${var,,}` are Bash-isms — not POSIX `sh`. macOS ships an old Bash 3.2 (no `mapfile`/`declare -A`); `brew install bash` for modern features, or target zsh.

## Debugging
```bash
bash -x script.sh        # trace each command
set -x; ...; set +x       # trace a region
shellcheck script.sh      # lint (brew install shellcheck)
```
