---
tags: [cli, security, snippet]
---

# SHA Checksums

Verify file integrity with a cryptographic hash.

```sh
# Single file
shasum -a 256 file.iso              # SHA-256
shasum -a 256 -c file.iso.sha256    # verify against a checksum file

# Deterministic checksum for an ENTIRE directory's contents
find . -type f -print0 | sort -z | xargs -0 shasum | awk '{ print $1 }' | shasum
```

> [!note] macOS
> `shasum` ships with macOS; `sha256sum` (GNU) does not unless you `brew install coreutils` (then `gsha256sum`). The directory recipe sorts first so the result is stable regardless of filesystem order.
