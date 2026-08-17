using CNCDataCollector.Collector.Services;
using Microsoft.AspNetCore.Mvc;

namespace CNCDataCollector.Api.Controllers;

[ApiController]
[Route("api/cnc/oee")]
public sealed class OeeController : ControllerBase
{
    private readonly HistoryStore _historyStore;

    public OeeController(
        HistoryStore historyStore)
    {
        _historyStore = historyStore;
    }

    // =========================================================
    // GET /api/cnc/oee
    //
    // Examples:
    //
    // /api/cnc/oee
    // /api/cnc/oee?count=300
    // /api/cnc/oee?count=1000
    // /api/cnc/oee?count=300&idealCycleTimeSeconds=12.5
    //
    // OEE:
    //
    // Availability = Running Time / Power ON Time
    //
    // Performance =
    //     Ideal Cycle Time × Total Parts / Running Time
    //
    // Quality =
    //     Good Parts / Total Parts
    //
    // OEE =
    //     Availability × Performance × Quality
    //
    // Runtime and production counters are cumulative,
    // therefore the selected period uses:
    //
    //     LAST - FIRST
    // =========================================================

    [HttpGet]
    public IActionResult GetOee(
        [FromQuery] int count = 300,
        [FromQuery] double idealCycleTimeSeconds = 12.5)
    {
        // =====================================================
        // VALIDATION
        // =====================================================

        count = Math.Clamp(
            count,
            2,
            3600);

        if (
            !double.IsFinite(
                idealCycleTimeSeconds) ||
            idealCycleTimeSeconds <= 0)
        {
            idealCycleTimeSeconds = 12.5;
        }

        // =====================================================
        // LOAD HISTORY
        // =====================================================

        var history = _historyStore
            .GetLast(count)
            .OrderBy(x => x.CollectedAt)
            .ToList();

        // =====================================================
        // NOT ENOUGH DATA
        // =====================================================

        if (history.Count < 2)
        {
            return Ok(new
            {
                success = true,

                data = new
                {
                    available = false,

                    message =
                        "Not enough history data to calculate OEE.",

                    snapshotCount =
                        history.Count,

                    availability = 0d,
                    performance = 0d,
                    quality = 0d,
                    oee = 0d,

                    totalParts = 0,
                    goodParts = 0,
                    rejectParts = 0,
                    targetQuantity = 0,

                    powerOnSeconds = 0d,
                    runningSeconds = 0d,
                    idleSeconds = 0d,
                    alarmSeconds = 0d,
                    stoppedSeconds = 0d,

                    idealCycleTimeSeconds =
                        Math.Round(
                            idealCycleTimeSeconds,
                            3),

                    averageCycleTimeSeconds = 0d,

                    cycleTimeSampleCount = 0
                }
            });
        }

        // =====================================================
        // FIRST / LAST SNAPSHOT
        // =====================================================

        var first =
            history[0];

        var last =
            history[^1];

        // =====================================================
        // PERIOD
        // =====================================================

        var startTime =
            first.CollectedAt;

        var endTime =
            last.CollectedAt;

        var period =
            endTime -
            startTime;

        var periodSeconds =
            Math.Max(
                0,
                period.TotalSeconds);

        // =====================================================
        // PRODUCTION
        // =====================================================

        var firstProduction =
            first.Production;

        var lastProduction =
            last.Production;

        var totalParts =
            CalculateCounterDelta(
                firstProduction?.PartCount ?? 0,
                lastProduction?.PartCount ?? 0);

        var goodParts =
            CalculateCounterDelta(
                firstProduction?.GoodPartCount ?? 0,
                lastProduction?.GoodPartCount ?? 0);

        var rejectParts =
            CalculateCounterDelta(
                firstProduction?.RejectPartCount ?? 0,
                lastProduction?.RejectPartCount ?? 0);

        // Target quantity is not cumulative.

        var targetQuantity =
            Math.Max(
                0,
                lastProduction?.TargetQuantity ?? 0);

        // Actual quantity is cumulative.

        var actualQuantity =
            CalculateCounterDelta(
                firstProduction?.ActualQuantity ?? 0,
                lastProduction?.ActualQuantity ?? 0);

        // =====================================================
        // RUNTIME
        // =====================================================

        var firstRuntime =
            first.Runtime;

        var lastRuntime =
            last.Runtime;

        var powerOnSeconds =
            CalculateTimeSpanDeltaSeconds(
                firstRuntime?.PowerOnTime,
                lastRuntime?.PowerOnTime);

        var runningSeconds =
            CalculateTimeSpanDeltaSeconds(
                firstRuntime?.RunningTime,
                lastRuntime?.RunningTime);

        var idleSeconds =
            CalculateTimeSpanDeltaSeconds(
                firstRuntime?.IdleTime,
                lastRuntime?.IdleTime);

        var alarmSeconds =
            CalculateTimeSpanDeltaSeconds(
                firstRuntime?.AlarmTime,
                lastRuntime?.AlarmTime);

        var stoppedSeconds =
            CalculateTimeSpanDeltaSeconds(
                firstRuntime?.StoppedTime,
                lastRuntime?.StoppedTime);

        // =====================================================
        // RUNTIME SANITIZATION
        // =====================================================

        powerOnSeconds =
            SanitizeRuntime(
                powerOnSeconds,
                periodSeconds);

        runningSeconds =
            SanitizeRuntime(
                runningSeconds,
                periodSeconds);

        idleSeconds =
            SanitizeRuntime(
                idleSeconds,
                periodSeconds);

        alarmSeconds =
            SanitizeRuntime(
                alarmSeconds,
                periodSeconds);

        stoppedSeconds =
            SanitizeRuntime(
                stoppedSeconds,
                periodSeconds);

        // Running time cannot logically exceed power-on time.

        runningSeconds =
            Math.Min(
                runningSeconds,
                powerOnSeconds);

        // =====================================================
        // CYCLE TIME
        // =====================================================

        var cycleTimes =
            history
                .Where(
                    x =>
                        x.Production != null &&
                        x.Production.CycleTime >
                            TimeSpan.Zero)
                .Select(
                    x =>
                        x.Production!
                            .CycleTime
                            .TotalSeconds)
                .Where(
                    x =>
                        double.IsFinite(x) &&
                        x > 0)
                .ToList();

        var averageCycleTime =
            cycleTimes.Count > 0
                ? cycleTimes.Average()
                : 0d;

        // =====================================================
        // AVAILABILITY
        //
        // Running / Power ON
        // =====================================================

        var availability =
            powerOnSeconds > 0
                ? (
                    runningSeconds /
                    powerOnSeconds
                ) * 100d
                : 0d;

        availability =
            ClampPercentage(
                availability);

        // =====================================================
        // PERFORMANCE
        //
        // Ideal Cycle Time × Total Parts
        // --------------------------------
        // Running Time
        //
        // Result is converted to percentage.
        // =====================================================

        var performance = 0d;

        if (
            runningSeconds > 0 &&
            totalParts > 0)
        {
            performance =
                (
                    idealCycleTimeSeconds *
                    totalParts /
                    runningSeconds
                ) * 100d;
        }

        performance =
            ClampPercentage(
                performance);

        // =====================================================
        // QUALITY
        //
        // Good Parts / Total Parts
        // =====================================================

        var quality =
            totalParts > 0
                ? (
                    (double)goodParts /
                    totalParts
                ) * 100d
                : 0d;

        quality =
            ClampPercentage(
                quality);

        // =====================================================
        // OEE
        //
        // A × P × Q
        //
        // Values are percentages, therefore:
        //
        // OEE = A × P × Q / 10000
        // =====================================================

        var oee =
            (
                availability *
                performance *
                quality
            ) / 10000d;

        oee =
            ClampPercentage(
                oee);

        // =====================================================
        // TARGET COMPLETION
        // =====================================================

        var targetCompletion =
            targetQuantity > 0
                ? (
                    (double)totalParts /
                    targetQuantity
                ) * 100d
                : 0d;

        targetCompletion =
            ClampPercentage(
                targetCompletion);

        // =====================================================
        // RESPONSE
        // =====================================================

        return Ok(new
        {
            success = true,

            data = new
            {
                available = true,

                snapshotCount =
                    history.Count,

                // =============================================
                // PERIOD
                // =============================================

                period = new
                {
                    start =
                        startTime,

                    end =
                        endTime,

                    durationSeconds =
                        Math.Round(
                            periodSeconds,
                            2)
                },

                // =============================================
                // OEE
                // =============================================

                availability =
                    Math.Round(
                        availability,
                        2),

                performance =
                    Math.Round(
                        performance,
                        2),

                quality =
                    Math.Round(
                        quality,
                        2),

                oee =
                    Math.Round(
                        oee,
                        2),

                // =============================================
                // PRODUCTION
                // =============================================

                totalParts,

                goodParts,

                rejectParts,

                targetQuantity,

                actualQuantity,

                targetCompletion =
                    Math.Round(
                        targetCompletion,
                        2),

                // =============================================
                // RUNTIME
                // =============================================

                powerOnSeconds =
                    Math.Round(
                        powerOnSeconds,
                        2),

                runningSeconds =
                    Math.Round(
                        runningSeconds,
                        2),

                idleSeconds =
                    Math.Round(
                        idleSeconds,
                        2),

                alarmSeconds =
                    Math.Round(
                        alarmSeconds,
                        2),

                stoppedSeconds =
                    Math.Round(
                        stoppedSeconds,
                        2),

                // =============================================
                // CYCLE TIME
                // =============================================

                idealCycleTimeSeconds =
                    Math.Round(
                        idealCycleTimeSeconds,
                        3),

                averageCycleTimeSeconds =
                    Math.Round(
                        averageCycleTime,
                        3),

                cycleTimeSampleCount =
                    cycleTimes.Count
            }
        });
    }

