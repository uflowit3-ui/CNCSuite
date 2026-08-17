namespace CNCDataCollector.Api.DTOs.Dashboard;

public sealed class RuntimeDashboardDto
{
    public TimeSpan PowerOnTime { get; init; }

    public TimeSpan RunningTime { get; init; }

    public TimeSpan IdleTime { get; init; }

    public TimeSpan AlarmTime { get; init; }

    public TimeSpan StoppedTime { get; init; }

    public DateTime? LastCycleStart { get; init; }

    public DateTime? LastCycleEnd { get; init; }
}