---
tags: [cli, security, encryption, snippet]
---

# GPG

Encrypt, sign, and verify files with public-key crypto (`brew install gnupg`). Backs [[pass]].

```bash
# Generate a key, then list it (note the long key id / fingerprint)
gpg --full-generate-key
gpg --list-secret-keys --keyid-format=long

# Encrypt for a recipient (ASCII-armored output)
echo "this is secret" > secret.txt
gpg --encrypt --armor --recipient "<email_address>" secret.txt   # → secret.txt.asc

# Decrypt
gpg --decrypt secret.txt.asc

# Detached signature + verification
gpg --armor --output secret.txt.sig --detach-sign secret.txt
gpg --verify secret.txt.sig secret.txt
```

> [!tip] Sharing keys
> Export your public key to send to others: `gpg --armor --export "<email>" > pubkey.asc`. Import theirs with `gpg --import pubkey.asc`.
