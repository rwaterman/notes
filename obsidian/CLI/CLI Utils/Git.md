---
tags: [git, cli, snippet]
---

# Git

## Releases

```bash
npm version <package-version> --no-git-tag-version
git config --global push.followTags true
git add -A
git commit -m "chore (<org_name>/<package_name>): v<package-version> (tag: <package_name>_<package-version>)"
git tag <package-version>
git push origin <branch_name> <package-version>
```

## Repository Stats & Audit

Commits per developer over a period:

```bash
git shortlog -sn --no-merges --since "01 January 2025"
```

Lines-of-code churn for one author:

```bash
git log --shortstat --no-merges --author="Rick Waterman" \
  | grep -E "fil(e|es) changed" \
  | awk '{files+=$1; inserted+=$4; deleted+=$6; delta+=$4-$6; ratio=deleted/inserted}
         END {printf "Commit stats:\n- Files changed (total).. %s\n- Lines added (total).... %s\n- Lines deleted (total).. %s\n- Total lines (delta).... %s\n- Add./Del. ratio (1:n).. 1 : %s\n", files, inserted, deleted, delta, ratio }' -
```

> [!warning] LOC is a terrible productivity metric
> Use churn for *codebase health* (refactor pressure, hotspots), not to rank people. See GitClear's "four worst software metrics."

**Tools:** [Gource](https://github.com/acaudwell/Gource) (repo history visualization) · [GitClear](https://www.gitclear.com/) (diff-aware stats, paid).

## Everyday Snippets

```bash
# Amend the last commit (message or staged changes)
git commit --amend

# Interactive history surgery (squash/reorder/fixup)
git rebase -i HEAD~5

# Move uncommitted work to a new branch
git switch -c feature/x

# Find which commit introduced a line
git log -S "needle" --oneline

# Bisect to a regression
git bisect start && git bisect bad && git bisect good <sha>

# Undo a pushed commit safely (new inverse commit)
git revert <sha>

# Discard local changes to a file
git restore <path>

# Prune stale remote-tracking branches
git fetch --prune
```
