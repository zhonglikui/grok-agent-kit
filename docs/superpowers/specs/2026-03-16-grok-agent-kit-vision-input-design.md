# grok-agent-kit Vision Input Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Local image input for CLI and MCP chat workflows

## Goal

Enable local image analysis in `grok-agent-kit` so Codex, Claude Code, OpenClaw, and direct CLI users can send screenshots or other local images to Grok without any hosted relay.

This slice should support three concrete workflows:

- local CLI users attaching screenshots to `chat`
- MCP clients passing local image paths to `grok_chat`
- named local sessions continuing safely even after image turns

## Why this slice next

Gemini recommended vision input because the current product already has solid chat, search, streaming, and local session foundations. The next biggest capability gap for agent users is multimodal input.

This fits the product constraints well:

- fully local-first file reading
- no browser upload service or self-hosted backend
- still centered on direct xAI API usage

## External API constraints

Official xAI image-input docs show that image input uses the OpenAI-compatible `input_image` content format and accepts either a public URL or a base64 `data:` URL.

The same docs currently note two important constraints for this slice:

- supported formats are PNG and JPEG
- each image must be no larger than 20 MB

The xAI chat-history guide also recommends disabling server-side history storage for image requests and instead replaying the needed history locally in a fresh request body.

That means this slice should not depend on `previous_response_id` for image-backed session continuity.

## Product behavior

### CLI

Add repeatable `--image <path>` support to `grok-agent-kit chat`.

Behavior rules:

- allow one or more local image paths
- resolve each path locally and convert it to a base64 data URL before sending to xAI
- reject unsupported file types or oversized files with a clear local error
- keep search commands text-only for this slice

### MCP

Extend `grok_chat` with an optional `images: string[]` field containing local file paths.

Behavior rules:

- the MCP server reads local files itself; callers only provide paths
- `grok_x_search` and `grok_web_search` remain unchanged in this slice
- the structured result surface remains text-first

### Session continuity

When a chat request uses images, or when a named local session already contains prior image turns, the client must switch to local replay mode:

- build a full `input` message array from the locally saved session history plus the new prompt
- send that request with `store: false`
- do not rely on `previous_response_id`

For text-only sessions, keep the existing lightweight `previous_response_id` continuation path.

This preserves current performance for text chats while keeping image sessions reliable and local-first.

## Architecture

## Shared core utilities

Add image helpers to `@grok-agent-kit/core`:

- local image file validation
- extension-to-media-type mapping for PNG and JPEG
- base64 data-URL construction
- conversion of local image inputs into xAI `input_image` content parts

Keep raw base64 strings out of the session store.

## Service request model

Extend the core chat request model so `GrokService` can build:

- a normal single-turn text request from `prompt` and optional `images`
- a fully replayed message array for named local sessions that contain image turns

The replay format should still use xAI-compatible content parts:

- `input_text`
- `input_image`

## Session store model

Persist lightweight image metadata per turn, not binary payloads.

Each history entry should optionally record:

- original local path
- display name
- media type

This metadata is used for transcript rendering and for reconstructing replayed requests by re-reading files from disk.

If a saved image path no longer exists during replay, fail fast with a clear error explaining which local file is missing.

## Error handling

Return local validation errors before any API request when:

- a referenced file does not exist
- the file is not PNG or JPEG
- the file exceeds the size limit
- a stored image path is missing during replay

Keep the errors deterministic and user-readable because these cases are common in agent workflows.

## Testing strategy

- add core tests for image-file validation and request building
- add CLI tests proving `chat --image <path>` sends structured image input
- add MCP tests proving `grok_chat` accepts `images`
- add session tests proving an image-backed named session replays locally without storing base64 in `sessions.json`

## Documentation

Update:

- root README in English and Simplified Chinese
- client docs index in both languages
- Codex, Claude Code, and OpenClaw docs with a short multimodal note

Include examples for:

- CLI `chat --image`
- MCP `grok_chat` with `images`
- named local session behavior for image turns
