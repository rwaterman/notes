# SSH - Mac OS

```
sudo tee /etc/ssh/sshd_config.d/200-custom.conf << 'EOF'
# Authentication
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

# Session hardening
ClientAliveInterval 300
ClientAliveCountMax 2
EOF
```
