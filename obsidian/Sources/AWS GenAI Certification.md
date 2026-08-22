---
tags: [aws, bedrock, genai, certification, course]
---

# AWS GenAI Certification Notes

Study notes for AWS generative-AI material, centered on **Amazon Bedrock**.

## Amazon Bedrock Overview

A serverless API for generative-AI **foundation models** — one interface to invoke text, chat, image, and embedding models.

- Use **pre-built** models, **fine-tune** them on your data, or bring your own.
- First-class support for **RAG** (Retrieval-Augmented Generation) and **agents**.
- Serverless — no infrastructure to manage; pay per token / per request.

## API Endpoints

Bedrock splits management from inference across four endpoints:

| Endpoint | Purpose | Key operations |
|---|---|---|
| `bedrock` | Manage, deploy, fine-tune models | model + provisioning management |
| `bedrock-runtime` | **Inference** — run prompts, generate embeddings | `Converse`, `ConverseStream`, `InvokeModel`, `InvokeModelWithResponseStream` |
| `bedrock-agent` | Manage agents & knowledge bases | agent/KB CRUD |
| `bedrock-agent-runtime` | Inference **against** agents & KBs | `InvokeAgent`, `Retrieve`, `RetrieveAndGenerate` |

> [!tip] Converse vs InvokeModel
> Prefer the **Converse** API for chat — it normalizes the message format across model providers, so you can swap models without rewriting request/response shaping. `InvokeModel` is the lower-level, model-specific call.

## IAM

- The **root user cannot use Bedrock** — use an IAM principal.
- Managed policies: `AmazonBedrockFullAccess` and `AmazonBedrockReadOnly`.
- Model access must also be **explicitly enabled** per-model in the Bedrock console before invocation.

> [!note] Related
> See [[IAM]] for the permission model and [[GraphQL]]/[[Lambda]] for wiring Bedrock into an application backend.
