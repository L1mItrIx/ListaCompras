using ListaCompras.BC.Modelos;

namespace ListaCompras.BW.Interfaces.DA
{
    public class IGestionItemDA
    {
        Task<bool> AgregarProducto(ItemLista item);

        Task<List<ItemLista>> ObtenerProductoPendiente();
        Task<bool> EliminarProducto(Guid idItem);

        Task<List<ItemLista>> MarcarProducto(ItemLista item, Enum ItemEstado);
    }
}
