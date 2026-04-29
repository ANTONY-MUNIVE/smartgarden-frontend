import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import { api } from '../api';

const CONFIG_INICIAL = {
  humedad_min: 25, humedad_max: 80,
  temp_min: 15,    temp_max: 35,
  luz_min: 200,    luz_max: 1000,
  intervalo_sensor: 10,
  alertas_email: true,
  alertas_dashboard: true,
  cultivo_actual: 'Tomate Cherry',
  etapa_actual: 'Crecimiento Vegetativo',
};

export default function AdminConfigPage() {
  const [config, setConfig]   = useState(CONFIG_INICIAL);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado]   = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    api.getConfig()
      .then(data => { if (data && Object.keys(data).length > 0) setConfig(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      await api.guardarConfig(config);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } catch {
      setError('No se pudo guardar la configuración.');
    } finally {
      setGuardando(false);
    }
  };

  const set = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const SliderConfig = ({ label, minKey, maxKey, unit, min, max }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <label className="label" style={{ marginBottom: 0 }}>{label}</label>
        <span style={{ fontSize: '0.8rem', color: 'var(--green-accent)', fontWeight: 700 }}>
          {config[minKey]} – {config[maxKey]} {unit}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="label" style={{ fontSize: '0.7rem' }}>Mínimo</label>
          <input type="number" className="input" min={min} max={config[maxKey] - 1}
            value={config[minKey]} onChange={e => set(minKey, Number(e.target.value))} />
        </div>
        <div>
          <label className="label" style={{ fontSize: '0.7rem' }}>Máximo</label>
          <input type="number" className="input" min={config[minKey] + 1} max={max}
            value={config[maxKey]} onChange={e => set(maxKey, Number(e.target.value))} />
        </div>
      </div>
      <div style={{ marginTop: 8, height: 6, background: 'var(--bg-border)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', height: '100%',
          left: `${((config[minKey] - min) / (max - min)) * 100}%`,
          width: `${((config[maxKey] - config[minKey]) / (max - min)) * 100}%`,
          background: 'linear-gradient(90deg, var(--green-primary), var(--green-accent))',
          borderRadius: 3,
        }} />
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      ⏳ Cargando configuración...
    </div>
  );

  return (
    <div style={{ flex: 1 }}>
      <Topbar title="Configuración del Sistema" subtitle="Ajusta los umbrales de alerta y parámetros del huerto" />
      <div className="page-wrapper">

        <form onSubmit={guardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            <div className="card">
              <h2 className="section-title">⚙️ Umbrales de Alerta</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                El sistema generará alertas cuando los valores salgan de estos rangos.
              </p>
              <SliderConfig label="💧 Humedad del Suelo" minKey="humedad_min" maxKey="humedad_max" unit="%" min={0} max={100} />
              <SliderConfig label="🌡️ Temperatura" minKey="temp_min" maxKey="temp_max" unit="°C" min={0} max={50} />
              <SliderConfig label="☀️ Luminosidad" minKey="luz_min" maxKey="luz_max" unit="lux" min={0} max={2000} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card">
                <h2 className="section-title">🌱 Cultivo Actual</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label className="label">Nombre del cultivo</label>
                    <input className="input" value={config.cultivo_actual} onChange={e => set('cultivo_actual', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Etapa actual</label>
                    <select className="input" value={config.etapa_actual} onChange={e => set('etapa_actual', e.target.value)}>
                      <option>Preparación del Suelo</option>
                      <option>Siembra de Semillas</option>
                      <option>Germinación</option>
                      <option>Crecimiento Vegetativo</option>
                      <option>Floración</option>
                      <option>Cosecha</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="section-title">📡 Sensor IoT</h2>
                <div>
                  <label className="label">Intervalo de lectura (segundos)</label>
                  <input type="number" className="input" min={5} max={60}
                    value={config.intervalo_sensor} onChange={e => set('intervalo_sensor', Number(e.target.value))} />
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Cada cuántos segundos el ESP32 envía datos. Mínimo 5s.
                  </p>
                </div>
              </div>

              <div className="card">
                <h2 className="section-title">🔔 Notificaciones</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { key: 'alertas_dashboard', label: 'Alertas en el Dashboard', desc: 'Mostrar notificaciones en tiempo real' },
                    { key: 'alertas_email',     label: 'Alertas por correo',       desc: 'Enviar email cuando hay condición crítica' },
                  ].map(opt => (
                    <div key={opt.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                      </div>
                      <button type="button" onClick={() => set(opt.key, !config[opt.key])} style={{ width: 44, height: 24, borderRadius: 12, background: config[opt.key] ? 'var(--green-primary)' : 'var(--bg-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'var(--transition)' }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: config[opt.key] ? 23 : 3, transition: 'var(--transition)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14 }}>
            {error && <span style={{ fontSize: '0.85rem', color: 'var(--red)', fontWeight: 700 }}>⚠️ {error}</span>}
            {guardado && (
              <span style={{ fontSize: '0.85rem', color: 'var(--green-accent)', fontWeight: 700, background: 'rgba(26,122,74,0.15)', padding: '8px 16px', border: '1px solid rgba(26,122,74,0.3)', borderRadius: 'var(--radius-sm)' }}>
                ✓ Configuración guardada exitosamente
              </span>
            )}
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }} disabled={guardando}>
              {guardando ? '⏳ Guardando...' : '💾 Guardar configuración'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
