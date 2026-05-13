using Microsoft.EntityFrameworkCore;
using TaskWorkFlowManagement.Api.Models;

namespace TaskWorkFlowManagement.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
}
