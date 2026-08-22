---
tags: [ssh, macos, security, snippet]
---

# SSH — macOS

Hardening the built-in OpenSSH server (Remote Login) on macOS. Drop overrides in `/etc/ssh/sshd_config.d/` rather than editing the main `sshd_config` — they survive OS updates and keep intent obvious.

```sh
sudo tee /etc/ssh/sshd_config.d/200-custom.conf << 'CONF'
# Authentication — keys only
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
AuthenticationMethods publickey

# Limit attack surface
PermitEmptyPasswords no
MaxAuthTries 3
LoginGraceTime 20

# Disable unused auth methods
HostbasedAuthentication no
IgnoreRhosts yes

# Session hardening — drop dead connections
ClientAliveInterval 300
ClientAliveCountMax 2
CONF
```

Apply and verify:

```sh
sudo sshd -t                                           # test config syntax first
sudo launchctl kickstart -k system/com.openssh.sshd    # restart sshd
```

> [!tip] Related
> Generate the keys these settings require in [[SSH - Snippets]]. Enable or disable the server itself under **System Settings → General → Sharing → Remote Login**.
