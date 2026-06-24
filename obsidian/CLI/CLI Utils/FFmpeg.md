---
tags: [cli, media, snippet]
---

# FFmpeg

Swiss-army knife for audio/video transcoding (`brew install ffmpeg`).

```bash
# Lossless FLAC → Apple Lossless (ALAC)
ffmpeg -i input.flac -acodec alac output.m4a

# Extract audio from a video
ffmpeg -i input.mp4 -vn -acodec copy output.aac

# Transcode to H.264 MP4 (good default, CRF 23 ≈ visually lossless-ish)
ffmpeg -i input.mov -c:v libx264 -crf 23 -preset medium -c:a aac output.mp4

# Trim without re-encoding (fast; -ss start, -to end)
ffmpeg -i input.mp4 -ss 00:00:10 -to 00:00:20 -c copy clip.mp4

# Make a GIF
ffmpeg -i input.mp4 -vf "fps=12,scale=480:-1" output.gif
```

> [!tip] `-c copy` skips re-encoding — instant and lossless, but only works when you're not changing the codec.
