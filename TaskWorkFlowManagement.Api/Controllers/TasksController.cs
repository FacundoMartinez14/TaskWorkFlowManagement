using Microsoft.AspNetCore.Mvc;
using TaskWorkFlowManagement.Api.Contracts.Tasks;
using TaskWorkFlowManagement.Api.Models;

namespace TaskWorkFlowManagement.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private static readonly List<TaskItem> Tasks = [];

    [HttpGet]
    public ActionResult<IEnumerable<TaskItemDto>> GetAll()
    {
        return Ok(Tasks.Select(ToDto));
    }

    [HttpPost]
    public ActionResult<TaskItemDto> Create(CreateTaskItemRequest request)
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = TaskItemStatus.ToDo,
            CreatedAtUtc = DateTime.UtcNow
        };

        Tasks.Add(task);

        return CreatedAtAction(nameof(GetAll), new { id = task.Id }, ToDto(task));
    }

    private static TaskItemDto ToDto(TaskItem task)
    {
        return new TaskItemDto(
            task.Id,
            task.Title,
            task.Description,
            task.Status,
            task.CreatedAtUtc);
    }
}
