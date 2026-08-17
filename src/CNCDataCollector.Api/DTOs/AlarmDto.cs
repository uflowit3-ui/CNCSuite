namespace CNCDataCollector.Api.DTOs;

public sealed class AlarmDto
{
    public int AlarmNumber { get; set; }

    public string Message { get; set; } = string.Empty;

    public int Level { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public bool IsActive { get; set; }

    public string Description { get; set; } = string.Empty;

    public string ControllerAlarmCode { get; set; } = string.Empty;
}