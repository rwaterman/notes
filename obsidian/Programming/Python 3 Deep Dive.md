---
tags: [programming, python, course]
---

# Python 3 Deep Dive

Notes from the *Python 3 Deep Dive* series (Udemy). [Course](https://sroa.udemy.com/course/python-3-deep-dive-part-1/learn/lecture/7065310#overview)

## Mental Model

- **Everything is an object** — functions and classes included; names are references bound to objects.
- **Mutable vs immutable** — `list`/`dict`/`set` mutable; `int`/`str`/`tuple` immutable. Drives copying, default-arg, and hashing gotchas.
- **Truthiness** — empty containers, `0`, `None`, `""` are falsy.
- **`is` vs `==`** — identity vs equality; `is` only for `None` / singletons.
- **PEP 8** (style), **PEP 20** (`import this`).

## Tooling

```sh
uv venv && source .venv/bin/activate   # venv + installs (uv)
uvx ruff check . && uvx ruff format .  # lint + format, no install
python -m pytest                       # tests
```
