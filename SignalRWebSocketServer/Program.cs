using SignalRWebSocketServer.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowed((host) => true) // Allow any origin
              .AllowCredentials(); // Allow credentials (e.g., cookies)
    });
});

builder.Services.AddSignalR();

var app = builder.Build();

app.UseCors("AllowAllOrigins");
app.MapHub<PricerHub>("/pricer");

app.Run();