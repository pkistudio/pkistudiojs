---
description: "Use when creating or deciding whether to create Architecture Decision Records for PkiStudio repositories."
name: "PkiStudio ADR Rules"
---

# PkiStudio ADR Rules

- Create an ADR only for a meaningfully architectural decision, a long-lived trade-off, or an explicit user request.
- Do not create ADRs for routine implementation details, dependency bumps, small refactors, copy changes, or release mechanics.
- Keep ADR work in the current repository unless the user explicitly asks for cross-repository coordination.
- Prefer `docs/adr/` unless the repository profile names another ADR location.
- Use a short, durable title that names the decision, not the implementation task.
- Include context, decision, consequences, alternatives considered, rollout or migration notes, and related issue or PR links when available.
- Mark status clearly, such as `Proposed`, `Accepted`, `Superseded`, or `Rejected`.
- If an ADR supersedes an older ADR, update both documents so the relationship is discoverable.
- Keep ADRs concise and factual. Record the decision and reasoning, not a full project history.