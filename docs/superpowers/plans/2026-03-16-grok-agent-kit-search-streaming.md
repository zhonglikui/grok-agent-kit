# grok-agent-kit Search Streaming Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `--stream` support to CLI `x-search` and `web-search`.

**Architecture:** Reuse the existing xAI SSE + core delta plumbing added for `chat`, then wire the two search commands into the same `renderStreamResult` path while preserving existing session persistence.

**Tech Stack:** TypeScript, Node.js, Vitest, Commander

---

## Chunk 1: CLI Streaming Tests

### Task 1: Add failing tests for search streaming

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\test\cli.test.ts`

- [ ] **Step 1: Add a failing test for `x-search --stream`**
- [ ] **Step 2: Add a failing test for `web-search --stream`**
- [ ] **Step 3: Run `npm test -- apps/cli/test/cli.test.ts` and verify failure**

## Chunk 2: Search Command Wiring

### Task 2: Implement streaming search commands

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\x-search.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\web-search.ts`

- [ ] **Step 1: Add `--stream` and `--stream`/`--json` validation**
- [ ] **Step 2: Pass `onTextDelta` into service calls**
- [ ] **Step 3: Reuse `renderStreamResult` and keep session history intact**
- [ ] **Step 4: Re-run `npm test -- apps/cli/test/cli.test.ts` until it passes**

## Chunk 3: Docs and Verification

### Task 3: Document search streaming

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\README.md`

- [ ] **Step 1: Add `x-search --stream` and `web-search --stream` examples**
- [ ] **Step 2: Keep English and Simplified Chinese docs aligned**

### Task 4: Run fresh verification commands

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified feature slice**
