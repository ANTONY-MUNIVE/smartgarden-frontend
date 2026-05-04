const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const BASE = API_BASE ? `${API_BASE}/api` : '/api';

const json = (res) => res.json();

const post = (url, body) =>
  fetch(`${BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const put = (url, body) =>
  fetch(`${BASE}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const patch = (url) =>
  fetch(`${BASE}${url}`, { method: 'PATCH' });

const del = (url) =>
  fetch(`${BASE}${url}`, { method: 'DELETE' });

export const api = {
  // Auth
  login: (username, password) => post('/users/login', { username, password }).then(json),

  // IA
  recomendarIA: (data) => post('/ia/recomendar', data).then(json),
  predecirIA: (data) => post('/ia/predecir', data).then(json),

  // Users
  getUsuarios:     ()           => fetch(`${BASE}/users`).then(json),
  crearUsuario:    (data)       => post('/users', data).then(json),
  editarUsuario:   (id, data)   => put(`/users/${id}`, data).then(json),
  eliminarUsuario: (id)         => del(`/users/${id}`).then(json),
  toggleUsuario:   (id)         => patch(`/users/${id}/toggle`).then(json),

  // Sensores
  getSensorActual:  ()           => fetch(`${BASE}/sensors/current`).then(json),
  getSensorHistory: (limit = 24) => fetch(`${BASE}/sensors/history?limit=${limit}`).then(json),
  postSensorReading:(data)       => post('/sensors/reading', data).then(json),

  // Alertas
  getAlertas: () => fetch(`${BASE}/alertas`).then(json),

  // Recomendaciones
  getRecomendaciones:  ()    => fetch(`${BASE}/recomendaciones`).then(json),
  aplicarRecomendacion:(id)  => patch(`/recomendaciones/${id}/aplicar`).then(json),

  // Experimentos
  getExperimentos:     ()         => fetch(`${BASE}/experimentos`).then(json),
  crearExperimento:    (data)     => post('/experimentos', data).then(json),
  editarExperimento:   (id, data) => put(`/experimentos/${id}`, data).then(json),
  eliminarExperimento: (id)       => del(`/experimentos/${id}`).then(json),

  // Etapas de cultivo
  getEtapas:    ()         => fetch(`${BASE}/etapas`).then(json),
  editarEtapa:  (id, data) => put(`/etapas/${id}`, data).then(json),

  // Config del sistema
  getConfig:   ()     => fetch(`${BASE}/config`).then(json),
  guardarConfig:(data) => put('/config', data).then(json),

  // Indicadores
  getIndicadores: () => fetch(`${BASE}/indicadores`).then(json),
};

/**
 * 🚀 PREDICCIÓN COMPLETA DE IA
 * Análisis integrado: clima + riegos + enfermedades + horarios de sol
 */
export const obtenerPrediccionCompleta = async (datosHuerto) => {
  try {
    const response = await fetch(`${API_BASE}/api/ia/prediccion-completa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        humedad_suelo: datosHuerto.humedad_suelo || 50,
        temperatura: datosHuerto.temperatura || 25,
        luz: datosHuerto.luz || 800,
        humedad_aire: datosHuerto.humedad_aire || 65,
        latitude: datosHuerto.latitude || -12.0,
        longitude: datosHuerto.longitude || -77.0
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error en predicción completa:', error);
    return { error: error.message };
  }
};

/**
 * 📅 CALENDARIO DE RIEGOS
 * Obtiene predicción de 7 días para riego óptimo
 */
export const obtenerCalendarioRiegos = async (datosHuerto) => {
  try {
    const response = await fetch(`${API_BASE}/api/ia/calendario-riegos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        humedad_suelo: datosHuerto.humedad_suelo || 50,
        temperatura: datosHuerto.temperatura || 25,
        luz: datosHuerto.luz || 800,
        humedad_aire: datosHuerto.humedad_aire || 65
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error en calendario de riegos:', error);
    return { error: error.message };
  }
};

/**
 * 🦠 RIESGO DE ENFERMEDADES
 * Predice probabilidad de enfermedades basado en clima y humedad
 */
export const obtenerRiesgoEnfermedades = async (datosHuerto) => {
  try {
    const response = await fetch(`${API_BASE}/api/ia/riesgo-enfermedades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        humedad_suelo: datosHuerto.humedad_suelo || 50,
        temperatura: datosHuerto.temperatura || 25,
        luz: datosHuerto.luz || 800,
        humedad_aire: datosHuerto.humedad_aire || 65
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error en análisis de enfermedades:', error);
    return { error: error.message };
  }
};

/**
 * ☀️ HORARIOS DE SOL
 * Obtiene salida/puesta de sol y horas de luz útil para cada día
 */
export const obtenerHorariosSol = async (datosHuerto) => {
  try {
    const response = await fetch(`${API_BASE}/api/ia/horarios-sol`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        humedad_suelo: datosHuerto.humedad_suelo || 50,
        temperatura: datosHuerto.temperatura || 25,
        luz: datosHuerto.luz || 800,
        humedad_aire: datosHuerto.humedad_aire || 65
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error en horarios de sol:', error);
    return { error: error.message };
  }
};

/**
 * 🌡️ CLIMA ACTUAL
 * Obtiene clima actual sin consumir datos de sensores
 */
export const obtenerClimaActual = async (latitude = -12.0, longitude = -77.0) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/ia/clima-actual?latitude=${latitude}&longitude=${longitude}`,
      { method: 'GET' }
    );
    return await response.json();
  } catch (error) {
    console.error('Error al obtener clima:', error);
    return { error: error.message };
  }
};

// ============================================
// EJEMPLO DE USO EN UN COMPONENTE REACT
// ============================================

/**
 * Ejemplo de componente que muestra todas las predicciones
 */
export const usarPrediccionesIA = async (datosHuerto) => {
  // 1. Obtener predicción completa
  const prediccion = await obtenerPrediccionCompleta(datosHuerto);
  
  if (prediccion.error) {
    console.error('Error:', prediccion.error);
    return null;
  }
  
  return {
    // Información general
    timestamp: prediccion.timestamp,
    ubicacion: prediccion.ubicacion,
    
    // Clima
    clima_actual: prediccion.clima_actual,
    pronostico_7_dias: prediccion.pronostico_7_dias,
    
    // Alertas
    alertas_clima: prediccion.alertas_clima,
    
    // Predicciones
    calendario_riegos: prediccion.calendario_riegos,
    riesgo_enfermedad: prediccion.riesgo_enfermedad,
    horarios_sol_optimo: prediccion.horarios_sol_optimo,
    
    // Recomendaciones
    recomendaciones: prediccion.recomendaciones_generales
  };
};

// ============================================
// FORMATO DE DATOS PARA ENVIAR
// ============================================

const FORMATO_DATOS_HUERTO = {
  // Datos de sensores (requeridos)
  humedad_suelo: 45,      // 0-100 (%)
  temperatura: 25,        // °C
  luz: 800,               // lux
  humedad_aire: 65,       // 0-100 (%)
  
  // Ubicación (opcional, default: Lima, Perú)
  latitude: -12.0,
  longitude: -77.0
};

