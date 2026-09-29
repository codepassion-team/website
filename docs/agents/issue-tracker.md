# Issue tracker: GitHub

Issues and specs for this repo live in GitHub Issues at `codepassion-team/website`. Use the `gh` CLI for issue operations.

## Conventions

- Create: `gh issue create --title "..." --body-file <file>`
- Read: `gh issue view <number> --comments`
- List: `gh issue list --state open --json number,title,body,labels,comments`
- Comment: `gh issue comment <number> --body-file <file>`
- Apply or remove labels: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`
- Close: `gh issue close <number> --comment "..."`

Use appropriate `--label` and `--state` filters when listing. Resolve the repo from the `origin` remote, or pass `--repo codepassion-team/website`.

## Pull requests as a triage surface

**PRs as a request surface: no.** Set this to `yes` only if external PRs should enter the issue triage queue. GitHub shares numbers between issues and PRs; resolve an ambiguous `#<number>` before acting on it.

## Skill instructions

When a skill says “publish to the issue tracker,” create a GitHub issue. When it says “fetch the relevant ticket,” read the numbered issue and its comments.

## Wayfinding operations

If `/wayfinder` is used, keep one `wayfinder:map` issue with child tickets linked as GitHub sub-issues. If sub-issues are unavailable, use a task list in the map body and `Part of #<map>` in each child. Use `wayfinder:<type>` labels (`research`, `prototype`, `grilling`, `task`). Represent blockers with GitHub issue dependencies when available, or a `Blocked by: #<n>` line. An unassigned, open child with no open blockers is available to claim.
