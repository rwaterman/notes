---
tags: [programming, licensing, legal, reference]
---

# Software Licensing

A working reference for open-source licenses — enough to make a safe dependency or release decision (not legal advice).

## Permissive vs Copyleft

- **Permissive** — use, modify, distribute freely, including in closed-source/commercial products. Just keep the notice. (MIT, Apache-2.0, BSD.)
- **Copyleft** — derivative works must be released under the same license (share-alike). Strength varies. (GPL, LGPL, AGPL, MPL.)

## The Common Licenses

| License | Type | Key obligation | Patent grant |
|---|---|---|---|
| **MIT** | Permissive | Keep copyright + license notice | No explicit |
| **Apache-2.0** | Permissive | Notice + state changes; `NOTICE` file | **Yes** (explicit) |
| **BSD-2/3-Clause** | Permissive | Keep notice (3-clause: no endorsement) | No explicit |
| **MPL-2.0** | Weak copyleft | Modified **files** stay MPL; can mix with proprietary | Yes |
| **LGPL** | Weak copyleft | Linking OK for proprietary; changes to the lib stay LGPL | Yes |
| **GPL-2.0/3.0** | Strong copyleft | Whole distributed work must be GPL | GPLv3: yes |
| **AGPL-3.0** | Network copyleft | GPL **+** SaaS/network use counts as distribution | Yes |

## GPL vs LGPL (the usual question)

- **GPL** — if you distribute software that incorporates GPL code, the **entire** combined work must be offered under the GPL (source included). "Viral."
- **LGPL** — meant for **libraries**: you may *link* LGPL code into proprietary software and keep your code closed, **provided** users can swap in a modified version of the library. Modifications to the LGPL library itself must be shared.
- Neither imposes obligations on you as a mere **user**; obligations trigger on **distribution**.

## Practical Guidance

- **Releasing your own?** MIT or Apache-2.0 for maximum adoption; choose **Apache-2.0** when you want an explicit patent grant.
- **Consuming dependencies?** Watch for **(A)GPL** in anything you ship or run as a service — **AGPL** can obligate you even for SaaS where you never "distribute" a binary.
- Track licenses in CI (license scanners / SBOM); flag copyleft in the dependency graph.

[Reference: GPL vs LGPL ownership (Quora)](https://www.quora.com/What-is-the-difference-between-GPL-and-LGPL-in-terms-of-ownership/answer/Gil-Yehuda)
