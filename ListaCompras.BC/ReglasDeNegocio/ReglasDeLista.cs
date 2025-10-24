using ListaCompras.BC.Estado;
using ListaCompras.BC.Modelos;

namespace ListaCompras.BC.ReglasDeNegocio
{
    public static class ReglasDeLista
    {
        public static bool listaEsValida(ListaCompra lista){
            return lista != null &&
                !string.IsNullOrEmpty(lista.Nombre) &&
                lista.Nombre.Length <= 50 &&
                lista.FechaObjetivo.Date >= DateTime.Today; // valido para dia de hoy o siguiente nada mas
        }

        public static bool idEsValido(Guid idLista)
        {
            return idLista != Guid.Empty;
        }

        public static bool puedeSerEliminada(ListaCompra lista)
        {
            return lista != null &&
                lista.Estado == ListaEstado.Activa;
        }

        public static bool laFechaEsValida(DateTime fecha)
        {
            return fecha.Date <= DateTime.Today.AddYears(1); 
        }
    }
}
