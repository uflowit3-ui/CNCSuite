using CNCDataCollector.Domain.Entities;

namespace CNCDataCollector.Collector.Services;

/// <summary>
/// In-memory store for CNC machine snapshots.
///
/// Important:
/// Production counters and Runtime values inside MachineSnapshot
/// are cumulative values. Consumers such as OEE and Reports should
/// calculate the selected-period delta using the first and last
/// snapshots returned by this store.
/// </summary>
public sealed class HistoryStore
{
    // ============================================================
    // CONFIGURATION
    // ============================================================

    private const int DefaultMaxCount = 3600;

    // ============================================================
    // STORAGE
    // ============================================================

    private readonly object _lock = new();

    private readonly LinkedList<MachineSnapshot> _history =
        new();

    private readonly int _maxCount;

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public HistoryStore(
        int maxCount = DefaultMaxCount)
    {
        _maxCount =
            Math.Max(
                2,
                maxCount);
    }

    // ============================================================
    // ADD SNAPSHOT
    // ============================================================

    /// <summary>
    /// Adds a new machine snapshot.
    ///
    /// Snapshots are stored in chronological order.
    /// </summary>
    public void Add(
        MachineSnapshot snapshot)
    {
        ArgumentNullException.ThrowIfNull(
            snapshot);

        lock (_lock)
        {
            /*
             * Normally snapshots arrive in chronological order.
             *
             * If a snapshot arrives with an older timestamp,
             * insert it in the correct position instead of
             * corrupting the history ordering.
             */

            if (
                _history.Count == 0 ||
                snapshot.CollectedAt >=
                    _history.Last!.Value.CollectedAt)
            {
                _history.AddLast(
                    snapshot);
            }
            else
            {
                InsertChronologically(
                    snapshot);
            }

            // Keep only the configured number of snapshots.
            while (
                _history.Count >
                _maxCount)
            {
                _history.RemoveFirst();
            }
        }
    }

    // ============================================================
    // ADD RANGE
    // ============================================================

    /// <summary>
    /// Adds multiple snapshots.
    ///
    /// Useful for tests, initialization or replay.
    /// </summary>
    public void AddRange(
        IEnumerable<MachineSnapshot> snapshots)
    {
        ArgumentNullException.ThrowIfNull(
            snapshots);

        foreach (
            var snapshot in snapshots)
        {
            Add(snapshot);
        }
    }

    // ============================================================
    // GET LAST
    // ============================================================

    /// <summary>
    /// Returns the latest requested number of snapshots.
    ///
    /// Result is chronological:
    /// oldest -> newest.
    /// </summary>
    public List<MachineSnapshot> GetLast(
        int count)
    {
        count =
            Math.Clamp(
                count,
                1,
                _maxCount);

        lock (_lock)
        {
            if (_history.Count == 0)
            {
                return new List<MachineSnapshot>();
            }

            var result =
                new List<MachineSnapshot>(
                    Math.Min(
                        count,
                        _history.Count));

            var node =
                _history.Last;

            while (
                node != null &&
                result.Count < count)
            {
                result.Add(
                    node.Value);

                node =
                    node.Previous;
            }

            // We collected newest -> oldest.
            // Reverse so consumers receive:
            //
            // oldest -> newest.
            result.Reverse();

            return result;
        }
    }

    // ============================================================
    // GET ALL
    // ============================================================

    /// <summary>
    /// Returns the complete currently retained history.
    ///
    /// Result is chronological:
    /// oldest -> newest.
    /// </summary>
    public List<MachineSnapshot> GetAll()
    {
        lock (_lock)
        {
            return _history.ToList();
        }
    }

    // ============================================================
    // GET LATEST
    // ============================================================

    /// <summary>
    /// Returns the latest snapshot, or null when no history exists.
    /// </summary>
    public MachineSnapshot? GetLatest()
    {
        lock (_lock)
        {
            return _history.Last?.Value;
        }
    }

    // ============================================================
    // GET FIRST
    // ============================================================

    /// <summary>
    /// Returns the oldest retained snapshot, or null when empty.
    /// </summary>
    public MachineSnapshot? GetFirst()
    {
        lock (_lock)
        {
            return _history.First?.Value;
        }
    }

