# grok-agent-kit MCP Search Streaming Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add MCP progress-notification streaming support to `grok_x_search` and `grok_web_search`.

**Architecture:** Reuse the existing core `onTextDelta` callback path and extend MCP search handlers to follow the same streaming contract already used by `grok_chat`. Keep the final tool result unchanged so clients can opt into progress notifications without changing how they consume completed tool responses.

**Tech Stack:** TypeScript, MCP SDK, Vitest, Zod

---

## Chunk 1: Search Streaming Tests

### Task 1: Add failing streamed X Search and Web Search handler tests

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\test\tool-handlers.test.ts`

- [ ] **Step 1: Add a failing streamed `grok_x_search` progress notification test**
- [ ] **Step 2: Add a failing streamed `grok_web_search` progress notification test**
- [ ] **Step 3: Run `npm test -- packages/mcp-server/test/tool-handlers.test.ts` and verify failure**

## Chunk 2: MCP Search Handler Wiring

### Task 2: Implement streamed search handlers

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\src\tool-handlers.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\src\server.ts`

- [ ] **Step 1: Add `stream` to MCP X Search and Web Search input schemas**
- [ ] **Step 2: Pass MCP `extra` through to both search handlers**
- [ ] **Step 3: Reuse a shared helper to emit `notifications/progress` from search deltas**
- [ ] **Step 4: Re-run `npm test -- packages/mcp-server/test/tool-handlers.test.ts` until it passes**

## Chunk 3: Docs and Verification

### Task 3: Document MCP search streaming

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.zh-CN.md`

- [ ] **Step 1: Add a short note about `grok_x_search` and `grok_web_search` with `stream: true` plus MCP progress notifications**
- [ ] **Step 2: Keep English and Simplified Chinese docs aligned**

### Task 4: Run fresh verification commands

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified feature slice**