    // =========================================================
    // COUNTER DELTA
    // =========================================================

    private static int CalculateCounterDelta(
        int first,
        int last)
    {
        // Normal cumulative counter.

        if (last >= first)
        {
            return last - first;
        }

        /*
         * Counter reset / machine restart.
         *
         * We don't know the counter maximum, so safely
         * return the latest value instead of negative data.
         */

        return Math.Max(
            0,
            last);
    }

    // =========================================================
    // TIMESPAN DELTA
    // =========================================================

    private static double CalculateTimeSpanDeltaSeconds(
        TimeSpan? first,
        TimeSpan? last)
    {
        var firstSeconds =
            first?.TotalSeconds ?? 0d;

        var lastSeconds =
            last?.TotalSeconds ?? 0d;

        if (
            !double.IsFinite(
                firstSeconds) ||
            !double.IsFinite(
                lastSeconds))
        {
            return 0d;
        }

        // Normal cumulative runtime counter.

        if (lastSeconds >= firstSeconds)
        {
            return lastSeconds -
                   firstSeconds;
        }

        /*
         * Runtime counter reset.
         *
         * Without knowing the counter maximum, latest value
         * is the safest recoverable value.
         */

        return Math.Max(
            0,
            lastSeconds);
    }

    // =========================================================
    // RUNTIME SANITIZATION
    // =========================================================

    private static double SanitizeRuntime(
        double value,
        double periodSeconds)
    {
        if (
            !double.IsFinite(value) ||
            value < 0)
        {
            return 0d;
        }

        if (periodSeconds <= 0)
        {
            return 0d;
        }

        return Math.Min(
            value,
            periodSeconds);
    }

    // =========================================================
    // PERCENTAGE CLAMP
    // =========================================================

    private static double ClampPercentage(
        double value)
    {
        if (
            !double.IsFinite(
                value))
        {
            return 0d;
        }

        return Math.Clamp(
            value,
            0d,
            100d);
    }
}