---
tags: [cli, macos, snippet]
---

# iCloud

The iCloud Drive folder lives at an awkward path; symlink it somewhere reachable from the shell.

```sh
# Short, tab-completable path to iCloud Drive
ln -sf "$HOME/Library/Mobile Documents/com~apple~CloudDocs" "$HOME/iCloud"
```

> [!note] App containers
> Per-app iCloud data lives under sibling `com~apple~*` / `iCloud~*` folders in `Mobile Documents/`.
