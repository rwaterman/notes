---
tags: [macos, spotlight, troubleshooting, snippet]
---

# macOS Spotlight

Stale or missing search results, or `mds`/`mdworker` pinning the CPU → rebuild the index. Reindexing runs in the background; expect CPU/fan noise until it finishes.

```sh
sudo mdutil -E /            # erase and rebuild the index for the boot volume
sudo mdutil -E -a           # ...for all volumes

# Heavier reset: toggle indexing off and on first
sudo mdutil -a -i off && sudo mdutil -a -i on && sudo mdutil -E -a
```

```sh
mdutil -s /                 # index status
mdfind "query"              # Spotlight search from the CLI
mdls file                   # a file's Spotlight metadata
```

Exclude `node_modules`, caches, and build dirs under **System Settings → Spotlight → Search Privacy**.
