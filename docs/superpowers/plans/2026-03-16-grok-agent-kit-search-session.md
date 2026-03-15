# grok-agent-kit Search Session Continuity Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend named local sessions to `x-search` and `web-search` in the CLI.

**Architecture:** Reuse the existing `apps/cli` session lookup/persist pattern from `chat`, wiring search commands into the current session store without changing core request models.

**Tech Stack:** TypeScript, Node.js, Vitest, Commander

---

## Chunk 1: Search Command Tests

### Task 1: Add failing CLI tests for search session continuity

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\test\cli.test.ts`

- [ ] **Step 1: Add failing tests for `x-search --session`**
- [ ] **Step 2: Add failing tests for `web-search --session`**
- [ ] **Step 3: Run `npm test -- apps/cli/test/cli.test.ts` and verify failure**

## Chunk 2: CLI Search Session Support

### Task 2: Implement session-aware search commands

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\x-search.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\web-search.ts`

- [ ] **Step 1: Add session-related CLI flags**
- [ ] **Step 2: Reuse stored response IDs when present**
- [ ] **Step 3: Persist updated response IDs and local history after success**
- [ ] **Step 4: Re-run `npm test -- apps/cli/test/cli.test.ts` until it passes**

## Chunk 3: Docs and Verification

### Task 3: Document search-session usage

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\README.md`

- [ ] **Step 1: Add `x-search --session` and `web-search --session` examples**
- [ ] **Step 2: Keep English and Simplified Chinese docs aligned**

### Task 4: Run fresh verification commands

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified feature slice**
