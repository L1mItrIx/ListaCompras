using ListaCompras.BC.Estado;

namespace ListaCompras.BC.Modelos
{
    public class ListaCompra
    {
        public Guid IdLista { get; set; }
        public string Nombre { get; set; }
        public DateTime FechaObjetivo {get; set;}
        public ListaEstado Estado { get; set; }

        public List<ItemLista> Productos { get; set; }
    }
}
