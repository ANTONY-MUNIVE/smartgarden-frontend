import { useState, useEffect } from 'react';
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
  const [recomendacionesIA, setRecomendacionesIA] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('pendientes'); // 'pendientes' o 'hecho'

  // Cargar estado completadas desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recomendacionesIACompleted');
    if (saved) {
      try {
        window.recomCompletadas = JSON.parse(saved);
      } catch {}
    }
  }, []);

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
    api.getRecomendaciones()
      .then(data => setLista(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));

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

        // Primero intentar predicción completa
        const datosCompletos = await obtenerPrediccionCompleta(datosSensor);
        if (datosCompletos && datosCompletos.recomendaciones_generales) {
          // Convertir recomendaciones a objetos trackables
          const recsConEstado = datosCompletos.recomendaciones_generales.map((rec, idx) => ({
            id: `rec_${idx}_${Date.now()}`,
            texto: rec,
            completada: window.recomCompletadas && window.recomCompletadas[`rec_${idx}_${Date.now()}`] ? true : false
          }));
          setRecomendacionesIA(recsConEstado);
          setMensajePrediccion('Recomendaciones de IA cargadas.');
        }

        // Luego cargar predicción de humedad compatibilidad
        const dataPrediccion = await api.predecirIA(datosSensor);
        if (dataPrediccion && dataPrediccion.humedad_futura_predicha !== undefined) {
          setPrediccionHumedad(dataPrediccion.humedad_futura_predicha);
          setMensajePrediccion(dataPrediccion.mensaje || 'Predicción generada correctamente.');
        } else {
          setPrediccionHumedad(null);
          setMensajePrediccion(datosCompletos?.error || 'No se pudo generar la predicción.');
        }
      } catch (error) {
        console.error('Error al obtener predicción IA:', error);
        setPrediccionHumedad(null);
        setMensajePrediccion('No se pudo cargar la predicción del modelo entrenado.');
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
    } catch {}
  };

  const marcarRecomIACompleta = (idRec) => {
    if (!window.recomCompletadas) window.recomCompletadas = {};
    window.recomCompletadas[idRec] = true;
    localStorage.setItem('recomendacionesIACompleted', JSON.stringify(window.recomCompletadas));
    
    // Actualizar estado para que desaparezca inmediatamente
    setRecomendacionesIA(prev => 
      prev.map(r => r.id === idRec ? { ...r, completada: true } : r)
    );
  };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      ⏳ Cargando recomendaciones...
    </div>
  );

  const cfgIA = P_CFG[prioridadIA] || P_CFG.baja;

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

        {/* Recomendaciones dinámicas de IA */}
        {recomendacionesIA.length > 0 && (
          <div style={{
            padding: '24px',
            background: '#F0F9FF',
            border: '2px solid #7DD3FC',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '24px',
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 8 }}>
              🔮 Recomendaciones Dinámicas de IA
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
                📋 Pendientes ({recomendacionesIA.filter(r => !r.completada).length})
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
                ✅ Hecho ({recomendacionesIA.filter(r => r.completada).length})
              </button>
            </div>

            {/* Lista filtrada */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(filtroEstado === 'pendientes'
                ? recomendacionesIA.filter(r => !r.completada)
                : recomendacionesIA.filter(r => r.completada)
              ).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#7C3AED', fontSize: '0.9rem' }}>
                  {filtroEstado === 'pendientes'
                    ? '✨ ¡Todas las recomendaciones completadas!'
                    : '📭 Aún no hay recomendaciones completadas'}
                </div>
              ) : (
                (filtroEstado === 'pendientes'
                  ? recomendacionesIA.filter(r => !r.completada)
                  : recomendacionesIA.filter(r => r.completada)
                ).map((rec) => (
                  <div key={rec.id} style={{
                    padding: '14px 16px',
                    background: rec.completada ? '#ECFDF5' : '#ffffff',
                    border: `1.5px solid ${rec.completada ? '#6EE7B7' : '#7DD3FC'}`,
                    borderRadius: 'var(--radius)',
                    fontSize: '0.85rem',
                    color: rec.completada ? '#10B981' : '#0369A1',
                    fontWeight: 500,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: rec.completada ? 0.7 : 1,
                    textDecoration: rec.completada ? 'line-through' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    <span>{rec.texto}</span>
                    {!rec.completada && (
                      <button
                        onClick={() => marcarRecomIACompleta(rec.id)}
                        style={{
                          padding: '6px 12px',
                          background: '#10B981',
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
                ))
              )}
            </div>
          </div>
        )}

        {lista.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
            <p>No hay recomendaciones disponibles.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {lista.map((r, i) => {
              const cfg = P_CFG[r.prioridad] || P_CFG.baja;
              return (
                <div key={r.id} className="animate-up" style={{
                  animationDelay: `${i * 0.08}s`,
                  padding: '22px 24px',
                  background: r.aplicada ? '#F9FAFB' : cfg.bg,
                  border: `2px solid ${r.aplicada ? '#E5E7EB' : cfg.border}`,
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex', gap: 18, alignItems: 'flex-start',
                  opacity: r.aplicada ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 6 }}>
                      {r.aplicada ? '✅' : (r.icono || cfg.emoji)}
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: r.aplicada ? '#6B7280' : cfg.color, background: '#fff', padding: '2px 8px', borderRadius: 20, border: `1px solid ${r.aplicada ? '#E5E7EB' : cfg.border}` }}>
                      {r.aplicada ? '✓ Aplicado' : `${cfg.emoji} ${cfg.label}`}
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: 700, color: r.aplicada ? '#9CA3AF' : cfg.color, marginBottom: 6, textDecoration: r.aplicada ? 'line-through' : 'none' }}>
                      {r.accion}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-soft)', lineHeight: 1.6, marginBottom: 14 }}>
                      {r.descripcion}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>🎯 Confianza:</span>
                      <div style={{ flex: 1, height: 8, background: '#fff', borderRadius: 20, overflow: 'hidden', border: `1px solid ${r.aplicada ? '#E5E7EB' : cfg.border}` }}>
                        <div style={{ height: '100%', width: `${r.confianza}%`, background: r.aplicada ? '#9CA3AF' : cfg.btn, borderRadius: 20 }} />
                      </div>
                      <span style={{ fontWeight: 800, color: r.aplicada ? '#9CA3AF' : cfg.color, fontSize: '0.88rem' }}>{r.confianza}%</span>
                    </div>
                  </div>

                  <button onClick={() => !r.aplicada && aplicar(r.id)} disabled={r.aplicada} style={{
                    flexShrink: 0, padding: '10px 18px',
                    background: r.aplicada ? '#E5E7EB' : cfg.btn,
                    color: r.aplicada ? '#9CA3AF' : '#fff',
                    border: 'none', borderRadius: 'var(--radius)',
                    fontWeight: 800, fontSize: '0.85rem',
                    cursor: r.aplicada ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease', alignSelf: 'center', whiteSpace: 'nowrap',
                  }}>
                    {r.aplicada ? '✅ Listo' : '✓ Aplicar'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {lista.length > 0 && lista.every(r => r.aplicada) && (
          <div style={{ marginTop: 24, padding: '24px', textAlign: 'center', background: 'var(--green-light)', border: '2px solid var(--green)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--green-dark)' }}>¡Aplicaste todos los consejos!</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-soft)', marginTop: 4 }}>Tu huerto está recibiendo el mejor cuidado posible.</div>
          </div>
        )}

      </div>
    </div>
  );
}