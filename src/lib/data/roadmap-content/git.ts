import type { RoadmapDetailMap } from './types';

/**
 * TOPICS TO COVER IN THIS FILE (fill in every one as a key below):
  // - Branches
  // - Merge
  // - Rebase
  // - Cherry Pick
  // - Reset
  // - Revert
  // - Stash
  // - Tags
  // - Pull Requests
  // - Conflict Resolution
 */
export const GitContent: RoadmapDetailMap = {
	Branches: {
		definition:
			'A branch is simply a lightweight, movable pointer to a commit — it lets you diverge from the main line of development and work in isolation without affecting other branches.',
		useCase:
			'A developer creates a `feature/checkout-redesign` branch off `main` so they can experiment with a new checkout flow without breaking the working production code other teammates rely on.',
		detailedMarkdown: `
# Branches

A **branch** in Git is not a copy of your code — it's just a pointer (a 41-byte file containing a commit hash) that moves forward automatically each time you commit. \`main\` is a branch. \`HEAD\` is a pointer to whichever branch you currently have checked out. This is why Git branching is described as "cheap" — creating one is an O(1) operation, not a copy of the filesystem.

## Why This Mental Model Matters
Coming from other VCS tools (or a "folder full of code" mental model), people assume branching is expensive or that a branch is a separate universe of files. In Git, all commits live in one object database; branches are just labels pointing at nodes in the commit graph. Switching branches simply moves \`HEAD\` and rewrites your working directory to match that commit's snapshot.

## Core Commands
\`\`\`bash
# List all local branches (the * marks the current one)
git branch

# Create a new branch (does NOT switch to it)
git branch feature/checkout-redesign

# Create AND switch to a new branch in one step
git switch -c feature/checkout-redesign
# older/equivalent syntax:
git checkout -b feature/checkout-redesign

# Switch to an existing branch
git switch main
git checkout main

# Delete a branch that has been merged
git branch -d feature/checkout-redesign

# Force-delete a branch even if it has unmerged work
git branch -D feature/checkout-redesign

# Rename the current branch
git branch -m new-name

# Push a new local branch to the remote and set up tracking
git push -u origin feature/checkout-redesign
\`\`\`

> **Danger zone:** \`git branch -D\` permanently discards any commits on that branch that aren't reachable from another branch. If those commits weren't pushed anywhere, they're gone (recoverable only briefly via \`git reflog\`).

## Common Branching Strategies
- **Feature branching:** Every piece of work (feature, bugfix) gets its own branch off \`main\`, merged back via a pull request once reviewed. Simple, widely used, plays well with CI.
- **Trunk-based development:** Everyone commits small, frequent changes directly to \`main\` (or very short-lived branches merged within a day), relying heavily on feature flags to hide incomplete work. Favored by teams practicing continuous deployment.
- **Git Flow:** A heavier model with long-lived \`develop\` and \`main\` branches plus \`release/*\` and \`hotfix/*\` branches. Popular for versioned software with scheduled releases, less common for fast-moving web apps today.

## Interview Angle
A classic question is: "What actually *is* a branch in Git?" The strong answer is: **a movable, lightweight reference to a commit — not a copy of the code.** Follow up by explaining that this is what makes Git branches fast to create/switch/delete compared to, say, Subversion's branching model, which literally copies directory trees.
	`
	},

	Merge: {
		definition:
			'`git merge` integrates the changes from one branch into another, either by simply moving a pointer forward (fast-forward) or by creating a new "merge commit" that ties two histories together (3-way merge).',
		useCase:
			'Merging a completed `feature/login` branch back into `main` once the pull request has been approved, preserving the full commit history of how that feature was built.',
		detailedMarkdown: `
# Merge

\`git merge <branch>\` combines the history of \`<branch>\` into your current branch. Git picks one of two strategies depending on the shape of the commit graph.

## Fast-Forward Merge
If your current branch's tip is a direct ancestor of the branch you're merging in (i.e., nobody committed to \`main\` while the feature branch existed), Git doesn't need to create anything new — it just slides the \`main\` pointer forward to match the feature branch's tip.

\`\`\`bash
git switch main
git merge feature/login
# Updating a1b2c3d..f4e5d6c
# Fast-forward
#  login.js | 12 ++++++++++++
\`\`\`

No merge commit is created — the history looks completely linear, as if the work had been done directly on \`main\`.

## 3-Way (True) Merge
If both branches have diverged — \`main\` gained new commits *and* the feature branch gained new commits — Git can't just move a pointer. It looks at three points: the tip of your branch, the tip of the other branch, and their common ancestor, then creates a new **merge commit** with two parents.

\`\`\`bash
git switch main
git merge feature/login
# Merge made by the 'ort' strategy.
#  login.js | 12 ++++++++++++
#  1 file changed, 12 insertions(+)
\`\`\`

This preserves exactly what happened and when — you can see in \`git log --graph\` that the feature branch existed in parallel and was later joined back in. You can force this behavior even when a fast-forward is possible with \`git merge --no-ff\`, which some teams prefer because it keeps a clear record of "this was a feature branch" in the history.

## Merge vs. Rebase (Teaser)
Both merge and rebase integrate changes from one branch into another, but they produce very different history shapes:

| | Merge | Rebase |
|---|---|---|
| **History** | Preserves branching structure (non-linear) | Rewrites onto new base (linear) |
| **New commits created?** | One merge commit | Yes — every commit is replayed/rewritten with a new hash |
| **Safe on shared branches?** | Yes, always | Only on your own unpushed/private commits |
| **Traceability** | Shows exactly when branches diverged/joined | Looks like work happened sequentially, loses that context |

See the **Rebase** entry for the full comparison and the golden rule about never rewriting shared history.

## When to Reach for Merge
- Integrating a finished feature branch into \`main\` (this is what "Merge pull request" does on GitHub by default).
- When you want an honest, complete record of collaborative history — especially on shared/public branches where rewriting history would break other people's clones.
- Merge is always the *safe* default because it never rewrites existing commits, it only adds a new one.
	`
	},

	Rebase: {
		definition:
			'`git rebase` replays your commits one by one on top of a different base commit, producing a cleaner, linear history instead of a branching merge commit.',
		useCase:
			'Before opening a pull request, running `git rebase main` on a feature branch to bring in the latest changes from `main` and present a clean, linear set of commits for review.',
		detailedMarkdown: `
# Rebase

\`git rebase\` takes the commits unique to your current branch, temporarily sets them aside, moves your branch pointer to a new base commit, and then re-applies ("replays") each commit on top — one at a time. The result *looks* as if you had branched off from the new base in the first place, but under the hood **every replayed commit gets a brand-new hash**, because its parent changed.

\`\`\`bash
# You're on feature/login, main has moved ahead since you branched
git switch feature/login
git rebase main
# First, rewinding head to replay your work on top of it...
# Applying: Add login form
# Applying: Add password validation
\`\`\`

If a commit being replayed conflicts with the new base, the rebase pauses so you can resolve it (see **Conflict Resolution**), then you continue:

\`\`\`bash
# ...fix the conflicting file(s)...
git add login.js
git rebase --continue

# Or bail out entirely and go back to how things were before the rebase
git rebase --abort
\`\`\`

## Interactive Rebase: Cleaning Up History
\`git rebase -i\` opens an editor listing your recent commits, letting you **reorder, squash, edit, or drop** them before they ever become part of shared history — great for turning "wip", "fix typo", "actually fix typo" into one clean commit.

\`\`\`bash
git rebase -i HEAD~3
\`\`\`
\`\`\`text
pick a1b2c3d Add login form
squash f4e5d6c fix typo
squash 9c8b7a6 actually fix typo
\`\`\`
Saving this squashes the last two commits into the first, prompting you to write a single combined commit message.

## The Golden Rule of Rebasing
> **Never rebase a branch that other people have already pulled from / based work on.** Rebasing rewrites commit hashes. If you rebase a branch that's already been pushed and someone else has it checked out or has branched off it, their history and yours will diverge irreconcilably, forcing painful manual reconciliation (or a destructive \`git push --force\`).
>
> Rule of thumb: rebase **freely on your own local, unpushed, private branches**. Once a branch is shared/public (pushed and used by others), switch to merging instead.

## Rebase vs. Merge

| | Rebase | Merge |
|---|---|---|
| **Resulting history** | Linear, no merge commits | Preserves actual branch/merge structure |
| **Commit hashes** | Rewritten for every replayed commit | Unchanged — original commits untouched |
| **Safe on shared branches** | No — golden rule violation | Yes, always safe |
| **Best used for** | Cleaning up your own local branch before sharing | Integrating finished, already-shared work |
| **Conflict resolution** | Potentially once per replayed commit | Once, for the whole merge |

## Interview Angle
"When would you rebase instead of merge?" — the strong answer: to keep your *own* feature branch up to date with \`main\` before opening a PR, or to clean up messy WIP commits with interactive rebase, but never on a branch others are already working from.
	`
	},

	'Cherry Pick': {
		definition:
			'`git cherry-pick <commit-hash>` applies the changes introduced by one specific commit from any branch onto your current branch, creating a new commit with the same changes.',
		useCase:
			'A critical security fix is committed on `main`, but it also needs to ship immediately on the `release/2.4` branch without pulling in every other unrelated commit from `main`.',
		detailedMarkdown: `
# Cherry Pick

\`git cherry-pick\` lets you grab a single, specific commit from anywhere in the repository's history and apply just that commit's changes onto your current branch — without merging or rebasing the entire branch it came from.

\`\`\`bash
# Find the hash of the fix on main
git log main --oneline
# f4e5d6c Fix null-pointer crash in checkout
# a1b2c3d Add new pricing tier

# Switch to the branch that also needs the fix
git switch release/2.4

# Apply just that one commit here
git cherry-pick f4e5d6c
# [release/2.4 9c8b7a6] Fix null-pointer crash in checkout
#  1 file changed, 3 insertions(+), 1 deletion(-)
\`\`\`

Notice the new commit gets a **different hash** (\`9c8b7a6\`) than the original (\`f4e5d6c\`) — it's a new commit with the same diff and message, applied on top of a different parent.

## Handling Multiple Commits
\`\`\`bash
# Cherry-pick a range of commits (exclusive of the first, inclusive of the last)
git cherry-pick a1b2c3d..f4e5d6c

# Cherry-pick without immediately committing, so you can inspect/amend first
git cherry-pick -n f4e5d6c
\`\`\`

## Handling Conflicts
Just like a merge or rebase, a cherry-pick can conflict if the target branch has diverged too much from where the original commit was made:

\`\`\`bash
git cherry-pick f4e5d6c
# error: could not apply f4e5d6c... Fix null-pointer crash in checkout
# hint: after resolving the conflicts, mark the corrected paths
# hint: with 'git add <paths>' and commit the result with
# hint: 'git cherry-pick --continue'

# ...resolve conflict markers in the file...
git add checkout.js
git cherry-pick --continue

# Or give up on this cherry-pick
git cherry-pick --abort
\`\`\`

## The Classic Use Case: Hotfix Backporting
The textbook scenario: a bug is fixed on \`main\`, but a supported \`release/2.4\` branch also has the bug and can't simply be merged/rebased with all of \`main\`'s newer, unreleased work. Cherry-picking lets you surgically apply *just* the fix commit to the release branch (and often to several other release branches) without dragging in unrelated changes.

## When to Use It vs. the Alternatives
- **Cherry-pick** when you need *one specific commit's changes* on another branch, and merging the whole branch would bring in unwanted work.
- **Merge** when you want *all* of a branch's history integrated.
- **Rebase** when you want to replay an *entire sequence* of your own commits onto a new base.

> **Danger zone:** Cherry-picking creates duplicate content in history (same change, different commit hash). If that commit is later merged normally too, Git is usually smart enough to detect the change is already present, but it can occasionally cause confusing "phantom" conflicts. Use cherry-pick sparingly and intentionally, not as a substitute for proper merging.
	`
	},

	Reset: {
		definition:
			'`git reset` moves the current branch pointer (HEAD) to a different commit, and — depending on the mode — also rewinds the staging area and/or your working directory to match.',
		useCase:
			'Un-staging a file you accidentally added with `git add` before committing, using `git reset HEAD <file>`, without losing any of your actual edits.',
		detailedMarkdown: `
# Reset

\`git reset\` moves \`HEAD\` (and the branch it points to) to a specified commit. What makes it powerful — and dangerous — is that it has three modes controlling how much else it touches: the staging area (the "index") and the working directory.

\`\`\`bash
git reset [--soft | --mixed | --hard] <commit>
\`\`\`

## The Three Modes

| Mode | Moves HEAD/branch | Staging area | Working directory | Typical use |
|---|---|---|---|---|
| \`--soft\` | Yes | Untouched (changes stay staged) | Untouched | Redo a commit message, or squash commits by hand while keeping everything staged |
| \`--mixed\` (default) | Yes | Reset to match target commit (changes become unstaged) | Untouched | Un-stage everything, keep your edits as working changes |
| \`--hard\` | Yes | Reset to match target commit | **Reset to match target commit** | Completely discard commits *and* uncommitted work |

\`\`\`bash
# Undo the last commit, but keep the changes staged, ready to re-commit
git reset --soft HEAD~1

# Undo the last commit AND un-stage it, but keep the edits in your files
git reset HEAD~1
# (equivalent to git reset --mixed HEAD~1)

# Un-stage a single file without discarding its edits
git reset HEAD path/to/file.js

# Nuke the last two commits and all uncommitted changes, back to a clean state
git reset --hard HEAD~2
\`\`\`

> **Danger zone:** \`git reset --hard\` overwrites your working directory to match the target commit, **permanently discarding any uncommitted changes and any commits no longer reachable from a branch.** There is no confirmation prompt. Before running it, double-check \`git status\` and consider \`git stash\` if there's anything you might want to keep. Recovery is only possible (and only briefly) via \`git reflog\`.

## Reset vs. Revert
This is one of the most commonly confused pairs in Git, and a favorite interview question:

| | Reset | Revert |
|---|---|---|
| **How it works** | Moves the branch pointer backward, optionally discarding history | Creates a **new** commit that applies the inverse diff |
| **History** | Rewrites/removes commits (destructive) | Fully preserved — nothing is deleted |
| **Safe on shared/pushed branches?** | No — rewrites history other people may have | Yes — it's just a normal new commit |
| **Typical use** | Cleaning up **local, unpushed** commits | Undoing a commit that's already **public/shared** |

Rule of thumb: **reset for your own local mess, revert for anything already pushed and shared.**

## Interview Angle
Be ready to explain, precisely, what happens to (1) HEAD, (2) the index, and (3) the working directory for each of \`--soft\`, \`--mixed\`, and \`--hard\` — this exact three-way breakdown is what interviewers are listening for.
	`
	},

	Revert: {
		definition:
			"`git revert <commit>` creates a brand-new commit that applies the exact inverse of a previous commit's changes, undoing its effect without deleting or rewriting any history.",
		useCase:
			'A bad commit was merged into `main` and deployed to production hours ago — instead of rewriting shared history, the team runs `git revert` to safely undo it with a new commit everyone can pull.',
		detailedMarkdown: `
# Revert

\`git revert\` undoes the changes introduced by a specific commit by generating a **new commit** whose diff is the exact opposite. The original commit stays in history untouched — you simply add a new one on top that cancels it out.

\`\`\`bash
git log --oneline
# f4e5d6c Add experimental pricing logic (this broke checkout)
# a1b2c3d Add new pricing tier

git revert f4e5d6c
# [main 9c8b7a6] Revert "Add experimental pricing logic (this broke checkout)"
#  1 file changed, 1 insertion(+), 5 deletions(-)
\`\`\`

Git opens an editor pre-filled with a message like \`Revert "Add experimental pricing logic..."\`, referencing the original commit hash for traceability. Both the original *and* the revert commit remain visible forever in \`git log\`.

## Reverting Without Auto-Committing
\`\`\`bash
# Stage the inverse changes but let you review/commit manually
git revert -n f4e5d6c
\`\`\`

## Reverting a Range or a Merge Commit
\`\`\`bash
# Revert several commits, oldest first
git revert a1b2c3d..f4e5d6c

# Reverting a merge commit requires telling Git which parent is the "mainline"
git revert -m 1 <merge-commit-hash>
\`\`\`

## Why Revert Is Safe for Shared History
Because revert only **adds** a new commit rather than deleting or rewriting existing ones, it never breaks other people's clones of the repository. Anyone can \`git pull\` and get the revert commit cleanly, exactly like any other new commit — no force-pushes, no diverged history, no coordination required. This is precisely why it's the standard tool for undoing something that's already been merged and deployed.

## Revert vs. Reset — the Direct Contrast
| | Revert | Reset |
|---|---|---|
| **Mechanism** | Adds a new commit that cancels out an old one | Moves the branch pointer, optionally erasing commits |
| **History** | Preserved completely — the "mistake" stays visible | Can be rewritten/lost |
| **Safe on a pushed/shared branch?** | **Yes** — this is exactly what it's for | **No** — will diverge from what others have pulled |
| **Undo of an undo** | You can revert a revert to "re-apply" the original change | Not directly comparable — reset just moves you around |

## Interview Angle
"You just merged a bug into \`main\` that's already been deployed and other engineers have pulled it — how do you undo it?" The correct answer is **revert, not reset**, precisely because reset would rewrite history that others already have, while revert adds a clean, shareable commit that undoes the damage.
	`
	},

	Stash: {
		definition:
			'`git stash` temporarily shelves your uncommitted changes (both staged and unstaged) onto a stack, giving you a clean working directory that you can restore later.',
		useCase:
			'You are mid-way through a feature when an urgent bug report comes in — you stash your half-finished work, switch to `main` to fix the bug, then pop your stash to resume exactly where you left off.',
		detailedMarkdown: `
# Stash

\`git stash\` takes your uncommitted changes — modified tracked files, and optionally staged changes — and stores them away on a stack, resetting your working directory to match \`HEAD\`. It's the tool for "I need a clean working directory *right now* but I'm not ready to commit."

## Core Workflow
\`\`\`bash
# Save your uncommitted work and clean the working directory
git stash
# Saved working directory and index state WIP on feature/login: a1b2c3d Add form

# ...switch branches, fix the urgent bug, commit, switch back...
git switch main
git commit -am "Hotfix: null check in payment gateway"
git switch feature/login

# Bring your stashed changes back
git stash pop
# On branch feature/login
# Changes not staged for commit:
#   modified:   login.js
# Dropped refs/stash@{0}
\`\`\`

\`git stash pop\` re-applies the most recent stash **and removes it from the stack**. If you'd rather keep it on the stack (in case you need to apply it elsewhere too), use \`git stash apply\` instead — it re-applies without deleting.

## Managing Multiple Stashes
Stashes are a stack — you can accumulate several at once.

\`\`\`bash
git stash list
# stash@{0}: WIP on feature/login: a1b2c3d Add form
# stash@{1}: WIP on main: 9c8b7a6 Refactor api client

# Apply a specific (not just the most recent) stash
git stash apply stash@{1}

# Give a stash a memorable name instead of relying on order
git stash push -m "half-done validation logic"

# Inspect what's in a stash without applying it
git stash show -p stash@{0}

# Delete a stash you no longer need
git stash drop stash@{1}

# Delete everything on the stash stack
git stash clear
\`\`\`

## Including Untracked / Ignored Files
By default, \`git stash\` only stashes changes to files Git already tracks. Brand-new untracked files are left alone.

\`\`\`bash
# Also stash new, untracked files
git stash -u
# (or --include-untracked)

# Also sweep in .gitignore'd files (rarely needed)
git stash -a
\`\`\`

## When to Use Stash vs. a Quick Commit
- Use **stash** for short-lived, "I'll be right back" interruptions where committing half-finished work would pollute history with a WIP commit you'd need to clean up later.
- Prefer a real (even messy) **commit** if the interruption might be long, if you might switch machines, or if you want the safety of the work being fully recorded — stashes are easy to forget about and can be accidentally dropped or cleared.

> **Danger zone:** \`git stash drop\` and \`git stash clear\` permanently delete stashed changes. A popped/dropped stash can sometimes be recovered via \`git fsck --unreachable\`, but don't count on it — treat stash as short-term storage, not backup.
	`
	},

	Tags: {
		definition:
			'A tag is a permanent, named pointer to a specific commit — typically used to mark release points (e.g. `v1.0.0`) — that, unlike a branch, does not move as new commits are added.',
		useCase:
			'Marking the exact commit that was deployed as version `v2.3.0` in production, so the team can always check out or diff against that exact release later.',
		detailedMarkdown: `
# Tags

A **tag** names a specific commit permanently. The key difference from a branch: a branch pointer *moves forward* automatically with every new commit, while a tag stays pinned to the exact commit it was created on forever (unless you explicitly delete/re-create it). Tags are the standard way to mark release versions.

## Lightweight vs. Annotated Tags
Git supports two kinds of tags:

\`\`\`bash
# Lightweight tag — just a name pointing at a commit, nothing more
git tag v1.0.0-lite

# Annotated tag — a full Git object with its own message, author, and date
git tag -a v1.0.0 -m "Release 1.0.0: initial public launch"
\`\`\`

| | Lightweight | Annotated |
|---|---|---|
| **Stored as** | Just a ref pointing to a commit | Full object in the Git database (tagger, date, message) |
| **Has its own message?** | No | Yes |
| **Can be GPG-signed?** | No | Yes (\`git tag -s\`) |
| **Recommended for** | Quick, personal, throwaway markers | Real releases — this is what most teams should use |

## Tagging a Past Commit
You don't have to tag \`HEAD\` — you can tag any commit by hash:

\`\`\`bash
git log --oneline
# f4e5d6c Bump version to 2.3.0
# a1b2c3d Fix flaky test

git tag -a v2.3.0 -m "Release 2.3.0" f4e5d6c
\`\`\`

## Viewing and Pushing Tags
Tags are **not** pushed to a remote by default — you have to push them explicitly.

\`\`\`bash
# List all tags
git tag
git tag -l "v1.*"   # filter by pattern

# See details of an annotated tag
git show v2.3.0

# Push a single tag
git push origin v2.3.0

# Push ALL tags at once
git push origin --tags
\`\`\`

## Checking Out and Deleting Tags
\`\`\`bash
# Look at the code exactly as it was at that release (detached HEAD state)
git checkout v2.3.0

# Delete a tag locally
git tag -d v2.3.0

# Delete a tag on the remote too
git push origin --delete v2.3.0
\`\`\`

> **Danger zone:** Checking out a tag puts you in a **detached HEAD** state — you're not on any branch. Commits made here can be easily lost since no branch points to them. If you need to make changes starting from a tag, create a branch from it first: \`git checkout -b hotfix/2.3.1 v2.3.0\`.

## Interview Angle
"How would you find and redeploy exactly what was in production for version 2.3.0?" — the answer is tags: an immutable, named pointer to that exact commit, unlike a branch which would have since moved on.
	`
	},

	'Pull Requests': {
		definition:
			'A Pull Request (PR) — or Merge Request on GitLab — is a hosting-platform feature (not a native Git command) that proposes merging changes from one branch into another and provides a structured space for code review and discussion before that happens.',
		useCase:
			'A developer pushes a `feature/checkout-redesign` branch and opens a Pull Request against `main` so teammates can review the diff, leave comments, and require CI checks to pass before the code is merged.',
		detailedMarkdown: `
# Pull Requests

It's worth stating clearly: **there is no \`git pull-request\` command.** Pull Requests (PRs on GitHub/Bitbucket, Merge Requests/MRs on GitLab) are a feature built by the *hosting platform* on top of plain Git branches, adding a collaborative review layer that Git itself doesn't provide.

## The Typical Flow
\`\`\`bash
# 1. Create a branch for your change
git switch -c feature/checkout-redesign

# 2. Commit your work
git add .
git commit -m "Redesign checkout flow with saved addresses"

# 3. Push the branch to the remote
git push -u origin feature/checkout-redesign
\`\`\`
4. **Open the PR** on GitHub/GitLab, targeting \`main\` (or wherever it should land), describing what changed and why.
5. **CI runs automatically** — tests, linting, build checks — and reports pass/fail directly on the PR.
6. **Reviewers comment**, request changes, or approve; you push more commits to the same branch to address feedback (the PR updates automatically since it just tracks the branch).
7. Once approved and checks pass, the PR is **merged**.

## The Three Merge Options on GitHub
When merging a PR, most platforms let you choose *how* the branch's commits land on the target branch:

| Option | What happens | Resulting history |
|---|---|---|
| **Merge commit** | Standard 3-way merge; all original commits kept, plus one new merge commit | Full detail preserved, but can get noisy with lots of small WIP commits |
| **Squash and merge** | All commits on the branch are combined into a single new commit on the target branch | Very clean \`main\` history — one commit per feature |
| **Rebase and merge** | Each commit on the branch is individually replayed onto the tip of the target branch, no merge commit | Linear history, but retains each individual commit |

Many teams default to **squash merge** for feature branches — it keeps \`main\`'s history readable (one entry per PR) regardless of how messy the branch's internal commit history was.

## Why PRs Matter Beyond "Just Merging"
- **Code review gate**: nothing lands on \`main\` without at least one human (and usually CI) looking at it.
- **Discussion trail**: comments on specific lines create a permanent record of *why* a decision was made.
- **Required checks**: branch protection rules can block merging until tests pass, a reviewer approves, and the branch is up to date with \`main\`.
- **Draft PRs**: many platforms let you open a PR early (marked "Draft") to get early feedback or kick off CI before the work is finished.

## Keeping a PR Branch Up to Date
\`\`\`bash
# Option A: merge main into your branch (safe, adds a merge commit)
git switch feature/checkout-redesign
git merge main

# Option B: rebase your branch onto main (cleaner, but only safe if you
# haven't shared this branch with anyone else / no one else has pulled it)
git rebase main
git push --force-with-lease
\`\`\`
\`--force-with-lease\` is the safer alternative to \`--force\` — it refuses to overwrite the remote branch if someone else has pushed to it since you last fetched, preventing you from silently clobbering a teammate's work.

## Interview Angle
Be ready to explain that a PR is a **platform-level workflow concept**, not a Git primitive — Git only knows about branches, commits, and refs. This distinction ("Git vs. GitHub/GitLab") comes up often when candidates conflate the two.
	`
	},

	'Conflict Resolution': {
		definition:
			'A merge conflict occurs when Git cannot automatically reconcile changes because the same lines (or the same file, in different ways) were modified differently on both sides being combined, requiring a human to decide the correct final result.',
		useCase:
			'Two developers both edit the same function in `pricing.js` on different branches; when one branch is merged into the other, Git flags the overlapping lines as a conflict for manual resolution instead of guessing which version is correct.',
		detailedMarkdown: `
# Conflict Resolution

Git is very good at automatically merging changes when they touch **different** parts of a file, or even different lines nearby each other. A **conflict** arises specifically when the *same lines* were changed differently on both sides (or one side deleted a file the other side edited) — Git has no way to know which version is "correct," so it stops and asks you.

## What Triggers a Conflict
- Both branches modified the exact same line(s) of the same file differently.
- One branch deleted a file while the other modified it.
- Both branches renamed the same file to different new names.

This can happen during \`git merge\`, \`git rebase\`, \`git cherry-pick\`, or \`git stash pop\` — anything that combines two sets of changes.

## Anatomy of a Conflict Marker
When a conflict happens, Git doesn't fail silently — it writes **both versions directly into the file**, wrapped in conflict markers, and pauses:

\`\`\`bash
git merge feature/pricing-update
# Auto-merging pricing.js
# CONFLICT (content): Merge conflict in pricing.js
# Automatic merge failed; fix conflicts and then commit the result.
\`\`\`

Opening \`pricing.js\` reveals something like:

\`\`\`text
function calculateDiscount(price) {
<<<<<<< HEAD
    return price * 0.9; // 10% off, current branch's version
=======
    return price * 0.85; // 15% off, incoming branch's version
>>>>>>> feature/pricing-update
}
\`\`\`

- \`<<<<<<< HEAD\` marks the start of **your current branch's** version.
- \`=======\` separates the two conflicting versions.
- \`>>>>>>> feature/pricing-update\` marks the end of the **incoming branch's** version, labeled by name.

## Resolving It, Step by Step
1. **Open the file** and decide the correct final content — keep one side, keep the other, blend both, or write something new entirely.
2. **Delete the conflict markers themselves** (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`) — leaving them in is a very common beginner mistake that silently breaks the code.
3. **Stage the resolved file**, telling Git you've handled it:
\`\`\`bash
git add pricing.js
\`\`\`
4. **Finish the operation** you were in the middle of:
\`\`\`bash
# If you were merging:
git commit
# (Git pre-fills a "Merge branch..." message for you)

# If you were rebasing:
git rebase --continue

# If you were cherry-picking:
git cherry-pick --continue
\`\`\`

## Useful Tools While Resolving
\`\`\`bash
# See which files still have unresolved conflicts
git status

# List files with conflicts directly
git diff --name-only --diff-filter=U

# Launch a visual merge tool (VS Code, Meld, KDiff3, etc. — configurable)
git mergetool

# Abandon the whole operation and go back to before it started
git merge --abort
git rebase --abort
\`\`\`

## Reducing How Often You Hit Conflicts
- Pull/rebase from \`main\` **frequently** on long-lived branches — the longer two branches diverge, the more likely they'll touch the same lines.
- Keep feature branches **small and short-lived**.
- Communicate with teammates when working in the same file/area of code.

> **Danger zone:** Committing a "resolved" file that still contains leftover \`<<<<<<<\`/\`=======\`/\`>>>>>>>\` markers is a real and common mistake — it compiles as broken code (or breaks silently in dynamically typed languages) and ships straight into history. Always re-read the whole conflicted section, and run tests before committing a resolution.

## Interview Angle
Be ready to actually *walk through* resolving a conflict on a whiteboard — name the three markers correctly, explain which side is "ours" (\`HEAD\`) vs. "theirs" (the incoming branch), and describe the \`add\` → \`commit\`/\`--continue\` finishing step for merge vs. rebase.
	`
	}
};
