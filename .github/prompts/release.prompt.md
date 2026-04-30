---
description: "Use when: running the pkistudio issue-to-release workflow, including issue creation, branch work, PR, merge, tag, release, and Actions checks."
name: "pkistudio release workflow"
argument-hint: "<version> <short feature or fix summary>"
agent: "agent"
---

# pkistudio Release Workflow

Run the standard pkistudio release workflow from issue creation through GitHub Release publication.

Expected invocation examples:

```text
/release 0.1.4 "Improve OID display"
/release v0.1.4 "Fix HEX clipboard parsing"
```

If the version, feature summary, or desired release scope is unclear, ask concise clarifying questions before making changes. Otherwise proceed proactively.

## Required Safety Rules

- This prompt is a workflow guide only and does not grant repository permissions.
- Push, tag, release, merge, and secret-backed Actions operations are possible only for users or tokens with the required repository permissions.
- Work in the current repository only.
- Check the current branch, remote, and working tree before making changes.
- Never discard uncommitted user changes.
- If unrelated local changes exist, stop and ask how to proceed.
- Create implementation work on a feature branch, never directly on `main`.
- Do not merge the PR or publish the release until the user confirms they have reviewed the behavior, unless the user explicitly asks to proceed without that confirmation.
- Use existing repository patterns and keep changes focused on the requested issue.
- Use non-interactive git commands.

## Inputs

Derive these from the invocation when possible:

- `version`: release version, normalized to both `X.Y.Z` and `vX.Y.Z` forms.
- `summary`: short feature or fix summary.
- `issueBody`: issue requirements. If the user supplied detailed requirements, preserve them.
- `verificationPlan`: expected local checks. If not supplied, infer from the changed area.

## Workflow

1. Preflight
   - Confirm the repository is `pkistudio/pkistudiojs` unless the user intentionally targets another repo.
   - Run a clean working tree check.
   - Confirm the current default branch and remote.
   - Check existing tags so the requested release version does not already exist.

2. Create Issue
   - Create a GitHub issue describing the requested change.
   - Include summary, requirements, expected behavior, and verification notes.
   - Record the issue number for the branch, PR body, and final report.
   - Prefer GitHub tools when available. If the GitHub CLI is unavailable and `GITHUB_TOKEN` is set, use the GitHub REST API with `curl`. Never print token values.

3. Create Branch
   - Create a branch named `issue-<number>-<short-kebab-summary>`.
   - Switch to it before editing files.

4. Implement
   - Read the relevant files before editing.
   - Update app code, documentation, and version references together when the change is release-worthy.
   - For pkistudio version bumps, update at least:
     - `app/static/pkistudio.js` `APP_VERSION`
     - `README.md` current version and any relevant feature documentation
   - Keep generated UI behavior consistent with the existing app style.

5. Verify Locally
   - Run syntax or lint checks available in the repo. At minimum, for JavaScript-only changes run:

     ```sh
     node --check app/static/pkistudio.js
     ```

   - Use the existing VS Code task `Start pkistudio server` or run `node app/server.js` when browser verification is needed.
   - Use browser automation when practical to verify critical UI behavior.
   - Stop any verification server you started when done.

6. Commit and Push
   - Review the diff and error list before committing.
   - Commit focused changes with a concise message.
   - Push the branch to `origin`.

7. Open Pull Request
   - Create a non-draft PR targeting `main` unless the user asks for a draft.
   - Include:
     - concise summary
     - notable implementation details
     - verification commands and manual checks
     - `Fixes #<issue-number>`
   - Report the PR URL.

8. Wait for User Confirmation
   - Ask the user to confirm their own manual check before merge/release.
   - When they say to proceed, continue.

9. Merge PR
   - Re-check PR status, review requirements, and local working tree.
   - Merge using the repository's preferred style. If no preference is known, use squash merge.
   - Confirm the issue closes automatically or report if it does not.

10. Tag and Release
    - Switch to `main`, fetch, and fast-forward pull.
    - Create an annotated tag `vX.Y.Z` on the merged `main` commit.
    - Push the tag.
    - Create a GitHub Release named `vX.Y.Z` with release notes summarizing user-facing changes and referencing the issue.
    - Mark it as the latest stable release, not draft and not prerelease, unless instructed otherwise.

11. Confirm Final State
    - Verify:
      - PR is merged and closed.
      - issue is closed as completed.
      - tag exists on `main` HEAD.
      - GitHub Release is published.
      - relevant GitHub Actions completed or are still running.
    - Final response must include issue, PR, release, tag, and any Actions status.

## Final Response Format

Keep the final response concise and include:

- Issue link and state
- PR link and merge state
- Release link and tag
- Verification summary
- Actions status
- Any follow-up needed
