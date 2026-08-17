using CNCDataCollector.Core.Interfaces;
using CNCDataCollector.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using CNCDataCollector.Api.DTOs.Dashboard;

namespace CNCDataCollector.Api.Controllers;

[ApiController]
[Route("api/cnc/machines")]
public sealed class MachinesController : ControllerBase
{
    private readonly IMachineService _machineService;

    // public MachinesController(
    //     IMachineService machineService)
    // {
    //     _machineService = machineService;
    // }
    private readonly IMachineConnectionService _machineConnectionService;

    public MachinesController(
        IMachineService machineService,
        IMachineConnectionService machineConnectionService)
    {
        _machineService = machineService;
        _machineConnectionService = machineConnectionService;
    }

    // =========================================================
    // GET: /api/cnc/machines
    // =========================================================

    [HttpGet]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        var result =
            await _machineService.GetAllAsync(
                cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new
            {
                success = false,
                message = result.Error.Message
            });
        }

        return Ok(new
        {
            success = true,
            data = result.Value
        });
    }

    // =========================================================
    // GET: /api/cnc/machines/{id}
    // =========================================================

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var result =
            await _machineService.GetByIdAsync(
                id,
                cancellationToken);

        if (!result.IsSuccess)
        {
            return NotFound(new
            {
                success = false,
                message = result.Error.Message
            });
        }

        return Ok(new
        {
            success = true,
            data = result.Value
        });
    }

    // =========================================================
    // POST: /api/cnc/machines
    // =========================================================

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] Machine machine,
        CancellationToken cancellationToken)
    {
        if (machine is null)
        {
            return BadRequest(new
            {
                success = false,
                message = "Machine data is required."
            });
        }

        var result =
            await _machineService.CreateAsync(
                machine,
                cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new
            {
                success = false,
                message = result.Error.Message
            });
        }

        // Result<T>.Value is nullable from the compiler's perspective.
        // The successful result is guaranteed to contain the created machine.
        var createdMachine = result.Value;

        if (createdMachine is null)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    success = false,
                    message = "Machine was created but no machine data was returned."
                });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdMachine.Id },
            new
            {
                success = true,
                data = createdMachine
            });
    }

    // =========================================================
    // PUT: /api/cnc/machines/{id}
    // =========================================================

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] Machine machine,
        CancellationToken cancellationToken)
    {
        if (machine is null)
        {
            return BadRequest(new
            {
                success = false,
                message = "Machine data is required."
            });
        }

        if (machine.Id != id)
        {
            return BadRequest(new
            {
                success = false,
                message = "Machine ID in route and request body must match."
            });
        }

        var result =
            await _machineService.UpdateAsync(
                machine,
                cancellationToken);

        if (!result.IsSuccess)
        {
            return NotFound(new
            {
                success = false,
                message = result.Error.Message
            });
        }

        return Ok(new
        {
            success = true,
            data = result.Value
        });
    }

    // =========================================================
    // DELETE: /api/cnc/machines/{id}
    // =========================================================

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var result =
            await _machineService.DeleteAsync(
                id,
                cancellationToken);

        if (!result.IsSuccess)
        {
            return NotFound(new
            {
                success = false,
                message = result.Error.Message
            });
        }

        return Ok(new
        {
            success = true,
            message = "Machine deleted successfully."
        });
    }

    // =========================================================
    // POST: /api/cnc/machines/{id}/enable
    // =========================================================

    [HttpPost("{id:int}/enable")]
    public async Task<IActionResult> Enable(
        int id,
        CancellationToken cancellationToken)
    {
        var result =
            await _machineService.EnableAsync(
                id,
                cancellationToken);

        if (!result.IsSuccess)
        {
            return NotFound(new
            {
                success = false,
                message = result.Error.Message
            });
        }

        return Ok(new
        {
            success = true,
            data = result.Value
        });
    }

    // =========================================================
    // POST: /api/cnc/machines/{id}/disable
    // =========================================================

    [HttpPost("{id:int}/disable")]
    public async Task<IActionResult> Disable(
        int id,
        CancellationToken cancellationToken)
    {
        var result =
            await _machineService.DisableAsync(
                id,
                cancellationToken);

        if (!result.IsSuccess)
        {
            return NotFound(new
            {
                success = false,
                message = result.Error.Message
            });
        }

        return Ok(new
        {
            success = true,
            data = result.Value
        });
    }

    // =========================================================
    // POST: /api/cnc/machines/{id}/test-connection
    // =========================================================

    [HttpPost("{id:int}/test-connection")]
    public async Task<IActionResult> TestConnection(
        int id,
        CancellationToken cancellationToken)
    {
        var result =
            await _machineService.TestConnectionAsync(
                id,
                cancellationToken);

        if (!result.IsSuccess)
        {
            return NotFound(new
            {
                success = false,
                message = result.Error.Message
            });
        }

        return Ok(new
        {
            success = true,
            data = new
            {
                connected = result.Value,
                message = result.Value
                    ? "Machine configuration is valid."
                    : "Machine connection test failed."
            }
        });
    }

    // =========================================================
    // CONNECT
    // =========================================================

    [HttpPost("{id:int}/connect")]
    public async Task<IActionResult> Connect(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            var machine =
                await _machineConnectionService.ConnectAsync(
                    id,
                    cancellationToken);

            return Ok(new
            {
                success = true,
                data = machine
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    // =========================================================
    // DISCONNECT
    // =========================================================

    [HttpPost("{id:int}/disconnect")]
    public async Task<IActionResult> Disconnect(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            var machine =
                await _machineConnectionService.DisconnectAsync(
                    id,
                    cancellationToken);

            return Ok(new
            {
                success = true,
                data = machine
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    // =========================================================
    // HEARTBEAT
    // =========================================================

    [HttpPost("{id:int}/heartbeat")]
    public async Task<IActionResult> Heartbeat(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            var machine =
                await _machineConnectionService.HeartbeatAsync(
                    id,
                    cancellationToken);

            return Ok(new
            {
                success = true,
                data = machine
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    [HttpGet("{id:int}/snapshot")]
    public async Task<IActionResult> GetSnapshot(
        int id,
        CancellationToken cancellationToken)
    {
        var result =
            await _machineService.GetSnapshotAsync(
                id,
                cancellationToken);

        if (!result.IsSuccess)
        {
            return NotFound(new
            {
                success = false,
                error = result.Error
            });
        }

        return Ok(new
        {
            success = true,
            data = result.Value
        });
    }

    [HttpGet("/api/cnc/dashboard/machines/{id:int}")]
    public async Task<IActionResult> GetDashboard(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _machineService.GetSnapshotAsync(
            id,
            cancellationToken);

        if (!result.IsSuccess || result.Value is null)
        {
            return NotFound(new
            {
                success = false,
                error = result.Error
            });
        }

        var snapshot = result.Value;

        if (snapshot is null)
        {
            return NotFound(new
            {
                success = false,
                error = "Machine snapshot not found."
            });
        }

        var machine = snapshot.Machine;

        if (machine is null)
        {
            return NotFound(new
            {
                success = false,
                error = "Machine not found."
            });
        }

        var response = new MachineDashboardDto
        {
            Id = machine.Id,
            MachineCode = machine.MachineCode.Value,
            Name = machine.Name.Value,

            Connection = new ConnectionDashboardDto
            {
                State = (int)machine.Connection.State,
                LastConnected = machine.Connection.LastConnected,
                LastDisconnected = machine.Connection.LastDisconnected,
                LastHeartbeat = machine.Connection.LastHeartbeat,
                Message = machine.Connection.Message
            },

            Status = new StatusDashboardDto
            {
                State = (int)machine.Status.State,
                EmergencyStop = machine.Status.EmergencyStop,
                FeedHold = machine.Status.FeedHold,
                CycleStart = machine.Status.CycleStart
            },

            Production = new ProductionDashboardDto
            {
                PartCount = machine.Production.PartCount,
                GoodPartCount = machine.Production.GoodPartCount,
                RejectPartCount = machine.Production.RejectPartCount,
                TargetQuantity = machine.Production.TargetQuantity,
                ActualQuantity = machine.Production.ActualQuantity,
                CycleTime = machine.Production.CycleTime
            },

            Runtime = new RuntimeDashboardDto
            {
                PowerOnTime = machine.Runtime.PowerOnTime,
                RunningTime = machine.Runtime.RunningTime,
                IdleTime = machine.Runtime.IdleTime,
                AlarmTime = machine.Runtime.AlarmTime,
                StoppedTime = machine.Runtime.StoppedTime,
                LastCycleStart = machine.Runtime.LastCycleStart,
                LastCycleEnd = machine.Runtime.LastCycleEnd
            },

            Program = new ProgramDashboardDto
            {
                ProgramNumber = machine.Program.ProgramNumber,
                ProgramName = machine.Program.ProgramName,
                CurrentBlockNumber = machine.Program.CurrentBlockNumber,
                IsRunning = machine.Program.IsRunning,
                StartTime = machine.Program.StartTime,
                EndTime = machine.Program.EndTime,
                Progress = machine.Program.Progress,
                RemainingCycleTime = machine.Program.RemainingCycleTime
            },

            Axis = new AxisDashboardDto
            {
                X = machine.Axis.X,
                Y = machine.Axis.Y,
                Z = machine.Axis.Z,
                A = machine.Axis.A,
                B = machine.Axis.B,
                C = machine.Axis.C,
                LastUpdated = machine.Axis.LastUpdated
            },

            Spindle = new SpindleDashboardDto
            {
                CurrentRpm = machine.Spindle.CurrentRpm,
                TargetRpm = machine.Spindle.TargetRpm,
                LoadPercentage = machine.Spindle.LoadPercentage,
                Power = machine.Spindle.Power,
                Temperature = machine.Spindle.Temperature,
                IsRunning = machine.Spindle.IsRunning,
                Clockwise = machine.Spindle.Clockwise,
                LastUpdated = machine.Spindle.LastUpdated
            },

            Tool = new ToolDashboardDto
            {
                ToolNumber = machine.Tool.ToolNumber,
                ToolName = machine.Tool.ToolName,
                ToolOffset = machine.Tool.ToolOffset,
                Length = machine.Tool.Length,
                Diameter = machine.Tool.Diameter,
                LifePercentage = machine.Tool.LifePercentage,
                IsActive = machine.Tool.IsActive,
                LastUpdated = machine.Tool.LastUpdated
            },

            ActiveAlarm = machine.ActiveAlarm is null
                ? null
                : new AlarmDashboardDto
                {
                    AlarmNumber = machine.ActiveAlarm.AlarmNumber,
                    Message = machine.ActiveAlarm.Message,
                    Level = (int)machine.ActiveAlarm.Level,
                    StartTime = machine.ActiveAlarm.StartTime,
                    EndTime = machine.ActiveAlarm.EndTime,
                    IsActive = machine.ActiveAlarm.IsActive,
                    Description = machine.ActiveAlarm.Description,
                    ControllerAlarmCode =
                        machine.ActiveAlarm.ControllerAlarmCode
                },

            CollectedAt = snapshot.CollectedAt
        };

        return Ok(new
        {
            success = true,
            data = response
        });
    }
}