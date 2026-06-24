---
tags: [programming, python, course]
---

# Python 3 Deep Dive

Notes from the *Python 3 Deep Dive* series (Udemy). Python is a "batteries-included" language — a large standard library and a culture of readability.

> [Course](https://sroa.udemy.com/course/python-3-deep-dive-part-1/learn/lecture/7065310#overview)

## The Zen of Python

```python
import this
```

> Beautiful is better than ugly.
> Explicit is better than implicit.
> Simple is better than complex.
> Complex is better than complicated.
> Flat is better than nested.
> Sparse is better than dense.
> Readability counts.

(Tim Peters — PEP 20.)

## PEPs
**Python Enhancement Proposals** document proposed and accepted language features. PEP 8 (style) and PEP 20 (Zen) are the ones you'll cite most.

## Mental Model Highlights
- **Everything is an object** — including functions and classes; names are references bound to objects.
- **Mutable vs immutable** — `list`/`dict`/`set` mutable; `int`/`str`/`tuple` immutable. Drives copying, default-arg, and hashing gotchas.
- **Truthiness** — empty containers, `0`, `None`, `""` are falsy.
- **`is` vs `==`** — identity vs equality; use `is` only for `None`/singletons.

## Modern Tooling
```sh
uv venv && source .venv/bin/activate   # fast venv + installs (uv)
ruff check . && ruff format .          # lint + format
python -m pytest                       # tests
```
