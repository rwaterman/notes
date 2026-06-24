---
tags: [devops, web, static-site, publishing]
---

# Static Site Generators

Notes on choosing an SSG to publish from Markdown / Obsidian (and possibly Emacs org-mode).

> [!note] This KB
> This site runs on **Quartz** — chosen for native Obsidian support (backlinks, graph, wikilinks).

## Options

### Astro
Best for a polished personal/professional site.
- **Strengths:** modern TypeScript-friendly stack; great for custom pages, components, portfolios; excellent DX; strong community momentum.
- **Weaknesses:** not Obsidian-native; org-mode needs a conversion workflow.
- **Use when:** the site is mainly your personal brand, portfolio, blog, and technical writing.

### Hugo
Best for durable, boring, long-term publishing.
- **Strengths:** very mature; extremely fast builds; minimal dependency churn; supports Markdown **and** org-mode; great for long-lived publishing.
- **Weaknesses:** less modern-feeling; templating/content model feels older.
- **Use when:** you want a reliable engine for Markdown/org-mode content.

### Quartz
Best for an Obsidian-native digital garden.
- **Strengths:** built around Obsidian-style notes; backlinks, graph view, wikilinks, search, popovers, LaTeX, syntax highlighting; ideal for public knowledge gardens.
- **Weaknesses:** specialized; less ideal for complex custom personal sites.
- **Use when:** the site is mainly your public Obsidian vault / second brain.

## Decision

```text
Professional dev site + blog        → Astro
Public Obsidian / digital garden    → Quartz
Durable Markdown/org-mode publisher → Hugo
```
