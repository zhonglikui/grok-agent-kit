# grok-agent-kit Vision Input Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local image input to CLI and MCP chat flows, with reliable local session replay for image-backed conversations.

**Architecture:** Extend the shared core types and service layer to support xAI `input_image` parts, add local file-to-data-URL helpers in core, wire repeatable image-path inputs into CLI and MCP chat, and replay named image sessions locally with `store: false` instead of relying on server-side response chaining.

**Tech Stack:** TypeScript, Commander, MCP SDK, Vitest, Node.js fs/path APIs

---

## Chunk 1: Core image request primitives

### Task 1: Add image-aware core types and file helpers

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\xai-client\src\types.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\core\src\types.ts`
- Create: `D:\work\typescript\grok-agent-kit\packages\core\src\image-input.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\core\src\index.ts`
- Test: `D:\work\typescript\grok-agent-kit\packages\core\test\image-input.test.ts`

- [ ] **Step 1: Write failing tests for PNG/JPEG validation, media-type mapping, and data-URL creation**
- [ ] **Step 2: Run `npm test -- packages/core/test/image-input.test.ts` and verify failure**
- [ ] **Step 3: Implement local image helper utilities and shared types**
- [ ] **Step 4: Re-run `npm test -- packages/core/test/image-input.test.ts` until it passes**

## Chunk 2: Chat request building and session replay

### Task 2: Teach the Grok service to send image content and replay local image sessions

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\core\src\grok-service.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\core\src\session-store.ts`
- Test: `D:\work\typescript\grok-agent-kit\packages\core\test\grok-service.test.ts`

- [ ] **Step 1: Write failing service tests for chat requests with images**
- [ ] **Step 2: Write a failing service test for local replay input using saved image metadata**
- [ ] **Step 3: Run `npm test -- packages/core/test/grok-service.test.ts` and verify failure**
- [ ] **Step 4: Implement image-aware input building and session-history image metadata**
- [ ] **Step 5: Re-run `npm test -- packages/core/test/grok-service.test.ts` until it passes**

## Chunk 3: CLI vision input

### Task 3: Add `--image` support to the chat command

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\chat.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\session-history.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\test\cli.test.ts`

- [ ] **Step 1: Write failing CLI tests for single-image chat and named-session replay with images**
- [ ] **Step 2: Run `npm test -- apps/cli/test/cli.test.ts` and verify failure**
- [ ] **Step 3: Implement repeatable `--image` parsing and image-session replay handling**
- [ ] **Step 4: Re-run `npm test -- apps/cli/test/cli.test.ts` until it passes**

## Chunk 4: MCP vision input

### Task 4: Add `images` support to `grok_chat`

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\src\server.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\src\tool-handlers.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\test\tool-handlers.test.ts`

- [ ] **Step 1: Write failing MCP tests for direct `images` input and named session replay with images**
- [ ] **Step 2: Run `npm test -- packages/mcp-server/test/tool-handlers.test.ts` and verify failure**
- [ ] **Step 3: Implement MCP schema and handler support for `images`**
- [ ] **Step 4: Re-run `npm test -- packages/mcp-server/test/tool-handlers.test.ts` until it passes**

## Chunk 5: Docs and release verification

### Task 5: Document multimodal chat usage

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\codex.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\codex.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\claude-code.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\claude-code.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\openclaw.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\openclaw.zh-CN.md`

- [ ] **Step 1: Add English multimodal CLI and MCP examples**
- [ ] **Step 2: Add matching Simplified Chinese docs**
- [ ] **Step 3: Note image-session replay behavior for named local sessions**

### Task 6: Run release verification

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified slice**
