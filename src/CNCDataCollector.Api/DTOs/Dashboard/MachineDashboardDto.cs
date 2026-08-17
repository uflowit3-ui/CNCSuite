namespace CNCDataCollector.Api.DTOs.Dashboard;

public sealed class MachineDashboardDto
{
    public int Id { get; init; }

    public string MachineCode { get; init; } = string.Empty;

    public string Name { get; init; } = string.Empty;

    public ConnectionDashboardDto Connection { get; init; } = new();

    public StatusDashboardDto Status { get; init; } = new();

    public ProductionDashboardDto Production { get; init; } = new();

    public RuntimeDashboardDto Runtime { get; init; } = new();

    public ProgramDashboardDto Program { get; init; } = new();

    public AxisDashboardDto Axis { get; init; } = new();

    public SpindleDashboardDto Spindle { get; init; } = new();

    public ToolDashboardDto Tool { get; init; } = new();

    public AlarmDashboardDto? ActiveAlarm { get; init; }

    public DateTime CollectedAt { get; init; }
}