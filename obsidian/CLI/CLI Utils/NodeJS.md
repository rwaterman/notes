---
tags: [cli, node, snippet]
---

# NodeJS

## Version Management

Use a version manager rather than the system Node; pin per-project with a `.nvmrc` / `.node-version`.

```sh
# fnm (fast) — brew install fnm
fnm install 24 && fnm use 24 && fnm default 24

# or nvm
nvm install --lts && nvm use --lts
```

## Cleanup

```sh
# Remove generated declaration files (not in node_modules)
find . -name '*.d.ts' -not -path "./node_modules/*" -delete

# Nuke node_modules and IDE cruft recursively
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
find . -name '.idea'        -type d -prune -exec rm -rf '{}' +
```

## Everyday

```sh
npm ci                 # clean, lockfile-exact install (use in CI)
npm outdated           # what's behind
npx <pkg>              # run a package without installing globally
node --watch app.js    # built-in watch mode (Node 18+)
node --test            # built-in test runner (Node 18+)
```

> [!tip] Global installs without sudo
> Point npm's global prefix at a user dir to avoid permission issues — see [[Using brew in a multi-user system]] and [[LLM CLI Tools]].
