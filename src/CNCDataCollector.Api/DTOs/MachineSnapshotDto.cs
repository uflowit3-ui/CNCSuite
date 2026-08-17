namespace CNCDataCollector.Api.DTOs;

public sealed class MachineSnapshotDto
{
    public MachineDto? Machine { get; set; }

    public MachineStatusDto? Status { get; set; }

    public ProductionDto? Production { get; set; }

    public RuntimeDto? Runtime { get; set; }

    public ProgramInfoDto? Program { get; set; }

    public AxisPositionDto? AxisPosition { get; set; }

    public SpindleDto? Spindle { get; set; }

    public ToolDto? Tool { get; set; }

    public AlarmDto? ActiveAlarm { get; set; }

    public DateTime CollectedAt { get; set; }
}