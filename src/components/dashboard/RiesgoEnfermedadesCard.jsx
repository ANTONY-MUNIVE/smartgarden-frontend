import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Componente para mostrar el riesgo de enfermedades
 */
export default function RiesgoEnfermedadesCard({ riesgo, loading }) {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className="card">
        <h3 className="section-title">🦠 Análisis de Enfermedades</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          ⏳ Analizando riesgos...
        </div>
      </div>
    );
  }

  if (!riesgo || riesgo.error) {
    return (
      <div className="card">
        <h3 className="section-title">🦠 Análisis de Enfermedades</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          ❌ Error al cargar análisis
        </div>
      </div>
    );
  }

  const getRiesgoConfig = (nivel) => {
    switch (nivel) {
      case 'CRÍTICO':
        return {
          bg: isDark ? '#2a1111' : '#FEF2F2',
          border: '#DC2626',
          text: '#991B1B',
          barColor: '#DC2626',
          emoji: '🔴',
        };
      case 'ALTO':
        return {
          bg: isDark ? '#2a1d10' : '#FEF3DC',
          border: '#FCD88A',
          text: '#92400E',
          barColor: '#F59E0B',
          emoji: '🟠',
        };
      case 'MEDIO':
        return {
          bg: isDark ? '#1f2937' : '#F3F4F6',
          border: '#9CA3AF',
          text: '#374151',
          barColor: '#FCD88A',
          emoji: '🟡',
        };
      case 'BAJO':
        return {
          bg: isDark ? '#1a3a1a' : '#F0FDF4',
          border: '#86EFAC',
          text: '#15803D',
          barColor: '#86EFAC',
          emoji: '🟢',
        };
      default:
        return {
          bg: isDark ? '#1f2937' : '#F3F4F6',
          border: '#9CA3AF',
          text: '#374151',
          barColor: '#9CA3AF',
          emoji: '⚪',
        };
    }
  };

  const config = getRiesgoConfig(riesgo.nivel_riesgo);
  const probabilidad = riesgo.probabilidad_enfermedad || 0;

  return (
    <div className="card">
      <h3 className="section-title">🦠 Análisis de Enfermedades</h3>

      {/* Barra de riesgo */}
      <div
        style={{
          padding: '14px 16px',
          background: config.bg,
          border: `1.5px solid ${config.border}`,
          borderRadius: 'var(--radius)',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>{config.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: config.text }}>
              {riesgo.nivel_riesgo}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Probabilidad: {probabilidad.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div
          style={{
            height: 8,
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(probabilidad, 100)}%`,
              background: config.barColor,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Enfermedades detectadas */}
      {riesgo.enfermedades_riesgo && riesgo.enfermedades_riesgo.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 8 }}>
            ⚠️ Enfermedades potenciales:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {riesgo.enfermedades_riesgo.map((enfermedad, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '0.8rem',
                  padding: '6px 10px',
                  background: isDark ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.15)',
                  borderLeft: '3px solid #FCD88A',
                  borderRadius: 4,
                  color: isDark ? '#FDE68A' : '#92400E',
                }}
              >
                {enfermedad}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {riesgo.recomendaciones && riesgo.recomendaciones.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 8 }}>
            💡 Recomendaciones:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {riesgo.recomendaciones.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '0.8rem',
                  padding: '6px 10px',
                  background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.15)',
                  borderLeft: '3px solid #22C55E',
                  borderRadius: 4,
                  color: isDark ? '#86EFAC' : '#15803D',
                }}
              >
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
