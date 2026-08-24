---
tags: [git, cli, snippet]
---

# Git

## Everyday

```bash
git commit --amend                    # fix the last commit (message or staged changes)
git rebase -i HEAD~5                  # squash / reorder / fixup
git switch -c feature/x               # move uncommitted work to a new branch
git log -S "needle" --oneline         # which commit introduced/removed a string
git bisect start && git bisect bad && git bisect good <sha>
git revert <sha>                      # undo a pushed commit with an inverse commit
git restore <path>                    # discard local changes to a file
git fetch --prune                     # drop stale remote-tracking branches
```

## Tag a Package Release

```bash
npm version <version> --no-git-tag-version
git config --global push.followTags true
git add package.json package-lock.json
git commit -m "chore(<package>): v<version>"
git tag v<version>
git push origin <branch> v<version>
```

## Repository Stats

```bash
# Commits per author since a date
git shortlog -sn --no-merges --since "01 January 2025"

# Churn for one author
git log --shortstat --no-merges --author="Rick Waterman" \
  | grep -E "fil(e|es) changed" \
  | awk '{files+=$1; inserted+=$4; deleted+=$6}
         END {printf "files %s, +%s -%s, delta %s, del/add 1:%.2f\n",
              files, inserted, deleted, inserted-deleted, (inserted ? deleted/inserted : 0)}'
```

Churn is a codebase-health signal (hotspots, refactor pressure), not a productivity metric. [Gource](https://github.com/acaudwell/Gource) visualizes history; [GitClear](https://www.gitclear.com/) does diff-aware stats.
