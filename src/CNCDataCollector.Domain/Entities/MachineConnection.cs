using CNCDataCollector.Domain.Enums;

namespace CNCDataCollector.Domain.Entities;

public class MachineConnection
{
    public ConnectionState State { get; set; }

    public DateTime LastConnected { get; set; }

    public DateTime LastDisconnected { get; set; }

    public DateTime LastHeartbeat { get; set; }

    public string Message { get; set; } = string.Empty;
}