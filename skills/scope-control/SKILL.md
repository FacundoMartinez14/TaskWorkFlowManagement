---
name: scope-control
description: Project-specific scope control guidance for TaskWorkflowManagement. Use when evaluating new features, architecture proposals, dependencies, deployment ideas, or requests that may overcomplicate the portfolio project.
---

# Scope Control

## Purpose

Keep the Task & Workflow Management System achievable, professional, and focused on recruiter-visible value.

The project should be finished and demonstrable, not expanded into an unfinished enterprise architecture sample.

## When to use this skill

Use this skill when deciding whether to add:

- New architecture layers
- New libraries
- New infrastructure
- Advanced patterns
- Large features
- Authentication or authorization
- Docker or deployment complexity
- State management

## Rules

- Build the MVP first.
- Prefer small, useful features over large architecture changes.
- Ask whether the change improves employability or interview value.
- Choose simple professional structure by default.
- Add complexity only when there is a clear current problem.
- Keep backend, frontend, and data access understandable.
- Use AutoMapper as the single standard mapping library for simple Entity <-> DTO mappings.
- Keep mapping profiles boring; do not move business logic into mapping configuration.
- Prioritize features users can see and recruiters can evaluate.
- Explain tradeoffs when declining unnecessary complexity.

## What to avoid

- Do not add microservices.
- Do not add event sourcing.
- Do not add CQRS unless explicitly requested later and justified.
- Do not add Kubernetes.
- Do not add Clean Architecture too early.
- Do not add MediatR by default.
- Do not introduce Mapster or competing mapping libraries.
- Do not use AutoMapper as a reason to create unnecessary layers or profiles.
- Do not add Docker before it helps local setup or deployment.
- Do not add state management libraries before Angular state is actually painful.
- Do not spend time on hidden complexity recruiters will not see.

## Expected output quality

- Work should move the project closer to a finished portfolio.
- Decisions should be practical and defensible in interviews.
- The codebase should stay easy for one developer to maintain.
- Each feature should have a clear reason to exist.

## Small examples

If asked to add CQRS early, respond with a practical alternative:

```text
For this portfolio stage, CQRS does not add enough value. A simple controller plus EF Core query/command methods will demonstrate backend skill more clearly and keep the project finishable.
```

If asked to add Docker:

```text
Docker can help later for database setup or deployment. For now, add it only when EF Core persistence exists and local setup benefits from a repeatable database container.
```
