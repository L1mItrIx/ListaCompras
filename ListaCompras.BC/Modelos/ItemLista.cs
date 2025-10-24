using ListaCompras.BC.Estado;

namespace ListaCompras.BC.Modelos
{
    public class ItemLista
    {
        public Guid IdItem{ get; set; }

        public Guid IdLista { get; set; }  
        public string NombreProducto { get; set; }
        public decimal Cantidad { get; set; }  
        public string? Unidad { get; set; }

        public ItemEstado Estado { get; set; }
        public ItemLista()
        {
            IdItem = Guid.NewGuid();
            Estado = ItemEstado.Pendiente;
            Cantidad = 1;
        }
    }
}
