---
tags: [ai, cli, tooling]
---

# LLM CLI Tools

Terminal-native coding agents from the major providers — install globally with npm.

```bash
npm i -g @google/gemini-cli @openai/codex @anthropic-ai/claude-code
```

| Tool | Package | Provider |
|---|---|---|
| Claude Code | `@anthropic-ai/claude-code` | Anthropic |
| Codex | `@openai/codex` | OpenAI |
| Gemini CLI | `@google/gemini-cli` | Google |

## Notes
- Each authenticates separately (API key or account login) on first run.
- Node 18+ required; install with a user-scoped prefix to avoid `sudo` (see [[NodeJS]] / [[Using brew in a multi-user system]]).
- Keep them updated: `npm update -g` — agent CLIs ship frequently.

> [!tip] Provider-agnostic prompting
> Patterns transfer across tools — see [[Prompt]] and [[Latent Space Prompt]].
