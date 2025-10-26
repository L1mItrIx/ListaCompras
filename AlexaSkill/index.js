const Alexa = require('ask-sdk-core');
const axios = require('axios');

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
  API_BASE_URL: 'https://rt7812n8-7034.use2.devtunnels.ms',
  TIMEOUT: 10000,
  LOCALE: 'es-ES'
};

// ============================================
// SERVICIO DE API - Maneja todas las llamadas HTTP
// ============================================
class ListaComprasAPI {
  
  static async crearLista(nombre) {
    try {
      const fechaHoy = new Date().toISOString().split('T')[0];
      const response = await axios.post(`${CONFIG.API_BASE_URL}/Listas`, {
        nombre: nombre,
        fechaObjetivo: fechaHoy
      }, { timeout: CONFIG.TIMEOUT });
      
      return { exito: true, data: response.data };
    } catch (error) {
      console.error('Error al crear lista:', error.response?.data || error.message);
      return { exito: false, error: error.message };
    }
  }
  
  static async obtenerListasDeHoy() {
    try {
      const response = await axios.get(`${CONFIG.API_BASE_URL}/Listas/hoy`, {
        timeout: CONFIG.TIMEOUT
      });
      return { exito: true, listas: response.data.listas || [] };
    } catch (error) {
      console.error('Error al obtener listas:', error.response?.data || error.message);
      return { exito: false, listas: [] };
    }
  }
  
  static async eliminarLista(idLista) {
    try {
      await axios.delete(`${CONFIG.API_BASE_URL}/Listas/${idLista}`, {
        timeout: CONFIG.TIMEOUT
      });
      return { exito: true };
    } catch (error) {
      console.error('Error al eliminar lista:', error.response?.data || error.message);
      return { exito: false };
    }
  }
  
  static async buscarListaPorNombre(nombre) {
    const resultado = await this.obtenerListasDeHoy();
    if (!resultado.exito) return null;
    
    return resultado.listas.find(l => 
      l.nombre.toLowerCase() === nombre.toLowerCase()
    );
  }
  
  static async agregarProducto(idLista, nombreProducto, cantidad, unidad) {
    try {
      await axios.post(`${CONFIG.API_BASE_URL}/Items`, {
        idLista: idLista,
        nombreProducto: nombreProducto,
        cantidad: parseFloat(cantidad) || 1,
        unidad: unidad || null
      }, { timeout: CONFIG.TIMEOUT });
      
      return { exito: true };
    } catch (error) {
      console.error('Error al agregar producto:', error.response?.data || error.message);
      return { exito: false };
    }
  }
  
  static async obtenerProductosDeLista(idLista) {
    try {
      const response = await axios.get(`${CONFIG.API_BASE_URL}/Items/lista/${idLista}`, {
        timeout: CONFIG.TIMEOUT
      });
      return { exito: true, items: response.data.items || [] };
    } catch (error) {
      console.error('Error al obtener productos:', error.response?.data || error.message);
      return { exito: false, items: [] };
    }
  }
  
  static async eliminarProducto(idItem) {
    try {
      await axios.delete(`${CONFIG.API_BASE_URL}/Items/${idItem}`, {
        timeout: CONFIG.TIMEOUT
      });
      return { exito: true };
    } catch (error) {
      console.error('Error al eliminar producto:', error.response?.data || error.message);
      return { exito: false };
    }
  }
  
  static async cambiarEstadoProducto(idItem, nuevoEstado) {
    try {
      await axios.put(`${CONFIG.API_BASE_URL}/Items/${idItem}/estado`, {
        nuevoEstado: nuevoEstado
      }, { timeout: CONFIG.TIMEOUT });
      
      return { exito: true };
    } catch (error) {
      console.error('Error al cambiar estado:', error.response?.data || error.message);
      return { exito: false };
    }
  }
  
  static buscarProductoEnLista(items, nombreProducto) {
    return items.find(i => 
      i.nombreProducto.toLowerCase().includes(nombreProducto.toLowerCase())
    );
  }
}

// ============================================
// UTILIDADES - Funciones auxiliares
// ============================================
class Utils {
  
  static obtenerListaActual(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return attributes.ultimaLista || null;
  }
  
  static guardarListaActual(handlerInput, nombreLista) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.ultimaLista = nombreLista;
    handlerInput.attributesManager.setSessionAttributes(attributes);
  }
  
  static obtenerContexto(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return attributes.contexto || null;
  }
  
  static guardarContexto(handlerInput, contexto) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.contexto = contexto;
    handlerInput.attributesManager.setSessionAttributes(attributes);
  }
  
  static limpiarContexto(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    delete attributes.contexto;
    handlerInput.attributesManager.setSessionAttributes(attributes);
  }
  
  static formatearProducto(item) {
    if (item.cantidad > 1 || item.unidad) {
      return `${item.cantidad} ${item.unidad || ''} de ${item.nombreProducto}`.trim();
    }
    return item.nombreProducto;
  }
  
  static formatearListaProductos(items) {
    return items.map(item => this.formatearProducto(item)).join(', ');
  }
}

