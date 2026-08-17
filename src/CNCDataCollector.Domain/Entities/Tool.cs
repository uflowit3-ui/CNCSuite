namespace CNCDataCollector.Domain.Entities;

public class Tool
{
    /// <summary>
    /// Current Tool Number.
    /// Example: T05
    /// </summary>
    public int ToolNumber { get; set; }

    /// <summary>
    /// Tool Name.
    /// </summary>
    public string ToolName { get; set; } = string.Empty;

    /// <summary>
    /// Tool Offset Number.
    /// Example: H05
    /// </summary>
    public int ToolOffset { get; set; }

    /// <summary>
    /// Tool Length (mm).
    /// </summary>
    public double Length { get; set; }

    /// <summary>
    /// Tool Diameter (mm).
    /// </summary>
    public double Diameter { get; set; }

    /// <summary>
    /// Remaining Tool Life (%).
    /// </summary>
    public double LifePercentage { get; set; }

    /// <summary>
    /// Is tool currently active?
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Last Updated Time.
    /// </summary>
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}