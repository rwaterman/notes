---
tags: [linux, arch, arm64, parallels, macos, vm, kde, tailscale, setup]
---

# VM Setup — Arch Linux ARM on Parallels

Arch Linux ARM on an Apple Silicon Mac in Parallels Desktop, from the Archboot ISO to a KDE Plasma desktop reachable over Tailscale. Every command below was run on Parallels Desktop 27, Archboot `2026.10.12` (`aarch64`, `local` image) and kernel `7.2.10-1-aarch64-ARCH`. For hardening the same box as a server, see [[VPS Setup - Arch Linux]].

> [!warning] Why installs boot back into the ISO
> Parallels' ARM firmware boots the disk through an auto-created entry that only looks for the removable-media fallback loader, `\EFI\BOOT\BOOTAA64.EFI` on the EFI system partition (ESP). A bootloader installed only under a vendor path such as `\EFI\arch\` is invisible to it. The firmware then falls through to the CD and boots the ISO again, or, with the ISO detached, shows **No OS found**. `bootctl install` (systemd-boot) writes the fallback file; section 6 checks for it before the first reboot.

End state:

| Part | Choice |
|---|---|
| Firmware and boot | UEFI, Secure Boot off, systemd-boot loading `/Image` |
| Disk | GPT: 1 GiB FAT32 ESP at `/boot`, ext4 root |
| Desktop | KDE Plasma with Plasma Login Manager, NetworkManager |
| Remote access | OpenSSH, key-only, over Tailscale |
| Host integration | Parallels Tools; VM starts at Mac login and keeps running when its window closes |

## 1. Create the VM

Copy the ISO out of iCloud Drive first. macOS can evict an iCloud file to free space, and the VM would lose its install medium halfway through.

```sh
mkdir -p ~/Parallels/ISOs
cp ~/Library/Mobile\ Documents/com~apple~CloudDocs/Downloads/archboot-*-aarch64-ARCH-local-aarch64.iso ~/Parallels/ISOs/

VM="Arch Linux ARM64"
ISO=$(ls ~/Parallels/ISOs/archboot-*-aarch64-ARCH-local-aarch64.iso)
prlctl create "$VM" --distribution linux         # 64 GB expanding disk, EFI, shared network
prlctl set "$VM" --cpus 4 --memsize 8192
prlctl set "$VM" --device-set cdrom0 --image "$ISO" --connect
prlctl list -i "$VM" | grep -E 'Boot order|BIOS type|Secure boot'
prlctl start "$VM"
```

Expect `Boot order: hdd0 cdrom0`, `BIOS type: efi-arm64` and `EFI Secure boot: off`. Keep the disk first for the whole install: an empty disk falls through to the CD, and once the bootloader exists the disk wins with no settings change. 8 GB of memory is enough to install; raise it later with `--memsize`.

## 2. Boot Archboot and get SSH

At the Archboot welcome screen press **Ctrl+C** for a root shell. The banner confirms *Offline Mode, with local package repository*: the ISO carries its own package repository, so the base install needs no internet.

The network interface comes up without an address. Start it, then put your Mac's public key in place:

```sh
ip link set enp0s5 up
systemctl restart systemd-networkd systemd-resolved
ip -4 -br a                                      # shared network: 10.211.55.x
mkdir -p -m700 /root/.ssh
echo 'ssh-ed25519 AAAA... you@mac' > /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
```

Archboot's `sshd` listens on port **11838** and refuses passwords. From the Mac:

```sh
ssh -p 11838 root@10.211.55.x
```

Everything from here can be pasted over SSH.

> [!tip] Typing into the console from the Mac
> `prlctl send-key-event "$VM" --scancode <code>` types into the VM, and `prlctl capture "$VM" --file screen.png` screenshots it. Send each key as one call without `--event`, so press and release travel together. Separate press and release calls are slow enough to trigger key auto-repeat.

## 3. Partition and format

`sgdisk` is not on the image; use `sfdisk`. The root partition type is the ARM64 one (`B921B045-…`), which keeps `systemd-gpt-auto-generator` correct.

