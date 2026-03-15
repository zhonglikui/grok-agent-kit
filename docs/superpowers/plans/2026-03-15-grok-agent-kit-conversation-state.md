# grok-agent-kit Conversation State Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local CLI session persistence and MCP-visible response chaining through xAI `previous_response_id` without requiring any self-hosted server.

**Architecture:** Shared request state fields live in `packages/core`, while file-backed named session persistence lives only in `apps/cli`. MCP tools expose raw stateful fields so external agents can manage conversation continuity themselves.

**Tech Stack:** TypeScript, Node.js, Vitest, Commander, xAI Responses API

---

## Chunk 1: Shared Stateful Request Support

### Task 1: Extend core request and result types

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\core\src\types.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\core\src\grok-service.ts`
- Test: `D:\work\typescript\grok-agent-kit\packages\core\test\grok-service.test.ts`

- [ ] **Step 1: Write failing tests for `previous_response_id`, `store`, and returned `responseId`**
- [ ] **Step 2: Run `npm test -- packages/core/test/grok-service.test.ts` and verify failure**
- [ ] **Step 3: Implement minimal pass-through support in `GrokService`**
- [ ] **Step 4: Re-run the targeted test until it passes**

## Chunk 2: CLI Session Store

### Task 2: Add file-backed session storage utilities

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\src\session-store.ts`
- Test: `D:\work\typescript\grok-agent-kit\apps\cli\test\session-store.test.ts`

- [ ] **Step 1: Write failing tests for save, load, list, and delete behaviors**
- [ ] **Step 2: Run `npm test -- apps/cli/test/session-store.test.ts` and verify failure**
- [ ] **Step 3: Implement the minimal JSON-backed session store**
- [ ] **Step 4: Re-run the targeted test until it passes**

### Task 3: Add chat session flags and session management commands

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\chat.ts`
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\sessions.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\index.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\types.ts`
- Test: `D:\work\typescript\grok-agent-kit\apps\cli\test\cli.test.ts`

- [ ] **Step 1: Write failing CLI tests for `--session`, `--reset-session`, and `sessions list/delete`**
- [ ] **Step 2: Run `npm test -- apps/cli/test/cli.test.ts` and verify failure**
- [ ] **Step 3: Implement minimal command wiring using the session store**
- [ ] **Step 4: Re-run the targeted test until it passes**

## Chunk 3: MCP Stateful Fields

### Task 4: Expose response chaining fields through MCP

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\src\server.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\src\tool-handlers.ts`
- Test: `D:\work\typescript\grok-agent-kit\packages\mcp-server\test\tool-handlers.test.ts`

- [ ] **Step 1: Write failing tests for `previousResponseId`, `store`, and returned `responseId`**
- [ ] **Step 2: Run `npm test -- packages/mcp-server/test/tool-handlers.test.ts` and verify failure**
- [ ] **Step 3: Implement minimal schema and handler support**
- [ ] **Step 4: Re-run the targeted test until it passes**

## Chunk 4: Docs and Verification

### Task 5: Document the local-first session workflow

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\codex.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\codex.zh-CN.md`

- [ ] **Step 1: Add session and continuation examples**
- [ ] **Step 2: Keep English and Simplified Chinese docs aligned**
- [ ] **Step 3: Verify all documented commands exist**

### Task 6: Run fresh verification commands

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified feature slice**
