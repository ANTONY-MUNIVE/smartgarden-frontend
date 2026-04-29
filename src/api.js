const BASE = '/api';

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
