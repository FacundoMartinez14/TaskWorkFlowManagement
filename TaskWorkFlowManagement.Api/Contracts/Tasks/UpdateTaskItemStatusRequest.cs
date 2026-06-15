using TaskWorkFlowManagement.Api.Models;

namespace TaskWorkFlowManagement.Api.Contracts.Tasks;

public class UpdateTaskItemStatusRequest
{
    public TaskItemStatus Status { get; set; }
}
