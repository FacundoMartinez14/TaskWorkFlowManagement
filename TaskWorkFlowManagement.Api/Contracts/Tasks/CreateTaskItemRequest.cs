using System.ComponentModel.DataAnnotations;
using TaskWorkFlowManagement.Api.Models;

namespace TaskWorkFlowManagement.Api.Contracts.Tasks;

public class CreateTaskItemRequest : IValidatableObject
{
    [Required]
    [StringLength(TaskItem.TitleMaxLength)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(Title))
        {
            yield return new ValidationResult(
                "Title is required.",
                new[] { nameof(Title) });
        }
    }
}
