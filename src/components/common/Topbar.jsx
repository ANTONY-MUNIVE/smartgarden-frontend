import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { MoonStar, SunMedium } from 'lucide-react';

export default function Topbar({ title, subtitle, emoji = '🌿' }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: 'var(--green-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>{emoji}</div>
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', background: 'var(--green-light)',
          border: '1.5px solid var(--green)', borderRadius: 20,
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--green)',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
          Sensores activos
        </div>

        <div style={{
          padding: '6px 14px', background: 'var(--bg)',
          border: '1.5px solid var(--border)', borderRadius: 20,
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-soft)',
        }}>
          🕐 {hora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--bg)', border: '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-soft)', cursor: 'pointer', transition: 'var(--transition)',
            boxShadow: 'var(--shadow)',
          }}
        >
          {isDark ? <SunMedium size={18} /> : <MoonStar size={18} />}
        </button>

        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'var(--green-light)', border: '2px solid var(--green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>{user?.avatar}</div>
      </div>
    </header>
  );
}