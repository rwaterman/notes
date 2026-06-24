---
tags: [cli, security, secrets, snippet]
---

# pass

The standard Unix password manager — secrets are GPG-encrypted files in `~/.password-store`, optionally version-controlled with git. See [[GPG]].

```sh
brew install pass

# One-time setup (use a GPG key id or email; see `gpg --list-keys`)
pass init "<your-gpg-id>"
pass git init                 # track the store in git

# Add secrets (organize with slashes → folders)
pass insert someuser
pass insert -m business/someuser   # -m = multiline (store extra fields)
pass generate business/someuser 24 # generate a 24-char password

# Read
pass business/someuser        # print to stdout
pass -c business/someuser     # copy to clipboard (clears after 45s)
pass ls                       # tree of the store

pass rm business/someuser     # delete
```
