namespace CNCDataCollector.Domain.Entities;

/// <summary>
/// Represents a complete snapshot of the current CNC machine data.
/// This model is used as the common data structure between
/// Collector, API, UI and future ERP/Laravel integration.
/// </summary>
public sealed class MachineSnapshot
{
    /// <summary>
    /// Machine information.
    /// </summary>
    public Machine? Machine { get; set; }

    /// <summary>
    /// Current machine status.
    /// </summary>
    public MachineStatus? Status { get; set; }

    /// <summary>
    /// Current production information.
    /// </summary>
    public Production? Production { get; set; }

    /// <summary>
    /// Current runtime information.
    /// </summary>
    public Runtime? Runtime { get; set; }

    /// <summary>
    /// Currently running CNC program.
    /// </summary>
    public ProgramInfo? Program { get; set; }

    /// <summary>
    /// Current axis positions.
    /// </summary>
    public AxisPosition? AxisPosition { get; set; }

    /// <summary>
    /// Current spindle information.
    /// </summary>
    public Spindle? Spindle { get; set; }

    /// <summary>
    /// Currently active tool information.
    /// </summary>
    public Tool? Tool { get; set; }

    /// <summary>
    /// Currently active alarm, if any.
    /// </summary>
    public Alarm? ActiveAlarm { get; set; }

    /// <summary>
    /// Time when this snapshot was collected.
    /// </summary>
    public DateTime CollectedAt { get; set; } = DateTime.UtcNow;
}