import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/common/Topbar';
import { api } from '../api';
import { RECOMENDACIONES_CFG } from '../utils/colorScheme';

export default function RecomendacionesPage() {
  const navigate = useNavigate();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  const [consejoIA, setConsejoIA] = useState('Analizando datos actuales del huerto...');
  const [prioridadIA, setPrioridadIA] = useState('baja');
  const P_CFG = RECOMENDACIONES_CFG();
  const [prediccionHumedad, setPrediccionHumedad] = useState(null);
  const [mensajePrediccion, setMensajePrediccion] = useState('Calculando predicción del modelo entrenado...');
  const [filtroEstado, setFiltroEstado] = useState('pendientes'); // 'pendientes' o 'hecho'
  const ultimasRecsIARef = useRef(''); // Hash de recomendaciones guardadas

  const cargarRecomendaciones = async () => {
    try {
      const data = await api.getRecomendaciones();
      setLista(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando recomendaciones:', error);
    }
  };

  const cargarConsejoIA = async () => {
    try {
      const sensor = await api.getSensorActual();
      const data = await api.recomendarIA({
        humedad_suelo: Number(sensor.humedad_suelo || 0),
        temperatura: Number(sensor.temperatura || 0),
        luz: Number(sensor.luminosidad || 0),
        humedad_aire: Number(sensor.humedad_ambiental || 0),
      });

      if (data.recomendaciones && data.recomendaciones.length > 0) {
        setConsejoIA(data.recomendaciones[0]);
        setPrioridadIA(data.prioridad || 'baja');
      } else {
        setConsejoIA('La IA no encontró recomendaciones críticas por ahora.');
        setPrioridadIA('baja');
      }
    } catch (error) {
      console.error('Error al obtener recomendación IA:', error);
      setConsejoIA('No se pudo cargar la recomendación IA desde el backend.');
      setPrioridadIA('baja');
    }
  };

  useEffect(() => {
    cargarRecomendaciones().finally(() => setLoading(false));

    const cargarPrediccionIA = async () => {
      try {
        const { obtenerPrediccionCompleta } = await import('../api');
        const sensor = await api.getSensorActual();
        const datosSensor = {
          humedad_suelo: Number(sensor.humedad_suelo || 0),
          temperatura: Number(sensor.temperatura || 0),
          luz: Number(sensor.luminosidad || 0),
          humedad_aire: Number(sensor.humedad_ambiental || 0),
        };

        // Obtener predicción completa
        const datosCompletos = await obtenerPrediccionCompleta(datosSensor);
        if (datosCompletos && datosCompletos.recomendaciones_generales) {
          // Hash de recomendaciones actuales para evitar duplicados
          const hashActual = JSON.stringify(datosCompletos.recomendaciones_generales);

          // Si las recomendaciones cambiaron, guardar las nuevas en BD
          if (hashActual !== ultimasRecsIARef.current) {
            try {
              // Crear recomendaciones IA en BD (solo las nuevas)
              for (const recTexto of datosCompletos.recomendaciones_generales) {
                await api.crearRecomendacion({
                  accion: recTexto,
                  descripcion: 'Recomendación automática generada por IA',
                  prioridad: 'alta',
                  confianza: 85,
                  aplicada: false,
                  icono: '🤖',
                  variable: 'prediccion_ia'
                });
              }
              // Actualizar hash y recargar lista
              ultimasRecsIARef.current = hashActual;
              await cargarRecomendaciones();
            } catch (error) {
              console.error('Error al guardar recomendaciones IA:', error);
            }
          }

          setMensajePrediccion('Recomendaciones de IA sincronizadas con BD.');
        }

        // Predicción de humedad
        const dataPrediccion = await api.predecirIA(datosSensor);
        if (dataPrediccion && dataPrediccion.humedad_futura_predicha !== undefined) {
          setPrediccionHumedad(dataPrediccion.humedad_futura_predicha);
          setMensajePrediccion(dataPrediccion.mensaje || 'Predicción generada correctamente.');
        }
      } catch (error) {
        console.error('Error al obtener predicción IA:', error);
      }
    };

    cargarConsejoIA();
    cargarPrediccionIA();
    const intervalo = setInterval(() => { cargarConsejoIA(); cargarPrediccionIA(); }, 10000);

    return () => clearInterval(intervalo);
  }, []);

  const aplicar = async (id) => {
    try {
      const updated = await api.aplicarRecomendacion(id);
      setLista(prev => prev.map(r => r.id === id ? updated : r));
    } catch (error) {
      console.error('Error al aplicar recomendación:', error);
    }
  };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      ⏳ Cargando recomendaciones...
    </div>
  );

  const cfgIA = P_CFG[prioridadIA] || P_CFG.baja;

  const getIconoVisible = (rec) => {
    const icono = typeof rec.icono === 'string' ? rec.icono.trim() : '';
    if (!icono || icono.includes('�') || icono.includes('Ã') || icono.includes('ð') || icono === '??') {
      return (P_CFG[rec.prioridad] || P_CFG.baja).emoji || '💡';
    }
    return icono;
  };

  return (
    <div style={{ flex: 1 }}>
      <Topbar title="Consejos de la IA 🤖" subtitle="Lo que el sistema recomienda para tu huerto" emoji="🤖" />
      <div className="page-wrapper">

        <div style={{
          padding: '20px 24px', background: 'var(--green-light)',
          border: '2px solid var(--green)', borderRadius: 'var(--radius-lg)',
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
        }}>
          <span style={{ fontSize: 44 }}>🤖</span>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--green-dark)', marginBottom: 4 }}>
              ¡El sistema analizó tu huerto!
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-soft)' }}>
              {lista.filter(r => !r.aplicada).length} sugerencias pendientes ·{' '}
              {lista.filter(r => r.aplicada).length} aplicadas ✅
            </div>
          </div>
        </div>

        {/* Predicciones de IA */}
        <section style={{
          padding: '24px',
          borderRadius: '16px',
          background: '#EFF6FF',
          border: '2px solid #BFDBFE',
          color: '#1D4ED8',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          position: 'relative',
        }}>
          <span style={{ position: 'absolute', left: 20, top: 20, fontSize: '2rem', background: '#fff', borderRadius: '50%', border: '2px solid #BFDBFE', padding: '4px 8px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>🤖</span>

          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '999px', background: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', marginLeft: '52px', border: '1.5px solid #BFDBFE' }}>🤖 Modelo entrenado</div>

          <h3 style={{ margin: '0 0 8px 52px', fontSize: '1.1rem', fontWeight: 800 }}>Predicciones de IA</h3>

          {prediccionHumedad !== null ? (
            <>
              <p style={{ marginBottom: '8px', marginLeft: '52px', fontSize: '0.95rem' }}>Humedad futura estimada del suelo:</p>

              <p style={{ fontSize: '1.8rem', fontWeight: 900, margin: '8px 0 8px 52px' }}>{prediccionHumedad}%</p>

              <p style={{ marginBottom: '8px', marginLeft: '52px', fontSize: '0.95rem' }}><strong>Modelo usado:</strong> modelo_humedad.pkl</p>

              <p style={{ fontWeight: 700, margin: '0 0 0 52px', fontSize: '0.95rem' }}>{mensajePrediccion}</p>

              <button onClick={() => navigate('/recomendaciones/detallesIA')} style={{ marginTop: '16px', marginLeft: '52px', padding: '11px 20px', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}>Ver detalles</button>
            </>
          ) : (
            <>
              <p style={{ fontWeight: 700, margin: '0 0 0 52px', fontSize: '0.95rem' }}>{mensajePrediccion}</p>

              <button onClick={() => navigate('/recomendaciones/detallesIA')} style={{ marginTop: '16px', marginLeft: '52px', padding: '11px 20px', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}>Ver detalles</button>
            </>
          )}

        </section>

        <div style={{
          padding: '22px 24px',
          background: cfgIA.bg,
          border: `2px solid ${cfgIA.border}`,
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 18,
          marginBottom: 24,
        }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 42, lineHeight: 1, marginBottom: 6 }}>🤖</div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: cfgIA.color,
              background: '#fff',
              padding: '2px 8px',
              borderRadius: 20,
              border: `1px solid ${cfgIA.border}`,
            }}>
              {cfgIA.emoji} IA {cfgIA.label}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: cfgIA.color,
              marginBottom: 6,
            }}>
              Recomendación IA en tiempo real
            </h3>

            <p style={{
              fontSize: '0.9rem',
              color: 'var(--text-soft)',
              lineHeight: 1.6,
              marginBottom: 10,
            }}>
              {consejoIA}
            </p>

            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: cfgIA.color }}>
              Prioridad IA: {prioridadIA}
            </div>
          </div>
        </div>

        {/* Filtros y lista de recomendaciones */}
        <div style={{
          padding: '24px',
          background: '#F0F9FF',
          border: '2px solid #7DD3FC',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 8 }}>
            📋 Gestor de Recomendaciones
          </h3>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, borderBottom: '2px solid #E0F2FE', paddingBottom: 12 }}>
            <button
              onClick={() => setFiltroEstado('pendientes')}
              style={{
                padding: '8px 16px',
                background: filtroEstado === 'pendientes' ? '#0369A1' : '#E0F2FE',
                color: filtroEstado === 'pendientes' ? '#fff' : '#0369A1',
                border: '1.5px solid #7DD3FC',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              📋 Pendientes ({lista.filter(r => !r.aplicada).length})
            </button>
            <button
              onClick={() => setFiltroEstado('hecho')}
              style={{
                padding: '8px 16px',
                background: filtroEstado === 'hecho' ? '#10B981' : '#ECFDF5',
                color: filtroEstado === 'hecho' ? '#fff' : '#10B981',
                border: '1.5px solid #6EE7B7',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ✅ Hecho ({lista.filter(r => r.aplicada).length})
            </button>
          </div>

          {/* Lista filtrada */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(filtroEstado === 'pendientes'
              ? lista.filter(r => !r.aplicada)
              : lista.filter(r => r.aplicada)
            ).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#7C3AED', fontSize: '0.9rem' }}>
                {filtroEstado === 'pendientes'
                  ? '✨ ¡Todas las recomendaciones completadas!'
                  : '📭 Aún no hay recomendaciones completadas'}
              </div>
            ) : (
              (filtroEstado === 'pendientes'
                ? lista.filter(r => !r.aplicada)
                : lista.filter(r => r.aplicada)
              ).map((rec) => {
                const cfg = P_CFG[rec.prioridad] || P_CFG.baja;
                return (
                  <div key={rec.id} style={{
                    padding: '14px 16px',
                    background: rec.aplicada ? '#ECFDF5' : 'rgba(3, 105, 161, 0.05)',
                    border: `1.5px solid ${rec.aplicada ? '#6EE7B7' : cfg.border || '#7DD3FC'}`,
                    borderRadius: 'var(--radius)',
                    fontSize: '0.85rem',
                    color: rec.aplicada ? '#10B981' : (cfg.color || '#0369A1'),
                    fontWeight: 500,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: rec.aplicada ? 0.7 : 1,
                    textDecoration: rec.aplicada ? 'line-through' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    <div>
                      <span>{getIconoVisible(rec)} {rec.accion}</span>
                      {rec.descripcion && (
                        <div style={{ fontSize: '0.75rem', marginTop: 4, opacity: 0.8 }}>
                          {rec.descripcion}
                        </div>
                      )}
                      {rec.created_at && (
                        <div style={{ fontSize: '0.7rem', marginTop: 2, opacity: 0.6 }}>
                          📅 {new Date(rec.created_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    {!rec.aplicada && (
                      <button
                        onClick={() => aplicar(rec.id)}
                        style={{
                          padding: '6px 12px',
                          background: cfg.btn || '#10B981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 'var(--radius)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        ✓ Listo
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}