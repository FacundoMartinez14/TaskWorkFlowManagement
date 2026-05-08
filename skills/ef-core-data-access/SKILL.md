---
name: ef-core-data-access
description: Project-specific guidance for Entity Framework Core data access in TaskWorkflowManagement. Use when adding or modifying DbContext, entities, migrations, relationships, database configuration, async queries, or persistence behavior for the task and workflow management API.
---

# EF Core Data Access

## Purpose

Add practical EF Core persistence that supports a professional portfolio backend without hiding simple behavior behind unnecessary abstractions.

This should demonstrate real-world data access skills recruiters expect: DbContext usage, migrations, relationships, async queries, and clean entity configuration.

## When to use this skill

Use this skill when working on:

- `DbContext`
- EF Core entities
- Migrations
- Database provider setup
- Entity relationships
- Query performance
- Data seeding
- SQL Server or PostgreSQL integration

## Rules

- Use EF Core directly through a project-specific `DbContext`.
- Keep entities simple and aligned with the domain.
- Use enums for constrained states such as task status.
- Use async EF Core APIs for database operations.
- Prefer `AsNoTracking()` for read-only queries.
- Configure relationships clearly when adding projects, boards, columns, tasks, or workflow states.
- Keep migrations committed and reviewable.
- Use DTO projection for API responses instead of returning entities directly.
- Use AutoMapper for simple Entity <-> DTO mappings when mapping is straightforward.
- Keep EF Core query decisions, business rules, and workflow logic outside AutoMapper profiles.
- Add indexes only when there is a clear query reason.
- Keep database setup simple enough to run locally.

## What to avoid

- Do not add a generic repository pattern by default; EF Core already acts as a unit of work and repository for this project size.
- Do not add Mapster or another mapping library; use AutoMapper for standard object mapping.
- Do not use AutoMapper profiles to compensate for unclear entity or DTO design.
- Do not add complex entity inheritance or advanced mappings early.
- Do not use lazy loading by default.
- Do not create migrations that include unrelated model changes.
- Do not optimize for scale before the MVP exists.
- Do not add database triggers, stored procedures, or event sourcing unless explicitly requested.

## Expected output quality

- Persistence code should be understandable to a reviewer in minutes.
- Migrations should map cleanly to the feature being added.
- Queries should avoid obvious N+1 issues.
- Data access should be testable enough without adding heavy infrastructure.
- The implementation should help explain EF Core knowledge in interviews.

## Small examples

Prefer:

```csharp
var tasks = await dbContext.Tasks
    .AsNoTracking()
    .OrderBy(task => task.CreatedAtUtc)
    .Select(task => new TaskItemDto(
        task.Id,
        task.Title,
        task.Description,
        task.Status,
        task.CreatedAtUtc))
    .ToListAsync();
```

Avoid:

```csharp
var tasks = await repository.GetAllAsync();
```

unless a repository has a clear project-specific reason to exist.
