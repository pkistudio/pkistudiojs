---
description: "Use when: running the pkistudio issue-to-release workflow, including issue creation, branch work, PR, merge, tag, GitHub Release, npm publish, Trusted Publishing, and Actions checks."
name: "pkistudio release workflow"
argument-hint: "[version|TBD] [#issue] <short feature or fix summary>"
agent: "agent"
---

# pkistudio Release Workflow

Run the standard pkistudio release workflow from issue creation through GitHub Release and npm publication.

Expected invocation examples:

```text
/release 0.1.4 "Improve OID display"
/release v0.1.4 "Fix HEX clipboard parsing"
/release TBD "Improve OID display"
/release "Improve OID display"
/release TBD #12
/release 0.1.5 #12 "Implement requested export option"
```

The release version may be omitted or set to `TBD` when development should proceed before the final version is known. If an existing issue number is supplied, use that issue instead of creating a duplicate issue. If the feature summary, desired release scope, issue reference, or whether a known-looking first argument is a version is unclear, ask concise clarifying questions before making changes. Otherwise proceed proactively.

## Default Operating Mode

When this prompt is invoked, proceed through the workflow without restating the full release procedure to the user. Treat the issue-to-release flow as the standard path and keep progress updates brief.

Default assumptions:

- If no issue number is supplied, create a tracking issue first.
- If an issue number is supplied, use that issue as the source of truth.
- Create a branch from the issue, implement the requested change, verify it, push it, and open a PR.
- Use the PR body and issue comments to preserve the release rationale, release notes draft, verification results, and publication status.
- Do not merge the PR until the user explicitly says to proceed.
- After merge is explicitly approved and required versions, credentials, and checks are in place, continue through version bump, tagging, GitHub Release creation, npm publication or workflow rerun, and post-publication verification without asking for separate confirmations unless something is blocked or ambiguous.

Ask only when:

- The requested version is missing and the workflow has reached a version-required step.
- The working tree has unrelated uncommitted changes.
- npm or GitHub permissions block progress.
- The issue requirements are ambiguous enough that implementation could go in the wrong direction.

Confirmation gate:

- Gate 1: PR merge.
- Post-merge release and publication steps should proceed proactively once prerequisites are satisfied.

## Required Safety Rules

- This prompt is a workflow guide only and does not grant repository permissions.
- Push, tag, release, merge, and secret-backed Actions operations are possible only for users or tokens with the required repository permissions.
- npm publication requires npm package ownership or a configured npm Trusted Publisher for `@pkistudio/pkistudiojs` and `.github/workflows/publish-npm.yml`.
- Work in the current repository only.
- Check the current branch, remote, and working tree before making changes.
- Never discard uncommitted user changes.
- If unrelated local changes exist, stop and ask how to proceed.
- Create implementation work on a feature branch, never directly on `main`.
- Do not merge the PR until the user confirms they have reviewed the behavior, unless the user explicitly asks to proceed without that confirmation.
- After merge approval, do not add extra confirmation gates for release publication, npm publication, workflow reruns, or post-publication verification unless permissions, version choice, failed checks, or ambiguous release intent require user input.
- Use existing repository patterns and keep changes focused on the requested issue.
- Use non-interactive git commands.

## Inputs

Derive these from the invocation when possible:

- `version`: release version, normalized to both `X.Y.Z` and `vX.Y.Z` forms when known. If omitted or `TBD`, treat it as pending and do not create tags, publish releases, or make final version bumps until the release step.
- `issueNumber`: existing GitHub issue number when the invocation includes a `#<number>` reference or an unambiguous issue URL.
- `summary`: short feature or fix summary.
- `issueBody`: issue requirements. If the user supplied detailed requirements, preserve them.
- `verificationPlan`: expected local checks. If not supplied, infer from the changed area.

## Standard Record Templates

Use these headings for new release tracking issues unless the issue already has a better structure:

```md
## Background
## Scope
## Release notes draft
## Verification
## Publication status
```

Use this shape for PR bodies:

```md
Summary:
- ...

Release notes draft:
...

Verification:
- `npm test`
- `npm run check`
- `npm pack --dry-run`

Closes #<issue-number>
```

## Workflow

