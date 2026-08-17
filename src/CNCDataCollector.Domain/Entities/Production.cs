namespace CNCDataCollector.Domain.Entities;

public class Production
{
    /// <summary>
    /// Total parts produced.
    /// </summary>
    public int PartCount { get; set; }

    /// <summary>
    /// Good parts produced.
    /// </summary>
    public int GoodPartCount { get; set; }

    /// <summary>
    /// Rejected parts.
    /// </summary>
    public int RejectPartCount { get; set; }

    /// <summary>
    /// Target production quantity.
    /// </summary>
    public int TargetQuantity { get; set; }

    /// <summary>
    /// Actual production quantity.
    /// </summary>
    public int ActualQuantity { get; set; }

    /// <summary>
    /// Current cycle time.
    /// </summary>
    public TimeSpan CycleTime { get; set; }
}