```sh
printf 'label: gpt\nsize=1GiB, type=U, name=ESP\ntype=B921B045-1DF0-41C3-AF44-4C6F280D3FAE, name=root\n' | sfdisk /dev/sda
mkfs.fat -F32 -n ESP /dev/sda1
mkfs.ext4 -L root /dev/sda2

T=/mnt/install
mount /dev/sda2 $T
mkdir -p $T/boot
mount -o fmask=0077,dmask=0077 /dev/sda1 $T/boot
```

## 4. Install the base system from the ISO

Archboot's `quickinst` is broken in this release. It hands pacman `--config /tmp/pacman.conf.XXX` as a single argument, and pacman stops with `unrecognized option '--config /tmp/pacman.conf.XXX'`. Its default package list also names `linux`; on `aarch64` the kernel package is `linux-aarch64`. Run pacman against the local repository directly:

```sh
cat > /tmp/pacman-local.conf << 'CONF'
[options]
Architecture = auto
SigLevel = Required DatabaseOptional
LocalFileSigLevel = Optional
[archboot]
Server = file:///var/cache/pacman/pkg
CONF

mkdir -p $T/var/cache/pacman/pkg $T/var/lib/pacman
pacman --root $T --config /tmp/pacman-local.conf --cachedir=$T/var/cache/pacman/pkg \
  -Sy --noconfirm base linux-aarch64 dosfstools e2fsprogs openssh nano less
```

- `sudo` is not in the offline repository. It is installed in section 8.
- Three post-install hooks fail with `==> ERROR: /proc must be mounted!`, including the initramfs build. That is expected outside a chroot; section 5 reruns them.
- The kernel lands on the ESP as `/boot/Image` (uncompressed, bootable directly by UEFI) and `/boot/Image.gz`.

## 5. Configure the new system

```sh
genfstab -U $T > $T/etc/fstab
echo arch-dev > $T/etc/hostname
printf '127.0.0.1 localhost\n::1 localhost\n127.0.1.1 arch-dev\n' > $T/etc/hosts
sed -i 's/^#en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' $T/etc/locale.gen
echo LANG=en_US.UTF-8 > $T/etc/locale.conf
echo KEYMAP=us > $T/etc/vconsole.conf
printf '[Match]\nType=ether\n\n[Network]\nDHCP=yes\n' > $T/etc/systemd/network/20-wired.network
install -d -m700 $T/root/.ssh
install -m600 /root/.ssh/authorized_keys $T/root/.ssh/authorized_keys

arch-chroot $T /bin/bash << 'CHROOT'
systemd-tmpfiles --create
journalctl --update-catalog
ln -sf /usr/share/zoneinfo/America/Los_Angeles /etc/localtime
locale-gen
mkinitcpio -P
systemctl enable systemd-networkd systemd-resolved sshd systemd-timesyncd systemd-boot-update
bootctl install --esp-path=/boot
CHROOT
arch-chroot $T passwd                            # root password, interactive

ln -sf /run/systemd/resolve/stub-resolv.conf $T/etc/resolv.conf
```

- Make the `resolv.conf` link **after** leaving the chroot. `arch-chroot` bind-mounts the live system's `resolv.conf` over the target's, so `ln` inside the chroot fails with `are the same file`.
- Hostnames allow letters, digits and hyphens. `hostnamectl set-hostname arch_dev` silently stores `archdev` as the hostname and keeps `arch_dev` only as the display ("pretty") name.
- `systemd-boot-update` keeps the loader on the ESP current when systemd is upgraded.

## 6. Boot loader

```sh
cat > $T/boot/loader/loader.conf << 'CONF'
default arch.conf
timeout 3
console-mode keep
editor no
CONF

cat > $T/boot/loader/entries/arch.conf << CONF
title   Arch Linux ARM64
linux   /Image
initrd  /initramfs-linux.img
options root=UUID=$(blkid -s UUID -o value /dev/sda2) rw
CONF

ls $T/boot/EFI/BOOT/BOOTAA64.EFI                 # must exist; this is what the firmware boots
umount -R $T
```

