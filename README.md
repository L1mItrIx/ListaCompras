🛒 Alexa Skill - Lista de Compras

Skill de Alexa en español para gestionar listas de compras con backend en .NET Core Web API.

📋 Requisitos Previos

- ✅ Probar la API por las carpetas API, BC, DA, BW
- ✅ Cuenta de Amazon Developer (https://developer.amazon.com/)
- ✅ SQL Server con base de datos configurada
- ✅ Dev Tunnel

🚀 Configuración Paso a Paso

1. Preparar el Backend

Ejecuta este script con el nombre Query

```sql
CREATE DATABASE ListaComprasDB;
GO

USE ListaComprasDB;
GO

CREATE TABLE ListaCompra (
    IdLista UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Nombre NVARCHAR(50) NOT NULL,
    FechaObjetivo DATE NOT NULL,
    Estado INT NOT NULL DEFAULT 0
);

CREATE TABLE ItemLista (
    IdItem UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    IdLista UNIQUEIDENTIFIER NOT NULL,
    NombreProducto NVARCHAR(100) NOT NULL,
    Cantidad DECIMAL(8,2) NOT NULL DEFAULT 1,
    Unidad NVARCHAR(200),
    Estado INT NOT NULL DEFAULT 0,
    FOREIGN KEY (IdLista) REFERENCES ListaCompra(IdLista) ON DELETE CASCADE
);


#### 1.2 Exponer tu API con Dev Tunnels

```bash
# Instalar Dev Tunnels (si no lo tienes)
# En Visual Studio 2022: Tools > Options > Environment > Preview Features > Enable Dev Tunnels

# O usar CLI
devtunnel create --allow-anonymous
devtunnel port create -p 5031
devtunnel host

# Copia la URL generada (ej: https://abc123.devtunnels.ms)
```

2. Probar tu API

```bash
se debe utilizar la aplicacion de Visual Studio Code
luego antes de activarlo necesitamos volvernos el host
para eso daremos click a la derecha de HTTP o HTTPS
seleccionamos la opcino dev tunnels y hostearemos nuestra API
luego de eso realizamos una prueba del 
```

3. Crear el Alexa Skill


Ve a https://developer.amazon.com/alexa/console/ask
Click en "Create Skill"
Configura:
   - Skill name: Lista de Compras
   - Primary locale: Spanish (ES)
   - Choose a model: Custom
   - Hosting: Alexa-hosted (Node.js)
   - Click **Create skill**

Configurar el Modelo de Interacción

1. En el panel izquierdo, click en "JSON Editor"
2. Copia y pega todo el contenido del archivo `AlexaSkill/interaction.json`
3. Click "Save Model"
4. Click "Build Model" (espera 2 o 3 minutos)

Configurar el Endpoint (Lambda)

1. Ve a la pestaña "Code" 
2. Reemplaza el contenido de `AlexaSkill/index.js` con el código del handler
3. Edita el archivo `AlexaSkill/package.json` con las dependencias necesarias
4. IMPORTANTE: En `index.js`, cambia la línea:
   ```javascript
   const API_BASE_URL = 'aca agregaras el link de tu api';
   ```
   Por tu URL real de Dev Tunnels (sin "/" al final)

Click "Save" y luego "Deploy"

4 Probar el Skill


1. Ve a la pestaña "Test"
2. Habilita el testing: cambiar de "Off" a "Development"
3. Prueba con estos comandos:

```
Usuario: "Alexa, abre lista de compras"
Alexa: "¡Bienvenido a tu asistente de listas de compras!..."

Usuario: "crea una lista llamada supermercado"
Alexa: "Lista supermercado creada exitosamente. ¿Deseas agregar productos ahora?"

Usuario: "agrega dos kilos de manzanas"
Alexa: "Agregué 2 kilos de manzanas a la lista."

Usuario: "qué productos tengo"
Alexa: "La lista tiene 1 producto: 2 kilos de manzanas."

Usuario: "marca manzanas como comprado"
Alexa: "Marqué manzanas como comprado."

Usuario: "cuáles son mis listas"
Alexa: "Para hoy, tienes una lista llamada supermercado."
```


Gestión de Listas

- `"crea una lista llamada [nombre]"`
- `"cuáles son mis listas"`
- `"mis listas de hoy"`
- `"listas para mañana"`
- `"elimina la lista [nombre]"`

Gestión de Productos (Sin Cantidad)

- `"agrega [producto]"` - Agrega 1 unidad por defecto
- `"añade [producto]"`
- `"pon [producto]"`

### Gestión de Productos (Con Cantidad)

- `"agrega [cantidad] [unidad] de [producto]"`
- `"añade [cantidad] [unidad] de [producto]"`
- `"pon [cantidad] [unidad] de [producto]"`

Unidades disponibles: kilos, gramos, litros, mililitros, unidades, paquetes, cajas, bolsas, latas, botellas

Consultar Productos

- `"qué productos tengo"`
- `"qué hay en mi lista"`
- `"lista los productos"`

Eliminar Productos

- `"elimina [producto]"`
- `"borra [producto]"`
- `"quita [producto]"`

Marcar Estado de Productos

- `"marca [producto] como comprado"`
- `"compré [producto]"`
- `"[producto] comprado"`
- `"marca [producto] como pendiente"`
- `"[producto] pendiente"`

Ejemplos Prácticos

```
"Alexa, abre lista de compras"
"crea una lista llamada supermercado"
"agrega manzanas" → Agrega 1 manzana
"agrega tres kilos de naranjas" → Agrega 3 kilos
"añade dos litros de leche"
"pon cinco unidades de yogurt"
"qué productos tengo"
"compré las naranjas"
"elimina el yogurt"
"cuáles son mis listas"
```

🔧 Troubleshooting

Error: "No pude consultar tus listas"

**Causa**: La API no puede buscar el id de la lista de acuerdo al nombre

Error: "No se conecta a la API"
**Causa**: Al borrar la skill de alexa puede suceder un error que utiliza el id de la skill vieja y tiene errores al momento de querer actualizarla a una nueva
esto provoca que no se puedan realizar actualizaciones, se ha intentado forzar el cambio del skill del id por el json manual, pero no hubo exito

**Causa**: Se desconoce y no se ha podido realizar ciertos intents porque el Skill de Alexa no actualizaba el id

📊 Estructura de la Base de Datos

```
ListaCompra
├── IdLista (GUID)
├── Nombre (string)
├── FechaObjetivo (date)
└── Estado (0=Activa, 1=Eliminada)

ItemLista
├── IdItem (GUID)
├── IdLista (FK)
├── NombreProducto (string)
├── Cantidad (decimal)
├── Unidad (string)
└── Estado (0=Pendiente, 1=Comprado)
```

🎯 Arquitectura del Proyecto

```
ListaCompras.sln
├── ListaCompras.API (Controllers, Program.cs)
├── ListaCompras.BC (Business Core - Modelos, Estados, Reglas)
├── ListaCompras.BW (Business Workflow - Casos de Uso)
└── ListaCompras.DA (Data Access - EF Core, Context)
```

📝 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/Listas` | Crear lista |
| GET | `/Listas/hoy` | Listas de hoy |
| GET | `/Listas/fecha/{fecha}` | Listas por fecha |
| DELETE | `/Listas/{id}` | Eliminar lista |
| POST | `/Items` | Agregar item |
| GET | `/Items/lista/{idLista}` | Items de lista |
| GET | `/Items/pendientes/{idLista}` | Items pendientes |
| DELETE | `/Items/{id}` | Eliminar item |
| PUT | `/Items/{id}/estado` | Cambiar estado |

👨‍💻 Autor: Eugene Li Liang