    // ============================================================
    // COUNT
    // ============================================================

    /// <summary>
    /// Number of snapshots currently stored.
    /// </summary>
    public int Count
    {
        get
        {
            lock (_lock)
            {
                return _history.Count;
            }
        }
    }

    // ============================================================
    // IS EMPTY
    // ============================================================

    public bool IsEmpty
    {
        get
        {
            lock (_lock)
            {
                return _history.Count == 0;
            }
        }
    }

    // ============================================================
    // CLEAR
    // ============================================================

    /// <summary>
    /// Clears all in-memory history.
    ///
    /// This does not affect the CNC machine or database.
    /// </summary>
    public void Clear()
    {
        lock (_lock)
        {
            _history.Clear();
        }
    }

    // ============================================================
    // REMOVE OLDER THAN
    // ============================================================

    /// <summary>
    /// Removes snapshots older than the supplied timestamp.
    /// </summary>
    public int RemoveOlderThan(
        DateTimeOffset timestamp)
    {
        lock (_lock)
        {
            var removed = 0;

            while (
                _history.First != null &&
                _history.First.Value.CollectedAt <
                    timestamp)
            {
                _history.RemoveFirst();

                removed++;
            }

            return removed;
        }
    }

    // ============================================================
    // GET BETWEEN
    // ============================================================

    /// <summary>
    /// Returns snapshots between two timestamps.
    ///
    /// Both boundaries are inclusive.
    /// Result is chronological.
    /// </summary>
    public List<MachineSnapshot> GetBetween(
        DateTimeOffset start,
        DateTimeOffset end)
    {
        if (end < start)
        {
            (
                start,
                end
            ) = (
                end,
                start
            );
        }

        lock (_lock)
        {
            return _history
                .Where(
                    x =>
                        x.CollectedAt >= start &&
                        x.CollectedAt <= end)
                .OrderBy(
                    x =>
                        x.CollectedAt)
                .ToList();
        }
    }

    // ============================================================
    // GET WINDOW
    // ============================================================

    /// <summary>
    /// Returns snapshots covering the requested time window
    /// backwards from the latest available snapshot.
    ///
    /// Example:
    ///
    /// GetWindow(TimeSpan.FromHours(1))
    ///
    /// returns approximately the last one hour of retained data.
    /// </summary>
    public List<MachineSnapshot> GetWindow(
        TimeSpan duration)
    {
        if (duration <= TimeSpan.Zero)
        {
            return new List<MachineSnapshot>();
        }

        lock (_lock)
        {
            if (_history.Count == 0)
            {
                return new List<MachineSnapshot>();
            }

            var latest =
                _history.Last!.Value;

            var start =
                latest.CollectedAt
                    .Subtract(duration);

            return _history
                .Where(
                    x =>
                        x.CollectedAt >= start &&
                        x.CollectedAt <=
                            latest.CollectedAt)
                .OrderBy(
                    x =>
                        x.CollectedAt)
                .ToList();
        }
    }

    // ============================================================
    // SNAPSHOT INTERVAL
    // ============================================================

    /// <summary>
    /// Returns the time span covered by the supplied snapshots.
    /// </summary>
    public static TimeSpan GetPeriod(
        IReadOnlyList<MachineSnapshot> snapshots)
    {
        if (
            snapshots == null ||
            snapshots.Count < 2)
        {
            return TimeSpan.Zero;
        }

        var first =
            snapshots[0];

        var last =
            snapshots[^1];

        if (
            last.CollectedAt <=
            first.CollectedAt)
        {
            return TimeSpan.Zero;
        }

        return
            last.CollectedAt -
            first.CollectedAt;
    }

    // ============================================================
    // INSERT CHRONOLOGICALLY
    // ============================================================

    private void InsertChronologically(
        MachineSnapshot snapshot)
    {
        var node =
            _history.Last;

        while (
            node != null &&
            node.Value.CollectedAt >
                snapshot.CollectedAt)
        {
            node =
                node.Previous;
        }

        if (node == null)
        {
            _history.AddFirst(
                snapshot);

            return;
        }

        _history.AddAfter(
            node,
            snapshot);
    }
}