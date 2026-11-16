---
tags: [linux, parallels, macos, vm, arch, ubuntu, tailscale, setup]
---

# VM Setup — Parallels Settings for Linux VMs

Host-side settings for Linux VMs in Parallels Desktop on an Apple Silicon Mac: size, disk growth, encryption, automatic snapshots and SSH over Tailscale. Everything here is a `prlctl` setting on the Mac, so it applies to any guest. Installing the guest is a separate page: [[VM Setup - Arch Linux on Parallels]] for Arch Linux ARM, and [[VPS Setup - Ubuntu]] for hardening an Ubuntu guest once it is installed.

Run on Parallels Desktop 27.1.0 against an Arch Linux ARM VM, with the values taken from an existing Ubuntu VM. One command was checked with `--dry-run` only: `prlctl encrypt`.

Baseline for both VMs:

| Setting | Value |
|---|---|
| CPUs | 4 |
| Memory | 32 GB (`--memsize 32768`) |
| Disk | 256 GB expanding (`--size 262144`) |
| Network | Shared |
| Encryption | On |
| Snapshots | SmartGuard, every 48 hours, keep 3 |

Read the current values:

```sh
VM="Arch Linux ARM64"
prlctl list -i "$VM" | grep -E 'cpu |memory |hdd0|Encrypted'
prlctl list -i "$VM" | grep -A3 'Smart Guard'
```

## 1. CPU and memory

`prlctl stop` without `--kill` asks the guest to shut down and waits for it.

```sh
prlctl stop "$VM"
prlctl set "$VM" --cpus 4 --memsize 32768
prlctl start "$VM"
```

## 2. Grow the disk

A new VM gets a 64 GB disk. Set the size before the first boot and the installer partitions the full disk:

```sh
prlctl set "$VM" --device-set hdd0 --size 262144 --no-fs-resize
```

On an installed VM, run the same command with the VM stopped, then grow the partition and filesystem from inside the guest. `--no-fs-resize` leaves the guest's partitions alone.

```sh
# On the Mac
prlctl stop "$VM"
prlctl set "$VM" --device-set hdd0 --size 262144 --no-fs-resize
prlctl start "$VM"

# In the guest
echo ', +' | sudo sfdisk -N 2 /dev/sda --no-reread --force
sudo partx -u /dev/sda
sudo resize2fs /dev/sda2
sudo sfdisk --verify /dev/sda                    # No errors detected.
df -h /
```

- The guest commands fit the layout from [[VM Setup - Arch Linux on Parallels]]: an ext4 root as the last partition, `/dev/sda2`. Other layouts need their own steps.
- `sfdisk` prints `Re-reading the partition table failed.: Device or resource busy` because the disk is mounted. `partx -u` hands the new table to the kernel without a reboot.
- `resize2fs` grows a mounted ext4 filesystem online.

## 3. Encryption

Parallels encrypts the VM's files on the Mac with a password. The guest still sees a plain disk.

```sh
prlctl stop "$VM"
prlctl encrypt "$VM" --dry-run                   # checks the preconditions only
prlctl encrypt "$VM"
prlctl start "$VM"
```

- The VM must be stopped. On a running VM the check fails with `Unable to perform the action because the virtual machine is busy`.
- Once a VM is encrypted, `prlctl exec`, `prlctl snapshot-list` and `prlctl resume` need its password. A session that has not supplied it gets `Failed to authorise current session against virtual machine`.
- `prlctl list -i` still reads the configuration of an encrypted VM without the password.

## 4. SmartGuard snapshots

SmartGuard takes a snapshot on a timer and deletes the oldest one past the limit. The interval is in seconds; `172800` is 48 hours.

```sh
prlctl set "$VM" --smart-guard on --sg-interval 172800 --sg-max-snapshots 3 --sg-notify-before-create off
prlctl list -i "$VM" | grep -A3 'Smart Guard'
prlctl snapshot-list "$VM"
```

`--sg-notify-before-create` defaults to `on`, which asks before each snapshot. `prlctl set "$VM" --smart-guard off` turns the timer off.

## 5. SSH over Tailscale

Join the guest to the tailnet first: section 12 of [[VM Setup - Arch Linux on Parallels]], or section 5 of [[VPS Setup - Ubuntu]]. Then give each VM an entry in `~/.ssh/config` on the Mac, with the MagicDNS name as the host name:

```text
Host arch-dev
    HostName arch-dev.<tailnet>.ts.net
    User alice
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
```

`ssh arch-dev` then works from the Mac on any network. A suspended VM is off the tailnet and the connection times out. Closing the VM's window suspends it by default; section 14 of [[VM Setup - Arch Linux on Parallels]] keeps it running.

## Sources

The Parallels Desktop command-line reference: `prlctl set smartguard --help`, `prlctl set startup --help`, `prlctl set device_mgmt --help` and `prlctl encrypt --help`.
