---
tags: [programming, licensing, legal, reference]
---

# Software Licensing

Enough to make a safe dependency or release decision. Not legal advice.

- **Permissive** — use, modify, distribute, including closed-source; keep the notice. (MIT, Apache-2.0, BSD.)
- **Copyleft** — derivative works must ship under the same license. Strength varies. (MPL, LGPL, GPL, AGPL.)
- Obligations trigger on **distribution**, never on mere use — except **AGPL**, where serving over a network counts.

| License | Type | Key obligation | Patent grant |
|---|---|---|---|
| **MIT** | Permissive | Keep copyright + license notice | No explicit |
| **Apache-2.0** | Permissive | Notice + state changes; `NOTICE` file | **Yes** |
| **BSD-2/3-Clause** | Permissive | Keep notice (3-clause: no endorsement) | No explicit |
| **MPL-2.0** | Weak copyleft | Modified **files** stay MPL; mixes with proprietary | Yes |
| **LGPL** | Weak copyleft | Link from proprietary code OK; changes to the lib stay LGPL, users must be able to swap it | Yes |
| **GPL-2.0/3.0** | Strong copyleft | Whole distributed work must be GPL, source included | GPLv3: yes |
| **AGPL-3.0** | Network copyleft | GPL **+** network use counts as distribution | Yes |

## Decisions

- **Releasing?** MIT for maximum adoption; **Apache-2.0** when you want an explicit patent grant.
- **Consuming?** Flag **(A)GPL** in anything you ship or run as a service. Track licenses in CI (license scanner / SBOM).

[GPL vs LGPL ownership (Quora)](https://www.quora.com/What-is-the-difference-between-GPL-and-LGPL-in-terms-of-ownership/answer/Gil-Yehuda)
