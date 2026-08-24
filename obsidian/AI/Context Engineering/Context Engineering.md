---
tags: [ai, llm, context-engineering]
---

# Context Engineering

Deciding **what goes into the context window**, in what form, in what order. Prompts are static instructions; context is the whole dynamic payload — instructions, retrieved data, tool results, history, state.

## The Budget

Every token costs latency, money, and attention.

- **Relevance over volume** — irrelevant tokens dilute attention ("context rot").
- **Lost in the middle** — models attend best to the start and end; put critical instructions and the question at the edges.
- Prune, summarize, rank before stuffing.

## Techniques

- **Retrieval (RAG)** — fetch relevant chunks (vector / keyword / hybrid), not whole documents.
- **Compression** — running summary instead of raw turns.
- **Structure** — clear sections and delimiters (rules, data, task).
- **Tools** — let the model pull data on demand (function calling, MCP) instead of pre-loading.
- **Memory** — durable facts externalized; re-inject only what's relevant now.
- **Few-shot** — only when examples change behavior; drop once instructions suffice.

## Failure Modes

- **Poisoning** — a wrong fact enters and the model builds on it.
- **Dilution** — marginal context buries the goal.
- **Staleness** — old history contradicts current state.

[[Prompt]] · [[Latent Space Prompt]] · [[LLM CLI Tools]]
