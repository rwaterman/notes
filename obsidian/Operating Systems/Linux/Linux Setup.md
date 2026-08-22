---
tags: [linux, setup, sysadmin, snippet]
---

# Linux Setup

First-boot setup snippets for fresh Linux hosts — creating an admin user and getting SSH keys in place.

## Arch Linux — Add an Admin User

```bash
# -m creates the home directory; set a password after
useradd -m alice
passwd alice

# Add to the wheel group (sudoers). Flags first, then group, then user.
usermod -aG wheel alice

# Give wheel sudo rights: run visudo and uncomment the wheel line
pacman -S vi          # visudo ships with the base system / sudo package
EDITOR=vi visudo      # uncomment: %wheel ALL=(ALL:ALL) ALL
```

> [!note] `usermod` argument order
> `usermod -aG <group> <user>` — `-a` **appends** (without it the user is *removed* from every other supplementary group), `-G` names the group(s). The user always comes last.

### VPS: copy your SSH key to the new user

When bootstrapping a VPS where you logged in as root, copy root's authorized key over to the new user so key auth works immediately:

```sh
rsync --archive --chown=alice:alice ~/.ssh /home/alice/
```

## Debian / Ubuntu — Add an Admin User

```bash
adduser alice                 # interactive: creates home + prompts for password
usermod -aG sudo alice        # 'sudo' group instead of Arch's 'wheel'
```

> [!tip] Related
> Harden the SSH daemon after setup — see [[SSH - Snippets]] for key generation and [[SSH - Mac OS]] for a hardened `sshd_config`.
