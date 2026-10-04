---
tags: [linux, ubuntu, vps, security, ssh, firewall, tailscale, setup]
---

# VPS Setup — Ubuntu 26.04

First hour on a fresh Ubuntu 26.04 LTS (Resolute Raccoon) server: patch, create an admin user, lock down SSH, turn on the firewall, join the tailnet, enable automatic security updates, then install the everyday tools. The Arch equivalent is [[VPS Setup - Arch Linux]].

> [!warning] Do not lock yourself out
> Keep the original root session open until a **second** terminal has logged in as the new user and run `sudo -v`. Repeat that check after every SSH or firewall change. Know where the provider's web console is before you start; it is the only way back in if SSH breaks.

## 1. Patch and set the basics

Run as `root` on first login.

```sh
apt update && apt full-upgrade -y
timedatectl set-timezone UTC
hostnamectl set-hostname web-1
[ -f /var/run/reboot-required ] && reboot
```

Time sync needs nothing: 26.04 ships `chrony` enabled by default.

## 2. Admin user

Create the user and copy root's key across. The commands are explained in [[Linux Setup]].

```sh
adduser alice
usermod -aG sudo alice
rsync --archive --chown=alice:alice ~/.ssh /home/alice/
```

From a second terminal, confirm the new account works before going further:

```sh
ssh alice@203.0.113.10
sudo -v
```

`sudo` on 26.04 is `sudo-rs`, the Rust rewrite. Ordinary `sudoers` rules and `visudo` behave the same; a few rarely used `Defaults` options are unsupported. The original is still installed as `sudo.ws` if a tool needs it.

## 3. Harden SSH

Put the settings in a drop-in instead of editing `/etc/ssh/sshd_config`. Two details decide whether the file works at all:

- `sshd` keeps the **first** value it reads for each option, and drop-ins load in name order. Cloud images ship `50-cloud-init.conf`, which can set `PasswordAuthentication yes`. The file below is named `10-…` so it is read first and wins.
- Replace `alice` in `AllowUsers` with your user. Every account not listed there is refused, including `root`.

```sh
sudo tee /etc/ssh/sshd_config.d/10-hardening.conf << 'CONF'
# Keys only, no root, named users only
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitEmptyPasswords no
AuthenticationMethods publickey
AllowUsers alice

# Fewer guesses, shorter window
MaxAuthTries 3
LoginGraceTime 20

# Authentication methods a single-user server does not need
HostbasedAuthentication no
KerberosAuthentication no
GSSAPIAuthentication no

# Features that are rarely needed
X11Forwarding no
PermitUserEnvironment no
AllowAgentForwarding no
PermitTunnel no

# Drop dead connections; hide the distribution string
ClientAliveInterval 300
ClientAliveCountMax 2
DebianBanner no
CONF
```

Test the syntax, apply, then read back what `sshd` actually resolved:

```sh
sudo sshd -t && sudo systemctl reload ssh
sudo sshd -T | grep -iE '^(permitrootlogin|passwordauthentication|allowusers|x11forwarding) '
```

Log in from a new terminal before closing the old one.

- **Port forwarding stays on.** DigitalOcean's guide also sets `AllowTcpForwarding no`. Add it on a server that only serves traffic; leave it out if you use `ssh -L` tunnels ([[SSH - Snippets]]) or an editor's remote mode.
- **Changing the port.** Ubuntu starts `sshd` through socket activation, so a `Port` or `ListenAddress` change needs `sudo systemctl daemon-reload && sudo systemctl restart ssh.socket`; a plain reload does not move the listener. Moving off port 22 only reduces log noise.
- **Allowlisting by address.** `AllowUsers alice@203.0.113.0/24` restricts a user to a source range. Use it only with a static address, otherwise prefer the Tailscale step below.
- **Per-key limits.** Prefix a line in `~/.ssh/authorized_keys` with `restrict` (or `restrict,pty`) to strip forwarding and other features from that one key, which suits deploy and backup keys.

## 4. Firewall (UFW)

Deny everything inbound, allow outbound, and open SSH **before** enabling.

```sh
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw limit OpenSSH        # allow, but block an address after 6 attempts in 30 seconds
sudo ufw show added           # review the rules before they go live
sudo ufw enable
sudo ufw status verbose
```

Open more ports only when a service needs them:

```sh
sudo ufw allow 80,443/tcp
sudo ufw allow from 203.0.113.0/24 to any port 5432 proto tcp
sudo ufw status numbered      # then: sudo ufw delete <number>
```

IPv6 is covered when `IPV6=yes` is set in `/etc/default/ufw`, which is the default.

> [!warning] Docker bypasses UFW
> Docker writes its own packet-filter rules, so a published port (`-p 5432:5432`) is reachable from the internet even when UFW denies it. Bind to loopback or the tailnet address instead (`-p 127.0.0.1:5432:5432`), or put a provider-level cloud firewall in front.

