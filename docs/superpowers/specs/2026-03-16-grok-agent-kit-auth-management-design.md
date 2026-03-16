# grok-agent-kit Auth Management Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Local auth inspection and xAI management API support

## Goal

Add a practical authentication-management workflow to `grok-agent-kit` without introducing any hosted backend.

This slice should help users answer three real questions quickly:

- is my local inference key configured?
- is my management key valid?
- can I list or create team API keys locally for Codex, Claude Code, or OpenClaw setup?

## Why this slice next

The core product is already local-first and API-key based, but onboarding still has an auth gap:

- users can run chat/search/MCP once they already have a key
- users with a management key cannot yet inspect or mint team API keys from the CLI
- browser auth is still ambiguous and should not be implied unless officially supported

For public `v1`, explicit auth guidance and management-key tooling reduce confusion and help real adoption.

## Product behavior

### New command group

Add a new top-level CLI command:

- `grok-agent-kit auth`

Subcommands:

- `auth status`
- `auth validate-management`
- `auth list-api-keys --team <teamId>`
- `auth create-api-key --team <teamId> --name <name>`

### Status behavior

`auth status` should report:

- whether `XAI_API_KEY` is configured
- whether `XAI_MANAGEMENT_API_KEY` is configured
- which management base URL is in use
- that browser auth is not part of the current local CLI/MCP flow

### Management API behavior

Use the official xAI management API for:

- validating the management key
- listing team API keys
- creating a new team API key

Default management base URL:

- `https://management-api.x.ai`

### API key creation defaults

If the user does not pass explicit ACLs, create a key with practical defaults:

- `api-key:model:*`
- `api-key:endpoint:*`

## Architecture

### xAI client expansion

Extend `packages/xai-client` with management endpoints rather than building a second HTTP stack.

This keeps:

- shared retry behavior
- shared error handling
- one client abstraction for xAI HTTP APIs

### CLI auth service

Add a small CLI auth-service wrapper that:

- reads `XAI_MANAGEMENT_API_KEY`
- instantiates a management-base-url client lazily
- throws a clear local error when the management key is missing

## Error handling

- missing `XAI_MANAGEMENT_API_KEY` should fail with a direct local message
- management API errors should surface the upstream xAI error clearly
- browser auth should be described as unsupported in the current local toolkit path, not as a hidden or partial feature

## Non-goals

- browser OAuth or cookie-based login automation
- storing secrets in local config files automatically
- rotating or deleting team API keys in this slice
- a hosted auth broker

## Testing strategy

- add `xai-client` tests for management validate/list/create
- add CLI tests for `auth status`
- add CLI tests for `auth validate-management`, `auth list-api-keys`, and `auth create-api-key`

## Documentation

Update:

- `.env.example`
- `README.md`
- `README.zh-CN.md`

Document the supported distinction clearly:

- `XAI_API_KEY` for inference
- `XAI_MANAGEMENT_API_KEY` for management
- no browser auth in the shipped local CLI/MCP flow
