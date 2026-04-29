import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const ROLES = [
  { username: 'estudiante1', label: 'Soy Estudiante', icon: '🌱', color: '#2D9B5A', bg: '#E8F7EE' },
  { username: 'docente1',    label: 'Soy Docente',    icon: '🌿', color: '#3B82F6', bg: '#EFF6FF' },
  { username: 'admin',       label: 'Soy Admin',      icon: '🌳', color: '#F5A623', bg: '#FEF3DC' },
];

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const r = await login(form.username, form.password);
    if (r.ok) navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      backgroundImage: 'radial-gradient(circle at 20% 80%, #D1FAE5 0%, transparent 40%), radial-gradient(circle at 80% 20%, #DCFCE7 0%, transparent 40%)',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div className={mounted ? 'animate-up' : ''} style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, background: 'var(--green)',
            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, boxShadow: 'var(--shadow-green)',
            animation: 'floatY 4s ease-in-out infinite',
          }}>🌱</div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>
            ¡Hola! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: '0.95rem' }}>
            Ingresa a tu huerto inteligente
          </p>
        </div>

        {/* Selección de rol */}
        <div className={mounted ? 'animate-up' : ''} style={{ marginBottom: 24, animationDelay: '0.05s' }}>
          <p style={{ textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ¿Quién eres?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {ROLES.map((r, index) => {
              const selected = form.username === r.username;

              return (
                <button
                  key={r.username}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setForm({ username: r.username, password: '' })}
                  style={{
                    padding: '14px 8px', borderRadius: 'var(--radius)',
                    border: `2px solid ${selected ? r.color : 'var(--border)'}`,
                    background: selected
                      ? `linear-gradient(180deg, ${r.bg} 0%, #ffffff 100%)`
                      : 'var(--white)',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.28s ease',
                    transform: selected ? 'translateY(-4px) scale(1.03)' : 'translateY(0) scale(1)',
                    boxShadow: selected
                      ? `0 12px 26px ${r.color}33, 0 0 0 1px ${r.color}22 inset`
                      : '0 1px 0 rgba(0,0,0,0.02)',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: mounted ? `fadeUp 0.45s ease both ${index * 0.08}s` : 'none',
                  }}
                  onMouseEnter={(event) => {
                    if (!selected) {
                      event.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.transform = selected ? 'translateY(-4px) scale(1.03)' : 'translateY(0) scale(1)';
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6, filter: selected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.75))' : 'none' }}>{r.icon}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: selected ? r.color : 'var(--text-soft)' }}>
                    {r.label}
                  </div>
                  {selected && (
                    <span style={{
                      position: 'absolute', inset: 0, borderRadius: 'var(--radius)',
                      border: `1px solid ${r.color}25`, pointerEvents: 'none',
                      animation: 'pulseGlow 1.8s ease-in-out infinite',
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`card ${mounted ? 'animate-pop' : ''}`} style={{ padding: 28, animationDelay: '0.12s' }}>
          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Usuario</label>
              <input className="input" type="text" name="login-username" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck="false" placeholder="ej. estudiante1"
                value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} name="login-password" autoComplete="new-password" autoCorrect="off" autoCapitalize="none" spellCheck="false" placeholder="••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex',
                }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <p style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Elige un perfil para completar el usuario. La contraseña no se autocompleta.
              </p>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', marginBottom: 16, background: 'var(--red-light)',
                border: '1.5px solid #FECACA', borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem', color: 'var(--red)', fontWeight: 600,
              }}>⚠️ {error}</div>
            )}

            <button type="submit" className="btn btn-green" disabled={loading}
              style={{
                width: '100%', justifyContent: 'center', padding: '13px', fontSize: '1rem',
                boxShadow: loading ? 'none' : 'var(--shadow-green)',
              }}>
              {loading ? '⏳ Entrando...' : '¡Entrar al Huerto! 🌿'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          SmartGardenSchool · Universidad Continental 2026
        </p>
      </div>
    </div>
  );
}