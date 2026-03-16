# grok-agent-kit CLI Interactive Search Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add interactive REPL support to `x-search` and `web-search`, with streaming output, local prompt history, and named-session continuation.

**Architecture:** Introduce a shared search-turn helper and a search-specific REPL runner that reuse the interactive console and prompt-history plumbing already added for chat.

**Tech Stack:** TypeScript, Commander, Vitest, Node.js readline/fs APIs

---

## Chunk 1: Red tests for interactive search

### Task 1: Add failing tests for the search REPL flow

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\test\interactive-search.test.ts`

- [ ] **Step 1: Write a failing test for `x-search --interactive` multi-turn behavior**
- [ ] **Step 2: Write a failing test for `web-search --interactive --session` resume and reset**
- [ ] **Step 3: Run `npm test -- apps/cli/test/interactive-search.test.ts` and verify failure**

## Chunk 2: Interactive runtime and shared search-turn helper

### Task 2: Implement interactive search support

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\src\interactive-search.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\interactive-chat.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\x-search.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\web-search.ts`

- [ ] **Step 1: Add a reusable search-turn helper**
- [ ] **Step 2: Add interactive runners for x-search and web-search**
- [ ] **Step 3: Re-run `npm test -- apps/cli/test/interactive-search.test.ts` until it passes**

## Chunk 3: Docs and verification

### Task 3: Document interactive search mode

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`

- [ ] **Step 1: Add English examples for interactive x-search and web-search**
- [ ] **Step 2: Add matching Simplified Chinese docs**
- [ ] **Step 3: Document `/reset` and `/exit`**

### Task 4: Run release verification

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified slice**
