using ListaCompras.BC.Estado;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ListaCompras.DA.Entidades
{
    [Table("ListaCompra")]
    public class ListaCompraDA
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid IdLista { get; set; }

        [Required(ErrorMessage ="La lista debe llevar nombre")]
        [MaxLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        public string Nombre { get; set; }

        [Required(ErrorMessage = "Se necesita una fecha para realizar la compra")]
        [Column(TypeName = "date")]
        public DateTime FechaObjetivo { get; set; }

        [Required]
        [Column(TypeName = "int")]
        public ListaEstado Estado { get; set; }

        //virutal para cargar cuando se quiera saber los items
        public virtual ICollection<ItemListaDA> Items { get; set; }

        //parametros iniciales
        public ListaCompraDA()
        {
            Items = new HashSet<ItemListaDA>();
            Estado = ListaEstado.Activa;
        }
    }
}
