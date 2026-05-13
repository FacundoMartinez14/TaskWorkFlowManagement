using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskWorkFlowManagement.Api.Contracts.Tasks;
using TaskWorkFlowManagement.Api.Data;
using TaskWorkFlowManagement.Api.Models;

namespace TaskWorkFlowManagement.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IMapper _mapper;

    public TasksController(AppDbContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItemDto>>> GetAll(CancellationToken cancellationToken)
    {
        var tasks = await _dbContext.TaskItems
            .AsNoTracking()
            .OrderBy(task => task.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return Ok(_mapper.Map<IEnumerable<TaskItemDto>>(tasks));
    }

    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> Create(
        CreateTaskItemRequest request,
        CancellationToken cancellationToken)
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = TaskItemStatus.ToDo,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.TaskItems.Add(task);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetAll), new { id = task.Id }, _mapper.Map<TaskItemDto>(task));
    }
}
