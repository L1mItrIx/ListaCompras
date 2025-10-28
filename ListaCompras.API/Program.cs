using ListaCompras.BW.CU;
using ListaCompras.BW.Interfaces.BW;
using ListaCompras.BW.Interfaces.DA;
using ListaCompras.DA.Acciones;
using ListaCompras.DA.Config;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ListaComprasContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IGestionListaBW, GestionListaBW>();
builder.Services.AddScoped<IGestionItemBW, GestionItemBW>();

builder.Services.AddScoped<IGestionListaDA, GestionListaDA>();
builder.Services.AddScoped<IGestionItemDA, GestionItemDA>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAlexa", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//CORS
app.UseCors("AllowAlexa");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();