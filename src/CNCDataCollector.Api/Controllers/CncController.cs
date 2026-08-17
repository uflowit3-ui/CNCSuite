using CNCDataCollector.Api.Mapping;
using CNCDataCollector.Collector.Services;
using Microsoft.AspNetCore.Mvc;

namespace CNCDataCollector.Api.Controllers;

[ApiController]
[Route("api/cnc")]
public sealed class CncController : ControllerBase
{
    private readonly SnapshotStore _snapshotStore;
    
    public CncController(
        SnapshotStore snapshotStore)
    {
        _snapshotStore = snapshotStore;
    }

    // GET: /api/cnc/snapshot
    [HttpGet("snapshot")]
    public IActionResult GetSnapshot()
    {
        var snapshot = _snapshotStore.Latest;

        if (snapshot is null)
        {
            return NotFound(new
            {
                success = false,
                message = "CNC snapshot is not available yet."
            });
        }

        return Ok(new
        {
            success = true,
            data = SnapshotMapper.ToDto(snapshot)
        });
    }

    // GET: /api/cnc/status
    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        var snapshot = _snapshotStore.Latest;

        if (snapshot?.Status is null)
        {
            return NotFound(new
            {
                success = false,
                message = "Machine status is not available."
            });
        }

        return Ok(new
        {
            success = true,
            data = new
            {
                state = (int)snapshot.Status.State,
                emergencyStop = snapshot.Status.EmergencyStop,
                feedHold = snapshot.Status.FeedHold,
                cycleStart = snapshot.Status.CycleStart
            }
        });
    }

    // GET: /api/cnc/production
    [HttpGet("production")]
    public IActionResult GetProduction()
    {
        var snapshot = _snapshotStore.Latest;

        if (snapshot?.Production is null)
        {
            return NotFound(new
            {
                success = false,
                message = "Production data is not available."
            });
        }

        return Ok(new
        {
            success = true,
            data = snapshot.Production
        });
    }

    // GET: /api/cnc/runtime
    [HttpGet("runtime")]
    public IActionResult GetRuntime()
    {
        var snapshot = _snapshotStore.Latest;

        if (snapshot?.Runtime is null)
        {
            return NotFound(new
            {
                success = false,
                message = "Runtime data is not available."
            });
        }

        return Ok(new
        {
            success = true,
            data = snapshot.Runtime
        });
    }

    // GET: /api/cnc/program
    [HttpGet("program")]
    public IActionResult GetProgram()
    {
        var snapshot = _snapshotStore.Latest;

        if (snapshot?.Program is null)
        {
            return NotFound(new
            {
                success = false,
                message = "Program data is not available."
            });
        }

        return Ok(new
        {
            success = true,
            data = snapshot.Program
        });
    }

    // GET: /api/cnc/axis
    [HttpGet("axis")]
    public IActionResult GetAxis()
    {
        var snapshot = _snapshotStore.Latest;

        if (snapshot?.AxisPosition is null)
        {
            return NotFound(new
            {
                success = false,
                message = "Axis position data is not available."
            });
        }

        return Ok(new
        {
            success = true,
            data = snapshot.AxisPosition
        });
    }

    // GET: /api/cnc/spindle
    [HttpGet("spindle")]
    public IActionResult GetSpindle()
    {
        var snapshot = _snapshotStore.Latest;

        if (snapshot?.Spindle is null)
        {
            return NotFound(new
            {
                success = false,
                message = "Spindle data is not available."
            });
        }

        return Ok(new
        {
            success = true,
            data = snapshot.Spindle
        });
    }

    // GET: /api/cnc/tool
    [HttpGet("tool")]
    public IActionResult GetTool()
    {
        var snapshot = _snapshotStore.Latest;

        if (snapshot?.Tool is null)
        {
            return NotFound(new
            {
                success = false,
                message = "Tool data is not available."
            });
        }

        return Ok(new
        {
            success = true,
            data = snapshot.Tool
        });
    }

    // GET: /api/cnc/alarm
    [HttpGet("alarm")]
    public IActionResult GetAlarm()
    {
        var snapshot = _snapshotStore.Latest;

        return Ok(new
        {
            success = true,
            data = snapshot?.ActiveAlarm
        });
    }
}