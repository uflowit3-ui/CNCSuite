namespace CNCDataCollector.Api.DTOs.Dashboard;

public sealed class ConnectionDashboardDto
{
    public int State { get; init; }

    public DateTime? LastConnected { get; init; }

    public DateTime? LastDisconnected { get; init; }

    public DateTime? LastHeartbeat { get; init; }

    public string Message { get; init; } = string.Empty;
}