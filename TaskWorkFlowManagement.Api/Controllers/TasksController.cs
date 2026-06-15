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

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskItemDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var task = await _dbContext.TaskItems
            .AsNoTracking()
            .FirstOrDefaultAsync(task => task.Id == id, cancellationToken);

        if (task is null)
        {
            return NotFound();
        }

        return Ok(_mapper.Map<TaskItemDto>(task));
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

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, _mapper.Map<TaskItemDto>(task));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateTaskItemRequest request,
        CancellationToken cancellationToken)
    {
        var task = await _dbContext.TaskItems
            .FirstOrDefaultAsync(task => task.Id == id, cancellationToken);

        if (task is null)
        {
            return NotFound();
        }

        task.Title = request.Title;
        task.Description = request.Description;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        UpdateTaskItemStatusRequest request,
        CancellationToken cancellationToken)
    {
        var task = await _dbContext.TaskItems
            .FirstOrDefaultAsync(task => task.Id == id, cancellationToken);

        if (task is null)
        {
            return NotFound();
        }

        if (request.Status is null || !Enum.IsDefined(request.Status.Value))
        {
            ModelState.AddModelError(nameof(request.Status), "Status must be a valid task item status.");
            return ValidationProblem(ModelState);
        }

        task.Status = request.Status.Value;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var task = await _dbContext.TaskItems
            .FirstOrDefaultAsync(task => task.Id == id, cancellationToken);

        if (task is null)
        {
            return NotFound();
        }

        _dbContext.TaskItems.Remove(task);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
