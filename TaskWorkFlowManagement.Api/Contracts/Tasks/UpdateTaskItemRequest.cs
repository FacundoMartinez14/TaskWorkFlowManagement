namespace TaskWorkFlowManagement.Api.Contracts.Tasks;

public class UpdateTaskItemRequest
{
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }
}
