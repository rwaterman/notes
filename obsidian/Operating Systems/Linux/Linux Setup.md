# Arch Linux

## Adding a New User

```bash
useradd -m   
usermod -a -G <TODO name or group first?> # Verify order 

pacman -S vi visudo
# …run visudo and uncomment wheel


```

### Optional: If you are setting up a VPS and need to make sure your key gets copied over

```sh
rsync --archive --chown=: ~/.ssh /home/
```

# Debian/Ubuntu Linux
