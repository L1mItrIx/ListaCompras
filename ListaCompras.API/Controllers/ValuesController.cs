using ListaCompras.BC.Modelos;
using ListaCompras.BW.Interfaces.BW;
using Microsoft.AspNetCore.Mvc;

namespace ListaCompras.API.Controllers
{
    /// <summary>
    /// Controller para gestionar listas de compras
    /// Expone endpoints HTTP que Alexa puede consumir
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class ListasController : ControllerBase
    {
        private readonly IGestionListaBW gestionListaBW;
        private readonly ILogger<ListasController> logger;

        /// <summary>
        /// Constructor con inyección de dependencias
        /// </summary>
        public ListasController(IGestionListaBW gestionListaBW, ILogger<ListasController> logger)
        {
            this.gestionListaBW = gestionListaBW;
            this.logger = logger;
        }

        /// <summary>
        /// POST /Listas
        /// Crea una nueva lista de compras
        /// </summary>
        /// <param name="lista">Datos de la lista a crear</param>
        /// <returns>200 OK si se creó, 400 BadRequest si falló</returns>
        [HttpPost]
        public async Task<ActionResult> CrearLista([FromBody] ListaCompra lista)
        {
            try
            {
                // Llamar a BW para crear la lista
                bool resultado = await gestionListaBW.crearLista(lista);

                if (!resultado)
                {
                    return BadRequest(new { mensaje = "No se pudo crear la lista. Verifica los datos o que no exista una lista con el mismo nombre hoy." });
                }

                return Ok(new
                {
                    mensaje = "Lista creada exitosamente",
                    idLista = lista.IdLista,
                    nombre = lista.Nombre
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al crear lista");
                return StatusCode(500, new { mensaje = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// GET /Listas/activas
        /// Obtiene todas las listas activas
        /// </summary>
        /// <returns>200 OK con la lista de listas</returns>
        [HttpGet("activas")]
        public async Task<ActionResult<List<ListaCompra>>> ObtenerListasActivas()
        {
            try
            {
                var listas = await gestionListaBW.obtenerListasActivas();

                return Ok(new
                {
                    cantidad = listas.Count,
                    listas = listas
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al obtener listas activas");
                return StatusCode(500, new { mensaje = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// GET /Listas/hoy
        /// Obtiene las listas de hoy
        /// </summary>
        /// <returns>200 OK con las listas de hoy</returns>
        [HttpGet("hoy")]
        public async Task<ActionResult<List<ListaCompra>>> ObtenerListasDeHoy()
        {
            try
            {
                var listas = await gestionListaBW.obtenerListasDeHoy();

                if (listas.Count == 0)
                {
                    return Ok(new
                    {
                        mensaje = "No tienes listas para hoy",
                        cantidad = 0,
                        listas = listas
                    });
                }

                return Ok(new
                {
                    mensaje = $"Tienes {listas.Count} lista(s) para hoy",
                    cantidad = listas.Count,
                    listas = listas
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al obtener listas de hoy");
                return StatusCode(500, new { mensaje = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// GET /Listas/fecha/{fecha}
        /// Obtiene las listas de una fecha específica
        /// </summary>
        /// <param name="fecha">Fecha en formato yyyy-MM-dd</param>
        /// <returns>200 OK con las listas de esa fecha</returns>
        [HttpGet("fecha/{fecha}")]
        public async Task<ActionResult<List<ListaCompra>>> ObtenerListasPorFecha(DateTime fecha)
        {
            try
            {
                var listas = await gestionListaBW.obtenerListasPorFechas(fecha);

                return Ok(new
                {
                    fecha = fecha.ToString("yyyy-MM-dd"),
                    cantidad = listas.Count,
                    listas = listas
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al obtener listas por fecha");
                return StatusCode(500, new { mensaje = "Error interno del servidor" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> EliminarLista(Guid id)
        {
            try
            {
                bool resultado = await gestionListaBW.eliminarLista(id);

                if (!resultado)
                {
                    return NotFound(new { mensaje = "Lista no encontrada o ya fue eliminada" });
                }

                return Ok(new { mensaje = "Lista eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al eliminar lista");
                return StatusCode(500, new { mensaje = "Error interno del servidor" });
            }
        }
    }
}