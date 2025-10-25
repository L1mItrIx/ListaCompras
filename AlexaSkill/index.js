const Alexa = require('ask-sdk-core');
const axios = require('axios');

// ============================================
// ⚠️ CAMBIA ESTA URL POR LA TUYA ⚠️
// ============================================
const API_BASE_URL = 'https://rt7812n8-7034.use2.devtunnels.ms';
// Solo copia tu URL hasta .ms (SIN /swagger/index.html)

// ============================================
// INTENT HANDLERS - No tocar
// ============================================

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Bienvenido a tu asistente de listas de compras. ' +
      'Puedes crear listas, agregar productos o consultar tus listas. ¿Qué deseas hacer?';
    
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const CrearListaIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CrearListaIntent';
  },
  async handle(handlerInput) {
    const nombreLista = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreLista');
    
    try {
      const fechaHoy = new Date().toISOString().split('T')[0];
      
      const response = await axios.post(`${API_BASE_URL}/Listas`, {
        nombre: nombreLista,
        fechaObjetivo: fechaHoy
      });
      
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      attributes.ultimaLista = {
        id: response.data.idLista,
        nombre: nombreLista
      };
      handlerInput.attributesManager.setSessionAttributes(attributes);
      
      const speakOutput = `Lista ${nombreLista} creada exitosamente. ¿Deseas agregar productos?`;
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('¿Quieres agregar productos a la lista?')
        .getResponse();
        
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      const speakOutput = 'Hubo un problema al crear la lista. ' +
        'Verifica que no exista una lista con ese nombre hoy.';
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

const ListarListasIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListarListasIntent';
  },
  async handle(handlerInput) {
    try {
      const response = await axios.get(`${API_BASE_URL}/Listas/hoy`);
      const listas = response.data.listas;
      
      if (!listas || listas.length === 0) {
        return handlerInput.responseBuilder
          .speak('No tienes listas para hoy. ¿Quieres crear una?')
          .reprompt('¿Deseas crear una lista nueva?')
          .getResponse();
      }
      
      let speakOutput = `Tienes ${listas.length} lista${listas.length > 1 ? 's' : ''} para hoy: `;
      speakOutput += listas.map(l => l.nombre).join(', ');
      speakOutput += '. ¿Qué deseas hacer?';
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('¿Qué deseas hacer con tus listas?')
        .getResponse();
        
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      return handlerInput.responseBuilder
        .speak('Hubo un problema al obtener tus listas.')
        .getResponse();
    }
  }
};

const EliminarListaIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'EliminarListaIntent';
  },
  async handle(handlerInput) {
    const nombreLista = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreLista');
    
    try {
      const listasResponse = await axios.get(`${API_BASE_URL}/Listas/hoy`);
      const listas = listasResponse.data.listas;
      const lista = listas.find(l => 
        l.nombre.toLowerCase() === nombreLista.toLowerCase()
      );
      
      if (!lista) {
        return handlerInput.responseBuilder
          .speak(`No encontré ninguna lista llamada ${nombreLista}.`)
          .getResponse();
      }
      
      await axios.delete(`${API_BASE_URL}/Listas/${lista.idLista}`);
      
      return handlerInput.responseBuilder
        .speak(`Lista ${nombreLista} eliminada exitosamente.`)
        .getResponse();
        
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      return handlerInput.responseBuilder
        .speak('Hubo un problema al eliminar la lista.')
        .getResponse();
    }
  }
};

const AgregarProductoIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AgregarProductoIntent';
  },
  async handle(handlerInput) {
    const nombreProducto = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreProducto');
    const cantidad = Alexa.getSlotValue(handlerInput.requestEnvelope, 'cantidad') || 1;
    const unidad = Alexa.getSlotValue(handlerInput.requestEnvelope, 'unidad');
    let nombreLista = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreLista');
    
    try {
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      if (!nombreLista && attributes.ultimaLista) {
        nombreLista = attributes.ultimaLista.nombre;
      }
      
      if (!nombreLista) {
        return handlerInput.responseBuilder
          .speak('¿A qué lista quieres agregar el producto?')
          .reprompt('Dime el nombre de la lista.')
          .getResponse();
      }
      
      const listasResponse = await axios.get(`${API_BASE_URL}/Listas/hoy`);
      const listas = listasResponse.data.listas;
      const lista = listas.find(l => 
        l.nombre.toLowerCase() === nombreLista.toLowerCase()
      );
      
      if (!lista) {
        return handlerInput.responseBuilder
          .speak(`No encontré la lista ${nombreLista}. ¿Quieres crearla?`)
          .reprompt('¿Deseas crear la lista?')
          .getResponse();
      }
      
      await axios.post(`${API_BASE_URL}/Items`, {
        idLista: lista.idLista,
        nombreProducto: nombreProducto,
        cantidad: parseFloat(cantidad),
        unidad: unidad
      });
      
      let speakOutput = `${nombreProducto} agregado a ${nombreLista}`;
      if (cantidad > 1 || unidad) {
        speakOutput = `${cantidad} ${unidad || ''} de ${nombreProducto} agregado a ${nombreLista}`;
      }
      speakOutput += '. ¿Deseas agregar algo más?';
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('¿Quieres agregar otro producto?')
        .getResponse();
        
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      return handlerInput.responseBuilder
        .speak('Hubo un problema al agregar el producto.')
        .getResponse();
    }
  }
};

const ListarProductosIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListarProductosIntent';
  },
  async handle(handlerInput) {
    const nombreLista = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreLista');
    
    try {
      const listasResponse = await axios.get(`${API_BASE_URL}/Listas/hoy`);
      const listas = listasResponse.data.listas;
      const lista = listas.find(l => 
        l.nombre.toLowerCase() === nombreLista.toLowerCase()
      );
      
      if (!lista) {
        return handlerInput.responseBuilder
          .speak(`No encontré la lista ${nombreLista}.`)
          .getResponse();
      }
      
      const itemsResponse = await axios.get(`${API_BASE_URL}/Items/lista/${lista.idLista}`);
      const items = itemsResponse.data.items;
      
      if (!items || items.length === 0) {
        return handlerInput.responseBuilder
          .speak(`La lista ${nombreLista} está vacía. ¿Quieres agregar productos?`)
          .reprompt('¿Deseas agregar productos?')
          .getResponse();
      }
      
      let speakOutput = `En la lista ${nombreLista} tienes: `;
      speakOutput += items.map(item => {
        let desc = item.nombreProducto;
        if (item.cantidad > 1 || item.unidad) {
          desc = `${item.cantidad} ${item.unidad || ''} de ${item.nombreProducto}`;
        }
        return desc;
      }).join(', ');
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
        
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      return handlerInput.responseBuilder
        .speak('Hubo un problema al obtener los productos.')
        .getResponse();
    }
  }
};

const EliminarProductoIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'EliminarProductoIntent';
  },
  async handle(handlerInput) {
    const nombreProducto = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreProducto');
    const nombreLista = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreLista');
    
    try {
      const listasResponse = await axios.get(`${API_BASE_URL}/Listas/hoy`);
      const listas = listasResponse.data.listas;
      const lista = listas.find(l => 
        l.nombre.toLowerCase() === nombreLista.toLowerCase()
      );
      
      if (!lista) {
        return handlerInput.responseBuilder
          .speak(`No encontré la lista ${nombreLista}.`)
          .getResponse();
      }
      
      const itemsResponse = await axios.get(`${API_BASE_URL}/Items/lista/${lista.idLista}`);
      const items = itemsResponse.data.items;
      const item = items.find(i => 
        i.nombreProducto.toLowerCase().includes(nombreProducto.toLowerCase())
      );
      
      if (!item) {
        return handlerInput.responseBuilder
          .speak(`No encontré ${nombreProducto} en la lista ${nombreLista}.`)
          .getResponse();
      }
      
      await axios.delete(`${API_BASE_URL}/Items/${item.idItem}`);
      
      return handlerInput.responseBuilder
        .speak(`${nombreProducto} eliminado de ${nombreLista}.`)
        .getResponse();
        
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      return handlerInput.responseBuilder
        .speak('Hubo un problema al eliminar el producto.')
        .getResponse();
    }
  }
};

const MarcarProductoIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MarcarProductoIntent';
  },
  async handle(handlerInput) {
    const nombreProducto = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreProducto');
    const estado = Alexa.getSlotValue(handlerInput.requestEnvelope, 'estado');
    const nombreLista = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nombreLista');
    
    try {
      const listasResponse = await axios.get(`${API_BASE_URL}/Listas/hoy`);
      const listas = listasResponse.data.listas;
      const lista = listas.find(l => 
        l.nombre.toLowerCase() === nombreLista.toLowerCase()
      );
      
      if (!lista) {
        return handlerInput.responseBuilder
          .speak(`No encontré la lista ${nombreLista}.`)
          .getResponse();
      }
      
      const itemsResponse = await axios.get(`${API_BASE_URL}/Items/lista/${lista.idLista}`);
      const items = itemsResponse.data.items;
      const item = items.find(i => 
        i.nombreProducto.toLowerCase().includes(nombreProducto.toLowerCase())
      );
      
      if (!item) {
        return handlerInput.responseBuilder
          .speak(`No encontré ${nombreProducto} en la lista.`)
          .getResponse();
      }
      
      const nuevoEstado = estado.toLowerCase() === 'comprado' ? 1 : 0;
      
      await axios.put(`${API_BASE_URL}/Items/${item.idItem}/estado`, {
        nuevoEstado: nuevoEstado
      });
      
      return handlerInput.responseBuilder
        .speak(`${nombreProducto} marcado como ${estado}.`)
        .getResponse();
        
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      return handlerInput.responseBuilder
        .speak('Hubo un problema al cambiar el estado del producto.')
        .getResponse();
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'Puedo ayudarte a gestionar tus listas de compras. ' +
      'Puedes decir: crea una lista llamada supermercado, ' +
      'agrega leche a supermercado, ' +
      'dime mis listas de hoy, ' +
      'o elimina la lista supermercado. ¿Qué deseas hacer?';
    
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Hasta luego. ¡Buenas compras!';
    
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Sesión terminada`);
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error completo:`, error);
    const speakOutput = 'Lo siento, tuve problemas para procesar tu solicitud. Por favor intenta de nuevo.';
    
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    CrearListaIntentHandler,
    ListarListasIntentHandler,
    EliminarListaIntentHandler,
    AgregarProductoIntentHandler,
    ListarProductosIntentHandler,
    EliminarProductoIntentHandler,
    MarcarProductoIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();