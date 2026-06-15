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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.Property(task => task.Title)
                .HasMaxLength(TaskItem.TitleMaxLength)
                .IsRequired();
        });
    }
}
