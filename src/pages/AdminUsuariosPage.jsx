import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '../api';
import { USUARIOS_CFG } from '../utils/colorScheme';

const ROL_CFG = USUARIOS_CFG();

const FORM_VACIO = { nombre: '', username: '', email: '', rol: 'estudiante', password: '' };

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [guardando, setGuardando]     = useState(false);
  const [modal, setModal]             = useState(false);
  const [editando, setEditando]       = useState(null);
  const [form, setForm]               = useState(FORM_VACIO);
  const [busqueda, setBusqueda]       = useState('');
  const [filtroRol, setFiltroRol]     = useState('todos');
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [apiError, setApiError]       = useState('');

  const cargar = async () => {
    try {
      const data = await api.getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch {
      setApiError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setApiError('');
    setModal(true);
  };

  const abrirEditar = (u) => {
    setEditando(u.id);
    setForm({ nombre: u.nombre, username: u.username, email: u.email || '', rol: u.rol, password: '' });
    setApiError('');
    setModal(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setApiError('');
    try {
      if (editando) {
        const payload = { nombre: form.nombre, username: form.username, email: form.email, rol: form.rol };
        if (form.password) payload.password = form.password;
        const result = await api.editarUsuario(editando, payload);
        if (result.error) { setApiError(result.error); return; }
        setUsuarios(prev => prev.map(u => u.id === editando ? result.user : u));
      } else {
        const result = await api.crearUsuario({ nombre: form.nombre, username: form.username, email: form.email, rol: form.rol, password: form.password });
        if (result.error) { setApiError(result.error); return; }
        setUsuarios(prev => [...prev, result.user]);
      }
      setModal(false);
      setForm(FORM_VACIO);
      setEditando(null);
    } catch {
      setApiError('Error al conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (id) => {
    try {
      const result = await api.toggleUsuario(id);
      if (result.user) setUsuarios(prev => prev.map(u => u.id === id ? result.user : u));
    } catch {}
  };

  const eliminar = async (id) => {
    try {
      await api.eliminarUsuario(id);
      setUsuarios(prev => prev.filter(u => u.id !== id));
    } catch {}
    setConfirmarEliminar(null);
  };

  const filtrados = usuarios.filter(u => {
    const q = busqueda.toLowerCase();
    const coincide = u.nombre.toLowerCase().includes(q) ||
                     u.username.toLowerCase().includes(q) ||
                     (u.email || '').toLowerCase().includes(q);
    return coincide && (filtroRol === 'todos' || u.rol === filtroRol);
  });

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      ⏳ Cargando usuarios...
    </div>
  );

  return (
    <div style={{ flex: 1 }}>
      <Topbar title="Gestión de Usuarios" subtitle="Administra los usuarios y roles del sistema" />
      <div className="page-wrapper">

        {apiError && !modal && (
          <div style={{ padding: '10px 16px', marginBottom: 16, background: 'var(--red-light)', border: '1.5px solid #FECACA', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--red)', fontWeight: 600 }}>
            ⚠️ {apiError}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Estudiantes', count: usuarios.filter(u=>u.rol==='estudiante').length, color: '#4ADE80', icon: '🌱' },
            { label: 'Docentes',    count: usuarios.filter(u=>u.rol==='docente').length,    color: '#60A5FA', icon: '🌿' },
            { label: 'Admins',      count: usuarios.filter(u=>u.rol==='admin').length,      color: '#F59E0B', icon: '🌳' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Barra de acciones */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input className="input" placeholder="🔍 Buscar por nombre, usuario o correo..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
          <select className="input" style={{ width: 140 }} value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
            <option value="todos">Todos los roles</option>
            <option value="estudiante">Estudiante</option>
            <option value="docente">Docente</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={abrirCrear} className="btn btn-primary"><Plus size={16} /> Nuevo Usuario</button>
        </div>

        {/* Tabla */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bg-border)' }}>
                {['Usuario', 'Correo', 'Rol', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u, idx) => {
                const cfg = ROL_CFG[u.rol] || ROL_CFG.estudiante;
                return (
                  <tr key={u.id} style={{ borderBottom: idx < filtrados.length - 1 ? '1px solid var(--bg-border)' : 'none', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${cfg.color}20`, border: `1px solid ${cfg.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{u.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{u.nombre}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '3px 10px', borderRadius: 20 }}>{cfg.label}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button onClick={() => toggleActivo(u.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: u.activo ? 'rgba(26,122,74,0.15)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${u.activo ? 'rgba(26,122,74,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        borderRadius: 20, padding: '3px 10px', cursor: 'pointer',
                        fontSize: '0.72rem', fontWeight: 700,
                        color: u.activo ? 'var(--green-accent)' : '#FCA5A5',
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: u.activo ? 'var(--green-accent)' : '#EF4444' }} />
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => abrirEditar(u)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700 }}>
                          <Pencil size={13} /> Editar
                        </button>
                        <button onClick={() => setConfirmarEliminar(u.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700 }}>
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtrados.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <p>No se encontraron usuarios con esos filtros.</p>
            </div>
          )}
        </div>

        {/* Modal crear/editar */}
        {modal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-xl)', padding: 32, width: '100%', maxWidth: 460 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
                  {editando ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
                </h2>
                <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>
              {apiError && (
                <div style={{ padding: '8px 12px', marginBottom: 14, background: 'var(--red-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--red)' }}>⚠️ {apiError}</div>
              )}
              <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Nombre completo</label>
                  <input className="input" required placeholder="ej. Carlos Quispe" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Usuario</label>
                    <input className="input" required placeholder="ej. carlos123" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Rol</label>
                    <select className="input" value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                      <option value="estudiante">Estudiante</option>
                      <option value="docente">Docente</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Correo electrónico</label>
                  <input className="input" type="email" required placeholder="correo@uc.edu.pe" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">{editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}</label>
                  <input className="input" type="password" required={!editando} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={() => setModal(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={guardando}>
                    {guardando ? '⏳ Guardando...' : (editando ? 'Guardar cambios' : 'Crear usuario')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal confirmar eliminar */}
        {confirmarEliminar && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-xl)', padding: 32, width: '100%', maxWidth: 380, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>¿Eliminar usuario?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>Esta acción no se puede deshacer.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmarEliminar(null)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                <button onClick={() => eliminar(confirmarEliminar)} style={{ flex: 1, padding: '10px 20px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 'var(--radius-sm)', color: '#FCA5A5', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
