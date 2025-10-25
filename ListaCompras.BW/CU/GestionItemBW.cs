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

        public GestionItemBW(IGestionItemDA gestionItemDA)
        {
            this.gestionItemDA = gestionItemDA;
        }

        public async Task<bool> agregarItem(ItemLista item)
        {
            if (!ReglasDeItem.itemEsValido(item))
            {
                return false;
            }
            return await gestionItemDA.agregarItem(item);
        }

        public async Task<bool> eliminarItem(Guid idItem)
        {
            if (!ReglasDeItem.idEsValido(idItem))
            {
                return false;
            }
            return await gestionItemDA.eliminarItem(idItem);
        }

        public async Task<List<ItemLista>> obtenerItemsDeLista(Guid idLista)
        {
            if (!ReglasDeLista.idEsValido(idLista))
            {
                return new List<ItemLista>();
            }
            return await gestionItemDA.obtenerItemsDeLista(idLista);
        }

        public async Task<bool> marcarEstadoItem(Guid idItem, ItemEstado nuevoEstado)
        {
            if (!ReglasDeItem.idEsValido(idItem))
            {
                return false;
            }
            if (!ReglasDeItem.elEstadoEsValido(nuevoEstado))
            {
                return false;
            }
            return await gestionItemDA.marcarEstadoItem(idItem, nuevoEstado);
        }


        public async Task<List<ItemLista>> obtenerItemsPendietes(Guid idLista)
        {
            if (!ReglasDeLista.idEsValido(idLista))
            {
                return new List<ItemLista>();
            }
            return await gestionItemDA.obtenerItemsPendietes(idLista);
        }
    }
}