import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import Topbar from '../components/common/Topbar';
import { api } from '../api';

const SENSOR_VACIO = {
  humedad_suelo: 0,
  temperatura: 0,
  luminosidad: 0,
  humedad_ambiental: 0,
};

const TT = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #E2EBE4',
    borderRadius: 12,
    fontSize: '0.82rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
};

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function limitar(valor, min, max) {
  return Math.min(Math.max(valor, min), max);
}

function calcularTendencia(historico, campo) {
  if (!Array.isArray(historico) || historico.length < 2) return 0;

  const datosValidos = historico
    .filter((item) => item && item[campo] !== undefined)
    .slice(0, 6);

  if (datosValidos.length < 2) return 0;

  const primero = numero(datosValidos[datosValidos.length - 1][campo]);
  const ultimo = numero(datosValidos[0][campo]);

  return (ultimo - primero) / Math.max(datosValidos.length - 1, 1);
}

function estadoHumedadSuelo(valor) {
  if (valor < 25) return 'Crítico';
  if (valor < 40) return 'Bajo';
  if (valor <= 70) return 'Adecuado';
  return 'Alto';
}

function estadoTemperatura(valor) {
  if (valor > 35) return 'Crítico';
  if (valor > 30) return 'Alto';
  if (valor >= 18) return 'Adecuado';
  return 'Bajo';
}

function estadoLuminosidad(valor) {
  if (valor < 150) return 'Bajo';
  if (valor <= 800) return 'Adecuado';
  if (valor <= 1000) return 'Alto';
  return 'Crítico';
}

function estadoHumedadAmbiental(valor) {
  if (valor < 35) return 'Bajo';
  if (valor <= 75) return 'Adecuado';
  if (valor <= 90) return 'Alto';
  return 'Crítico';
}

function colorEstado(estado) {
  if (estado === 'Crítico') return '#991B1B';
  if (estado === 'Alto') return '#92400E';
  if (estado === 'Bajo') return '#1D4ED8';
  return '#166534';
}

function generarExplicacionGrafico(datosGrafica, prediccionIA) {
  if (!datosGrafica || datosGrafica.length < 3) {
    return 'El gráfico todavía no tiene datos suficientes para explicar la tendencia.';
  }

  const actual = datosGrafica[0];
  const unaHora = datosGrafica[1];
  const veinticuatroHoras = datosGrafica[2];

  const humedadActual = actual.humedad;
  const humedad1h = unaHora.humedad;
  const humedad24h = veinticuatroHoras.humedad;

  let tendenciaHumedad = 'se mantiene estable';

  if (humedad24h > humedadActual + 3) {
    tendenciaHumedad = 'tiende a subir';
  } else if (humedad24h < humedadActual - 3) {
    tendenciaHumedad = 'tiende a bajar';
  }

  return `El gráfico compara el estado actual del huerto con una predicción a 1 hora y una estimación a 24 horas. \nActualmente la humedad del suelo está en ${humedadActual}%. \nSegún el modelo IA, en 1 hora podría estar aproximadamente en ${humedad1h}%. \nCon el historial registrado, el sistema estima que en 24 horas podría llegar a ${humedad24h}%, por eso la tendencia de la humedad ${tendenciaHumedad}. \nLa temperatura, luminosidad y humedad ambiental también se muestran para observar si las condiciones del huerto se mantienen adecuadas o si podrían necesitar atención.`;
}

