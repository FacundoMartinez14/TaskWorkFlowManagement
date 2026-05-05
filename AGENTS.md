# AGENTS.md

## Project overview

TaskWorkFlowManagement is a full stack portfolio project.

The goal is to build a modern task and workflow management application to demonstrate full stack development skills for job search purposes.

Backend:

- .NET Web API
- C#

Frontend:

- Angular
- TypeScript

Version control:

- Git
- GitHub

## Current project stage

The project is in its initial setup phase.

Keep the architecture simple and avoid adding unnecessary complexity too early.

## General rules

- Do not make large architectural changes without explaining them first.
- Prefer small, focused, reviewable changes.
- Do not modify unrelated files.
- Do not delete files unless explicitly requested.
- Do not rename projects, folders, namespaces, or solution files without asking first.
- Before changing code, inspect the relevant files.
- If the task is ambiguous, propose a short plan before editing.
- Explain the reason for meaningful changes.

## Backend rules

- Follow standard .NET Web API conventions.
- Keep controllers simple.
- Do not introduce service layers, repositories, database access, authentication, authorization, Docker, or external dependencies unless explicitly requested.
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
- Do not add UI libraries, state management libraries, or complex architecture unless explicitly requested.

Before considering frontend work complete, run:

```bash
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
