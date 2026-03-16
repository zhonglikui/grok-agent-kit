# grok-agent-kit Session Search and MCP Session Parity Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local session filtering in the CLI and expose basic local session management over MCP, including named-session continuation for `grok_chat`.

**Architecture:** Promote the file-backed session store into `@grok-agent-kit/core`, keep the CLI using that shared implementation via a thin re-export, and teach the MCP server to use the same store for list/get/delete operations and chat session persistence.

**Tech Stack:** TypeScript, Commander, MCP SDK, Vitest, Node.js fs APIs

---

## Chunk 1: Shared Session Store Refactor

### Task 1: Move the file-backed session store into core without breaking the CLI

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\packages\core\src\session-store.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\core\src\index.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\session-store.ts`
- Test: `D:\work\typescript\grok-agent-kit\apps\cli\test\session-store.test.ts`

- [ ] **Step 1: Write or adjust failing tests only if the re-export path breaks**
- [ ] **Step 2: Move the file session store implementation into core and leave a CLI re-export shim**
- [ ] **Step 3: Re-run `npm test -- apps/cli/test/session-store.test.ts` until it passes**

## Chunk 2: CLI Session Filtering

### Task 2: Add filtering flags to `sessions list`

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\sessions.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\test\cli.test.ts`

- [ ] **Step 1: Write failing CLI tests for `--search`, `--model`, and `--limit`**
- [ ] **Step 2: Run targeted CLI session tests and verify failure**
- [ ] **Step 3: Implement filtering and invalid-regex handling in `sessions list`**
- [ ] **Step 4: Re-run targeted CLI session tests until they pass**

## Chunk 3: MCP Session Tools and Chat Session Parity

### Task 3: Add MCP tools for local session management and `grok_chat` session support

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\src\tool-handlers.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\src\server.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\test\tool-handlers.test.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\session-history.ts` (only if useful to share entry creation logic)

- [ ] **Step 1: Write failing MCP tests for list/get/delete session tools**
- [ ] **Step 2: Write a failing MCP chat test for named session auto-resume and persistence**
- [ ] **Step 3: Run targeted MCP tests and verify failure**
- [ ] **Step 4: Inject the shared session store into the MCP server and handlers**
- [ ] **Step 5: Implement `grok_list_sessions`, `grok_get_session`, `grok_delete_session`, and `grok_chat` session support**
- [ ] **Step 6: Re-run targeted MCP tests until they pass**

## Chunk 4: Docs and Verification

### Task 4: Document CLI filtering and MCP local session parity

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\codex.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\claude-code.md`

- [ ] **Step 1: Add CLI session filtering examples in English docs**
- [ ] **Step 2: Add matching Simplified Chinese docs**
- [ ] **Step 3: Note MCP local session tools for supported clients**

### Task 5: Run release verification

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified slice**
