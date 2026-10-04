---
tags: [linux, arch, vps, security, ssh, firewall, tailscale, setup]
---

# VPS Setup — Arch Linux

First hour on a fresh Arch Linux server: full upgrade, create an admin user, lock down SSH, turn on the firewall, join the tailnet, set an update routine, then install the everyday tools. The Ubuntu equivalent is [[VPS Setup - Ubuntu]].

> [!warning] Do not lock yourself out
> Keep the original root session open until a **second** terminal has logged in as the new user and run `sudo -v`. Repeat that check after every SSH or firewall change. Know where the provider's web console is before you start; it is the only way back in if SSH breaks.

## 1. Upgrade and set the basics

Run as `root` on first login. Arch is a rolling release: always upgrade the whole system with `pacman -Syu`. Installing with `pacman -Sy <package>` on a stale system is a partial upgrade and breaks shared libraries.

```sh
pacman -Syu --needed sudo openssh rsync
timedatectl set-timezone UTC
timedatectl set-ntp true
hostnamectl set-hostname web-1
reboot                          # when the upgrade replaced the kernel
```

Reboot after every kernel upgrade. The modules for the running kernel are removed from disk, so anything that loads a module afterwards, including the firewall, Tailscale and Docker, fails until the reboot.

## 2. Admin user

Create the user, grant `sudo` through the `wheel` group, and copy root's key across. See also [[Linux Setup]].

```sh
useradd -m -G wheel alice && passwd alice
echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/10-wheel
chmod 440 /etc/sudoers.d/10-wheel && visudo -c
rsync --archive --chown=alice:alice ~/.ssh /home/alice/
```

From a second terminal, confirm the new account works before going further:

```sh
ssh alice@203.0.113.10
sudo -v
```

Some providers' images create an `arch` user through cloud-init instead of enabling root. Log in as that account and run `sudo -i` to get a root shell, then follow sections 1 and 2 as written.

## 3. Harden SSH

Put the settings in a drop-in instead of editing `/etc/ssh/sshd_config`. Two details decide whether the file works at all:

- `sshd` keeps the **first** value it reads for each option, and drop-ins load in name order. Arch ships `99-archlinux.conf`, and cloud images add `50-cloud-init.conf`, which can set `PasswordAuthentication yes`. The file below is named `10-…` so it is read first and wins.
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

# Drop dead connections
ClientAliveInterval 300
ClientAliveCountMax 2
CONF
```

Test the syntax, apply, then read back what `sshd` actually resolved:

```sh
sudo sshd -t && sudo systemctl reload sshd
sudo sshd -T | grep -iE '^(permitrootlogin|passwordauthentication|allowusers|x11forwarding) '
```

Log in from a new terminal before closing the old one.

- **Not the Ubuntu file.** The Ubuntu page adds `DebianBanner no`. That option exists only in Debian's patched OpenSSH; on Arch it is a syntax error and `sshd` refuses to start.
- **Port forwarding stays on.** DigitalOcean's guide also sets `AllowTcpForwarding no`. Add it on a server that only serves traffic; leave it out if you use `ssh -L` tunnels ([[SSH - Snippets]]) or an editor's remote mode.
- **Changing the port.** Add `Port 2222` to the drop-in and run `sudo systemctl restart sshd`. Every firewall command in the sections below then needs `2222/tcp` in place of `22/tcp`, including the rules that remove and restore public SSH in the Tailscale section; otherwise enabling the firewall blocks the new port. Moving off port 22 only reduces log noise.
- **Allowlisting by address.** `AllowUsers alice@203.0.113.0/24` restricts a user to a source range. Use it only with a static address, otherwise prefer the Tailscale step below.
- **Per-key limits.** Prefix a line in `~/.ssh/authorized_keys` with `restrict` (or `restrict,pty`) to strip forwarding and other features from that one key, which suits deploy and backup keys.

## 4. Firewall (UFW)

UFW is used here so both pages share one set of commands. `nftables` is the native alternative; run one or the other, never both.

Deny everything inbound, allow outbound, and open SSH **before** enabling. Arch needs both the service (loads the rules at boot) and `ufw enable` (turns the rules on).

```sh
sudo pacman -S --needed ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw limit 22/tcp         # allow, but block an address after 6 attempts in 30 seconds
sudo ufw show added           # review the rules before they go live
sudo systemctl enable --now ufw
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
sudo pacman -S --needed tailscale
sudo systemctl enable --now tailscaled
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
   sudo ufw delete limit 22/tcp
   sudo ufw reload
   ```

5. Confirm from outside: `ssh alice@<public-ip>` should time out and `ssh alice@100.x.y.z` should connect. Sessions that were already open over the public address stay up until they close.

If the tailnet is ever unreachable, the provider's web console is the way back in; re-add the rule with `sudo ufw limit 22/tcp`.

`sudo tailscale up --ssh` is the alternative: Tailscale authenticates SSH sessions itself using the tailnet's access rules, and no keys need to be distributed.

## 6. Updates

Arch has no supported unattended upgrade. Updates occasionally need a manual step, and those steps are announced on the [Arch news page](https://archlinux.org/news/). Upgrade by hand on a schedule instead, weekly at minimum:

```sh
sudo pacman -S --needed pacman-contrib arch-audit informant
sudo systemctl enable --now paccache.timer   # weekly: keep the last three versions of each cached package

