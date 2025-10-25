using ListaCompras.BW.CU;
using ListaCompras.BW.Interfaces.BW;
using ListaCompras.BW.Interfaces.DA;
using ListaCompras.DA.Acciones;
using ListaCompras.DA.Config;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE SERVICIOS
// ═══════════════════════════════════════════════════════════════

// Configurar DbContext con SQL Server
builder.Services.AddDbContext<ListaComprasContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Inyección de dependencias - Business Workflow (BW)
builder.Services.AddScoped<IGestionListaBW, GestionListaBW>();
builder.Services.AddScoped<IGestionItemBW, GestionItemBW>();

// Inyección de dependencias - Data Access (DA)
builder.Services.AddScoped<IGestionListaDA, GestionListaDA>();
builder.Services.AddScoped<IGestionItemDA, GestionItemDA>();

// Configurar CORS (para que Alexa pueda comunicarse con tu API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAlexa", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Agregar controllers
builder.Services.AddControllers();

// Configurar Swagger (documentación de API)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL PIPELINE HTTP
// ═══════════════════════════════════════════════════════════════

// Habilitar Swagger en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Aplicar CORS
app.UseCors("AllowAlexa");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();