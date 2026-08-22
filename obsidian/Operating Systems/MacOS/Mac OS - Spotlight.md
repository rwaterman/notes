---
tags: [macos, spotlight, troubleshooting, snippet]
---

# macOS Spotlight

Spotlight's search index (`mds`/`mdworker`) occasionally corrupts — searches return stale or missing results, or `mds` pins the CPU. Rebuilding the index fixes it.

## Force a Full Reindex

```sh
sudo mdutil -a -i off      # disable indexing on all volumes
sudo rm -rf /.Spotlight-V100   # delete the existing index
sudo mdutil -a -i on       # re-enable indexing
sudo mdutil -E             # erase and rebuild from scratch
```

Reindexing runs in the background and can take a while; CPU/fan spike until it finishes.

## Useful Companions

```sh
mdutil -s /                 # index status for a volume
mdfind "query"              # Spotlight search from the CLI
mdls file                   # show a file's Spotlight metadata
```

> [!tip] Exclude a folder
> Add paths under **System Settings → Spotlight → Search Privacy** to keep large build dirs (`node_modules`, caches) out of the index.
