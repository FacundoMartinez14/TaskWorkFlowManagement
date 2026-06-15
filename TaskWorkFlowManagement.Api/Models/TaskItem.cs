namespace TaskWorkFlowManagement.Api.Models;

public class TaskItem
{
    public const int TitleMaxLength = 200;

    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TaskItemStatus Status { get; set; } = TaskItemStatus.ToDo;

    public DateTime CreatedAtUtc { get; set; }
}
