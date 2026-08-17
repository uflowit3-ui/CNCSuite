namespace CNCDataCollector.Api.DTOs;

public sealed class ToolDto
{
    public int ToolNumber { get; set; }

    public string ToolName { get; set; } = string.Empty;

    public int ToolOffset { get; set; }

    public double Length { get; set; }

    public double Diameter { get; set; }

    public double LifePercentage { get; set; }

    public bool IsActive { get; set; }

    public DateTime LastUpdated { get; set; }
}