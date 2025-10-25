using ListaCompras.BC.Estado;
using ListaCompras.BC.Modelos;

namespace ListaCompras.BW.Interfaces.BW
{
    public interface IGestionItemBW
    {
        Task<bool> agregarItem(ItemLista item);

        Task<bool> eliminarItem(Guid idItem);

        Task<List<ItemLista>> obtenerItemsDeLista(Guid idLista);

        Task<bool> marcarEstadoItem(Guid idItem, ItemEstado nuevoEstado);

        Task<List<ItemLista>> obtenerItemsPendietes(Guid idLista);
    }
}