export default function DetallesIAPage() {
  const navigate = useNavigate();

  const [sensor, setSensor] = useState(SENSOR_VACIO);
  const [grafica, setGrafica] = useState([]);
  const [prediccionIA, setPrediccionIA] = useState(null);
  const [mensajeIA, setMensajeIA] = useState('Analizando sensores con IA...');
  const [explicacionGrafico, setExplicacionGrafico] = useState('');
  const [loading, setLoading] = useState(true);

  const cargarDatosIA = async () => {
    try {
      const [actual, historial] = await Promise.all([
        api.getSensorActual(),
        api.getSensorHistory(24),
      ]);

      const sensorActual = actual && !actual.message ? actual : SENSOR_VACIO;
      const historialSensores = Array.isArray(historial) ? historial : [];

      setSensor(sensorActual);

      const datosIA = {
        humedad_suelo: numero(sensorActual.humedad_suelo),
        temperatura: numero(sensorActual.temperatura),
        luz: numero(sensorActual.luminosidad),
        humedad_aire: numero(sensorActual.humedad_ambiental),
      };

      // Usar helper del api en lugar de fetch directo
      const data = await api.predecirIA({
        humedad_suelo: datosIA.humedad_suelo,
        temperatura: datosIA.temperatura,
        luz: datosIA.luz,
        humedad_aire: datosIA.humedad_aire,
      });

      const humedadIA =
        data && data.humedad_futura_predicha !== undefined
          ? numero(data.humedad_futura_predicha)
          : null;

      setPrediccionIA(humedadIA);
      setMensajeIA(data?.mensaje || data?.error || 'Predicción procesada.');

      const tendenciaHumedad = calcularTendencia(historialSensores, 'humedad_suelo');
      const tendenciaTemp = calcularTendencia(historialSensores, 'temperatura');
      const tendenciaLuz = calcularTendencia(historialSensores, 'luminosidad');
      const tendenciaAire = calcularTendencia(historialSensores, 'humedad_ambiental');

      const humedadActual = numero(sensorActual.humedad_suelo);
      const tempActual = numero(sensorActual.temperatura);
      const luzActual = numero(sensorActual.luminosidad);
      const aireActual = numero(sensorActual.humedad_ambiental);

      const humedad1h =
        humedadIA !== null
          ? humedadIA
          : limitar(humedadActual + tendenciaHumedad, 0, 100);

      const humedad24h = limitar(humedad1h + tendenciaHumedad * 24, 0, 100);

      const temp1h = limitar(tempActual + tendenciaTemp, 0, 60);
      const temp24h = limitar(tempActual + tendenciaTemp * 24, 0, 60);

      const luz1h = limitar(luzActual + tendenciaLuz, 0, 1200);
      const luz24h = limitar(luzActual + tendenciaLuz * 24, 0, 1200);

      const aire1h = limitar(aireActual + tendenciaAire, 0, 100);
      const aire24h = limitar(aireActual + tendenciaAire * 24, 0, 100);

      const datosGrafica = [
        {
          tiempo: 'Actual',
          humedad: Math.round(humedadActual),
          temperatura: Math.round(tempActual),
          luz: Math.round(luzActual),
          humedadAire: Math.round(aireActual),
        },
        {
          tiempo: 'Pred. 1h',
          humedad: Math.round(limitar(humedad1h, 0, 100)),
          temperatura: Math.round(temp1h),
          luz: Math.round(luz1h),
          humedadAire: Math.round(aire1h),
        },
        {
          tiempo: 'Pred. 24h',
          humedad: Math.round(humedad24h),
          temperatura: Math.round(temp24h),
          luz: Math.round(luz24h),
          humedadAire: Math.round(aire24h),
        },
      ];

      setGrafica(datosGrafica);
      setExplicacionGrafico(generarExplicacionGrafico(datosGrafica, humedadIA));
    } catch (error) {
      console.error('Error cargando detalles IA:', error);
      setMensajeIA('No se pudo conectar con el backend de IA.');
      setExplicacionGrafico(
        'No se pudo generar la explicación porque no hubo conexión con el backend de IA.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosIA();

    const intervalo = setInterval(cargarDatosIA, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const estadoSuelo = estadoHumedadSuelo(numero(sensor.humedad_suelo));
  const estadoTemp = estadoTemperatura(numero(sensor.temperatura));
  const estadoLuz = estadoLuminosidad(numero(sensor.luminosidad));
  const estadoAire = estadoHumedadAmbiental(numero(sensor.humedad_ambiental));

  const cards = [
    {
      titulo: 'Humedad del suelo',
      valor: `${Math.round(numero(sensor.humedad_suelo))}%`,
      detalle: estadoSuelo,
      fondo: '#EFF6FF',
      borde: '#BFDBFE',
      color: '#1D4ED8',
    },
    {
      titulo: 'Temperatura',
      valor: `${Math.round(numero(sensor.temperatura))}°C`,
      detalle: estadoTemp,
      fondo: '#FEF3DC',
      borde: '#FCD88A',
      color: '#92400E',
    },
    {
      titulo: 'Luminosidad',
      valor: `${Math.round(numero(sensor.luminosidad))} lux`,
      detalle: estadoLuz,
      fondo: '#F0FDF4',
      borde: '#BBF7D0',
      color: colorEstado(estadoLuz),
    },
    {
      titulo: 'Humedad ambiental',
      valor: `${Math.round(numero(sensor.humedad_ambiental))}%`,
      detalle: estadoAire,
      fondo: '#F5F3FF',
      borde: '#DDD6FE',
      color: '#7C3AED',
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        ⏳ Analizando detalles de IA...
      </div>
    );
  }

  return (
    <div style={{ flex: 1 }}>
      <Topbar
        title="Detalles de la IA"
        subtitle="Predicción del comportamiento del huerto en 1h y 24h"
        emoji="🤖"
      />

      <div className="page-wrapper">
        <button
          onClick={() => navigate('/recomendaciones')}
          style={{
            marginBottom: 18,
            border: 'none',
            background: 'var(--green-light)',
            color: 'var(--green-dark)',
            padding: '10px 16px',
            borderRadius: 12,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          ← Volver a recomendaciones
        </button>

        <div
          style={{
            padding: '22px 24px',
            background: '#F0FDF4',
            border: '2px solid #BBF7D0',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--green-dark)',
              marginBottom: 8,
            }}
          >
            🤖 Análisis predictivo del modelo IA
          </div>

          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-soft)',
              lineHeight: 1.6,
              marginBottom: 10,
            }}
          >
            Esta pantalla muestra cómo la Inteligencia Artificial ayuda a analizar
            el estado del huerto. El modelo entrenado predice la humedad futura del suelo, y el sistema usa el historial de
            sensores para proyectar el comportamiento de temperatura, luminosidad y
            humedad ambiental.
          </p>

          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              background: '#fff',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 800,
              color: 'var(--green-dark)',
              border: '1px solid #BBF7D0',
            }}
          >
            {mensajeIA}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {cards.map((card) => (
            <div
              key={card.titulo}
              style={{
                padding: '18px 20px',
                background: card.fondo,
                border: `2px solid ${card.borde}`,
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: card.color,
                  marginBottom: 8,
                }}
              >
                {card.titulo}
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  color: card.color,
                  marginBottom: 4,
                }}
              >
                {card.valor}
              </div>

              <div
                style={{
                  fontSize: '0.8rem',
                  color: card.color,
                  fontWeight: 800,
                }}
              >
                Estado: {card.detalle}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: '22px 24px',
            background: '#fff',
            border: '1px solid #E2EBE4',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              alignItems: 'center',
              marginBottom: 18,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--green-dark)',
                  marginBottom: 4,
                }}
              >
                Gráfica predictiva IA
              </h3>

              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-soft)',
                  margin: 0,
                }}
              >
                Comparación entre los sensores actuales, la predicción a 1 hora y
                la estimación a 24 horas.
              </p>
            </div>

            <div
              style={{
                padding: '8px 12px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#1D4ED8',
              }}
            >
              IA humedad 1h:{' '}
              {prediccionIA !== null ? `${prediccionIA}%` : 'Sin dato'}
            </div>
          </div>

          <div style={{ height: 330 }}>
            {grafica.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={grafica}>
                  <defs>
                    <linearGradient id="humedadIA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="temperaturaIA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="luzIA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="aireIA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="tiempo" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip {...TT} />
                  <Legend />

                  <Area
                    type="monotone"
                    dataKey="humedad"
                    name="Humedad suelo (%)"
                    stroke="#3B82F6"
                    fill="url(#humedadIA)"
                    strokeWidth={3}
                  />

                  <Area
                    type="monotone"
                    dataKey="temperatura"
                    name="Temperatura (°C)"
                    stroke="#F59E0B"
                    fill="url(#temperaturaIA)"
                    strokeWidth={3}
                  />

                  <Area
                    type="monotone"
                    dataKey="luz"
                    name="Luminosidad (lux)"
                    stroke="#22C55E"
                    fill="url(#luzIA)"
                    strokeWidth={3}
                  />

                  <Area
                    type="monotone"
                    dataKey="humedadAire"
                    name="Humedad ambiental (%)"
                    stroke="#8B5CF6"
                    fill="url(#aireIA)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                Sin datos suficientes para graficar.
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            padding: '20px 22px',
            background: '#EFF6FF',
            border: '2px solid #BFDBFE',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1rem',
              fontWeight: 800,
              color: '#1D4ED8',
              marginBottom: 8,
            }}
          >
            ¿Qué significa el gráfico?
          </h3>

          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-soft)',
              lineHeight: 1.7,
              margin: 0,
              whiteSpace: 'pre-line',
            }}
          >
            {explicacionGrafico}
          </p>
        </div>

        <div
          style={{
            padding: '20px 22px',
            background: '#FEFCE8',
            border: '2px solid #FDE68A',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1rem',
              fontWeight: 800,
              color: '#92400E',
              marginBottom: 8,
            }}
          >
            ¿Como se integró la IA?
          </h3>

          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-soft)',
              lineHeight: 1.7,
              marginBottom: 12,
            }}
          >
            “En esta pantalla se observa la integración de Inteligencia Artificial
            dentro del sistema SmartGarden. Primero se leen los sensores actuales:
            humedad del suelo, temperatura, luminosidad y humedad ambiental.
            Luego, el modelo entrenado predice
            cómo podría estar la humedad del suelo en la siguiente hora.
          </p>

          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-soft)',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Además, el sistema usa los datos históricos registrados para estimar
            la tendencia de los demás sensores a 1 hora y 24 horas. En la gráfica
            se comparan tres momentos: el valor actual, la predicción cercana y
            la estimación futura. Esto permite tomar decisiones preventivas, por
            ejemplo regar el huerto si la humedad baja, revisar la temperatura si
            sube demasiado o verificar la iluminación si la luminosidad no es adecuada.”
          </p>
        </div>
      </div>
    </div>
  );
}
