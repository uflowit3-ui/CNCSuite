using CNCDataCollector.Domain.Entities;

namespace CNCDataCollector.Collector.Services;

public sealed class SnapshotStore
{
    private readonly object _lock = new();

    private MachineSnapshot? _latestSnapshot;

    public MachineSnapshot? Latest
    {
        get
        {
            lock (_lock)
            {
                return _latestSnapshot;
            }
        }
    }

    public void Update(MachineSnapshot snapshot)
    {
        ArgumentNullException.ThrowIfNull(snapshot);

        lock (_lock)
        {
            _latestSnapshot = snapshot;
        }
    }

    public bool HasData
    {
        get
        {
            lock (_lock)
            {
                return _latestSnapshot is not null;
            }
        }
    }

    public void Clear()
    {
        lock (_lock)
        {
            _latestSnapshot = null;
        }
    }
}