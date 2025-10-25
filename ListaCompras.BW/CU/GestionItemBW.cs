using ListaCompras.BC.Modelos;
using ListaCompras.BC.Estado;
using ListaCompras.BC.ReglasDeNegocio;
using ListaCompras.BW.Interfaces.BW;
using ListaCompras.BW.Interfaces.DA;

namespace ListaCompras.BW.CU
{
    public class GestionItemBW : IGestionItemBW
    {
        private readonly IGestionItemDA gestionItemDA;
        private readonly IGestionListaDA gestionListaDA;

        public GestionItemBW(IGestionItemDA gestionItemDA, IGestionListaDA gestionListaDA)
        {
            this.gestionItemDA = gestionItemDA;
            this.gestionListaDA = gestionListaDA;
        }

        public async Task<bool> agregarItem(ItemLista item)
        {
            if (!ReglasDeItem.itemEsValido(item))
            {
                return Guid.Empty;
            }
        }

        public Task<bool> eliminarItem(Guid idItem)
        {
            throw new NotImplementedException();
        }

        public Task<bool> marcarProducto(Guid idItem, ItemEstado nuevoEstado)
        {
            throw new NotImplementedException();
        }

        public Task<List<ItemLista>> obtenerItemPendietes(Guid idLista)
        {
            throw new NotImplementedException();
        }

        public Task<List<ItemLista>> obtenerItemsDeLista(Guid idLista)
        {
            throw new NotImplementedException();
        }
    }
}
