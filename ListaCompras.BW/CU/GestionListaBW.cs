using ListaCompras.BC.Estado;
using ListaCompras.BC.Modelos;
using ListaCompras.BC.ReglasDeNegocio;
using ListaCompras.BW.Interfaces.BW;
using ListaCompras.BW.Interfaces.DA;

namespace ListaCompras.BW.CU
{
    public class GestionListaBW : IGestionListaBW
    {
        private readonly IGestionListaDA gestionListaDA;

        public GestionListaBW(IGestionListaDA gestionListaDA)
        {
            this.gestionListaDA = gestionListaDA;
        }

        public async Task<bool> crearLista(ListaCompra lista)
        {
            bool duplicados = await gestionListaDA.existeListaConNombre(lista.Nombre, lista.FechaObjetivo); //quita nombres duplicados con misma fecha
            if (!ReglasDeLista.listaEsValida(lista) || duplicados)
            {
                return false;
            }
            return await gestionListaDA.crearLista(lista);
        }
        public async Task<bool> eliminarLista(Guid idLista)
        {
            if (!ReglasDeLista.idEsValido(idLista) || !ReglasDeLista.puedeSerEliminada(lista))
            {
                return false;
            }
            return await gestionListaDA.eliminarLista(idLista);
        }
        

        //listar listas por varios metodos
        public async Task<List<ListaCompra>> obtenerListasActivas()
        {
            return await gestionListaDA.obtenerListasActivas();
        }
        public async Task<List<ListaCompra>> obtenerListasPorFechas(DateTime fecha)
        {
            if (!ReglasDeLista.laFechaEsValida(fecha))
            {
                return new List<ListaCompra>();
            }
            return await gestionListaDA.obtenerListasPorFechas(fecha);
        }

        public async Task<List<ListaCompra>> obtenerListasDeHoy()
        {
            return await gestionListaDA.obtenerListasPorFechas(DateTime.Today);
        }
    }
}
