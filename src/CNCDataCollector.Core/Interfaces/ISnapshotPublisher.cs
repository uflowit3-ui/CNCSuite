using CNCDataCollector.Domain.Entities;

namespace CNCDataCollector.Core.Interfaces;

public interface ISnapshotPublisher
{
    Task PublishAsync(
        MachineSnapshot snapshot,
        CancellationToken cancellationToken = default);
}