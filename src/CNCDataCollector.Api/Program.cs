using CNCDataCollector.Api.Hubs;
using CNCDataCollector.Api.Services;
using CNCDataCollector.Collector.DependencyInjection;
using CNCDataCollector.Core.Interfaces;
using CNCDataCollector.Core.Services;
using CNCDataCollector.Infrastructure.DependencyInjection;
using CNCDataCollector.Infrastructure.Repositories;
using CNCDataCollector.MockDriver.Drivers;

var builder = WebApplication.CreateBuilder(args);

// --------------------------------------------------
// Services
// --------------------------------------------------

builder.Services.AddCollectorServices();
builder.Services.AddSignalR();


builder.Services.AddInfrastructureServices(
    builder.Configuration);

// Machine Configuration Service
// MachineService currently uses in-memory storage,
// therefore Singleton is required so machine data
// remains available between API requests.
builder.Services.AddScoped<
    IMachineRepository,
    MachineRepository>();

builder.Services.AddScoped<
    IMachineService,
    MachineService>();

builder.Services.AddScoped<
    IMachineConnectionService,
    MachineConnectionService>();

builder.Services.AddSingleton<
    ICncDriver,
    MockCncDriver>();

// --------------------------------------------------
// CORS
// --------------------------------------------------

builder.Services.AddCors(options =>
{
    options.AddPolicy("Dashboard", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// --------------------------------------------------
// Controllers
// --------------------------------------------------

builder.Services.AddControllers();



// --------------------------------------------------
// SignalR
// --------------------------------------------------

builder.Services.AddSignalR();

builder.Services.AddSingleton<
    ISnapshotPublisher,
    SignalRSnapshotPublisher>();
    

// --------------------------------------------------
// Swagger
// --------------------------------------------------

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --------------------------------------------------
// Build
// --------------------------------------------------

var app = builder.Build();

app.UseStaticFiles();
// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.UseCors("Dashboard");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Local development is HTTP
// app.UseHttpsRedirection();

// --------------------------------------------------
// API Controllers
// --------------------------------------------------

app.MapControllers();

// --------------------------------------------------
// SignalR
// --------------------------------------------------

app.MapHub<CncHub>("/hubs/cnc");

app.MapHub<CncDashboardHub>("/hubs/cnc-dashboard");

// --------------------------------------------------
// Run
// --------------------------------------------------


app.Run();