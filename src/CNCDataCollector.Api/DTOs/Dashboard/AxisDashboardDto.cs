namespace CNCDataCollector.Api.DTOs.Dashboard;

public sealed class AxisDashboardDto
{
    public double X { get; init; }

    public double Y { get; init; }

    public double Z { get; init; }

    public double A { get; init; }

    public double B { get; init; }

    public double C { get; init; }

    public DateTime LastUpdated { get; init; }
}