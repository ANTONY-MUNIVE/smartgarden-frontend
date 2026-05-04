import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Componente para mostrar horarios de sol y horas de luz
 */
export default function HorariosSolCard({ horarios, loading }) {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className="card">
        <h3 className="section-title">☀️ Horarios de Sol (7 días)</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          ⏳ Calculando horarios...
        </div>
      </div>
    );
  }

  if (!horarios || horarios.length === 0) {
    return (
      <div className="card">
        <h3 className="section-title">☀️ Horarios de Sol (7 días)</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          ❌ No hay datos disponibles
        </div>
      </div>
    );
  }

  const getHorasLuzColor = (horas) => {
    if (horas >= 12) return { color: '#22C55E', text: 'Excelente' };
    if (horas >= 10) return { color: '#3B82F6', text: 'Bueno' };
    if (horas >= 8) return { color: '#FCD88A', text: 'Moderado' };
    return { color: '#EF4444', text: 'Bajo' };
  };

  const promedio = horarios.length > 0
    ? (horarios.reduce((sum, h) => sum + h.horas_luz, 0) / horarios.length).toFixed(1)
    : 0;

  return (
    <div className="card">
      <h3 className="section-title">☀️ Horarios de Sol (7 días)</h3>

      {/* Resumen */}
      <div
        style={{
          padding: '12px 14px',
          background: isDark ? '#1f2937' : '#F3F4F6',
          border: `1.5px solid ${isDark ? '#374151' : '#D1D5DB'}`,
          borderRadius: 'var(--radius)',
          marginBottom: 14,
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
          ⏱️ Promedio: {promedio} horas/día
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
          {promedio >= 10 ? '✅ Luz suficiente' : '⚠️ Luz limitada'}
        </div>
      </div>

      {/* Detalle por día */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {horarios.slice(0, 7).map((horario, idx) => {
          const colorConfig = getHorasLuzColor(horario.horas_luz);
          return (
            <div
              key={idx}
              style={{
                padding: '10px 12px',
                background: isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.08)',
                border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)'}`,
                borderRadius: 'var(--radius)',
                display: 'grid',
                gridTemplateColumns: '70px 1fr auto',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {horario.fecha}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  🌅 {horario.salida} — 🌇 {horario.puesta}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: colorConfig.color,
                    fontWeight: 600,
                  }}
                >
                  {horario.horas_luz.toFixed(1)}h · {colorConfig.text}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colorConfig.color}22 0%, ${colorConfig.color}44 100%)`,
                  border: `2px solid ${colorConfig.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: colorConfig.color,
                }}
              >
                ☀️
              </div>
            </div>
          );
        })}
      </div>

      {/* Consejo */}
      <div
        style={{
          padding: '10px 12px',
          background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.15)',
          borderLeft: '3px solid #22C55E',
          borderRadius: 4,
          marginTop: 12,
          fontSize: '0.75rem',
          color: isDark ? '#86EFAC' : '#15803D',
        }}
      >
        💡 <strong>Tip:</strong> Las primeras horas (06:00-09:00) y últimas (15:00-18:00) son ideales para riego.
      </div>
    </div>
  );
}
