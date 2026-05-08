---
name: portfolio-employability
description: Project-specific employability guidance for TaskWorkflowManagement. Use when improving recruiter-facing quality, README content, demo readiness, interview explanations, screenshots, tradeoff notes, or feature prioritization for the portfolio.
---

# Portfolio Employability

## Purpose

Make the project stronger for remote full stack job applications by prioritizing visible, explainable, professional work.

The project should demonstrate that the developer can build and ship a modern full stack application, not just experiment with technology.

## When to use this skill

Use this skill when working on:

- README improvements
- Feature prioritization
- Demo readiness
- Screenshots or walkthrough notes
- Interview talking points
- Architecture tradeoffs
- Recruiter-facing documentation
- Project polish

## Rules

- Prioritize features that can be demonstrated quickly.
- Keep the README accurate and current.
- Explain setup steps clearly.
- Document meaningful tradeoffs without long theory.
- Highlight real skills: REST APIs, EF Core, Angular, TypeScript, validation, Git workflow, and deployment.
- Prefer end-to-end vertical slices over isolated technical experiments.
- Make the app easy to run locally.
- Keep naming and project structure professional.
- Add screenshots or a short demo section once the frontend exists.

## What to avoid

- Do not add personal information about the developer.
- Do not write exaggerated claims.
- Do not document features that do not exist yet as completed.
- Do not hide unfinished core functionality behind architecture diagrams.
- Do not spend too much time on README polish before the app has working features.
- Do not add buzzwords that are not visible in the code.

## Expected output quality

- The repository should look credible to a recruiter.
- The README should help someone run and understand the project.
- Technical decisions should be easy to defend in interviews.
- The project should show practical modern full stack skills.
- The final result should support job applications, portfolio reviews, and technical conversations.

## Small examples

Good README feature wording:

```text
- Task CRUD API with request DTOs, response DTOs, validation, and enum-based workflow status.
```

Avoid:

```text
- Enterprise-grade scalable distributed task orchestration platform.
```

Good tradeoff note:

```text
The backend currently uses a simple Web API structure. Clean Architecture and CQRS are intentionally avoided at this stage to keep the portfolio focused and finishable.
```
