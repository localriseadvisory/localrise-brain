# AGENTS.md

Repository-wide operating policy for AI agents working in `localrise-brain`.

This file applies across the repository and should be used together with any more specific `AGENTS.md` or `CLAUDE.md` files found deeper in the tree.

## External Claude Knowledge Base

- Primary source of truth: `C:\Users\digui\Documents\localrise-brain\Claude\Claude Local RIse`
- Fallback mirror only when the primary source is unavailable: `C:\Users\digui\Documents\localrise-brain\.codex\Claude Local RIse`
- Project-history context root: `C:\Users\digui\.claude\projects`

Before making any material decision about implementation, content, architecture, automation, or operations, perform a targeted lookup in the external Claude knowledge base and reuse existing patterns when they fit the task.

## Knowledge Structure

Always verify these knowledge areas before acting:

1. `agents` -> execution logic
   - `C:\Users\digui\Documents\localrise-brain\Claude\Claude Local RIse\.claude\agents`
2. `skills` -> reusable procedures
   - `C:\Users\digui\Documents\localrise-brain\Claude\Claude Local RIse\marketingskills\skills`
3. `commands` -> operational actions
   - `C:\Users\digui\Documents\localrise-brain\Claude\Claude Local RIse\.claude\commands`
4. `projects` -> history and context
   - `C:\Users\digui\.claude\projects\c--Users-digui-Documents-localrise-brain`
   - `C:\Users\digui\.claude\projects\C--Users-digui-Documents-localrise-brain-Claude-Claude-Local-RIse`

## Lookup Rules

- Before acting, perform a targeted check in `agents`, `skills`, `commands`, and `projects`.
- Start with the most likely files in each area instead of reading the whole knowledge base.
- Expand the search only if the first pass leaves important gaps.
- Reuse and adapt existing logic before inventing a new solution.
- Create a new approach only when the knowledge base does not cover the case or is clearly inadequate.
- Use the `.codex` mirror only when the primary Claude tree is unavailable.

## Source Precedence

If the consulted sources conflict, use this precedence:

1. `commands`
2. `agents`
3. `skills`
4. `projects` as context and historical reference, never as a higher-priority rule source

## Task Heuristics

- Dashboard requests: verify commands, then agents, then skills, then related project history/context.
- Diagnostic or audit requests: verify matching commands and agents before defining methodology, then check skills and project context.
- Proposal, presentation, or commercial-material requests: verify commands, then reusable skills/procedures, then project history before drafting.
- Content, radar, or SEO requests: verify skills first for method, but still check commands, agents, and project context before execution.

## Response Expectations

- When reuse materially shapes the outcome, mention that the approach or pattern was inherited or adapted from the Claude knowledge base.
- Do not claim a pattern is new if it was derived from the external Claude materials.
