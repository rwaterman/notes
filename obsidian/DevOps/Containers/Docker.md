---
tags: [devops, docker, containers]
---

# Docker

Package an app and its dependencies into a portable **image** that runs as an isolated **container** on any host with a container runtime. "Works on my machine" → works everywhere.

## Image vs Container

- **Image** — immutable, layered filesystem + metadata (built from a `Dockerfile`).
- **Container** — a running (or stopped) instance of an image, with a writable top layer.
- **Registry** — where images live (Docker Hub, **Amazon ECR**, GHCR).

## Dockerfile Essentials

```dockerfile
# --- build stage ---
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- runtime stage ---
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

- **Layers** are cached — order from least- to most-frequently-changing (deps before source) for fast rebuilds.
- **Multi-stage builds** keep build tools out of the final image → smaller, safer.

## Everyday Commands

```bash
docker build -t myapp:1.0 .
docker run -p 3000:3000 --env-file .env myapp:1.0
docker ps                 # running containers
docker logs -f <id>       # tail logs
docker exec -it <id> sh   # shell inside
docker image prune -a     # reclaim space
```

## Compose (multi-container, local)

```yaml
services:
  api:
    build: .
    ports: ["3000:3000"]
    depends_on: [db]
  db:
    image: postgres:16
    environment: { POSTGRES_PASSWORD: dev }
    volumes: ["pgdata:/var/lib/postgresql/data"]
volumes: { pgdata: {} }
```

## Best Practices

- Small base images (`-alpine`, `distroless`); pin versions, not `latest`.
- Run as a **non-root** user; use `.dockerignore`.
- One concern per container; persist state in **volumes**, never the container layer.
- Scan images in CI (Trivy, ECR scanning).

> [!tip] Where they run
> Locally with Compose; in prod via [[ECS & Fargate]] or [[Kubernetes]].
