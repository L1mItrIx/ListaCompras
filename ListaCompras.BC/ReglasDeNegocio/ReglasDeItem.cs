using ListaCompras.BC.Modelos;
using ListaCompras.BC.Estado;

namespace ListaCompras.BC.ReglasDeNegocio
{
    public static class ReglasDeItem
    {
        public static bool itemEsValido(ItemLista item)
        {
            return item != null &&
                !string.IsNullOrEmpty(item.NombreProducto) &&
                item.Cantidad > 0 &&
                item.IdLista != Guid.Empty &&
                (item.Unidad == null || item.Unidad.Length <= 200);
        }

        public static bool idEsValido(Guid idItem)
        {
            return idItem != Guid.Empty;
        }

        public static bool puedeCambiarEstado(ItemLista item, ItemEstado nuevoEstado)
        {
            return item != null &&
                (Enum.IsDefined(typeof(ItemEstado), nuevoEstado));
        }

        public static bool elEstadoEsValido(ItemEstado estado)
        {
            return Enum.IsDefined(typeof(ItemEstado), estado);
        }
    }
}
