# Project Agent Rules

This document explains the persistent agent workflow for `grok-agent-kit`.

## Why these rules exist

The project is being developed in long-running conversations across multiple coding agents. To avoid instruction drift, the repository keeps root-level instruction files for different tools:

- `AGENTS.md`
- `GEMINI.md`
- `CLAUDE.md`

These files intentionally repeat the same core rules so the active tool can pick them up immediately at session start.

## Core rules

1. Before choosing the next milestone or making a major architecture change, consult the local `gemini` CLI.
2. Once the task is clear, execute autonomously without asking for approval on each small step.
3. After Codex and Gemini reach a conclusion for a slice, Codex should execute every remaining step in that slice automatically: implementation, documentation, verification, commit, push, and obvious same-slice follow-up work.
4. This autonomy rule applies to both already-known work and newly discovered work inside the same slice: continue executing until the slice is fully delivered unless genuinely blocked.
5. If a Gemini consultation fails, times out, or is interrupted, retry or continue from the latest valid Gemini recommendation. Do not stop only because the consultation tool had an issue.
6. Do not treat a progress update or phase summary as a stopping point.
7. After each independently useful feature slice, run:
   - `npm test`
   - `npm run build`
   - `npm run typecheck`
   - `npm run pack:cli`
8. If verification passes, commit and push the result to `origin/main`.
9. Keep the project local-first and avoid requiring a self-hosted server for the default product path.
10. Keep `XAI_API_KEY` as the primary auth path; only consider browser auth when it does not require a self-hosted backend.
11. Update English and Simplified Chinese user-facing docs together.

## Maintenance note

When these operating rules change, update all three root instruction files in the same commit.