// ============================================
// BASE HANDLER - Clase base para todos los handlers
// ============================================
class BaseHandler {
  
  crearRespuesta(handlerInput, mensaje, debePreguntar = false, reprompt = null) {
    const builder = handlerInput.responseBuilder.speak(mensaje);
    
    if (debePreguntar) {
      builder.reprompt(reprompt || mensaje);
    }
    
    return builder.getResponse();
  }
  
  async manejarError(handlerInput, mensajeError) {
    console.error(mensajeError);
    return this.crearRespuesta(
      handlerInput,
      'Lo siento, hubo un problema. Por favor intenta de nuevo.'
    );
  }
}

// ============================================
// HANDLERS DE LISTAS
// ============================================
class LaunchRequestHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  }
  
  handle(handlerInput) {
    console.log('=== Skill iniciado ===');
    Utils.limpiarContexto(handlerInput);
    
    const mensaje = 'Bienvenido a tu gestor de listas de compras. ' +
      '¿Qué deseas hacer? Puedes crear una lista, ver tus listas, o agregar productos.';
    
    return this.crearRespuesta(handlerInput, mensaje, true);
  }
}

class CrearListaIntentHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CrearListaIntent';
  }
  
  async handle(handlerInput) {
    const nombreLista = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreLista');
    
    if (!nombreLista) {
      return this.crearRespuesta(
        handlerInput,
        '¿Cómo quieres llamar a tu lista?',
        true
      );
    }
    
    const resultado = await ListaComprasAPI.crearLista(nombreLista);
    
    if (!resultado.exito) {
      return this.crearRespuesta(
        handlerInput,
        `No pude crear la lista ${nombreLista}. Es posible que ya exista una con ese nombre.`
      );
    }
    
    Utils.guardarListaActual(handlerInput, nombreLista);
    Utils.guardarContexto(handlerInput, 'LISTA_CREADA');
    
    const mensaje = `Lista ${nombreLista} creada exitosamente. ¿Quieres agregar productos ahora?`;
    
    return this.crearRespuesta(handlerInput, mensaje, true);
  }
}

class ListarListasIntentHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListarListasIntent';
  }
  
  async handle(handlerInput) {
    const resultado = await ListaComprasAPI.obtenerListasDeHoy();
    
    if (!resultado.exito) {
      return this.manejarError(handlerInput, 'Error al obtener listas');
    }
    
    if (resultado.listas.length === 0) {
      Utils.guardarContexto(handlerInput, 'SIN_LISTAS');
      return this.crearRespuesta(
        handlerInput,
        'No tienes listas para hoy. ¿Quieres crear una?',
        true
      );
    }
    
    const nombres = resultado.listas.map(l => l.nombre).join(', ');
    const mensaje = `Tienes ${resultado.listas.length} lista${resultado.listas.length > 1 ? 's' : ''}: ${nombres}. ¿Qué deseas hacer?`;
    
    return this.crearRespuesta(handlerInput, mensaje, true);
  }
}

class SeleccionarListaIntentHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SeleccionarListaIntent';
  }
  
  async handle(handlerInput) {
    const nombreLista = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreLista');
    
    const lista = await ListaComprasAPI.buscarListaPorNombre(nombreLista);
    
    if (!lista) {
      return this.crearRespuesta(
        handlerInput,
        `No encontré la lista ${nombreLista}. ¿Quieres crearla?`,
        true
      );
    }
    
    Utils.guardarListaActual(handlerInput, nombreLista);
    
    return this.crearRespuesta(
      handlerInput,
      `Lista ${nombreLista} seleccionada. ¿Qué deseas hacer?`,
      true,
      '¿Quieres agregar productos, ver la lista, o eliminar algo?'
    );
  }
}

class EliminarListaIntentHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'EliminarListaIntent';
  }
  
  async handle(handlerInput) {
    const nombreLista = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreLista');
    
    const lista = await ListaComprasAPI.buscarListaPorNombre(nombreLista);
    
    if (!lista) {
      return this.crearRespuesta(
        handlerInput,
        `No encontré la lista ${nombreLista}.`
      );
    }
    
    const resultado = await ListaComprasAPI.eliminarLista(lista.idLista);
    
    if (!resultado.exito) {
      return this.manejarError(handlerInput, 'Error al eliminar lista');
    }
    
    // Si era la lista actual, limpiarla
    if (Utils.obtenerListaActual(handlerInput) === nombreLista) {
      Utils.guardarListaActual(handlerInput, null);
    }
    
    return this.crearRespuesta(
      handlerInput,
      `Lista ${nombreLista} eliminada.`
    );
  }
}

