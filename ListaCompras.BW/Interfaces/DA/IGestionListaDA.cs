using ListaCompras.BC.Modelos;

namespace ListaCompras.BW.Interfaces.DA
{
    public class IGestionListaDA
    {
        Task<bool> CrearLista(ListaCompra lista);

        //listar listas por varios metodos
        Task<List<ListaCompra>> ObtenerListasActivas();
        Task<List<ListaCompra>> ObtenerListasPorFechas(DateTime fecha);
        Task<bool> EliminarLista(Guid idLista);
        Task<bool> ExisteListaConNombre(string nombre, DateTime fecha);
    }
}
