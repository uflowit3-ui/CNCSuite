using CNCDataCollector.Collector.Services;
using CNCDataCollector.Collector.Workers;
using CNCDataCollector.Core.Interfaces;
using CNCDataCollector.MockDriver.Drivers;
using Microsoft.Extensions.DependencyInjection;

namespace CNCDataCollector.Collector.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCollectorServices(
        this IServiceCollection services)
    {
        // CNC Driver
        services.AddSingleton<ICncDriver, MockCncDriver>();

        // Collector
        services.AddSingleton<CollectorService>();

        // In-memory stores
        services.AddSingleton<SnapshotStore>();
        services.AddSingleton<HistoryStore>();

        // Background worker
        services.AddHostedService<CollectorWorker>();

        return services;
    }
}