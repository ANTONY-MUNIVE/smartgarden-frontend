import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import CalendarioRiegosCard from '../components/dashboard/CalendarioRiegosCard';
import RiesgoEnfermedadesCard from '../components/dashboard/RiesgoEnfermedadesCard';
import HorariosSolCard from '../components/dashboard/HorariosSolCard';
import { api, obtenerPrediccionCompleta, obtenerClimaActual } from '../api';
import { useTheme } from '../context/ThemeContext';

export default function PrediccionesPage() {
  const { isDark } = useTheme();
  const [sensor, setSensor] = useState({
    humedad_suelo: 0,
    temperatura: 0,
    luminosidad: 0,
    humedad_ambiental: 0,
  });
  const [clima, setClima] = useState(null);
  const [calendario, setCalendario] = useState([]);
  const [riesgoEnfermedad, setRiesgoEnfermedad] = useState(null);
  const [horariosSol, setHorariosSol] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recomendaciones, setRecomendaciones] = useState([]);

  const cargarPredicciones = async () => {
    try {
      setLoading(true);

      // 1. Obtener sensor actual
      const current = await api.getSensorActual();
      if (current && !current.message) {
        setSensor(current);

        // 2. Obtener clima actual
        const climaData = await obtenerClimaActual(-12.0, -77.0);
        setClima(climaData);

        // 3. Obtener predicción completa
        const prediccion = await obtenerPrediccionCompleta({
          humedad_suelo: current.humedad_suelo || 50,
          temperatura: current.temperatura || 25,
          luz: current.luminosidad || 800,
          humedad_aire: current.humedad_ambiental || 65,
        });

        if (!prediccion.error) {
          setCalendario(prediccion.calendario_riegos || []);
          setRiesgoEnfermedad(prediccion.riesgo_enfermedad || null);
          setHorariosSol(prediccion.horarios_sol_optimo || []);
          setRecomendaciones(prediccion.recomendaciones_generales || []);
        }
      }
    } catch (error) {
      console.error('Error al cargar predicciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPredicciones();
    const t = setInterval(cargarPredicciones, 30000); // Actualizar cada 30s
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ flex: 1 }}>
      <Topbar
        title="Predicciones Inteligentes"
        subtitle="Análisis 7 días: clima, riegos, enfermedades y luz solar"
        emoji="🔮"
      />

      <div className="page-wrapper">
        {/* Resumen general */}
        <div
          style={{
            padding: '16px 20px',
            background: isDark ? '#1f2937' : '#F3F4F6',
            border: `1.5px solid ${isDark ? '#374151' : '#D1D5DB'}`,
            borderRadius: 'var(--radius-lg)',
            marginBottom: 24,
          }}
        >
          <h3 style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
            📊 Resumen General
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                💧 Humedad Actual
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {Math.round(sensor.humedad_suelo)}%
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                🌡️ Temperatura
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {Math.round(sensor.temperatura)}°C
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                ☀️ Luz Solar
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {Math.round(sensor.luminosidad)}lx
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                💨 Humedad Aire
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {Math.round(sensor.humedad_ambiental)}%
              </div>
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        {recomendaciones.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.15)',
              border: '1.5px solid #22C55E',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 24,
            }}
          >
            <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#22C55E' }}>
              💡 Recomendaciones Generales
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recomendaciones.map((rec, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: '0.85rem',
                    color: isDark ? '#86EFAC' : '#15803D',
                    fontWeight: 500,
                  }}
                >
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Clima actual */}
        {clima && !clima.error && (
          <div
            style={{
              padding: '16px 20px',
              background: isDark ? '#1f2937' : '#F3F4F6',
              border: `1.5px solid ${isDark ? '#374151' : '#D1D5DB'}`,
              borderRadius: 'var(--radius-lg)',
              marginBottom: 24,
            }}
          >
            <h3 style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
              🌡️ Clima Actual
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}>
                  Temperatura
                </div>
                {clima.clima_actual?.temperatura}°C
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}>
                  Humedad
                </div>
                {clima.clima_actual?.humedad}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}>
                  Condición
                </div>
                {clima.clima_actual?.descripcion}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}>
                  Viento
                </div>
                {clima.clima_actual?.velocidad_viento} km/h
              </div>
            </div>
          </div>
        )}

        {/* Tarjetas de predicciones */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20, marginBottom: 20 }}>
          <CalendarioRiegosCard calendario={calendario} loading={loading} />
          <RiesgoEnfermedadesCard riesgo={riesgoEnfermedad} loading={loading} />
        </div>

        {/* Horarios de sol */}
        <div style={{ marginBottom: 20 }}>
          <HorariosSolCard horarios={horariosSol} loading={loading} />
        </div>

        {/* Botón para recargar */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={cargarPredicciones}
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: 'var(--green)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontSize: '0.9rem',
            }}
          >
            {loading ? '⏳ Actualizando...' : '🔄 Actualizar Predicciones'}
          </button>
        </div>
      </div>
    </div>
  );
}
