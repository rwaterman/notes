---
tags: [linux, setup, sysadmin, snippet]
---

# Linux Setup

First-boot: admin user + SSH key, then harden `sshd` ([[SSH - Snippets]], [[SSH - Mac OS]]).

## Arch

```bash
useradd -m alice && passwd alice
usermod -aG wheel alice          # -a appends; without it the user loses every other group
EDITOR=vi visudo                 # uncomment: %wheel ALL=(ALL:ALL) ALL
```

## Debian / Ubuntu

```bash
adduser alice                    # interactive: home + password
usermod -aG sudo alice
```

## Copy root's SSH key to the new user (VPS bootstrap)

```sh
rsync --archive --chown=alice:alice ~/.ssh /home/alice/
```
