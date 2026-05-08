using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using TaskWorkFlowManagement.Api.Contracts.Tasks;
using TaskWorkFlowManagement.Api.Models;

namespace TaskWorkFlowManagement.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private static readonly List<TaskItem> Tasks = [];
    private readonly IMapper _mapper;

    public TasksController(IMapper mapper)
    {
        _mapper = mapper;
    }

    [HttpGet]
    public ActionResult<IEnumerable<TaskItemDto>> GetAll()
    {
        return Ok(_mapper.Map<IEnumerable<TaskItemDto>>(Tasks));
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

        return CreatedAtAction(nameof(GetAll), new { id = task.Id }, _mapper.Map<TaskItemDto>(task));
    }
}