- Point `linux` at `/Image`. `Image.gz` is compressed and systemd-boot cannot load it.
- The `linux-aarch64` preset builds only `initramfs-linux.img`; there is no fallback image to add an entry for.
- `bootctl` reports `Not booted with EFI or running in a container, skipping EFI variable modifications`. That is fine: no firmware boot entry is needed because the fallback file covers it.

## 7. First boot

Detach the ISO from the Mac and start the VM. The target is unmounted, so a hard stop of the live system loses nothing.

```sh
prlctl stop "$VM" --kill
prlctl set "$VM" --device-set cdrom0 --disconnect
prlctl start "$VM"
```

Check the case that used to fail as well: attach the ISO again, reboot from inside the guest, and confirm it still comes up from disk (`findmnt /` shows `/dev/sda2`). Then power off fully and start again without the ISO.

The installed system runs `sshd` on port 22 and gets a new DHCP lease:

```sh
ssh root@10.211.55.y
bootctl status | grep -E 'Product|Current Entry'   # systemd-boot, arch.conf
systemctl --failed
```

> [!note] Expired passwords block SSH commands
> `passwd -e` on an account also stops key-based SSH from running commands: `Password change required but no TTY available`. Expire passwords only after setup is finished, or log in interactively once to change it.

## 8. Package signing keys and full upgrade

