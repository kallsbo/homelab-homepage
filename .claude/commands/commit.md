---
description: Create a focused git commit and push for the current changes.
---

1. Run `git status` and `git diff` to understand what has changed
2. Run `git log --oneline -5` to match the existing commit message style
3. Stage only the files relevant to a single concern — if changes span unrelated files, ask the user which files to include in this commit before proceeding
4. Write a concise commit message following the repo's conventional commits style (fix/feat/refactor/docs prefix, short summary, no period)
5. Commit and push to remote

Never mix unrelated file changes in one commit. If in doubt, ask.
