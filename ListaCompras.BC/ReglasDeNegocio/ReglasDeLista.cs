using ListaCompras.BC.Modelos;

namespace ListaCompras.BC.ReglasDeNegocio
{
    public static class ReglasDeLista
    {
        public static bool listaEsValida(ListaCompra lista){
            return lista != null &&
                !string.IsNullOrEmpty(lista.Nombre) &&
                lista.Nombre.Length <= 50 &&

        }
    }
}
