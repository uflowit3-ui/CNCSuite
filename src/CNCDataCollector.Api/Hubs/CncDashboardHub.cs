using Microsoft.AspNetCore.SignalR;

namespace CNCDataCollector.Api.Hubs;

public sealed class CncDashboardHub : Hub
{
    public async Task SubscribeToMachine(int machineId)
    {
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            GetMachineGroup(machineId));
    }

    public async Task UnsubscribeFromMachine(int machineId)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            GetMachineGroup(machineId));
    }

    private static string GetMachineGroup(int machineId)
        => $"machine-{machineId}";
}