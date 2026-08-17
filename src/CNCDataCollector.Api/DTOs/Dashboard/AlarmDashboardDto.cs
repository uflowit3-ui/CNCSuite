namespace CNCDataCollector.Api.DTOs.Dashboard;

public sealed class AlarmDashboardDto
{
    public int AlarmNumber { get; init; }

    public string Message { get; init; } = string.Empty;

    public int Level { get; init; }

    public DateTime? StartTime { get; init; }

    public DateTime? EndTime { get; init; }

    public bool IsActive { get; init; }

    public string Description { get; init; } = string.Empty;

    public string ControllerAlarmCode { get; init; } = string.Empty;
}