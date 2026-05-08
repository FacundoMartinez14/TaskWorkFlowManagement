---
name: rest-api-design
description: Project-specific REST API design guidance for TaskWorkflowManagement. Use when defining or reviewing routes, status codes, request and response DTOs, error responses, pagination, filtering, or API consistency.
---

# REST API Design

## Purpose

Design consistent REST endpoints for the Task & Workflow Management System that look professional, are easy to consume from Angular, and can be explained clearly in interviews.

This skill should keep the API practical rather than academic.

## When to use this skill

Use this skill when working on:

- Route design
- HTTP methods
- Status codes
- Request DTOs
- Response DTOs
- Error handling
- Pagination or filtering
- API consistency reviews

## Rules

- Use resource-based routes.
- Use plural nouns for collections.
- Keep routes predictable and consistent.
- Use DTOs for request and response bodies.
- Use `201 Created` for successful creates.
- Use `404 Not Found` when a resource does not exist.
- Use `400 Bad Request` for validation failures.
- Use `204 No Content` for successful deletes or updates with no body.
- Add pagination and filtering only when endpoints can realistically return many records.
- Keep status transitions explicit when useful, such as `PATCH /api/tasks/{id}/status`.

## What to avoid

- Do not create RPC-style routes like `/api/tasks/createTask`.
- Do not return `200 OK` for every scenario.
- Do not expose internal entities when DTOs exist.
- Do not add pagination to every endpoint before there is a need.
- Do not invent complex API envelopes unless consistency requires it later.
- Do not leak stack traces or internal exception details in API responses.

## Expected output quality

- Routes should be easy for frontend code to consume.
- Status codes should show real API judgment.
- Request and response shapes should be stable and named clearly.
- The API should demonstrate professional backend habits to recruiters.
- Tradeoffs should be easy to explain in a technical interview.

## Small examples

Good route set for tasks:

```text
GET    /api/tasks
GET    /api/tasks/{id}
POST   /api/tasks
PUT    /api/tasks/{id}
PATCH  /api/tasks/{id}/status
DELETE /api/tasks/{id}
```

Avoid:

```text
POST /api/tasks/updateStatus
GET  /api/getAllTasks
```