// ============================================
// HANDLERS DE PRODUCTOS
// ============================================
class AgregarProductoIntentHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AgregarProductoIntent';
  }
  
  async handle(handlerInput) {
    const nombreProducto = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreProducto');
    const cantidad = Alexa.getSlotValue(handlerInput.requestEnvelope, 'cantidad') || 1;
    const unidad = Alexa.getSlotValue(handlerInput.requestEnvelope, 'unidad');
    
    if (!nombreProducto) {
      return this.crearRespuesta(
        handlerInput,
        '¿Qué producto quieres agregar?',
        true
      );
    }
    
    const nombreLista = Utils.obtenerListaActual(handlerInput);
    
    if (!nombreLista) {
      Utils.guardarContexto(handlerInput, 'ESPERANDO_LISTA_PARA_PRODUCTO');
      return this.crearRespuesta(
        handlerInput,
        'Primero selecciona una lista. Puedes decir: usar lista supermercado.',
        true
      );
    }
    
    const lista = await ListaComprasAPI.buscarListaPorNombre(nombreLista);
    
    if (!lista) {
      return this.crearRespuesta(
        handlerInput,
        `La lista ${nombreLista} ya no existe. Selecciona otra lista.`,
        true
      );
    }
    
    const resultado = await ListaComprasAPI.agregarProducto(
      lista.idLista,
      nombreProducto,
      cantidad,
      unidad
    );
    
    if (!resultado.exito) {
      return this.manejarError(handlerInput, 'Error al agregar producto');
    }
    
    const productoFormateado = cantidad > 1 || unidad
      ? `${cantidad} ${unidad || ''} de ${nombreProducto}`.trim()
      : nombreProducto;
    
    const mensaje = `${productoFormateado} agregado a ${nombreLista}. ¿Algo más?`;
    
    return this.crearRespuesta(handlerInput, mensaje, true);
  }
}

class ListarProductosIntentHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListarProductosIntent';
  }
  
  async handle(handlerInput) {
    const nombreLista = Utils.obtenerListaActual(handlerInput);
    
    if (!nombreLista) {
      return this.crearRespuesta(
        handlerInput,
        'Primero selecciona una lista.',
        true
      );
    }
    
    const lista = await ListaComprasAPI.buscarListaPorNombre(nombreLista);
    
    if (!lista) {
      return this.crearRespuesta(
        handlerInput,
        `La lista ${nombreLista} ya no existe.`
      );
    }
    
    const resultado = await ListaComprasAPI.obtenerProductosDeLista(lista.idLista);
    
    if (!resultado.exito) {
      return this.manejarError(handlerInput, 'Error al obtener productos');
    }
    
    if (resultado.items.length === 0) {
      return this.crearRespuesta(
        handlerInput,
        `La lista ${nombreLista} está vacía. ¿Quieres agregar productos?`,
        true
      );
    }
    
    const productos = Utils.formatearListaProductos(resultado.items);
    const mensaje = `En ${nombreLista} tienes: ${productos}.`;
    
    return this.crearRespuesta(handlerInput, mensaje);
  }
}

class EliminarProductoIntentHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'EliminarProductoIntent';
  }
  
  async handle(handlerInput) {
    const nombreProducto = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreProducto');
    const nombreLista = Utils.obtenerListaActual(handlerInput);
    
    if (!nombreLista) {
      return this.crearRespuesta(
        handlerInput,
        'Primero selecciona una lista.',
        true
      );
    }
    
    const lista = await ListaComprasAPI.buscarListaPorNombre(nombreLista);
    
    if (!lista) {
      return this.crearRespuesta(
        handlerInput,
        `La lista ${nombreLista} ya no existe.`
      );
    }
    
    const resultadoItems = await ListaComprasAPI.obtenerProductosDeLista(lista.idLista);
    
    if (!resultadoItems.exito) {
      return this.manejarError(handlerInput, 'Error al obtener productos');
    }
    
    const item = ListaComprasAPI.buscarProductoEnLista(resultadoItems.items, nombreProducto);
    
    if (!item) {
      return this.crearRespuesta(
        handlerInput,
        `No encontré ${nombreProducto} en ${nombreLista}.`
      );
    }
    
    const resultado = await ListaComprasAPI.eliminarProducto(item.idItem);
    
    if (!resultado.exito) {
      return this.manejarError(handlerInput, 'Error al eliminar producto');
    }
    
    return this.crearRespuesta(
      handlerInput,
      `${nombreProducto} eliminado de ${nombreLista}.`
    );
  }
}

class MarcarProductoIntentHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MarcarProductoIntent';
  }
  
  async handle(handlerInput) {
    const nombreProducto = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreProducto');
    const estado = Alexa.getSlotValue(handlerInput.requestEnvelope, 'estado');
    const nombreLista = Utils.obtenerListaActual(handlerInput);
    
    if (!nombreLista) {
      return this.crearRespuesta(
        handlerInput,
        'Primero selecciona una lista.',
        true
      );
    }
    
    const lista = await ListaComprasAPI.buscarListaPorNombre(nombreLista);
    
    if (!lista) {
      return this.crearRespuesta(
        handlerInput,
        `La lista ${nombreLista} ya no existe.`
      );
    }
    
    const resultadoItems = await ListaComprasAPI.obtenerProductosDeLista(lista.idLista);
    
    if (!resultadoItems.exito) {
      return this.manejarError(handlerInput, 'Error al obtener productos');
    }
    
    const item = ListaComprasAPI.buscarProductoEnLista(resultadoItems.items, nombreProducto);
    
    if (!item) {
      return this.crearRespuesta(
        handlerInput,
        `No encontré ${nombreProducto} en ${nombreLista}.`
      );
    }
    
    const nuevoEstado = estado.toLowerCase() === 'comprado' ? 1 : 0;
    const resultado = await ListaComprasAPI.cambiarEstadoProducto(item.idItem, nuevoEstado);
    
    if (!resultado.exito) {
      return this.manejarError(handlerInput, 'Error al cambiar estado');
    }
    
    return this.crearRespuesta(
      handlerInput,
      `${nombreProducto} marcado como ${estado}.`
    );
  }
}

// ============================================
// HANDLERS DE CONFIRMACIÓN
// ============================================
class YesIntentHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
  }
  
  handle(handlerInput) {
    const contexto = Utils.obtenerContexto(handlerInput);
    
    switch (contexto) {
      case 'LISTA_CREADA':
        Utils.limpiarContexto(handlerInput);
        return this.crearRespuesta(
          handlerInput,
          '¿Qué producto quieres agregar?',
          true
        );
        
      case 'SIN_LISTAS':
        Utils.limpiarContexto(handlerInput);
        return this.crearRespuesta(
          handlerInput,
          '¿Cómo quieres llamar a tu lista?',
          true
        );
        
      default:
        return this.crearRespuesta(
          handlerInput,
          'Perfecto. ¿Qué deseas hacer?',
          true
        );
    }
  }
}

class NoIntentHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent';
  }
  
  handle(handlerInput) {
    Utils.limpiarContexto(handlerInput);
    
    return this.crearRespuesta(
      handlerInput,
      'De acuerdo. ¿Hay algo más en lo que pueda ayudarte?',
      true
    );
  }
}

// ============================================
// HANDLERS DEL SISTEMA
// ============================================
class HelpIntentHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  }
  
  handle(handlerInput) {
    const mensaje = 'Puedo ayudarte a gestionar tus listas de compras. ' +
      'Puedes decir: crea una lista llamada supermercado, ' +
      'agrega leche, ver mis listas, ' +
      'o eliminar la lista. ¿Qué deseas hacer?';
    
    return this.crearRespuesta(handlerInput, mensaje, true);
  }
}

class CancelAndStopIntentHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  }
  
  handle(handlerInput) {
    Utils.limpiarContexto(handlerInput);
    return this.crearRespuesta(handlerInput, 'Hasta luego. ¡Buenas compras!');
  }
}

class SessionEndedRequestHandler extends BaseHandler {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  }
  
  handle(handlerInput) {
    console.log('=== Sesión terminada ===');
    return handlerInput.responseBuilder.getResponse();
  }
}

class ErrorHandler extends BaseHandler {
  canHandle() {
    return true;
  }
  
  handle(handlerInput, error) {
    console.error('=== ERROR ===');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('API:', CONFIG.API_BASE_URL);
    
    return this.crearRespuesta(
      handlerInput,
      'Disculpa, tuve un problema. Intenta de nuevo.'
    );
  }
}

// ============================================
// EXPORTAR SKILL
// ============================================
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    new LaunchRequestHandler(),
    new CrearListaIntentHandler(),
    new ListarListasIntentHandler(),
    new SeleccionarListaIntentHandler(),
    new EliminarListaIntentHandler(),
    new AgregarProductoIntentHandler(),
    new ListarProductosIntentHandler(),
    new EliminarProductoIntentHandler(),
    new MarcarProductoIntentHandler(),
    new YesIntentHandler(),
    new NoIntentHandler(),
    new HelpIntentHandler(),
    new CancelAndStopIntentHandler(),
    new SessionEndedRequestHandler()
  )
  .addErrorHandlers(new ErrorHandler())
  .lambda();