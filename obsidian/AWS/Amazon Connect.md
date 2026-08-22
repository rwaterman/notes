---
tags: [aws, amazon-connect, contact-center, course]
---

# Amazon Connect

AWS's cloud contact center — an omnichannel (voice + chat) service you configure in a console instead of standing up telephony hardware. Pay-as-you-go, integrates with [[Lambda]] for custom logic and [[S3]] for call recordings.

## Pricing Model

- **Pay as you go** — per-minute for voice, per-message for chat; no upfront commitment.
- **[[S3]]** stores recorded calls and chat transcripts.
- **[[Lambda]]** runs custom actions mid-flow (look up a customer, call an API, fetch a balance).

## Core Concepts

- **Contact flow** — defines a customer's experience end to end: welcome, identity/biometrics, self-service (e.g. balances), routing to an agent, and post-call surveys. Built in the drag-and-drop flow designer.
- **Queue** — where contacts wait before an agent is available.
- **Routing profile** — determines which queues (and which channels — calls vs chat) an agent receives.

## Omnichannel

One agent workspace across **voice** and **chat**, with routing that balances an agent's work across channels rather than treating them separately.

## Typical Flow Stages

1. Welcome / greeting
2. Identity verification (including voice biometrics via Amazon Connect Voice ID)
3. Self-service — balances, status, simple transactions
4. Route to an agent through the right queue
5. Post-contact survey

> [!tip] Extending Connect
> Custom logic lives in [[Lambda]]; analytics and recordings land in [[S3]]. Contact Lens adds real-time transcription, sentiment, and call analytics on top.
