using CNCDataCollector.Domain.Entities;

namespace CNCDataCollector.Core.Interfaces;

public interface IMachineConnectionService
{
    Task<Machine> ConnectAsync(
        int machineId,
        CancellationToken cancellationToken = default);

    Task<Machine> DisconnectAsync(
        int machineId,
        CancellationToken cancellationToken = default);

    Task<Machine> HeartbeatAsync(
        int machineId,
        CancellationToken cancellationToken = default);
}