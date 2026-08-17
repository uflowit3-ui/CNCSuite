namespace CNCDataCollector.Api.DTOs.Dashboard;

public sealed class StatusDashboardDto
{
    public int State { get; init; }

    public bool EmergencyStop { get; init; }

    public bool FeedHold { get; init; }

    public bool CycleStart { get; init; }
}