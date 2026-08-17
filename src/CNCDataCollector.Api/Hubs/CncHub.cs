using Microsoft.AspNetCore.SignalR;

namespace CNCDataCollector.Api.Hubs;

public sealed class CncHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(
        Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}