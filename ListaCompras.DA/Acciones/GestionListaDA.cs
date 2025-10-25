using ListaCompras.BC.Modelos;
using ListaCompras.BC.Estado;
using ListaCompras.BW.Interfaces.DA;
using ListaCompras.DA.Config;
using ListaCompras.DA.Entidades;
using Microsoft.EntityFrameworkCore;

namespace ListaCompras.DA.Acciones
{
    public class GestionListaDA : IGestionListaDA
    {
        private readonly ListaComprasContext listaComprasContext;

        public GestionListaDA(ListaComprasContext listaComprasContext)
        {
            this.listaComprasContext = listaComprasContext;
        }

        public async Task<bool> crearLista(ListaCompra lista)
        {
            try
            {
                var listaDA = new ListaCompraDA
                {
                    IdLista = lista.IdLista,
                    Nombre = lista.Nombre,
                    FechaObjetivo = lista.FechaObjetivo,
                    Estado = lista.Estado
                };
                listaComprasContext.ListaCompra.Add(listaDA);
                await listaComprasContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex){return false;}
        }

        public async Task<bool> eliminarLista(Guid idLista)
        {
            try
            {
                var lista = await listaComprasContext.ListaCompra.FindAsync(idLista);
                if (lista == null)
                    return false;
                lista.Estado = ListaEstado.Eliminada;
                await listaComprasContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex){return false;}
        }

        public async Task<List<ListaCompra>> obtenerListasActivas()
        {
            try
            {   //select from de estados = 0 (activo)
                var listasDA = await listaComprasContext.ListaCompra
                    .Where(l => l.Estado == ListaEstado.Activa)
                    .ToListAsync();
                var listas = listasDA.Select(l => new ListaCompra
                {
                    IdLista = l.IdLista,
                    Nombre = l.Nombre,
                    FechaObjetivo = l.FechaObjetivo,
                    Estado = l.Estado
                }).ToList();
                return listas;
            }catch(Exception ex) { return new List<ListaCompra>(); }
        }

        public async Task<List<ListaCompra>> obtenerListasPorFechas(DateTime fecha)
        {
            try
            {   //select from de estados = 0 (activo)
                var listasDA = await listaComprasContext.ListaCompra
                    .Where(l => l.FechaObjetivo.Date == fecha.Date &&
                                l.Estado == ListaEstado.Activa)
                    .ToListAsync();
                var listas = listasDA.Select(l => new ListaCompra
                {
                    IdLista = l.IdLista,
                    Nombre = l.Nombre,
                    FechaObjetivo = l.FechaObjetivo,
                    Estado = l.Estado
                }).ToList();
                return listas;
            }
            catch (Exception ex) { return new List<ListaCompra>(); }
        }

        public async Task<bool> existeListaConNombre(string nombre, DateTime fecha)
        {
            try
            {
                return await listaComprasContext.ListaCompra
                    .AnyAsync(l => l.Nombre == nombre && l.FechaObjetivo.Date == fecha.Date &&
                                    l.Estado == ListaEstado.Activa);
            }
            catch (Exception ex) { return false; }
        }

    }
}