The installed system has no initialized keyring, and its repositories are the Arch Linux ARM mirrors. The Arch Linux ARM keyring package is signed by the Arch Linux ARM build key, which the fresh keyring does not trust yet (`signature from "Arch Linux ARM Build System <builder@archlinuxarm.org>" is unknown trust`). Verify that key against the fingerprint published on the [Arch Linux ARM package signing page](https://archlinuxarm.org/about/package-signing) before trusting it:

```sh
pacman-key --init
pacman-key --populate
pacman-key --list-keys builder@archlinuxarm.org  # compare with the published fingerprint
pacman-key --lsign-key 68B3537F39A313B3E574D06777193F152BDBE6A6
pacman -Sy --noconfirm archlinuxarm-keyring
pacman-key --populate archlinuxarm
pacman -Syu sudo
```

`archlinuxarm-keyring` is the one package to install with `-Sy` on its own; the `-Syu` that follows completes the upgrade.

## 9. Admin user

Same as [[Linux Setup]]: `sudo` through the `wheel` group, plus your key.

```sh
useradd -m -G wheel -s /bin/bash alice && passwd alice
echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/10-wheel
chmod 440 /etc/sudoers.d/10-wheel && visudo -c
install -d -m700 -o alice -g alice /home/alice/.ssh
install -m600 -o alice -g alice /root/.ssh/authorized_keys /home/alice/.ssh/
```

Run Plasma as this user, not as root.

## 10. KDE Plasma

`plasma-meta` brings Plasma Login Manager (`plasmalogin.service`), so SDDM is not needed. It also brings NetworkManager for the network applet; switch from `systemd-networkd` so the two do not manage the same interface.

```sh
sudo pacman -S --needed plasma-meta konsole dolphin kate ark gwenview okular \
  pipewire pipewire-pulse pipewire-jack wireplumber noto-fonts noto-fonts-emoji
sudo systemctl enable plasmalogin NetworkManager
sudo systemctl disable systemd-networkd.service systemd-networkd.socket systemd-networkd-wait-online.service
sudo reboot
```

DNS stays on `systemd-resolved`; NetworkManager detects the stub `resolv.conf` and uses it. NetworkManager sends a different DHCP client ID, so the VM gets a new address after this reboot.

### Plasma version mismatch on Arch Linux ARM (October 2026)

Arch Linux ARM rebuilds packages some days after Arch Linux. In October 2026 its repository carried `libplasma` 6.8.0, which ships `libPlasma.so.8`, while `plasma-workspace`, `plasma-desktop`, the login manager and most applets were still 6.7.5, built against `libPlasma.so.7`. The result is a black screen with only a mouse cursor, and in the journal:

```text
plasma-login-greeter: error while loading shared libraries: libPlasmaQuick.so.7: cannot open shared object file
```

Check for the mismatch before installing: the major and minor versions of these two should agree.

```sh
pacman -Si libplasma plasma-workspace | grep -E '^(Name|Version)'
```

If they differ, build `libplasma` at the version the rest of Plasma expects from Arch's own packaging, and hold it. The upstream tarball is checked against the PKGBUILD's SHA-256 sum and the KDE release managers' signatures. `--ignorearch` is needed because the PKGBUILD lists only `x86_64`.

```sh
sudo pacman -S --needed base-devel cmake extra-cmake-modules kdoctools plasma-wayland-protocols wayland-protocols
mkdir -p ~/build/libplasma && cd ~/build/libplasma
curl -fsSLO https://gitlab.archlinux.org/archlinux/packaging/packages/libplasma/-/raw/6.7.5-1/PKGBUILD
gpg --keyserver hkps://keyserver.ubuntu.com --recv-keys \
  E0A3EB202F8E57528E13E72FD7574483BB57B18D 0AAC775BB6437A8D9AF7A3ACFE0784117FBCE11D \
  D07BD8662C56CB291B316EB2F5675605C74E02CF 1FA881591C26B276D7A5518EEAAF29B42A678C20
makepkg --ignorearch --syncdeps
sudo pacman -U libplasma-6.7.5-1-aarch64.pkg.tar.xz
sudo sed -i '/^\[options\]/a IgnorePkg   = libplasma' /etc/pacman.conf
```

- `kwin` and `plasma-activities` were already 6.8.0 and do not link `libPlasma`, so the session runs as a 6.7/6.8 mix.
- Applets that were already rebuilt for 6.8, such as display configuration and print manager, fail to load until the rest of Plasma catches up. `plasmashell` logs `libPlasma.so.8: cannot open shared object file` for them.
- **Remove the hold** once `pacman -Si plasma-workspace` shows 6.8.x: delete the `IgnorePkg = libplasma` line, then run `sudo pacman -Syu`.

### Baloo crash loop

Baloo's file extractor starts without a display connection, falls back to the X11 platform plugin and aborts, over a thousand times within minutes (`coredumpctl list` fills with `baloo_file_extractor`). It needs no display; run it offscreen:

```sh
sudo mkdir -p /etc/systemd/user/kde-baloo.service.d
printf '[Service]\nEnvironment=QT_QPA_PLATFORM=offscreen\n' | sudo tee /etc/systemd/user/kde-baloo.service.d/offscreen.conf
systemctl --user daemon-reload && systemctl --user restart kde-baloo
```

`balooctl6 disable` turns file indexing off instead.

## 11. yay

Build the AUR helper as your own user, never as root. AUR packages are user-submitted build scripts; read the `PKGBUILD` before installing one.

```sh
sudo pacman -S --needed git base-devel
git clone https://aur.archlinux.org/yay.git
cd yay && makepkg -si
```

`yay-bin` skips compiling Go; see [[VPS Setup - Arch Linux]].

## 12. Tailscale and SSH

`tailscale` is in the Arch Linux ARM `extra` repository; `yay -S tailscale` resolves to the same package.

```sh
sudo pacman -S --needed tailscale
sudo systemctl enable --now tailscaled
sudo tailscale up                                # prints a login URL; approve the machine in the browser
sudo tailscale set --hostname=arch-dev           # MagicDNS name: arch-dev.<tailnet>.ts.net
```

Keys only for OpenSSH:

```sh
sudo tee /etc/ssh/sshd_config.d/10-key-only.conf << 'CONF'
PasswordAuthentication no
KbdInteractiveAuthentication no
CONF
sudo sshd -t && sudo systemctl reload sshd
```

From any machine on the tailnet: `ssh alice@arch-dev`. `sudo tailscale set --ssh` is the alternative: Tailscale authenticates SSH sessions with the tailnet's access rules instead of keys. The full SSH and firewall hardening is in [[VPS Setup - Arch Linux]].

**Networking mode.** Shared networking (the default) puts the VM behind NAT on `10.211.55.0/24`, reachable from the Mac only. Bridged networking gives it its own address from the LAN's DHCP server, so Tailscale peers on the LAN connect to it directly:

```sh
prlctl set "$VM" --device-set net0 --type bridged --iface default
```

With bridged networking, the Mac in this setup could not reach the VM on its LAN address. Use the Tailscale name from the Mac as well.

## 13. Parallels Tools

Tools add clipboard sharing, shared folders, dynamic resolution and `prlctl exec`. The installer builds against the running kernel, so install the matching headers first.

```sh
# In the VM
sudo pacman -S --needed base-devel linux-aarch64-headers
# On the Mac
prlctl installtools "$VM"
# In the VM
sudo mount -o ro /dev/sr0 /mnt && sudo /mnt/install && sudo umount /mnt
sudo reboot
```

Tools `27.0.3` installed cleanly on kernel 7.2.10; the installer also pulls `net-tools`. The log is `/var/log/parallels-tools-install.log` and the service is `prltoolsd.service`.

## 14. Keep it running

Start the VM at Mac login, keep it running when its window is closed (the default suspends it and drops SSH), and shut it down cleanly when the Mac shuts down:

```sh
prlctl set "$VM" --autostart user-login --on-window-close keep-running --autostop shutdown
```

A sleeping Mac pauses the VM. *Wake for network access* lets the Mac wake on a Wake-on-LAN magic packet while on power:

```sh
pmset -g custom | grep womp                      # 1 under "AC Power" means on
sudo pmset -c womp 1
```

The magic packet has to come from a device on the same LAN, and Tailscale on the sleeping Mac is down until it wakes.

## 15. Verify

```sh
findmnt / /boot                                  # /dev/sda2 ext4, /dev/sda1 vfat
bootctl status | grep -E 'Product|Current Entry'
systemctl --failed
pacman -Syu                                      # nothing to do; warns that libplasma is ignored while held
tailscale status
coredumpctl list --since -10min                  # no repeating crashes
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Reboots into the ISO after installing | No `\EFI\BOOT\BOOTAA64.EFI` on the ESP | `bootctl install` (section 6) |
| **No OS found** with the ISO detached | Same | Same |
| `unrecognized option '--config /tmp/pacman.conf.XXX'` | `quickinst` quoting bug | Run pacman directly (section 4) |
| `target not found: sudo` | Not in the offline repository | Install after first boot (section 8) |
| `/proc must be mounted!` during install | Hooks ran outside a chroot | `mkinitcpio -P` in `arch-chroot` (section 5) |
| Port 22 connection refused on the live ISO | Archboot `sshd` uses port 11838 | `ssh -p 11838` |
| `signature … is unknown trust` | Arch Linux ARM build key not trusted | Section 8 |
| Black screen with only a cursor at login | `libplasma` newer than the rest of Plasma | Section 10 |
| Repeating `baloo_file_extractor` core dumps | Extractor has no display | Offscreen override (section 10) |
| `Password change required but no TTY available` | Expired password | Log in interactively once |
| Hostname `arch_dev` becomes `archdev` | Underscores are invalid in hostnames | Use `arch-dev` |

## Sources

[Archboot](https://archboot.com/), the ArchWiki pages on [systemd-boot](https://wiki.archlinux.org/title/Systemd-boot) and [installation](https://wiki.archlinux.org/title/Installation_guide), Arch Linux ARM's [package signing](https://archlinuxarm.org/about/package-signing) page, Arch's [libplasma packaging](https://gitlab.archlinux.org/archlinux/packaging/packages/libplasma), and the Parallels Desktop command-line reference (`prlctl <command> --help`).
