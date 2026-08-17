namespace CNCDataCollector.Domain.Entities;

public class Runtime
{
    /// <summary>
    /// Machine power ON duration.
    /// </summary>
    public TimeSpan PowerOnTime { get; set; }

    /// <summary>
    /// Machine running duration.
    /// </summary>
    public TimeSpan RunningTime { get; set; }

    /// <summary>
    /// Machine idle duration.
    /// </summary>
    public TimeSpan IdleTime { get; set; }

    /// <summary>
    /// Machine alarm duration.
    /// </summary>
    public TimeSpan AlarmTime { get; set; }

    /// <summary>
    /// Machine stopped duration.
    /// </summary>
    public TimeSpan StoppedTime { get; set; }

    /// <summary>
    /// Last cycle start time.
    /// </summary>
    public DateTime? LastCycleStart { get; set; }

    /// <summary>
    /// Last cycle end time.
    /// </summary>
    public DateTime? LastCycleEnd { get; set; }
}