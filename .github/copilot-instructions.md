This repository uses Architecture Decision Records (ADRs) stored under `docs/adr/`.

When reviewing code, check whether the proposed changes are consistent with existing ADRs.

Pay special attention to changes involving:

- External dependencies
- Database selection or schema strategy
- Authentication and authorization
- API design
- Cryptographic algorithms or key management
- Deployment architecture
- Runtime infrastructure
- Major framework or library choices

If a change appears to conflict with an existing ADR, point out the relevant ADR and explain the conflict.

If a pull request introduces an important architectural decision without an ADR, suggest adding a new ADR under `docs/adr/`.

When suggesting an ADR, recommend using the existing ADR template in `docs/adr/0000-template.md`.

Do not treat ADRs as implementation manuals. ADRs should explain why a decision was made, what alternatives were considered, and what consequences are expected.

Prefer concise, actionable review comments.