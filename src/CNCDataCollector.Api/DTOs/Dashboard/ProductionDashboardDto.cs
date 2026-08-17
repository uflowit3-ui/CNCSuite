namespace CNCDataCollector.Api.DTOs.Dashboard;

public sealed class ProductionDashboardDto
{
    public int PartCount { get; init; }

    public int GoodPartCount { get; init; }

    public int RejectPartCount { get; init; }

    public int TargetQuantity { get; init; }

    public int ActualQuantity { get; init; }

    public TimeSpan CycleTime { get; init; }
}