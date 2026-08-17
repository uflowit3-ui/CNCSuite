namespace CNCDataCollector.Api.DTOs.Dashboard;

public sealed class ToolDashboardDto
{
    public int ToolNumber { get; init; }

    public string ToolName { get; init; } = string.Empty;

    public double ToolOffset { get; init; }

    public double Length { get; init; }

    public double Diameter { get; init; }

    public double LifePercentage { get; init; }

    public bool IsActive { get; init; }

    public DateTime LastUpdated { get; init; }
}