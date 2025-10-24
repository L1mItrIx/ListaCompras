using ListaCompras.BC.Estado;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Timers;

namespace ListaCompras.DA.Entidades
{
    [Table("ItemLista")]
    public class ItemListaDA
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid IdItem { get; set; }

        [Required]
        public Guid IdLista { get; set; }

        [Required(ErrorMessage = "El producto necesita un nombre, no lo abandone como su padre")]
        [MaxLength(100)]
        [Column(TypeName = "nvarchar(100)")]
        public string NombreProducto { get; set; }

        [Required(ErrorMessage = "Se necesita saber cuanto del producto llevara")]
        [Column(TypeName = "decimal(8,2)")] //decimal de 5 digitos y 2 centimos, para no exagerar
        [Range(0.01, 99999.99, ErrorMessage = "no puede ser menor de 0")]
        public decimal Cantidad { get; set; }

        [MaxLength(200)]
        [Column(TypeName = "nvarchar(200)")]
        public string Unidad { get; set; }

        [Required]
        [Column(TypeName = "int")]
        public ItemEstado Estado { get; set; }

        [ForeignKey("IdLista")]
        public virtual ListaCompraDA? Lista { get; set; }

        //default
        public ItemListaDA()
        {
            Estado = ItemEstado.Pendiente;
            Cantidad = 1;
        }
    }
}
