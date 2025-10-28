CREATE DATABASE ListaComprasDB;
GO

USE ListaComprasDB;
GO

CREATE TABLE ListaCompra (
    IdLista UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Nombre NVARCHAR(50) NOT NULL,
    FechaObjetivo DATE NOT NULL,
    Estado INT NOT NULL DEFAULT 0,  -- 0 = Activa, 1 = Eliminada
    CONSTRAINT CK_ListaCompra_Estado CHECK (Estado IN (0, 1))
);
GO


CREATE TABLE ItemLista (
    IdItem UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    IdLista UNIQUEIDENTIFIER NOT NULL,
    NombreProducto NVARCHAR(100) NOT NULL,
    Cantidad DECIMAL(8, 2) NOT NULL CHECK (Cantidad > 0),
    Unidad NVARCHAR(200) NULL,
    Estado INT NOT NULL DEFAULT 0,  -- 0 = Pendiente, 1 = Comprado
    CONSTRAINT FK_ItemLista_ListaCompra FOREIGN KEY (IdLista) 
        REFERENCES ListaCompra(IdLista) ON DELETE CASCADE,
    CONSTRAINT CK_ItemLista_Estado CHECK (Estado IN (0, 1))
);
GO


-- buscar listas por fecha
CREATE NONCLUSTERED INDEX IX_ListaCompra_FechaObjetivo
ON ListaCompra(FechaObjetivo);
GO

-- filtrar listas por estado
CREATE NONCLUSTERED INDEX IX_ListaCompra_Estado
ON ListaCompra(Estado);
GO

-- buscar items de una lista
CREATE NONCLUSTERED INDEX IX_ItemLista_IdLista
ON ItemLista(IdLista);
GO

--filtrar items por estado
CREATE NONCLUSTERED INDEX IX_ItemLista_Estado
ON ItemLista(Estado);
GO

-- prueba

DECLARE @IdLista1 UNIQUEIDENTIFIER = NEWID();

INSERT INTO ListaCompra (IdLista, Nombre, FechaObjetivo, Estado)
VALUES (@IdLista1, 'Supermercado', CAST(GETDATE() AS DATE), 0);

-- Insertar items de ejemplo
INSERT INTO ItemLista (IdItem, IdLista, NombreProducto, Cantidad, Unidad, Estado)
VALUES 
    (NEWID(), @IdLista1, 'Leche', 2, 'litros', 0),
    (NEWID(), @IdLista1, 'Pan', 1, 'unidad', 0),
    (NEWID(), @IdLista1, 'Huevos', 12, 'unidades', 0);

-- Insertar otra lista
DECLARE @IdLista2 UNIQUEIDENTIFIER = NEWID();

INSERT INTO ListaCompra (IdLista, Nombre, FechaObjetivo, Estado)
VALUES (@IdLista2, 'Farmacia', CAST(GETDATE() AS DATE), 0);

INSERT INTO ItemLista (IdItem, IdLista, NombreProducto, Cantidad, Unidad, Estado)
VALUES 
    (NEWID(), @IdLista2, 'Aspirinas', 1, 'caja', 0),
    (NEWID(), @IdLista2, 'Alcohol', 1, 'botella', 1);  

GO


-- Ver todas las listas
SELECT * FROM ListaCompra;

-- Ver todos los items
SELECT * FROM ItemLista;



--DELETE FROM ItemLista;
--DELETE FROM ListaCompra;