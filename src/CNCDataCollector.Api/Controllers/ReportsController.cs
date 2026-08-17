using CNCDataCollector.Collector.Services;
using Microsoft.AspNetCore.Mvc;

namespace CNCDataCollector.Api.Controllers;

[ApiController]
[Route("api/cnc/reports")]
public sealed class ReportsController : ControllerBase
{
    private readonly HistoryStore _historyStore;

    public ReportsController(
        HistoryStore historyStore)
    {
        _historyStore =
            historyStore;
    }

    // =========================================================
    // GET /api/cnc/reports
    //
    // Examples:
    //
    // /api/cnc/reports
    // /api/cnc/reports?count=300
    // /api/cnc/reports?count=1000
    //
    // IMPORTANT:
    //
    // Production counters and Runtime counters are cumulative.
    // Therefore report values are calculated from:
    //
    //     LAST SNAPSHOT - FIRST SNAPSHOT
    //
    // for the selected history window.
    // =========================================================

    [HttpGet]
    public IActionResult GetReport(
        [FromQuery] int count = 300)
    {
        // =====================================================
        // VALIDATE COUNT
        // =====================================================

        count =
            Math.Clamp(
                count,
                2,
                3600);

        // =====================================================
        // LOAD HISTORY
        // =====================================================

        var history =
            _historyStore
                .GetLast(count)
                .OrderBy(
                    x => x.CollectedAt)
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
                        "Not enough history data to generate report.",

                    snapshotCount =
                        history.Count
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
        // REPORT PERIOD
        // =====================================================

        var startTime =
            first.CollectedAt;

        var endTime =
            last.CollectedAt;

        var reportDuration =
            endTime -
            startTime;

        var durationSeconds =
            Math.Max(
                0,
                reportDuration.TotalSeconds);

        // =====================================================
        // PRODUCTION
        //
        // Production counters are cumulative.
        //
        // Selected period:
        //
        //     LAST - FIRST
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

        // Target is a current target.
        // Do NOT subtract it.

        var targetQuantity =
            Math.Max(
                0,
                lastProduction?.TargetQuantity ?? 0);

        var actualQuantity =
            CalculateCounterDelta(
                firstProduction?.ActualQuantity ?? 0,
                lastProduction?.ActualQuantity ?? 0);

        // =====================================================
        // CYCLE TIME
        //
        // Use cycle-time samples available in the selected
        // history period.
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

        var minimumCycleTime =
            cycleTimes.Count > 0
                ? cycleTimes.Min()
                : 0d;

        var maximumCycleTime =
            cycleTimes.Count > 0
                ? cycleTimes.Max()
                : 0d;

        // =====================================================
        // RUNTIME
        //
        // Runtime values are cumulative TimeSpan values.
        //
        // Therefore:
        //
        //     Period Runtime =
        //     Last Runtime - First Runtime
        //
        // This is the important correction.
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
        // RUNTIME SANITY
        // =====================================================

        powerOnSeconds =
            Math.Max(
                0,
                powerOnSeconds);

        runningSeconds =
            Math.Max(
                0,
                runningSeconds);

        idleSeconds =
            Math.Max(
                0,
                idleSeconds);

        alarmSeconds =
            Math.Max(
                0,
                alarmSeconds);

        stoppedSeconds =
            Math.Max(
                0,
                stoppedSeconds);

        // =====================================================
        // LIMIT RUNTIME TO REPORT PERIOD
        //
        // A runtime value cannot be greater than the selected
        // report duration.
        // =====================================================

        if (durationSeconds > 0)
        {
            powerOnSeconds =
                Math.Min(
                    powerOnSeconds,
                    durationSeconds);

            runningSeconds =
                Math.Min(
                    runningSeconds,
                    durationSeconds);

            idleSeconds =
                Math.Min(
                    idleSeconds,
                    durationSeconds);

            alarmSeconds =
                Math.Min(
                    alarmSeconds,
                    durationSeconds);

            stoppedSeconds =
                Math.Min(
                    stoppedSeconds,
                    durationSeconds);
        }

        // =====================================================
        // QUALITY
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
        // UTILIZATION
        //
        // Running Time / Power ON Time
        // =====================================================

        var utilization =
            powerOnSeconds > 0
                ? (
                    runningSeconds /
                    powerOnSeconds
                ) * 100d
                : 0d;

        utilization =
            ClampPercentage(
                utilization);

        // =====================================================
        // REJECT RATE
        // =====================================================

        var rejectRate =
            totalParts > 0
                ? (
                    (double)rejectParts /
                    totalParts
                ) * 100d
                : 0d;

        rejectRate =
            ClampPercentage(
                rejectRate);

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
        //
        // Existing response structure is preserved so the
        // current Reports.tsx continues to work.
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
                            durationSeconds,
                            2)
                },

                // =============================================
                // PRODUCTION
                // =============================================

                production = new
                {
                    totalParts,

                    goodParts,

                    rejectParts,

                    targetQuantity,

                    actualQuantity,

                    targetCompletion =
                        Math.Round(
                            targetCompletion,
                            2)
                },

                // =============================================
                // CYCLE TIME
                // =============================================

                cycleTime = new
                {
                    averageSeconds =
                        Math.Round(
                            averageCycleTime,
                            3),

                    minimumSeconds =
                        Math.Round(
                            minimumCycleTime,
                            3),

                    maximumSeconds =
                        Math.Round(
                            maximumCycleTime,
                            3),

                    sampleCount =
                        cycleTimes.Count
                },

                // =============================================
                // RUNTIME
                // =============================================

                runtime = new
                {
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
                            2)
                },

                // =============================================
                // PERFORMANCE
                // =============================================

                performance = new
                {
                    quality =
                        Math.Round(
                            quality,
                            2),

                    rejectRate =
                        Math.Round(
                            rejectRate,
                            2),

                    utilization =
                        Math.Round(
                            utilization,
                            2)
                }
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
         * Without knowing the counter maximum we cannot
         * reconstruct the missing value safely.
         *
         * Return latest counter value instead of negative data.
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
         * Without a known maximum, safely return latest value.
         */

        return Math.Max(
            0,
            lastSeconds);
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