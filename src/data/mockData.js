export const sensorActual = {
  humedad_suelo: 68, temperatura: 24,
  luminosidad: 850, humedad_ambiental: 72,
  ultima_actualizacion: new Date(),
};

export function generarHistorial(horas = 24) {
  const ahora = Date.now();
  return Array.from({ length: horas }, (_, i) => {
    const t = ahora - (horas - i) * 3600000;
    return {
      hora: new Date(t).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      humedad:     Math.round(55 + Math.sin(i * 0.4) * 20 + Math.random() * 5),
      temperatura: Math.round(20 + Math.cos(i * 0.3) * 6 + Math.random() * 2),
      luz:         Math.round(400 + Math.sin(i * 0.5) * 400 + Math.random() * 50),
    };
  });
}

export const alertas = [
  { id: 1, tipo: 'advertencia', variable: 'Humedad del Suelo', mensaje: 'Humedad baja en Sector B', tiempo: 'Hace 15 min', icono: '💧' },
  { id: 2, tipo: 'critico',     variable: 'Temperatura',       mensaje: 'Temperatura elevada detectada', tiempo: 'Hace 1 hora', icono: '🌡️' },
  { id: 3, tipo: 'info',        variable: 'Riego',             mensaje: 'Riego automático a las 18:00', tiempo: 'Hace 2 horas', icono: '🚿' },
];

export const recomendaciones = [
  { id: 1, prioridad: 'alta',  accion: 'Aumentar frecuencia de riego', descripcion: 'Los niveles de humedad en el Sector A están por debajo del óptimo. Incrementa el riego un 20% los próximos 3 días.', variable: 'Humedad del Suelo', icono: '💧', confianza: 94 },
  { id: 2, prioridad: 'alta',  accion: 'Instalar malla de sombra',     descripcion: 'La luminosidad excesiva afecta el crecimiento de las lechugas. Instala una malla al 30%.', variable: 'Luminosidad', icono: '☀️', confianza: 88 },
  { id: 3, prioridad: 'media', accion: 'Monitorear temperatura nocturna', descripcion: 'Variaciones nocturnas detectadas que podrían afectar los tomates. Considera cobertura térmica.', variable: 'Temperatura', icono: '🌡️', confianza: 76 },
  { id: 4, prioridad: 'baja',  accion: 'Registrar etapa de crecimiento', descripcion: 'Han pasado 7 días desde el último registro. Documenta el avance actual del cultivo.', variable: 'General', icono: '📝', confianza: 60 },
];

export const experimentos = [
  { id: 1, titulo: 'Efecto de la frecuencia de riego en lechugas', hipotesis: 'Aumentar el riego de 2 a 3 veces mejorará el crecimiento un 15%.', variables: ['Humedad del Suelo', 'Frecuencia de Riego'], cultivo: 'Lechuga Romana', duracion: 14, progreso: 65, estado: 'activo',     observaciones: 8  },
  { id: 2, titulo: 'Comparación de sustratos orgánicos',          hipotesis: 'El sustrato con 40% de compost produce tomates con más nutrientes.', variables: ['Composición del Suelo', 'pH'], cultivo: 'Tomate Cherry',  duracion: 30, progreso: 85, estado: 'activo',     observaciones: 15 },
  { id: 3, titulo: 'Impacto de luz LED en albahaca',              hipotesis: 'Luz LED roja 4h extra aumentará la producción de aceites esenciales.', variables: ['Luminosidad', 'Espectro de Luz'], cultivo: 'Albahaca',        duracion: 21, progreso: 100, estado: 'completado', observaciones: 21 },
  { id: 4, titulo: 'Rotación de cultivos y salud del suelo',      hipotesis: 'La rotación entre legumbres mejorará el nivel de nitrógeno.', variables: ['Nitrógeno', 'Microorganismos'], cultivo: 'Frijoles / Zanahorias', duracion: 60, progreso: 20, estado: 'pendiente',  observaciones: 3  },
];

export const etapasCultivo = [
  { id: 1, nombre: 'Preparación del Suelo', estado: 'completado',  fecha: '15 Feb 2024', icono: '🌍', descripcion: 'Acondicionamiento con compost orgánico y verificación del pH.', datos: { 'pH inicial': '6.2', 'Compost': '5kg/m²', 'Profundidad': '20cm' } },
  { id: 2, nombre: 'Siembra de Semillas',   estado: 'completado',  fecha: '22 Feb 2024', icono: '🌱', descripcion: 'Siembra directa de tomate cherry variedad Sun Gold a 30cm entre plantas.', datos: { 'Variedad': 'Sun Gold', 'Profundidad': '1cm', 'Distancia': '30cm' } },
  { id: 3, nombre: 'Germinación',           estado: 'completado',  fecha: '1 Mar 2024',  icono: '🌿', descripcion: 'Emergencia de plántulas con 92% de éxito.', datos: { 'Tasa': '92%', 'Días': '7', 'Temperatura': '22°C' } },
  { id: 4, nombre: 'Crecimiento Vegetativo',estado: 'en_progreso', fecha: '15 Mar 2024', icono: '🌳', descripcion: 'Desarrollo de hojas y tallos. Plantas a 25cm de altura.', datos: { 'Altura': '25cm', 'Hojas': '8-10', 'Nutrición': 'Óptima' } },
  { id: 5, nombre: 'Floración',             estado: 'pendiente',   fecha: '5 Abr 2024 (est.)', icono: '🌸', descripcion: 'Inicio esperado de la floración. Se monitoreará la polinización.', datos: { 'Flores/planta': '15-20', 'Duración': '2 semanas' } },
  { id: 6, nombre: 'Cosecha',               estado: 'pendiente',   fecha: '15 May 2024 (est.)', icono: '🍅', descripcion: 'Recolección de frutos maduros al color rojo intenso.', datos: { 'Frutos/planta': '40-50', 'Peso': '15-20g' } },
];

export const indicadoresSTEAM = {
  experimentos_activos: 12,
  observaciones_totales: 248,
  variables_monitoreadas: 8,
  sesiones_semana: 15,
  areas: [
    { area: 'Ciencia',      descripcion: 'Método científico y experimentación', actividades: 29, progreso: 85 },
    { area: 'Tecnología',   descripcion: 'Sensores IoT y monitoreo digital',    actividades: 22, progreso: 70 },
    { area: 'Ingeniería',   descripcion: 'Sistemas de riego y estructuras',      actividades: 18, progreso: 60 },
    { area: 'Arte',         descripcion: 'Documentación visual y diseño',        actividades: 15, progreso: 50 },
    { area: 'Matemáticas',  descripcion: 'Análisis de datos y estadísticas',     actividades: 25, progreso: 75 },
  ],
};

export const prediccionesML = Array.from({ length: 6 }, (_, i) => ({
  hora: `+${(i + 1) * 2}h`,
  humedad_predicha: Math.round(65 - i * 3 + Math.random() * 4),
  confianza_min:    Math.round(58 - i * 3),
  confianza_max:    Math.round(72 - i * 3 + 4),
}));