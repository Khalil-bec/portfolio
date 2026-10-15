# Ticket status

Single source of truth for ticket progress. **Update this file every time a
ticket's implementation is done** (and on any status change). Keep it in sync
with `doc/tickets/` and `doc/idea-v1-decisions.md`.

## Legend

| Status | Meaning |
| --- | --- |
| `todo` | Not started. |
| `in-progress` | Being implemented. |
| `in-review` | Implemented + screenshot-checked, awaiting code review / user approval. Not yet committed. |
| `done` | Reviewed, approved by the user, and committed. Commit SHA recorded. |
| `blocked` | Waiting on another ticket. |

A ticket only reaches `done` after the user approves the commit (see
`AGENTS.md`: never commit without approval).

## Tickets

| Ticket | Title | Blocked by | Status | Commit | Notes |
| --- | --- | --- | --- | --- | --- |
| 001 | Setup project scaffold | — | `done` | `b4cc247` | Reviewed (no Critical), user-approved, pushed. Repo hosted privately. |
| 002 | Motion foundation (Lenis + anchors + kill-switch + focus) | 001 | `done` | `8d611ea` | Reviewed (no Critical), user-approved, committed. Nav deferred to 004, GSAP bridge to 003 (user-confirmed). |
| 003 | Reveals + numbered sections + ticker shell | 002 | `todo` | — | |
| 004 | Bilingual wiring | 001 | `todo` | — | Parallel with 002/003. |
| 005 | Content fit-in — hero + education + contact | 001, 003, 004 | `todo` | — | Parallel with 006. Owns favicon/OG monogram. |
| 006 | Content fit-in — projects + skills | 001, 003, 004 | `todo` | — | Parallel with 005. |
| 007 | Hardening + verification | 002–006 | `blocked` | — | Unblocks once 002–006 are `done`. |

## Update log

Append one line per status change, newest last.

- 2026-10-15 — `doc/status.md` created; 001 marked `done` (`b4cc247`), 002–006 `todo`, 007 `blocked`.
- 2026-10-15 — 002 implemented (Lenis foundation) → `in-review`. Decisions + visual-qa + code-review recorded in `doc/idea-v1-decisions.md`. Not committed; awaiting approval. Nav moved to 004, GSAP bridge to 003.
- 2026-10-15 — 002 approved + committed (`8d611ea`) → `done`.
