---
name: git-discipline
description: Project-specific Git and GitHub discipline guidance for TaskWorkflowManagement. Use when creating branches, preparing commits, reviewing changed files, writing commit messages, or keeping the portfolio repository clean.
---

# Git Discipline

## Purpose

Keep the repository professional and easy to review. The Git history does not need to be perfect, but it should show disciplined development habits appropriate for a portfolio project.

Recruiters and interviewers may inspect commit history, branch names, and whether generated files are committed.

## When to use this skill

Use this skill when working on:

- Branch decisions
- Commit preparation
- Commit messages
- Pull request readiness
- Reviewing changed files
- Avoiding generated files in Git
- Keeping changes focused

## Rules

- Do not work directly on `main`.
- Use feature branches such as `feature/task-crud`, `fix/task-validation`, or `docs/readme-update`.
- Keep commits focused on one logical change.
- Use clear commit messages.
- Check `git status` before and after changes.
- Review diffs before summarizing work.
- Do not revert user changes unless explicitly requested.
- Keep generated files out of commits.
- Prefer pull requests for visible project progress, even when working alone.

## What to avoid

- Do not commit `bin/`, `obj/`, `.vs/`, `node_modules/`, or build output.
- Do not mix unrelated backend, frontend, and documentation changes in one commit unless the task truly spans them.
- Do not rewrite history unless explicitly requested.
- Do not use vague commit messages like `update`, `fix stuff`, or `changes`.
- Do not commit secrets, local connection strings, or machine-specific files.

## Expected output quality

- Changes should be easy to review.
- Commit messages should communicate intent.
- The repository should look intentional and professional.
- A reviewer should understand what changed without guessing.

## Small examples

Good commit messages:

```text
feat: add task status enum
feat: add task creation endpoint
docs: add project skills guidance
fix: validate task title length
```

Good branch names:

```text
feature/task-crud
feature/angular-task-list
fix/task-status-validation
docs/portfolio-readme
```
