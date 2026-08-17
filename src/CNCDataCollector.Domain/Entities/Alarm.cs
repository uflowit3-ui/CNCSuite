using CNCDataCollector.Domain.Enums;

namespace CNCDataCollector.Domain.Entities;

public class Alarm
{
    /// <summary>
    /// Alarm Number from CNC Controller.
    /// </summary>
    public int AlarmNumber { get; set; }

    /// <summary>
    /// Alarm Message.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Alarm Severity.
    /// </summary>
    public AlarmLevel Level { get; set; }

    /// <summary>
    /// Alarm Start Time.
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// Alarm End Time.
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Is Alarm Currently Active?
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Optional Alarm Description.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Optional Alarm Description.
    /// </summary>
    public string ControllerAlarmCode { get; set; } = string.Empty;
}