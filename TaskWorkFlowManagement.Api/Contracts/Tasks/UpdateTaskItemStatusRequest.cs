using System.ComponentModel.DataAnnotations;
using TaskWorkFlowManagement.Api.Models;

namespace TaskWorkFlowManagement.Api.Contracts.Tasks;

public class UpdateTaskItemStatusRequest
{
    [Required]
    public TaskItemStatus? Status { get; set; }
}
