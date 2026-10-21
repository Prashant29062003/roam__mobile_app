# 11 . Agent-neutral project setup

Status: done

## Goal

The project's setup should not assume one coding agent. Today it is already
90% there — the memory is one file, the skills are one copy with junctions,
and the MCP servers are remote URLs. Two doc lines still name OpenCode
specifically, and one claims a tool that is not wired up.

## Decisions

| # | Decision | Choice | Why |
|---|----------|--------|-----|
| 1 | How far to strip | **Docs only. Keep the per-client shims** (`.opencode/`, `.claude/`, `.mcp.json`, `CLAUDE.md`) | One shared source, several thin shims. A new client is a pointer, not a fork. Deleting the shims would break Claude Code's skill discovery and the Expo plugin, and would make every client hand-roll its MCP config. |
| 2 | Sanity MCP | **Not now** | It is part of a later plan. The `AGENTS.md` line that claims it is wired up gets corrected instead, because this file is "every decision that is still true". |

## What the audit found

| Where | Finding | Verdict |
|-------|---------|---------|
| `AGENTS.md` | One shared memory. `CLAUDE.md` is one line: `@AGENTS.md`. | ✅ agent-neutral |
| `.agents/skills/` | 13 skills, the shared source. `.claude/skills/*` are **junctions** into it (verified: `LinkType=Junction`, identical hashes). No duplication, no drift. | ✅ agent-neutral |
| `skills-lock.json` | Pins every skill's source and hash. `npx skills experimental_install` restores the set after a fresh clone; `npx skills update` refreshes it. | ✅ the portable path |
| `.mcp.json` | The MCP-standard project config — read by Claude Code, Cursor, VS Code, Windsurf, Zed. | ✅ |
| `.opencode/opencode.json` | OpenCode's own schema (it does not read `.mcp.json`). | config, not docs |
| `AGENTS.md` | The Clerk MCP bullet named `.opencode/opencode.json` (OpenCode), `.mcp.json` (Claude Code), and the commands `opencode mcp auth clerk` / `opencode mcp list`. | ✗ the only opencode-specific documentation |
| `AGENTS.md` | "ask through your tool's built-in question panel" — an OpenCode-ism, already hedged with "your tool's". | ✗ wording |
| `AGENTS.md` | Claimed content changes go "through the Sanity MCP". No Sanity MCP is configured anywhere. | ✗ claims a tool that is not there |

Nothing in the repo names a model or provider for the agent. The only provider
mentioned is TypeSafe, which is the app's own AI. So a paid agent on a
different provider needs no repository change at all.

## Steps

### 1. Rewrite the MCP bullet — done

The bullet now names the server, the URL, the OAuth sign-in and where the
config lives — `.mcp.json` for MCP-standard clients, `.opencode/opencode.json`
for OpenCode — and points at Clerk's per-client page instead of one client's
commands.

### 2. Correct the Sanity line — done

It now says the Sanity MCP is the intended route and is not wired up yet, and
that the setup is its own task.

### 3. De-OpenCode the "question panel" wording — done

Three places, now "your client's own option picker if it has one" / "the
client's option picker" / "through the client's option picker, and in plain
text when it has none".

### 4. Add an "Agents" section — done

Five bullets after **Commands**: where the memory, the skills and the MCP
servers live, and that client folders are shims. "Add a client, do not fork
the memory."

### 5. Nothing else changed — done

`.opencode/`, `.claude/`, `.mcp.json`, `CLAUDE.md` and `skills-lock.json` are
untouched.

## Verification

| # | Check | Result |
|---|-------|--------|
| 1 | `opencode` appears in `AGENTS.md` only as a file path | ✅ 3 hits, all paths (`.opencode/opencode.json`, the client-folders bullet, the Clerk bullet) |
| 2 | `claude` appears only as a file path or the one-line-import note | ✅ 2 hits, both paths |
| 3 | `question panel` is gone | ✅ 0 hits |
| 4 | `AGENTS.md` is under 150 lines | ✅ 126 |
| 5 | Every factual claim in the MCP bullet is still true | ✅ the URL, the OAuth sign-in, and both config paths were checked against the files |

## AGENTS.md updates

The four steps above are the updates. Nothing else in the file changed.

## Result

Done. The setup no longer names an agent: the only remaining mentions are
file paths, which have to name a folder to be useful. A future client needs
three things and nothing else — read `AGENTS.md`, run `npx skills
experimental_install` (or `npx skills add <source> -a '<agent>'`), and add the
two remote MCP URLs with its own OAuth sign-in. The Sanity MCP is deliberately
left out until its own plan lands; the line that mentioned it now says so.
