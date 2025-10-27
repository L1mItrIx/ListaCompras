using ListaCompras.BC.Modelos;
using ListaCompras.BC.Estado;
using ListaCompras.BW.Interfaces.BW;
using Microsoft.AspNetCore.Mvc;

namespace ListaCompras.API.Controllers
{
    /// <summary>
    /// Controller para gestionar items/productos de las listas
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class ItemsController : ControllerBase
    {
        private readonly IGestionItemBW gestionItemBW;
        private readonly ILogger<ItemsController> logger;

        public ItemsController(IGestionItemBW gestionItemBW, ILogger<ItemsController> logger)
        {
            this.gestionItemBW = gestionItemBW;
            this.logger = logger;
        }

        /// <summary>
        /// POST /Items
        /// Agrega un nuevo item a una lista
        /// </summary>
        /// <param name="item">Datos del item a agregar</param>
        /// <returns>200 OK si se agregó, 400 BadRequest si falló</returns>
        [HttpPost]
        public async Task<ActionResult> AgregarItem([FromBody] ItemLista item)
        {
            try
            {
                bool resultado = await gestionItemBW.agregarItem(item);

                if (!resultado)
                {
                    return BadRequest(new { mensaje = "No se pudo agregar el item. Verifica que la lista exista y los datos sean correctos." });
                }

                return Ok(new
                {
                    mensaje = "Item agregado exitosamente",
                    idItem = item.IdItem,
                    nombreProducto = item.NombreProducto,
                    cantidad = item.Cantidad,
                    unidad = item.Unidad
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al agregar item");
                return StatusCode(500, new { mensaje = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// GET /Items/lista/{idLista}
        /// Obtiene todos los items de una lista
        /// </summary>
        /// <param name="idLista">ID de la lista</param>
        /// <returns>200 OK con los items</returns>
        [HttpGet("lista/{idLista}")]
        public async Task<ActionResult<List<ItemLista>>> ObtenerItemsDeLista(Guid idLista)
        {
            try
            {
                var items = await gestionItemBW.obtenerItemsDeLista(idLista);

                return Ok(new
                {
                    idLista = idLista,
                    cantidad = items.Count,
                    items = items
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al obtener items de la lista");
                return StatusCode(500, new { mensaje = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// GET /Items/pendientes/{idLista}
        /// Obtiene solo los items pendientes de una lista
        /// </summary>
        /// <param name="idLista">ID de la lista</param>
        /// <returns>200 OK con los items pendientes</returns>
        [HttpGet("pendientes/{idLista}")]
        public async Task<ActionResult<List<ItemLista>>> ObtenerItemsPendientes(Guid idLista)
        {
            try
            {
                var items = await gestionItemBW.obtenerItemsPendietes(idLista);

                if (items.Count == 0)
                {
                    return Ok(new
                    {
                        mensaje = "No hay items pendientes en esta lista",
                        idLista = idLista,
                        cantidad = 0,
                        items = items
                    });
                }

                return Ok(new
                {
                    mensaje = $"Tienes {items.Count} item(s) pendiente(s)",
                    idLista = idLista,
                    cantidad = items.Count,
                    items = items
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al obtener items pendientes");
                return StatusCode(500, new { mensaje = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// DELETE /Items/{id}
        /// Elimina un item de una lista
        /// </summary>
        /// <param name="id">ID del item a eliminar</param>
        /// <returns>200 OK si se eliminó, 404 NotFound si no existe</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> EliminarItem(Guid id)
        {
            try
            {
                bool resultado = await gestionItemBW.eliminarItem(id);

                if (!resultado)
                {
                    return NotFound(new { mensaje = "Item no encontrado" });
                }

                return Ok(new { mensaje = "Item eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al eliminar item");
                return StatusCode(500, new { mensaje = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// PUT /Items/{id}/estado
        /// Cambia el estado de un item (Pendiente ↔ Comprado)
        /// </summary>
        /// <param name="id">ID del item</param>
        /// <param name="request">Objeto con el nuevo estado</param>
        /// <returns>200 OK si se cambió, 404 NotFound si no existe</returns>
        [HttpPut("{id}/estado")]
        public async Task<ActionResult> MarcarEstadoItem(Guid id, [FromBody] CambiarEstadoRequest request)
        {
            try
            {
                bool resultado = await gestionItemBW.marcarEstadoItem(id, request.NuevoEstado);

                if (!resultado)
                {
                    return NotFound(new { mensaje = "Item no encontrado o estado inválido" });
                }

                string estadoTexto = request.NuevoEstado == ItemEstado.Comprado ? "comprado" : "pendiente";

                return Ok(new
                {
                    mensaje = $"Item marcado como {estadoTexto}",
                    idItem = id,
                    nuevoEstado = request.NuevoEstado
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al cambiar estado del item");
                return StatusCode(500, new { mensaje = "Error interno del servidor" });
            }
        }
    }

    /// <summary>
    /// DTO (Data Transfer Object) para cambiar el estado de un item
    /// </summary>
    public class CambiarEstadoRequest
    {
        public ItemEstado NuevoEstado { get; set; }
    }
}