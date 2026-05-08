using TaskWorkFlowManagement.Api.Models;

namespace TaskWorkFlowManagement.Api.Contracts.Tasks;

public record TaskItemDto(
    Guid Id,
    string Title,
    string? Description,
    TaskItemStatus Status,
    DateTime CreatedAtUtc);
