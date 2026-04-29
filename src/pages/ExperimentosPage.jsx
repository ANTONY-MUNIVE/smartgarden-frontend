import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import { useAuth } from '../context/AuthContext';
import { Plus, X } from 'lucide-react';
import { api } from '../api';
import { EXPERIMENTOS_CFG } from '../utils/colorScheme';

export default function ExperimentosPage() {
  const { user }    = useAuth();
  const [lista, setLista]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ titulo: '', hipotesis: '', cultivo: '', duracion: '' });
  const puedeCrear = ['docente', 'admin'].includes(user?.rol);
  const E_CFG = EXPERIMENTOS_CFG();

  useEffect(() => {
    api.getExperimentos()
      .then(data => setLista(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const crear = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const nuevo = await api.crearExperimento({
        titulo: form.titulo, hipotesis: form.hipotesis,
        cultivo: form.cultivo, duracion: Number(form.duracion),
        variables: ['General'], progreso: 0,
        estado: 'pendiente', observaciones: 0,
      });
      setLista(prev => [nuevo, ...prev]);
      setForm({ titulo: '', hipotesis: '', cultivo: '', duracion: '' });
      setModal(false);
    } catch {}
    finally { setGuardando(false); }
  };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      ⏳ Cargando experimentos...
    </div>
  );

  return (
    <div style={{ flex: 1 }}>
      <Topbar title="Mis Experimentos 🔬" subtitle="Registra y sigue tus experimentos científicos" emoji="🔬" />
      <div className="page-wrapper">

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { ...E_CFG.activo,     count: lista.filter(e => e.estado === 'activo').length },
            { ...E_CFG.completado, count: lista.filter(e => e.estado === 'completado').length },
            { ...E_CFG.pendiente,  count: lista.filter(e => e.estado === 'pendiente').length },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `2px solid ${s.border}`, borderRadius: 'var(--radius-lg)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 36 }}>{s.emoji}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: s.color, opacity: 0.8 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {puedeCrear && (
          <div style={{ marginBottom: 20 }}>
            <button onClick={() => setModal(true)} className="btn btn-green" style={{ fontSize: '0.95rem', padding: '11px 22px' }}>
              <Plus size={18} /> Crear nuevo experimento
            </button>
          </div>
        )}

        {lista.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔬</div>
            <p>No hay experimentos registrados aún.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
            {lista.map((exp, i) => {
              const cfg = E_CFG[exp.estado] || E_CFG.pendiente;
              return (
                <div key={exp.id} className="card animate-up" style={{ animationDelay: `${i * 0.06}s`, padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 30 }}>{cfg.emoji}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '3px 10px', borderRadius: 20, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6, lineHeight: 1.3 }}>{exp.titulo}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>{exp.hipotesis}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    <span style={{ fontSize: '0.75rem', background: 'var(--green-light)', color: 'var(--green)', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>🌱 {exp.cultivo}</span>
                    <span style={{ fontSize: '0.75rem', background: 'var(--bg)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>📅 {exp.duracion} días</span>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Progreso</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: cfg.color }}>{exp.progreso}%</span>
                    </div>
                    <div style={{ height: 8, background: cfg.bg, borderRadius: 20, overflow: 'hidden', border: `1px solid ${cfg.border}` }}>
                      <div style={{ height: '100%', width: `${exp.progreso}%`, background: cfg.color, borderRadius: 20 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📝 {exp.observaciones} observaciones</span>
                    <button onClick={() => setDetalle(exp)} className="btn btn-green" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>Ver detalles →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal crear */}
        {modal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div className="card animate-pop" style={{ width: '100%', maxWidth: 460, padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', fontWeight: 700 }}>🔬 Nuevo Experimento</h2>
                <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={22} /></button>
              </div>
              <form onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">¿Qué quieres estudiar?</label>
                  <input className="input" required placeholder="ej. Efecto del riego en lechugas" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Mi hipótesis (lo que creo que pasará)</label>
                  <textarea className="input" required rows={3} placeholder="Si hago esto... entonces pasará..." value={form.hipotesis} onChange={e => setForm(f => ({ ...f, hipotesis: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Planta o cultivo</label>
                    <input className="input" required placeholder="ej. Lechuga" value={form.cultivo} onChange={e => setForm(f => ({ ...f, cultivo: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Días de duración</label>
                    <input className="input" type="number" required min={1} placeholder="30" value={form.duracion} onChange={e => setForm(f => ({ ...f, duracion: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={() => setModal(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                  <button type="submit" className="btn btn-green" style={{ flex: 1, justifyContent: 'center' }} disabled={guardando}>
                    {guardando ? '⏳ Guardando...' : '¡Crear! 🚀'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal detalles */}
        {detalle && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div className="card animate-pop" style={{ width: '100%', maxWidth: 520, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 36 }}>{E_CFG[detalle.estado]?.emoji}</span>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{detalle.titulo}</h2>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: E_CFG[detalle.estado]?.color, background: E_CFG[detalle.estado]?.bg, padding: '2px 10px', borderRadius: 20, border: `1px solid ${E_CFG[detalle.estado]?.border}` }}>
                      {E_CFG[detalle.estado]?.label}
                    </span>
                  </div>
                </div>
                <button onClick={() => setDetalle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}><X size={22} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
                {[
                  { emoji: '🌱', label: 'Cultivo',        value: detalle.cultivo },
                  { emoji: '📅', label: 'Duración',        value: `${detalle.duracion} días` },
                  { emoji: '📝', label: 'Observaciones',   value: detalle.observaciones },
                ].map(d => (
                  <div key={d.label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{d.emoji}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>{d.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>{d.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>🧪 Mi hipótesis</div>
                <div style={{ padding: '14px 16px', background: 'var(--green-light)', border: '1.5px solid var(--green)', borderRadius: 'var(--radius)', fontSize: '0.9rem', color: 'var(--green-dark)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{detalle.hipotesis}"
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>📊 Variables que estudio</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(detalle.variables || ['General']).map(v => (
                    <span key={v} style={{ padding: '6px 14px', background: 'var(--blue-light)', color: 'var(--blue)', border: '1px solid #BFDBFE', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700 }}>📌 {v}</span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>📈 Progreso del experimento</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Avance actual</span>
                  <span style={{ fontWeight: 800, color: E_CFG[detalle.estado]?.color, fontSize: '1rem' }}>{detalle.progreso}%</span>
                </div>
                <div style={{ height: 12, background: 'var(--bg)', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ height: '100%', width: `${detalle.progreso}%`, background: E_CFG[detalle.estado]?.color, borderRadius: 20, transition: 'width 0.8s ease' }} />
                </div>
              </div>
              <button onClick={() => setDetalle(null)} className="btn btn-green" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}>✓ Entendido</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
