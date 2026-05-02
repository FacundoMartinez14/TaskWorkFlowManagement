using Microsoft.AspNetCore.Mvc;

namespace TaskWorkFlowManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            Status = "Healthy",
            Application = "Task Workflow Management API",
            TimestampUtc = DateTime.UtcNow
        });
    }
}