## 5. Tailscale

Tailscale puts the server on a private WireGuard network (a "tailnet"), so SSH and admin ports can be closed to the public internet.

```sh
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
tailscale ip -4               # the server's 100.x.y.z address
```

The order of the next steps matters, because the last one removes public SSH access:

1. From your own machine, which must also be on the tailnet, open a new session to the tailnet address and keep it open: `ssh alice@100.x.y.z`.
2. In the Tailscale admin console, open **Machines**, choose the server, and select **Disable key expiry**. Node keys otherwise expire after 180 days by default, and an expired key takes the server off the tailnet.
3. Allow tailnet traffic through the firewall:

   ```sh
   sudo ufw allow in on tailscale0
   sudo ufw allow 41641/udp      # lets peers connect directly instead of through a relay
   ```

4. Only after step 1 works, close SSH on the public interface:

   ```sh
   sudo ufw delete limit OpenSSH
   sudo ufw reload
   ```

5. Confirm from outside: `ssh alice@<public-ip>` should time out and `ssh alice@100.x.y.z` should connect. Sessions that were already open over the public address stay up until they close.

If the tailnet is ever unreachable, the provider's web console is the way back in; re-add the rule with `sudo ufw limit OpenSSH`.

`sudo tailscale up --ssh` is the alternative: Tailscale authenticates SSH sessions itself using the tailnet's access rules, and no keys need to be distributed.

## 6. Automatic security updates

`unattended-upgrades` and `needrestart` are installed by default on 26.04 server. Confirm that unattended upgrades are switched on, then allow the server to reboot itself when a kernel or library update requires it:

```sh
sudo dpkg-reconfigure -plow unattended-upgrades

sudo tee /etc/apt/apt.conf.d/52unattended-upgrades-local << 'CONF'
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "09:00";
CONF

sudo unattended-upgrade --dry-run --debug
```

The reboot time is in the server's timezone, UTC here. Leave automatic reboot off on a server that must not restart unannounced, and watch for `/var/run/reboot-required` instead.

## 7. Recommended programs

Every package name below exists in the 26.04 archive.

```sh
# Essentials
sudo apt install -y git curl wget ca-certificates gnupg build-essential unzip zip rsync tmux zsh neovim

# Search, navigation, inspection
sudo apt install -y ripgrep fd-find bat fzf jq eza zoxide git-delta tree ncdu btop

# Debugging and network
sudo apt install -y strace lsof bind9-dnsutils mtr-tiny tcpdump

# Development
sudo apt install -y gh shellcheck shfmt just direnv stow sqlite3 python3-venv pipx

# Security audit
sudo apt install -y lynis ssh-audit
```

Things that differ from other distributions:

- **Renamed binaries.** `fd-find` installs `fdfind` and `bat` installs `batcat`. Link the usual names, then log in again so `~/.local/bin` is on `PATH`:

  ```sh
  mkdir -p ~/.local/bin
  ln -s "$(command -v fdfind)" ~/.local/bin/fd
  ln -s "$(command -v batcat)" ~/.local/bin/bat
  ```

- **`uv` is not packaged.** Install it per user: `curl -LsSf https://astral.sh/uv/install.sh | sh`.
- **`yq` is a different tool.** The `yq` package is the Python wrapper around `jq`. For the Go `yq` that most scripts expect, use `sudo snap install yq`.
- **Node.js** in the archive is 22.x. Use NodeSource or a version manager when a project needs a newer release.
- **Docker.** `sudo apt install -y docker.io docker-buildx docker-compose-v2`. Membership of the `docker` group is equivalent to root, so add users deliberately. Read the Docker warning in the firewall section first.
- **AWS CLI.** `sudo apt install -y awscli` installs version 2.

## 8. Verify

```sh
sudo ss -tlnp                 # every listening TCP socket and the process behind it
sudo ufw status verbose
ssh-audit localhost           # grades key exchange, ciphers and host keys
sudo lynis audit system       # broad hardening review with a prioritized list
tailscale status
```

Only `sshd` and the services you deliberately opened should appear in the `ss` output on a public address.

## Sources

Adapted from DigitalOcean's [Initial Server Setup with Ubuntu](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu), [How To Harden OpenSSH on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-harden-openssh-on-ubuntu-20-04) and [How To Set Up a Firewall with UFW on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu), and from Tailscale's [Use UFW to lock down an Ubuntu server](https://tailscale.com/kb/1077/secure-server-ubuntu). Updated for 26.04: drop-in configuration, `KbdInteractiveAuthentication` in place of the deprecated `ChallengeResponseAuthentication`, socket-activated `sshd`, and `sudo-rs`.