1. Preflight
   - Confirm the repository is `pkistudio/pkistudiojs` unless the user intentionally targets another repo.
   - Run a clean working tree check.
   - Confirm the current default branch and remote.
   - If `version` is known, check existing tags so the requested release version does not already exist.
   - If `version` is known, check whether `@pkistudio/pkistudiojs@<version>` is already published on npm so reruns do not attempt to publish an immutable version twice.
   - If `version` is pending, record that the final version must be chosen before version bumps, tagging, or release publication.

2. Create Issue
   - If `issueNumber` is known, fetch the existing issue and use its title, body, requirements, labels, and discussion as the source request. Do not create a new issue.
   - If no existing issue is supplied, create a GitHub issue describing the requested change.
   - For new issues, include summary, requirements, expected behavior, and verification notes.
   - Record the issue number for the branch, PR body, and final report.
   - Prefer GitHub tools when available. If the GitHub CLI is unavailable and `GITHUB_TOKEN` is set, use the GitHub REST API with `curl`. Never print token values.

3. Create Branch
   - Create a branch named `issue-<number>-<short-kebab-summary>`.
   - Switch to it before editing files.

4. Implement
   - Read the relevant files before editing.
   - Update app code and documentation for the requested behavior.
   - If `version` is known and the change is release-worthy, update version references together.
   - If `version` is pending, leave existing released version references unchanged during implementation and note the deferred version bump in the issue and PR.
   - For pkistudio version bumps, update at least:
     - `package.json` `version`
     - `app/static/pkistudio-core.js` `VERSION`
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
   - For release candidates, run `npm pack --dry-run` and confirm the package contents are intentional.
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
   - If `version` is pending, ask the user to choose the final release version before continuing to merge/release steps that require version metadata.
   - When they say to proceed, continue.

9. Merge PR
   - Re-check PR status, review requirements, and local working tree.
   - Merge using the repository's preferred style. If no preference is known, use squash merge.
   - Confirm the issue closes automatically or report if it does not.

10. Tag, Release, and Publish
    - Switch to `main`, fetch, and fast-forward pull.
      - If `version` is pending, stop and ask for the final version before changing files, tagging, or publishing a release.
      - Once the final version is chosen, normalize it to both `X.Y.Z` and `vX.Y.Z` forms and check that the tag does not already exist.
      - If version references were deferred, create a focused version bump commit on `main` or on a release-prep branch/PR if the user wants review before publication.
    - Create an annotated tag `vX.Y.Z` on the merged `main` commit.
    - Push the tag.
      - The `Publish npm package` workflow runs on `v*` tag pushes and publishes with npm Trusted Publishing. It expects:
         - npm package name: `@pkistudio/pkistudiojs`
         - GitHub owner/repository: `pkistudio/pkistudiojs`
         - workflow filename: `publish-npm.yml`
         - npm Trusted Publishing environment: none / blank, unless the workflow is later changed to use one.
      - For scoped npm packages, `E404` during publish can mean the package does not exist yet or the workflow/account lacks scope permission.
      - If npm publish fails with `E404` or `no permission`, explain that npm Trusted Publishing or initial package ownership is not configured. Do not keep rerunning the same job until npm permissions are fixed.
      - Do not create a new tag just to retry npm publication when the version and tag are already correct. After fixing npm permissions or Trusted Publishing, rerun the failed publish workflow or publish manually from an authorized npm account.
      - If the version was already published manually, do not rerun the publish job for the same tag/version; npm versions are immutable and the rerun will fail.
    - Create a GitHub Release named `vX.Y.Z` with release notes summarizing user-facing changes and referencing the issue.
    - Mark it as the latest stable release, not draft and not prerelease, unless instructed otherwise.
      - After publication, verify `npm view @pkistudio/pkistudiojs@X.Y.Z version dist-tags dist.tarball --json` and, when practical, perform a fresh temporary install from npm and import the package entry points.

11. Confirm Final State
    - Verify:
      - PR is merged and closed.
      - issue is closed as completed.
      - tag exists on `main` HEAD.
      - GitHub Release is published.
      - npm package version is published and has the expected dist-tag.
      - relevant GitHub Actions completed or are still running.
    - Final response must include issue, PR, release, tag, and any Actions status.

## Final Response Format

Keep the final response concise and include:

- Issue link and state
- PR link and merge state
- Release link and tag
- npm package/version status
- Verification summary
- Actions status
- Any follow-up needed
