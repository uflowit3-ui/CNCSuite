namespace CNCDataCollector.Api.DTOs;

public sealed class ProgramInfoDto
{
    public string ProgramNumber { get; set; } = string.Empty;

    public string ProgramName { get; set; } = string.Empty;

    public int CurrentBlockNumber { get; set; }

    public bool IsRunning { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public double Progress { get; set; }

    public TimeSpan? RemainingCycleTime { get; set; }
}