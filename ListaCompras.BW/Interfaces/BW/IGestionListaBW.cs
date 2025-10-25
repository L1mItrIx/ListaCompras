using ListaCompras.BC.Estado;
using ListaCompras.BC.Modelos;

namespace ListaCompras.BW.Interfaces.BW
{
    public interface IGestionListaBW
    {
        Task<bool> crearLista(ListaCompra lista);
        Task<bool> eliminarLista(Guid idLista);

        //listar listas por varios metodos
        Task<List<ListaCompra>> obtenerListasActivas();
        Task<List<ListaCompra>> obtenerListasPorFechas(DateTime fecha);

        Task<List<ListaCompra>> obtenerListasDeHoy();
    }
}
