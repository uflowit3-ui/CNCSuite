using CNCDataCollector.Collector.Services;
using CNCDataCollector.Core.Interfaces;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CNCDataCollector.Collector.Workers;

public sealed class CollectorWorker : BackgroundService
{
    private readonly CollectorService _collector;
    private readonly HistoryStore _historyStore;
    private readonly ILogger<CollectorWorker> _logger;
    private readonly SnapshotStore _snapshotStore;
    private readonly ISnapshotPublisher _snapshotPublisher;

    public CollectorWorker(
        CollectorService collector,
        SnapshotStore snapshotStore,
        HistoryStore historyStore,
        ISnapshotPublisher snapshotPublisher,
        ILogger<CollectorWorker> logger)
    {
        _collector = collector;
        _historyStore = historyStore;
        _snapshotStore = snapshotStore;
        _snapshotPublisher = snapshotPublisher;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "CNC Collector Worker started.");

        try
        {
            var connectResult =
                await _collector.ConnectAsync(stoppingToken);

            if (!connectResult.IsSuccess)
            {
                _logger.LogError(
                    "Failed to connect to CNC.");

                return;
            }

            _logger.LogInformation(
                "Connected to CNC successfully.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var snapshot =
                        await _collector.CollectSnapshotAsync(
                            stoppingToken);

                    _historyStore.Add(snapshot);

                    _snapshotStore.Update(snapshot);

                    await _snapshotPublisher.PublishAsync(
                        snapshot,
                        stoppingToken);

                    _logger.LogInformation(
                        "CNC Snapshot collected at {Time}",
                        snapshot.CollectedAt);

                    await Task.Delay(
                        TimeSpan.FromSeconds(1),
                        stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error while collecting CNC data.");

                    await Task.Delay(
                        TimeSpan.FromSeconds(5),
                        stoppingToken);
                }
            }
        }
        catch (OperationCanceledException)
        {
            // Normal shutdown
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Collector worker stopped unexpectedly.");
        }
        finally
        {
            try
            {
                await _collector.DisconnectAsync(
                    CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while disconnecting CNC.");
            }

            _logger.LogInformation(
                "CNC Collector Worker stopped.");
        }
    }
}