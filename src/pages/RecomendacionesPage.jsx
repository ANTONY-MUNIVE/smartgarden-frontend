import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import { api } from '../api';
import { RECOMENDACIONES_CFG } from '../utils/colorScheme';

export default function RecomendacionesPage() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  const [consejoIA, setConsejoIA] = useState('Analizando datos actuales del huerto...');
  const [prioridadIA, setPrioridadIA] = useState('baja');
  const P_CFG = RECOMENDACIONES_CFG();

  const cargarConsejoIA = async () => {
    try {
      const sensor = await api.getSensorActual();
      const data = await api.recomendarIA({
        humedad_suelo: Number(sensor.humedad_suelo || 0),
        temperatura: 80,
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

    cargarConsejoIA();
    const intervalo = setInterval(cargarConsejoIA, 10000);

    return () => clearInterval(intervalo);
  }, []);

  const aplicar = async (id) => {
    try {
      const updated = await api.aplicarRecomendacion(id);
      setLista(prev => prev.map(r => r.id === id ? updated : r));
    } catch {}
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