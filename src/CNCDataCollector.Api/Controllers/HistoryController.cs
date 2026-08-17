using CNCDataCollector.Api.Mapping;
using CNCDataCollector.Collector.Services;
using Microsoft.AspNetCore.Mvc;

namespace CNCDataCollector.Api.Controllers;

[ApiController]
[Route("api/cnc/history")]
public sealed class HistoryController : ControllerBase
{
    private readonly HistoryStore _historyStore;

    public HistoryController(HistoryStore historyStore)
    {
        _historyStore = historyStore;
    }

    // GET /api/cnc/history
    [HttpGet]
    public IActionResult GetHistory([FromQuery] int count = 300)
    {
        count = Math.Clamp(count, 1, 3600);

        var history = _historyStore.GetLast(count);

        return Ok(new
        {
            success = true,
            count = history.Count,
            data = history
        });
    }

    // GET /api/cnc/history/spindle
    [HttpGet("spindle")]
    public IActionResult GetSpindleHistory(
        [FromQuery] int count = 300)
    {
        count = Math.Clamp(count, 1, 3600);

        var history = _historyStore
            .GetLast(count)
            .Select(x => new
            {
                timestamp = x.CollectedAt,
                rpm = x.Spindle?.CurrentRpm ?? 0,
                targetRpm = x.Spindle?.TargetRpm ?? 0,
                load = x.Spindle?.LoadPercentage ?? 0,
                power = x.Spindle?.Power ?? 0,
                temperature = x.Spindle?.Temperature ?? 0,
                isRunning = x.Spindle?.IsRunning ?? false
            });

        return Ok(new
        {
            success = true,
            count = history.Count(),
            data = history
        });
    }

    // GET /api/cnc/history/axis
    [HttpGet("axis")]
    public IActionResult GetAxisHistory(
        [FromQuery] int count = 300)
    {
        count = Math.Clamp(count, 1, 3600);

        var history = _historyStore
            .GetLast(count)
            .Select(x => new
            {
                timestamp = x.CollectedAt,
                x = x.AxisPosition?.X ?? 0,
                y = x.AxisPosition?.Y ?? 0,
                z = x.AxisPosition?.Z ?? 0,
                a = x.AxisPosition?.A ?? 0,
                b = x.AxisPosition?.B ?? 0,
                c = x.AxisPosition?.C ?? 0
            });

        return Ok(new
        {
            success = true,
            count = history.Count(),
            data = history
        });
    }

    // GET /api/cnc/history/production
    [HttpGet("production")]
    public IActionResult GetProductionHistory(
        [FromQuery] int count = 300)
    {
        count = Math.Clamp(count, 1, 3600);

        var history = _historyStore
            .GetLast(count)
            .Select(x => new
            {
                timestamp = x.CollectedAt,
                partCount = x.Production?.PartCount ?? 0,
                goodParts = x.Production?.GoodPartCount ?? 0,
                rejectParts = x.Production?.RejectPartCount ?? 0,
                targetQuantity = x.Production?.TargetQuantity ?? 0,
                actualQuantity = x.Production?.ActualQuantity ?? 0,
                cycleTime = x.Production?.CycleTime
                    .TotalSeconds ?? 0
            });

        return Ok(new
        {
            success = true,
            count = history.Count(),
            data = history
        });
    }

    // GET /api/cnc/history/runtime
    [HttpGet("runtime")]
    public IActionResult GetRuntimeHistory(
        [FromQuery] int count = 300)
    {
        count = Math.Clamp(count, 1, 3600);

        var history = _historyStore
            .GetLast(count)
            .Select(x => new
            {
                timestamp = x.CollectedAt,
                powerOnSeconds =
                    x.Runtime?.PowerOnTime.TotalSeconds ?? 0,

                runningSeconds =
                    x.Runtime?.RunningTime.TotalSeconds ?? 0,

                idleSeconds =
                    x.Runtime?.IdleTime.TotalSeconds ?? 0,

                alarmSeconds =
                    x.Runtime?.AlarmTime.TotalSeconds ?? 0,

                stoppedSeconds =
                    x.Runtime?.StoppedTime.TotalSeconds ?? 0
            });

        return Ok(new
        {
            success = true,
            count = history.Count(),
            data = history
        });
    }

    // GET /api/cnc/history/temperature
    [HttpGet("temperature")]
    public IActionResult GetTemperatureHistory(
        [FromQuery] int count = 300)
    {
        count = Math.Clamp(count, 1, 3600);

        var history = _historyStore
            .GetLast(count)
            .Select(x => new
            {
                timestamp = x.CollectedAt,
                spindleTemperature =
                    x.Spindle?.Temperature ?? 0
            });

        return Ok(new
        {
            success = true,
            count = history.Count(),
            data = history
        });
    }

    // GET /api/cnc/history/alarms
    [HttpGet("alarms")]
    public IActionResult GetAlarmHistory(
        [FromQuery] int count = 300)
    {
        count = Math.Clamp(count, 1, 3600);

        var history = _historyStore
            .GetLast(count)
            .Where(x => x.ActiveAlarm != null)
            .Select(x => new
            {
                timestamp = x.CollectedAt,
                alarmNumber = x.ActiveAlarm!.AlarmNumber,
                message = x.ActiveAlarm.Message,
                level = x.ActiveAlarm.Level,
                description = x.ActiveAlarm.Description,
                controllerAlarmCode =
                    x.ActiveAlarm.ControllerAlarmCode,
                startTime = x.ActiveAlarm.StartTime,
                endTime = x.ActiveAlarm.EndTime,
                isActive = x.ActiveAlarm.IsActive
            });

        return Ok(new
        {
            success = true,
            count = history.Count(),
            data = history
        });
    }
}