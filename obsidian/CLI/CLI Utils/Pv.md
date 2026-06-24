---
tags: [cli, linux, snippet]
---

# Pv (Pipe Viewer)

Show progress, throughput, and ETA for data moving through a pipe (`brew install pv`).

```bash
# Progress bar while compressing
pv junkfile.txt | gzip > junkfile.txt.gz

# Make a test file to try it on
dd if=/dev/urandom of=junkfile.txt bs=1m count=1024

# Throttle a pipe to 1 MB/s
pv -L 1m bigfile | nc host 9000

# Progress for a disk image write (give pv the size so it can show %)
pv -s 4g image.iso | dd of=/dev/disk2 bs=4m
```
