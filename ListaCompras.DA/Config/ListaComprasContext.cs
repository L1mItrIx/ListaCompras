using Microsoft.EntityFrameworkCore;
using ListaCompras.DA.Entidades;

namespace ListaCompras.DA.Config
{
    public class ListaComprasContext : DbContext
    {
        public ListaComprasContext(DbContextOptions<ListaComprasContext> options) : base(options) { }

        public DbSet<ListaCompraDA> ListaCompra { get; set; }

        public DbSet<ItemListaDA> ItemLista { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            //relacion tabla lista item
            modelBuilder.Entity<ListaCompraDA>()
                .HasMany(lista => lista.Items)
                .WithOne(item => item.Lista)
                .HasForeignKey(item => item.IdLista)
                .OnDelete(DeleteBehavior.Cascade); //si borran la lista, se borran los items

            modelBuilder.Entity<ListaCompraDA>()
                .HasIndex(l => l.FechaObjetivo)
                .HasDatabaseName("IX_ListaCompra_FechaObjetivo");

            // filtrar listas activas/eliminadas
            modelBuilder.Entity<ListaCompraDA>()
                .HasIndex(l => l.Estado)
                .HasDatabaseName("IX_ListaCompra_Estado");

            // buscar items de una lista
            modelBuilder.Entity<ItemListaDA>()
                .HasIndex(i => i.IdLista)
                .HasDatabaseName("IX_ItemLista_IdLista");

            // filtrar pendientes/comprados
            modelBuilder.Entity<ItemListaDA>()
                .HasIndex(i => i.Estado)
                .HasDatabaseName("IX_ItemLista_Estado");
        }

    }
}
