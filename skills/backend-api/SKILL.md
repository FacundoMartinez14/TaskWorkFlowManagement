---
name: backend-api
description: Project-specific guidance for ASP.NET Core Web API work in TaskWorkflowManagement. Use when creating or modifying controllers, DTOs, request contracts, validation, dependency injection, or backend application behavior for the task and workflow management API.
---

# Backend API

## Purpose

Build a professional, maintainable ASP.NET Core Web API for the Task & Workflow Management System without adding architecture that the project does not need yet.

The backend should show recruiters that the developer can build clear REST APIs with modern .NET practices, readable C#, and interview-ready tradeoffs.

## When to use this skill

Use this skill when working on:

- API controllers
- Request and response DTOs
- Backend validation
- Dependency injection
- Backend feature endpoints
- Controller-to-application logic boundaries
- Simple service classes when controller logic starts growing

## Rules

- Keep controllers thin and readable.
- Use DTOs and request contracts for API input/output.
- Store API contracts under a clear folder such as `Contracts/<FeatureName>`.
- Use meaningful names like `CreateTaskItemRequest`, `UpdateTaskItemRequest`, and `TaskItemDto`.
- Return appropriate HTTP responses instead of raw exceptions.
- Use async methods once persistence or external I/O is involved.
- Keep domain models separate from API contracts as the domain grows.
- Use AutoMapper as the standard mapping library for simple Entity <-> DTO mappings.
- Keep business rules, validation decisions, and workflow transitions out of AutoMapper profiles.
- Add a service layer only when logic is no longer trivial or is reused by multiple endpoints.
- Keep dependency injection explicit and boring.
- Run `dotnet build` before considering backend work complete.

## What to avoid

- Do not introduce Clean Architecture unless explicitly requested later.
- Do not add MediatR, CQRS, repositories, unit of work, or mapping libraries by default.
- Do not introduce Mapster or another mapping library; this project standardizes on AutoMapper.
- Do not hide business behavior inside mapping profiles.
- Do not put growing business logic directly inside controllers.
- Do not expose persistence entities directly once API contracts are established.
- Do not add authentication, authorization, Docker, or external dependencies unless the task requires it.
- Do not rename projects, namespaces, or solution files without explicit approval.

## Expected output quality

- Code should be easy to explain in a technical interview.
- Controllers should show professional REST API habits.
- Names should be clear without comments explaining obvious behavior.
- Changes should be small, focused, and reviewable.
- The API should remain simple enough to finish as a portfolio project.

## Small examples

Prefer:

```csharp
[HttpPost]
public async Task<ActionResult<TaskItemDto>> Create(CreateTaskItemRequest request)
{
    var task = await taskService.CreateAsync(request);
    return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
}
```

Avoid:

```csharp
[HttpPost]
public ActionResult<TaskItem> Create(TaskItem task)
{
    // Directly exposing internal models and mixing API input with domain state.
}
```
