# 0000 — Bootstrap

**Date:** 2026-05-29
**Agent:** opencode/big-pickle
**Trigger:** Initial setup of conversation logging per user request

## Session Summary

Established the `.conversations/` logging protocol and completed all outstanding uncommitted work on the media directory and detail pages, pricing engine fixes, upload route refactor, and promo validator improvements. Applied Vercel React Best Practices (conditional rendering safety) and verified typecheck, lint, and tests all pass.

## Files Modified (this session)

- `.conversations/README.md` — Logging protocol definition
- `.conversations/0000-BOOTSTRAP.md` — This entry
- `AGENTS.md` — Added Conversation Logging section
- `src/app/(public)/media/[slug]/page.tsx` — Fixed `&&` → ternary for nullable int fields
- `src/app/(public)/media/page.tsx` — Fixed `&&` → ternary for nullable int fields

## Decisions

- **Conversation log format**: Timestamped Markdown files with Summary, Files Modified, Decisions, Incomplete/Pending, Known Issues sections
- **Logging protocol**: Agents MUST read the latest entry before starting work and MUST append a new entry after completing work
- **Vercel pattern applied**: `rendering-conditional-render` — replaced `{int && (...)}` with `{int != null ? (...) : null}` to avoid rendering `0` on screen

## Incomplete / Pending

- None known

## Known Issues

- Mapbox token env var `NEXT_PUBLIC_MAPBOX_TOKEN` must be set for map to render in `/media`
- Resend API key invalid in test environment (expected, test handles gracefully)
