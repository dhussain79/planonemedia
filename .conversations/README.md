# Conversation Log

This directory contains a chronological log of AI agent sessions in this repository.

## Purpose

Enable any future agent (Claude Code, OpenCode, Cursor, etc.) to quickly recall what was done in previous sessions, what decisions were made, and what remains incomplete.

## Logging Protocol

Every session MUST:

1. **Read** the latest entry (highest-numbered file) to understand current state
2. **Create** a new entry at the end of the session with:
   - Date and agent model used
   - Summary of what was accomplished
   - Files modified
   - Any decisions made (architecture, patterns, trade-offs)
   - **Explicit list of incomplete or pending tasks**
   - **Explicit list of known issues or bugs**

## Format

Files use the pattern: `YYYY-MM-DD-HHmm.md`

Each entry should be a Markdown file with these sections:

```markdown
# YYYY-MM-DD HH:mm

**Agent:** {model name}
**Trigger:** {what user asked for}

## Summary

{2-3 sentence overview}

## Files Modified

- `path/to/file` — {what changed and why}

## Decisions

- {decision made, rationale}

## Incomplete / Pending

- {item} — {status, blocker if any}

## Known Issues

- {issue} — {where, how to reproduce}
```

## Bootstrap

Entry `0000-BOOTSTRAP.md` documents the initial state of the project when logging was established.
