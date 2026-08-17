namespace CNCDataCollector.Api.DTOs.Dashboard;

public sealed class ProgramDashboardDto
{
    public string ProgramNumber { get; init; } = string.Empty;

    public string ProgramName { get; init; } = string.Empty;

    public int CurrentBlockNumber { get; init; }

    public bool IsRunning { get; init; }

    public DateTime? StartTime { get; init; }

    public DateTime? EndTime { get; init; }

    public double Progress { get; init; }

    public TimeSpan RemainingCycleTime { get; init; }
}