namespace CNCDataCollector.Api.DTOs;

public sealed class RuntimeDto
{
    public TimeSpan PowerOnTime { get; set; }

    public TimeSpan RunningTime { get; set; }

    public TimeSpan IdleTime { get; set; }

    public TimeSpan AlarmTime { get; set; }

    public TimeSpan StoppedTime { get; set; }

    public DateTime? LastCycleStart { get; set; }

    public DateTime? LastCycleEnd { get; set; }
}