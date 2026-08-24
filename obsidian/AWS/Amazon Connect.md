---
tags: [aws, amazon-connect, contact-center]
---

# Amazon Connect

Cloud contact center (voice + chat), configured in a console. Pay per voice-minute / chat-message, no upfront commitment.

- **Contact flow** — the customer's path: greeting → identity (Voice ID biometrics) → self-service → queue → agent → post-contact survey. Built in the drag-and-drop flow designer.
- **Queue** — where contacts wait. **Routing profile** — which queues and channels (voice, chat) an agent takes; one workspace across both.
- **[[Lambda]]** runs custom logic mid-flow (customer lookup, API call, balance fetch). **[[S3]]** stores recordings and transcripts. **Contact Lens** adds transcription, sentiment, and call analytics.
