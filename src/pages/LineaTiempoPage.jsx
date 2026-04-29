import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import { api } from '../api';
import { ETAPAS_CFG } from '../utils/colorScheme';

const S = ETAPAS_CFG();

export default function LineaTiempoPage() {
  const [etapas, setEtapas]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEtapas()
      .then(data => setEtapas(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      ⏳ Cargando etapas...
    </div>
  );

  const completadas = etapas.filter(e => e.estado === 'completado').length;
  const pct = etapas.length > 0 ? Math.round((completadas / etapas.length) * 100) : 0;

  return (
    <div style={{ flex: 1 }}>
      <Topbar title="Línea de Tiempo del Cultivo" subtitle="Seguimiento del ciclo de vida completo de tus cultivos" />
      <div className="page-wrapper">

        <div className="card" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: 2 }}>🍅 Tomate Cherry — Ciclo Actual</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{completadas} de {etapas.length} etapas completadas</p>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--green-accent)' }}>{pct}%</div>
          </div>
          <div style={{ height: 8, background: 'var(--bg-border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--green-primary), var(--green-accent))', borderRadius: 4 }} />
          </div>
        </div>

        {etapas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
            <p>No hay etapas registradas aún.</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 28, top: 0, bottom: 0, width: 2, background: 'var(--bg-border)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {etapas.map((etapa, idx) => {
                const cfg = S[etapa.estado] || S.pendiente;
                const activa = etapa.estado === 'en_progreso';
                return (
                  <div key={etapa.id} style={{ display: 'flex', gap: 20, paddingBottom: 24 }}>
                    <div style={{
                      position: 'relative', zIndex: 1, flexShrink: 0,
                      width: 58, height: 58,
                      background: activa ? 'linear-gradient(135deg, var(--green-primary), var(--green-glow))' : 'var(--bg-card)',
                      border: `2px solid ${cfg.color}`, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                      boxShadow: activa ? 'var(--shadow-glow)' : 'none',
                    }}>{etapa.icono || '🌱'}</div>
                    <div className="card" style={{ flex: 1, padding: '18px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: activa ? 'var(--green-accent)' : 'var(--text-primary)', marginBottom: 4 }}>{etapa.nombre}</h3>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 20 }}>{cfg.label}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{etapa.fecha}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{etapa.descripcion}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {Object.entries(etapa.datos || {}).map(([k, v]) => (
                          <div key={k} style={{ padding: '4px 12px', background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 20, fontSize: '0.72rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{k}: </span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
