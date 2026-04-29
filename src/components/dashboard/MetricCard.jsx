export default function MetricCard({ icon, label, value, unit, delta, estado, color }) {
  const colores = {
    green:  { bg: 'rgba(26,122,74,0.12)',  border: 'rgba(26,122,74,0.35)',  text: '#4ADE80' },
    red:    { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)',  text: '#FCA5A5' },
    yellow: { bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.35)',  text: '#FDE68A' },
    blue:   { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)', text: '#93C5FD' },
  };
  const c = colores[color] || colores.green;

  return (
    <div className="card" style={{ background: c.bg, borderColor: c.border, padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 42, height: 42, background: c.bg, border: `1px solid ${c.border}`,
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>{icon}</div>
        {delta && (
          <span style={{
            fontSize: '0.72rem', fontWeight: 700,
            color: delta.startsWith('+') ? 'var(--green-accent)' : '#FCA5A5',
            background: delta.startsWith('+') ? 'rgba(26,122,74,0.15)' : 'rgba(239,68,68,0.15)',
            padding: '2px 8px', borderRadius: 20,
          }}>{delta}</span>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: c.text, lineHeight: 1, marginBottom: 6 }}>
        {value}<span style={{ fontSize: '1rem', fontWeight: 600, marginLeft: 4, color: 'var(--text-muted)' }}>{unit}</span>
      </div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {estado && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: estado === 'adecuado' ? 'var(--green-accent)' : estado === 'advertencia' ? 'var(--alert-yellow)' : 'var(--alert-red)',
          }} />
          <span style={{
            fontSize: '0.7rem', fontWeight: 700,
            color: estado === 'adecuado' ? 'var(--green-accent)' : estado === 'advertencia' ? 'var(--alert-yellow)' : 'var(--alert-red)',
          }}>
            {estado === 'adecuado' ? '✓ Normal' : estado === 'advertencia' ? '⚠ Atención' : '✗ Crítico'}
          </span>
        </div>
      )}
    </div>
  );
}