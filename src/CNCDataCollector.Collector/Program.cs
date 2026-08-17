using CNCDataCollector.Collector.DependencyInjection;
using CNCDataCollector.Collector.Services;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();

services.AddCollectorServices();

var provider = services.BuildServiceProvider();

var collector = provider.GetRequiredService<CollectorService>();

await collector.ConnectAsync();

while (true)
{
    await collector.CollectAsync();

    await Task.Delay(1000);
}