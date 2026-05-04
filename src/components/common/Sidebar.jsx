import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

const NAV = [
  { to: '/dashboard',       icon: '🏠', label: 'Inicio',        roles: ['estudiante','docente','admin'] },
  { to: '/predicciones',    icon: '🔮', label: 'Predicciones',  roles: ['estudiante','docente','admin'] },
  { to: '/recomendaciones', icon: '🤖', label: 'Consejos IA',   roles: ['estudiante','docente','admin'] },
  { to: '/experimentos',    icon: '🔬', label: 'Experimentos',  roles: ['estudiante','docente','admin'] },
  { to: '/linea-tiempo',    icon: '🌱', label: 'Mi Cultivo',    roles: ['estudiante','docente','admin'] },
  { to: '/niveles',         icon: '🏆', label: 'Mis Niveles',   roles: ['estudiante','docente','admin'] },
  { to: '/indicadores',     icon: '📊', label: 'STEAM',         roles: ['docente','admin'] },
  { to: '/admin/usuarios',  icon: '👥', label: 'Usuarios',      roles: ['admin'] },
  { to: '/admin/config',    icon: '⚙️', label: 'Configuración', roles: ['admin'] },
];

const ROL_COLOR = { estudiante: '#2D9B5A', docente: '#3B82F6', admin: '#F5A623' };
const ROL_LABEL = { estudiante: 'Estudiante', docente: 'Docente', admin: 'Admin' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside style={{
      width: 'var(--sidebar-w)', background: 'var(--white)',
      borderRight: '1px solid var(--border)', height: '100vh',
      position: 'fixed', left: 0, top: 0,
      display: 'flex', flexDirection: 'column', zIndex: 100,
      boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
    }}>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: 'var(--shadow-green)' }}>🌱</div>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', lineHeight: 1.1 }}>HuertoSmart</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Huerto Inteligente</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.filter(n => n.roles.includes(user?.rol)).map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 'var(--radius)',
            marginBottom: 4, textDecoration: 'none',
            fontWeight: isActive ? 800 : 600, fontSize: '0.9rem',
            color: isActive ? 'var(--green)' : 'var(--text-soft)',
            background: isActive ? 'var(--green-light)' : 'transparent',
            transition: 'var(--transition)',
          })}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--radius)', marginBottom: 8 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--green-light)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{user?.avatar}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nombre}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: ROL_COLOR[user?.rol] }}>{ROL_LABEL[user?.rol]}</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
          <LogOut size={15} /> Salir
        </button>
      </div>
    </aside>
  );
}