using ListaCompras.BC.Modelos;
using ListaCompras.BC.Estado;
using ListaCompras.BW.Interfaces.DA;
using ListaCompras.DA.Config;
using ListaCompras.DA.Entidades;
using Microsoft.EntityFrameworkCore;

namespace ListaCompras.DA.Acciones
{
    public class GestionItemDA : IGestionItemDA
    {
        private readonly ListaComprasContext listaComprasContext;
        public GestionItemDA(ListaComprasContext listaComprasContext)
        {
            this.listaComprasContext = listaComprasContext;
        }
        public async Task<bool> agregarItem(ItemLista item)
        {
            try
            {
                var itemDA = new ItemListaDA
                {
                    IdItem = item.IdItem,
                    IdLista = item.IdLista,
                    NombreProducto = item.NombreProducto,
                    Cantidad = item.Cantidad,
                    Unidad = item.Unidad,
                    Estado = item.Estado
                };
                listaComprasContext.Add(itemDA);
                await listaComprasContext.SaveChangesAsync();
                return true;
            }catch (Exception ex) {return false;}
        }

        public async Task<bool> eliminarItem(Guid idItem) 
        {
            try
            {
                var item = await listaComprasContext.ItemLista.FindAsync(idItem);
                if (item != null)
                    return false;
                listaComprasContext.ItemLista.Remove(item);
                await listaComprasContext.SaveChangesAsync();
                return true;
            }catch(Exception ex) {return false;}
        }

        public async Task<List<ItemLista>> obtenerItemsDeLista(Guid idLista) 
        {
            try
            {
                var itemsDA = await listaComprasContext.ItemLista
                    .Where(i => i.IdLista == idLista)
                    .ToListAsync();
                var items = itemsDA.Select(i => new ItemLista
                {
                    IdItem = i.IdItem,
                    IdLista = i.IdLista,
                    NombreProducto = i.NombreProducto,
                    Cantidad = i.Cantidad,
                    Unidad = i.Unidad,
                    Estado = i.Estado,
                }).ToList();
                return items;
            }catch(Exception ex) { return new List<ItemLista> (); }
        }

        public async Task<bool> marcarProducto(Guid idItem, ItemEstado nuevoEstado) 
        {
            try
            {
                var item = await listaComprasContext.ItemLista.FindAsync(idItem);
                if (item != null)
                    return false;
                item.Estado = nuevoEstado;
                await listaComprasContext.SaveChangesAsync();
                return true;
            }
            catch(Exception ex) { return false; }
        }

        public async Task<List<ItemLista>> obtenerItemPendietes(Guid idLista)
        {
            try
            {
                var itemsDA = await listaComprasContext.ItemLista
                    .Where(i => i.IdLista == idLista && i.Estado == ItemEstado.Pendiente)
                    .ToListAsync();
                var items = itemsDA.Select(i => new ItemLista
                {
                    IdItem = i.IdItem,
                    IdLista = i.IdLista,
                    NombreProducto = i.NombreProducto,
                    Cantidad = i.Cantidad,
                    Unidad = i.Unidad,
                    Estado = i.Estado,
                }).ToList();
                return items;
            }
            catch (Exception ex) { return new List<ItemLista>(); }
        }
    }
}
