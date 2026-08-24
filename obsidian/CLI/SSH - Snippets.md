---
tags: [ssh, security, snippet]
---

# SSH Snippets

## Keys

```bash
# ED25519 (default choice); -a 100 = KDF rounds protecting the private key
ssh-keygen -a 100 -t ed25519 -f ~/.ssh/id_ed25519 -C "$(whoami)@$(hostname)"

# RSA 4096 when the target can't do ed25519
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -C "name@host-or-email"

# Install a public key on a remote host
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@remote_host
```

## Tunnel

```sh
# Local :5433 → db.internal:5432 via bastion; -N = no shell
ssh -N -L 5433:db.internal:5432 user@bastion [-i ~/.ssh/some_key]
```

## Convert an RSA key to PEM (AWS, older tooling)

Modern `ssh-keygen` writes `-----BEGIN OPENSSH PRIVATE KEY-----`, which `openssl rsa` cannot read. Convert in place (copy first if you want to keep the original):

```sh
cp ~/.ssh/id_rsa ~/.ssh/id_rsa.pem
ssh-keygen -p -m PEM -f ~/.ssh/id_rsa.pem     # prompts for old/new passphrase
head -1 ~/.ssh/id_rsa.pem                      # -----BEGIN RSA PRIVATE KEY-----
```

Harden the server side in [[SSH - Mac OS]].
