# Vendored libraries

Repo rule: libraries come only from `/vendor`. No dependency is added without
explicit approval. Nothing here is fetched at runtime.

Fetched from jsDelivr over HTTPS and header-checked (see
`doc/idea-v1-decisions.md`, 2026-10-15). Verify by comparing the SHA-256 below —
do not re-download to "check".

| File | Version | SHA-256 |
| --- | --- | --- |
| `lenis-1.3.27.min.js` | 1.3.27 | `80f53e77f1c13e379fc246d2b5e299188e20bcb2b2fe7ebb13e8e8c7563a6da7` |
| `lenis-1.3.27.min.css` | 1.3.27 | `47469b217f10ae50ff9a7d43b0eb4b64bca52e1ee4ee72cc4569f8ddfca8ee6f` |
| `gsap-3.15.0.min.js` | 3.15.0 | `92bb9a96476f983d212a2bc4f54c889039c1696dd4461d40a736860938570fbb` |
| `ScrollTrigger-3.15.0.min.js` | 3.15.0 | `b0b14d67b55b0c43c756ac0b106cfcb09d0879945f6ead64451065b0672916a2` |

Compare hashes with:

```sh
sha256sum vendor/*
```

## Update policy

- Any version bump is a dependency change: ask first.
- On bump, re-record the SHA-256 above and note the reason in
  `doc/idea-v1-decisions.md`.
- Watch the upstream advisories for GSAP and Lenis; there is no automated
  dependency scanning in this repo.
