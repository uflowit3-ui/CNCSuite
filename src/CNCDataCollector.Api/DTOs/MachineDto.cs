namespace CNCDataCollector.Api.DTOs;

public sealed class MachineDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string MachineCode { get; set; } = string.Empty;

    public string IpAddress { get; set; } = string.Empty;

    public int Port { get; set; }

    public int ControllerType { get; set; }

    public bool IsEnabled { get; set; }
}