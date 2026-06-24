---
tags: [ai, llm, context-engineering]
---

# Context Engineering

The discipline of deciding **what information goes into an LLM's context window**, in what form, and in what order — so the model has exactly what it needs and nothing that distracts it. The successor framing to "prompt engineering": prompts are static instructions; context is the whole dynamic payload (instructions + retrieved data + tools + history + state).

## The Context Budget

The window is finite and not free — every token costs latency, money, and attention.

- **Relevance over volume** — more context is not better; irrelevant tokens dilute attention ("context rot").
- **Lost in the middle** — models attend best to the **start and end** of long contexts; put the critical instructions and the question at the edges.
- **Signal-to-noise** — prune, summarize, and rank before stuffing.

## Techniques

- **Retrieval (RAG)** — fetch only the relevant chunks (vector/keyword/hybrid search) instead of dumping whole documents.
- **Compression / summarization** — roll up long histories; keep a running summary instead of raw turns.
- **Structured context** — clear sections/delimiters (system rules, data, task) so the model can locate what matters.
- **Tool results as context** — let the model pull data on demand (function calling, MCP) rather than pre-loading everything.
- **Memory** — externalize durable facts (files, a store) and re-inject only what's relevant to the current task.
- **Few-shot examples** — include them only when they change behavior; drop once instructions suffice.

## Failure Modes

- **Context poisoning** — a wrong fact enters context and the model keeps building on it.
- **Distraction / dilution** — too much marginal context buries the goal.
- **Stale context** — outdated history contradicts current state.

## See Also
[[Prompt]] · [[Latent Space Prompt]] · [[LLM CLI Tools]]
