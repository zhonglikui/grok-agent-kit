# grok-agent-kit MCP Chat Streaming Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add minimal MCP streaming support to `grok_chat` using progress notifications.

**Architecture:** Keep the transport and core layers unchanged. Extend the MCP chat handler so it can translate `onTextDelta` callbacks into `notifications/progress` messages when the client opts in with `stream: true` and a request progress token.

**Tech Stack:** TypeScript, MCP SDK, Vitest, Zod

---

## Chunk 1: MCP Streaming Tests

### Task 1: Add a failing tool-handler test for streamed chat notifications

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\test\tool-handlers.test.ts`

- [ ] **Step 1: Add a failing streamed chat notification test**
- [ ] **Step 2: Run `npm test -- packages/mcp-server/test/tool-handlers.test.ts` and verify failure**

## Chunk 2: MCP Handler Wiring

### Task 2: Implement streamed `grok_chat`

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\src\tool-handlers.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\src\server.ts`

- [ ] **Step 1: Add `stream` to the MCP chat input schema**
- [ ] **Step 2: Forward deltas as `notifications/progress` when the request supplies a progress token**
- [ ] **Step 3: Preserve the final tool result shape**
- [ ] **Step 4: Re-run `npm test -- packages/mcp-server/test/tool-handlers.test.ts` until it passes**

## Chunk 3: Docs and Verification

### Task 3: Document MCP chat streaming

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.zh-CN.md`

- [ ] **Step 1: Add a short note about `grok_chat` + `stream: true` + MCP progress notifications**
- [ ] **Step 2: Keep English and Simplified Chinese docs aligned**

### Task 4: Run fresh verification commands

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified feature slice**
