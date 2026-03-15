# grok-agent-kit Local History Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist a lightweight local transcript for named CLI sessions and expose it with `sessions show`.

**Architecture:** Reuse the existing file-backed CLI session store and extend each session record with an append-only `history` array. Keep this feature entirely in `apps/cli` so MCP and shared API logic remain transport-agnostic.

**Tech Stack:** TypeScript, Node.js, Vitest, Commander

---

## Chunk 1: Session Store History

### Task 1: Extend the session store with local history

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\session-store.ts`
- Test: `D:\work\typescript\grok-agent-kit\apps\cli\test\session-store.test.ts`

- [ ] **Step 1: Write failing tests for persisted history and missing-history fallback**
- [ ] **Step 2: Run `npm test -- apps/cli/test/session-store.test.ts` and verify failure**
- [ ] **Step 3: Implement the minimal session history shape**
- [ ] **Step 4: Re-run the targeted test until it passes**

## Chunk 2: CLI History View

### Task 2: Record history on session chats and show it

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\chat.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\sessions.ts`
- Test: `D:\work\typescript\grok-agent-kit\apps\cli\test\cli.test.ts`

- [ ] **Step 1: Write failing tests for session history append and `sessions show`**
- [ ] **Step 2: Run `npm test -- apps/cli/test/cli.test.ts` and verify failure**
- [ ] **Step 3: Implement the minimal CLI history behavior**
- [ ] **Step 4: Re-run the targeted test until it passes**

## Chunk 3: Docs and Verification

### Task 3: Document local history usage

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\README.md`

- [ ] **Step 1: Add `sessions show` usage examples**
- [ ] **Step 2: Keep English and Simplified Chinese docs aligned**

### Task 4: Run fresh verification commands

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified feature slice**
