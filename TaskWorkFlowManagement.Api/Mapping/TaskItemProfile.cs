using AutoMapper;
using TaskWorkFlowManagement.Api.Contracts.Tasks;
using TaskWorkFlowManagement.Api.Models;

namespace TaskWorkFlowManagement.Api.Mapping;

public class TaskItemProfile : Profile
{
    public TaskItemProfile()
    {
        CreateMap<TaskItem, TaskItemDto>();
    }
}