checkupdates              # list pending updates without touching the system
arch-audit                # installed packages with known vulnerabilities
sudo pacman -Syu          # informant stops the upgrade until unread news has been read
```

- `linux-lts` is the calmer kernel for a server. Install it next to `linux`, add it to the bootloader, and boot it before removing the default kernel; the bootloader step depends on the image.
- `reflector` keeps the mirror list fresh. Skip it when the provider's image already points at its own mirror.

## 7. Recommended programs

Every package name below is in the official repositories.

```sh
# Essentials
sudo pacman -S --needed git base-devel curl wget unzip zip rsync tmux zsh neovim man-db

# Search, navigation, inspection
sudo pacman -S --needed ripgrep fd bat fzf jq go-yq eza zoxide git-delta tree ncdu btop

# Debugging and network
sudo pacman -S --needed strace lsof bind mtr tcpdump

# Development
sudo pacman -S --needed github-cli shellcheck shfmt just direnv stow sqlite uv

# Security audit
sudo pacman -S --needed lynis ssh-audit
```

Notes:

- **`go-yq`, not `yq`.** `go-yq` is the Go tool that most scripts expect. The package named `yq` is the Python wrapper around `jq`.
- **`bind`** provides `dig`.
- **Docker.** `sudo pacman -S --needed docker docker-buildx docker-compose`, then `sudo systemctl enable --now docker`. Membership of the `docker` group is equivalent to root, so add users deliberately. Read the Docker warning in the firewall section first.
- **AWS CLI.** `sudo pacman -S --needed aws-cli-v2`. The package named `aws-cli` is version 1.
- **Arch User Repository (AUR) helper.** Build `yay` as your own user, never as root:

  ```sh
  git clone https://aur.archlinux.org/yay-bin.git
  cd yay-bin && makepkg -si
  ```

  AUR packages are user-submitted build scripts. Read the `PKGBUILD` before installing one on a server.

### Language runtimes: nvm and pyenv

Install Node.js and Python per user through version managers, so projects can pin a version and a rolling system upgrade does not change the interpreter underneath them. Both managers are in the official repositories.

```sh
sudo pacman -S --needed nvm pyenv base-devel openssl zlib xz tk zstd
```

Add the loaders to `~/.zshrc`, or to `~/.bashrc` with `bash` in place of `zsh` on the last line:

```sh
source /usr/share/nvm/init-nvm.sh
export PYENV_ROOT="$HOME/.pyenv"
eval "$(pyenv init - zsh)"
```

Then open a new shell and install the runtimes as your own user, not root:

```sh
nvm install --lts
pyenv install 3.14            # newest 3.14.x; compiles from source, takes a few minutes
pyenv global 3.14
python --version && node --version
```

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

Adapted from DigitalOcean's [Initial Server Setup with Ubuntu](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu), [How To Harden OpenSSH on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-harden-openssh-on-ubuntu-20-04) and [How To Set Up a Firewall with UFW on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu), and from Tailscale's [Use UFW to lock down an Ubuntu server](https://tailscale.com/kb/1077/secure-server-ubuntu). Translated to Arch: `pacman`, the `wheel` group, `sshd.service`, and a manual update routine in place of unattended upgrades.
