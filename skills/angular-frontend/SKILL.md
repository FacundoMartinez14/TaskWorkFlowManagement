---
name: angular-frontend
description: Project-specific guidance for modern Angular frontend work in TaskWorkflowManagement. Use when creating or modifying Angular components, services, TypeScript models, forms, RxJS flows, API integration, or frontend UI behavior.
---

# Angular Frontend

## Purpose

Build a modern Angular frontend that demonstrates practical full stack ability: typed API calls, clean components, readable TypeScript, and a simple UI for managing tasks and workflows.

The frontend should help recruiters see that the developer can move from AngularJS experience into modern Angular confidently.

## When to use this skill

Use this skill when working on:

- Angular components
- API services
- TypeScript interfaces
- Forms
- RxJS flows
- UI state
- Routing
- Frontend feature screens

## Rules

- Use modern Angular conventions.
- Name component files in kebab-case with the `.component.ts`, `.component.html`, and `.component.css` suffixes.
- End component class names with `Component`.
- Prefer standalone components if the Angular version and project setup support them.
- Keep components focused on presentation and UI interaction.
- Put HTTP calls in Angular services, not directly inside components.
- Use strongly typed request and response models.
- Use reactive forms when validation or edit flows become non-trivial.
- Keep RxJS usage simple and readable.
- Start with a simple working UI before adding polish.
- Use clear folder names such as `features/tasks`, `services`, and `models` when the frontend exists.
- Run `npm install` and `npm run build` before considering frontend work complete.

## What to avoid

- Do not add NgRx or other state management libraries until the project clearly needs them.
- Do not add UI component libraries unless explicitly requested.
- Do not over-split components before there is real complexity.
- Do not duplicate API shapes manually in many places.
- Do not build a marketing landing page instead of the actual application experience.
- Do not hide errors; show useful UI states for loading and failure when API calls exist.

## Expected output quality

- TypeScript should be strict, readable, and interview-ready.
- Components should be easy to scan and maintain.
- API integration should be typed end to end.
- UI should prioritize real workflows: list tasks, create tasks, update status, edit, and delete.
- The frontend should demonstrate employable Angular skills without unnecessary framework weight.

## Small examples

Prefer:

```ts
export interface TaskItemDto {
  id: string;
  title: string;
  description?: string | null;
  status: 'ToDo' | 'InProgress' | 'Done';
  createdAtUtc: string;
}
```

Prefer service-based API access:

```ts
getTasks(): Observable<TaskItemDto[]> {
  return this.http.get<TaskItemDto[]>(this.tasksUrl);
}
```
