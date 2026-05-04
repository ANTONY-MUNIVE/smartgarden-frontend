import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Componente para mostrar el calendario de riegos de 7 días
 */
export default function CalendarioRiegosCard({ calendario, loading }) {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className="card">
        <h3 className="section-title">📅 Calendario de Riegos (7 días)</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          ⏳ Calculando calendario...
        </div>
      </div>
    );
  }

  if (!calendario || calendario.length === 0) {
    return (
      <div className="card">
        <h3 className="section-title">📅 Calendario de Riegos (7 días)</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          ❌ No hay datos disponibles
        </div>
      </div>
    );
  }

  const getNecesidadColor = (necesidad) => {
    switch (necesidad) {
      case 'URGENTE':
        return { bg: isDark ? '#2a1111' : '#FEF2F2', border: '#DC2626', text: '#991B1B', emoji: '🚨' };
      case 'ALTA':
        return { bg: isDark ? '#2a1d10' : '#FEF3DC', border: '#FCD88A', text: '#92400E', emoji: '⚠️' };
      case 'MEDIA':
        return { bg: isDark ? '#1f2937' : '#F3F4F6', border: '#9CA3AF', text: '#374151', emoji: '💧' };
      case 'BAJA':
        return { bg: isDark ? '#1a3a1a' : '#F0FDF4', border: '#86EFAC', text: '#15803D', emoji: '✅' };
      default:
        return { bg: isDark ? '#1f2937' : '#F3F4F6', border: '#9CA3AF', text: '#374151', emoji: '⏸️' };
    }
  };

  return (
    <div className="card">
      <h3 className="section-title">📅 Calendario de Riegos (7 días)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {calendario.slice(0, 7).map((dia, idx) => {
          const config = getNecesidadColor(dia.necesidad);
          return (
            <div
              key={idx}
              style={{
                padding: '12px 14px',
                background: config.bg,
                border: `1.5px solid ${config.border}`,
                borderRadius: 'var(--radius)',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{config.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: config.text }}>
                  {dia.fecha} · {dia.necesidad}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  💧 {dia.cantidad_litros_m2} L/m² · ⏰ {dia.horario_recomendado}
                </div>
                {dia.lluvia_esperada > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#3B82F6', marginTop: 2 }}>
                    🌧️ Lluvia esperada: {dia.lluvia_esperada}mm
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {dia.temp_max}°C
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
