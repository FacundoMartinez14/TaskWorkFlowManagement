# Task & Workflow Management System

TaskWorkFlowManagement is a full stack portfolio project for building a modern task and workflow management application. The current focus is a clean, recruiter-friendly backend API that demonstrates practical .NET Web API, REST, validation, EF Core, PostgreSQL, and Git workflow skills.

The Angular frontend is planned but has not been created yet.

## Current Backend Stack

- .NET Web API
- C#
- ASP.NET Core controllers
- Entity Framework Core
- PostgreSQL with Npgsql
- AutoMapper
- Swagger / OpenAPI
- EF Core migrations

## Implemented Features

- Health check endpoint
- TaskItem CRUD API
- Task status updates with enum-based statuses:
  - `ToDo`
  - `InProgress`
  - `Done`
- Request and response DTOs for task API contracts
- Task title validation:
  - required
  - cannot be whitespace
  - maximum length of 200 characters
- JSON enum values serialized as strings
- EF Core `AppDbContext` with `TaskItems`
- Initial database migration and title length migration
- Swagger UI enabled in Development

## Repository Structure

```text
TaskWorkFlowManagement.Api/
  Controllers/
  Contracts/
  Data/
  Mapping/
  Migrations/
  Models/
```

## Run the Backend Locally

From the repository root:

```bash
cd TaskWorkFlowManagement.Api
dotnet build
dotnet run
```

The API launch profiles currently use:

- HTTPS: `https://localhost:7239`
- HTTP: `http://localhost:5095`

Swagger UI is available in Development at:

- `https://localhost:7239/swagger`
- `http://localhost:5095/swagger`

## PostgreSQL Configuration

The API reads the database connection from `ConnectionStrings:DefaultConnection` in `TaskWorkFlowManagement.Api/appsettings.json`.

Current local connection string:

```json
"DefaultConnection": "Host=localhost;Port=5432;Database=task_workflow_management;Username=postgres;Password=Password1"
```

To run locally, make sure PostgreSQL is running and update the connection string if your local username, password, host, port, or database name differs.

## Apply EF Core Migrations

In Development, the API applies pending migrations on startup through `Database.MigrateAsync()`.

You can also apply migrations manually from the repository root:

```bash
dotnet ef database update --project TaskWorkFlowManagement.Api
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Returns API health information |
| `GET` | `/api/tasks` | Lists all tasks |
| `GET` | `/api/tasks/{id}` | Gets one task by ID |
| `POST` | `/api/tasks` | Creates a task |
| `PUT` | `/api/tasks/{id}` | Updates a task title and description |
| `PATCH` | `/api/tasks/{id}/status` | Updates a task status |
| `DELETE` | `/api/tasks/{id}` | Deletes a task |

## Current Status

The backend API has the first working task management slice: persistence, migrations, validation, DTOs, CRUD endpoints, task status handling, and Swagger documentation.

Suggested next steps:

- Create the Angular frontend
- Add a task list UI connected to the API
- Add task create/edit forms
- Add basic filtering by task status when the task list grows
