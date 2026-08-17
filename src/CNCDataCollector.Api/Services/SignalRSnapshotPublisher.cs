using CNCDataCollector.Api.Hubs;
using CNCDataCollector.Api.Mapping;
using CNCDataCollector.Core.Interfaces;
using CNCDataCollector.Domain.Entities;
using Microsoft.AspNetCore.SignalR;

namespace CNCDataCollector.Api.Services;

public sealed class SignalRSnapshotPublisher : ISnapshotPublisher
{
    private readonly IHubContext<CncDashboardHub> _hubContext;

    public SignalRSnapshotPublisher(
        IHubContext<CncDashboardHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task PublishAsync(
        MachineSnapshot snapshot,
        CancellationToken cancellationToken = default)
    {
        var dto = SnapshotMapper.ToDto(snapshot);

        if (snapshot.Machine is null)
        {
            return;
        }

        var machineId = snapshot.Machine.Id;

        await _hubContext
            .Clients
            .Group($"machine-{machineId}")
            .SendAsync(
                "MachineSnapshotUpdated",
                dto,
                cancellationToken);
    }
}