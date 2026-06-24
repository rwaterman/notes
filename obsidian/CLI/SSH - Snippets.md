---
tags: [ssh, security, snippet]
---

# Create an SSH Key (ED25519)

```bash
ssh-keygen -o -a 100 -t ed25519 -f ~/.ssh/id_ed25519 -C "$(whoami)@$(hostname)"
```

# Create an SSH Key (RSA)

```sh
ssh-keygen -t rsa -b 4096 -C "name@host-or-email"
```

# Copy SSH Public Key to Remote Host

```bash
ssh-copy-id -i ~/.ssh/your_custom_key.pub username@remote_host
```

# Create an SSH Tunnel

```sh
ssh -Nv -L target_port:endpoint:source_port user@host [-i ~/.ssh/some_ssh_key.xxx]
```

# Convert an id_rsa Key (PKCS#1 and PKCS#8) to an AWS-compatible PEM Key

```sh
openssl rsa -in ~/.ssh/id_rsa -outform pem > newfile.pem
```
