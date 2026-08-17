namespace CNCDataCollector.Domain.Entities;

public class ProgramInfo
{
    /// <summary>
    /// CNC Program Number (Example: O0001)
    /// </summary>
    public string ProgramNumber { get; set; } = string.Empty;

    /// <summary>
    /// CNC Program Name
    /// </summary>
    public string ProgramName { get; set; } = string.Empty;

    /// <summary>
    /// Current Block Number (Example: N1250)
    /// </summary>
    public int CurrentBlockNumber { get; set; }

    /// <summary>
    /// Is Program Currently Running?
    /// </summary>
    public bool IsRunning { get; set; }

    /// <summary>
    /// Program Start Time
    /// </summary>
    public DateTime? StartTime { get; set; }

    /// <summary>
    /// Program End Time
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Program execution percentage (0-100).
    /// </summary>
    public double Progress { get; set; }

    /// <summary>
    /// Estimated remaining cycle time.
    /// </summary>
    public TimeSpan RemainingCycleTime { get; set; }
}