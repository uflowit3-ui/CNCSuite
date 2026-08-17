namespace CNCDataCollector.Api.DTOs.Dashboard;

public sealed class SpindleDashboardDto
{
    public double CurrentRpm { get; init; }

    public double TargetRpm { get; init; }

    public double LoadPercentage { get; init; }

    public double Power { get; init; }

    public double Temperature { get; init; }

    public bool IsRunning { get; init; }

    public bool Clockwise { get; init; }

    public DateTime LastUpdated { get; init; }
}