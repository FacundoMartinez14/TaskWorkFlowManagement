# AGENTS.md

## Project overview

TaskWorkFlowManagement is a full stack portfolio project.

The goal is to maintain and polish a modern task and workflow management application that demonstrates practical full stack development skills.

Backend:

- .NET Web API
- C#

Frontend:

- Angular
- TypeScript
- Angular Material
- Angular CDK Drag & Drop

Version control:

- Git
- GitHub

## Current project stage

The project is a functional full-stack MVP.

Completed baseline capabilities include:

- ASP.NET Core Web API
- PostgreSQL persistence with EF Core
- TaskItem CRUD
- Soft delete
- Angular frontend
- Kanban-style task board
- Drag and drop between workflow columns
- Keyword filtering
- README updates
- Backend and frontend build validation

Future work should prioritize polish, documentation accuracy, screenshots or demo readiness, deployment decisions, and only high-value improvements. Keep the architecture simple and avoid adding complexity unless it solves a clear current problem.

## Skills workflow

- Use the relevant project skills in `skills/` before making changes.
- Use `scope-control` when evaluating new features, dependencies, architecture, or deployment ideas.
- Use `portfolio-employability` for recruiter-facing polish, README accuracy, screenshots, demo notes, and prioritization.
- Use `git-discipline` for branch, commit, pull request, and changed-file review decisions.
- Use `backend-api`, `rest-api-design`, and `ef-core-data-access` for backend/API/data changes.
- Use `angular-frontend` for Angular, TypeScript, service, component, form, and UI behavior changes.
- If a task spans multiple areas, keep the implementation as a small vertical slice and explain the tradeoffs.

## General rules

- Do not make large architectural changes without explaining them first.
- Prefer small, focused, reviewable changes.
- Do not modify unrelated files.
- Do not delete files unless explicitly requested.
- Do not rename projects, folders, namespaces, or solution files without asking first.
- Before changing code, inspect the relevant files.
- If the task is ambiguous, propose a short plan before editing.
- Explain the reason for meaningful changes.
- Keep guidance and documentation accurate to the current implementation; do not describe planned work as completed.
- Do not turn agent guidance into portfolio marketing copy.

## Backend rules

- Follow standard .NET Web API conventions.
- Keep controllers simple.
- Use the existing PostgreSQL/EF Core persistence approach.
- Do not introduce new service layers, repositories, authentication, authorization, Docker, or external dependencies unless explicitly requested or clearly justified.
- Use DTOs when creating API contracts.
- Do not expose internal domain models directly once the domain grows.
- Prefer clear and boring code over clever abstractions.

Before considering backend work complete, run:

```bash
dotnet build
```

## Frontend rules

- Follow Angular conventions.
- Keep components focused and readable.
- Use strongly typed TypeScript.
- Use the existing Angular Material and Angular CDK patterns where they already fit.
- Do not add new UI libraries, state management libraries, or complex architecture unless explicitly requested or clearly justified.
- Preserve simple loading and error states for API-backed UI flows.

Before considering frontend work complete, run:

```bash
cd TaskWorkflowManagement.Web
npm install
npm run build
```

## Git rules
- Do not work directly on main.
- Use feature branches.
- Keep commits focused.
- Use clear commit messages.
- Prefer pull requests for all changes, even when working alone.

Recommended branch naming:
feature/<short-description>
fix/<short-description>
chore/<short-description>
docs/<short-description>

Recommended commit examples:
chore: add initial project documentation
feat: add health check endpoint
docs: update backend setup instructions
fix: ignore generated build files

## Review checklist

After making changes, summarize:

Files changed
Reason for each change
Commands executed
How to test the result
Any assumptions made
