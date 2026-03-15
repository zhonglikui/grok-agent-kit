# grok-agent-kit CLI Streaming Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add minimal streaming output to the CLI `chat` command while preserving local session persistence.

**Architecture:** Extend the xAI transport with a streaming `responses.create` path that parses SSE deltas and returns a final response object. Thread an optional `onTextDelta` callback through core chat options, then expose it in the CLI via `chat --stream`.

**Tech Stack:** TypeScript, Node.js fetch/Web Streams, Vitest, Commander

---

## Chunk 1: Transport Streaming

### Task 1: Add xAI SSE streaming support

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\xai-client\src\types.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\xai-client\src\xai-client.ts`
- Test: `D:\work\typescript\grok-agent-kit\packages\xai-client\test\xai-client.test.ts`

- [ ] **Step 1: Write a failing SSE parsing test**
- [ ] **Step 2: Run `npm test -- packages/xai-client/test/xai-client.test.ts` and verify failure**
- [ ] **Step 3: Implement minimal streaming request and parser**
- [ ] **Step 4: Re-run the targeted test until it passes**

## Chunk 2: Core Streaming Plumbing

### Task 2: Thread text deltas through the core chat service

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\core\src\types.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\core\src\grok-service.ts`
- Test: `D:\work\typescript\grok-agent-kit\packages\core\test\grok-service.test.ts`

- [ ] **Step 1: Write a failing service test for `onTextDelta`**
- [ ] **Step 2: Run `npm test -- packages/core/test/grok-service.test.ts` and verify failure**
- [ ] **Step 3: Implement the minimal streaming branch in `chat`**
- [ ] **Step 4: Re-run the targeted test until it passes**

## Chunk 3: CLI Streaming UX

### Task 3: Add `chat --stream`

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\chat.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\output.ts`
- Test: `D:\work\typescript\grok-agent-kit\apps\cli\test\cli.test.ts`

- [ ] **Step 1: Write a failing CLI test for incremental stdout writes**
- [ ] **Step 2: Run `npm test -- apps/cli/test/cli.test.ts` and verify failure**
- [ ] **Step 3: Implement minimal `--stream` behavior and preserve session history**
- [ ] **Step 4: Re-run the targeted test until it passes**

## Chunk 4: Docs and Verification

### Task 4: Document streaming usage

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\README.md`

- [ ] **Step 1: Add `chat --stream` examples**
- [ ] **Step 2: Keep English and Simplified Chinese docs aligned**

### Task 5: Run fresh verification commands

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified feature slice**
