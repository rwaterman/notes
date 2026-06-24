---
tags: [aws, api-gateway, serverless, integration, snippet]
---

# API Gateway

Managed front door for APIs: routing, auth, throttling, and transformation in front of Lambda, HTTP backends, or AWS services. Handles TLS, scaling, and request lifecycle so your backend doesn't.

## API Types

| | REST API | HTTP API | WebSocket API |
|---|---|---|---|
| Cost | Higher | ~70% cheaper | Per message + connection-minute |
| Latency | Higher | Lower | — |
| Auth | IAM, Cognito, Lambda authorizers | JWT/OIDC, Lambda, IAM | Lambda |
| Transforms | VTL mapping templates | Minimal | — |
| Extras | API keys + usage plans, caching, WAF, request validation | CORS, simple, fast | `$connect`/`$disconnect`/routes |

Default to **HTTP API** for Lambda/HTTP proxying; use **REST API** when you need caching, usage plans, or request/response transformation.

## Integrations

- **Lambda proxy** — pass the raw request to Lambda, return its response. Most common.
- **HTTP proxy** — forward to any HTTP backend.
- **AWS service** — call a service directly (e.g. drop a message on SQS) with no Lambda.
- **Mock** — return canned responses (stubs, CORS preflight).

## Endpoints

- **Edge-optimized** — fronted by CloudFront (global clients).
- **Regional** — clients in-region, or your own CDN.
- **Private** — only reachable from a VPC via an interface endpoint.

## Controlling Traffic

- **Throttling** — account-level + per-method rate/burst.
- **Usage plans + API keys** (REST) — per-client quotas and throttles.
- **Caching** (REST) — cache responses per stage to cut backend load.
- **Stages + stage variables** — `dev`/`prod` deployments and config.

## Snippets

```sh
# Count edge-optimized REST APIs in the account
aws apigateway get-rest-apis \
  --query 'items[?endpointConfiguration.types[0] == `EDGE`]' \
  --output json | jq length
```

> [!tip] Custom domains
> Map `api.example.com` to a stage with an ACM cert via a **custom domain name** + base-path mapping, instead of exposing the generated `*.execute-api` URL.
