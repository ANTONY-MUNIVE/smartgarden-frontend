import { useState } from 'react';
import Topbar from '../components/common/Topbar';
import { useAuth } from '../context/AuthContext';

const AREAS = [
  {
    key: 'ciencia',
    nombre: 'Ciencia',
    emoji: '🔬',
    color: '#2D9B5A',
    bg: '#E8F7EE',
    border: '#A7D7B8',
    descripcion: 'Observa, experimenta y saca conclusiones',
    niveles: ['Observador', 'Explorador', 'Investigador', 'Científico', 'Experto'],
    xp: 320,
    xpMax: 500,
    nivel: 3,
    actividades: [
      { texto: 'Registrar una observación en un experimento', xp: 20, completada: true },
      { texto: 'Completar un experimento completo', xp: 80, completada: true },
      { texto: 'Detectar una condición crítica en el huerto', xp: 40, completada: true },
      { texto: 'Predecir el estado del cultivo correctamente', xp: 60, completada: false },
      { texto: 'Crear 3 experimentos diferentes', xp: 100, completada: false },
    ],
  },
  {
    key: 'tecnologia',
    nombre: 'Tecnología',
    emoji: '💻',
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    descripcion: 'Usa sensores IoT y analiza datos digitales',
    niveles: ['Curioso', 'Usuario', 'Operador', 'Técnico', 'Experto'],
    xp: 180,
    xpMax: 400,
    nivel: 2,
    actividades: [
      { texto: 'Leer los datos del sensor por primera vez', xp: 20, completada: true },
      { texto: 'Interpretar una gráfica de sensores', xp: 40, completada: true },
      { texto: 'Identificar qué sensor dio una alerta', xp: 30, completada: false },
      { texto: 'Comparar datos de dos días distintos', xp: 60, completada: false },
      { texto: 'Aplicar 3 recomendaciones de la IA', xp: 80, completada: false },
    ],
  },
  {
    key: 'ingenieria',
    nombre: 'Ingeniería',
    emoji: '⚙️',
    color: '#F5A623',
    bg: '#FEF3DC',
    border: '#FCD88A',
    descripcion: 'Diseña soluciones para el huerto',
    niveles: ['Aprendiz', 'Constructor', 'Diseñador', 'Ingeniero', 'Experto'],
    xp: 90,
    xpMax: 400,
    nivel: 1,
    actividades: [
      { texto: 'Entender cómo funciona el sistema de riego', xp: 30, completada: true },
      { texto: 'Proponer una mejora al huerto', xp: 60, completada: false },
      { texto: 'Ajustar los umbrales de alerta', xp: 50, completada: false },
      { texto: 'Diseñar un experimento con variables controladas', xp: 80, completada: false },
      { texto: 'Crear un plan de cuidado semanal', xp: 100, completada: false },
    ],
  },
  {
    key: 'arte',
    nombre: 'Arte',
    emoji: '🎨',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    descripcion: 'Documenta y comunica tus hallazgos',
    niveles: ['Principiante', 'Comunicador', 'Narrador', 'Creativo', 'Experto'],
    xp: 140,
    xpMax: 400,
    nivel: 2,
    actividades: [
      { texto: 'Escribir la descripción de un experimento', xp: 20, completada: true },
      { texto: 'Registrar 5 observaciones con detalle', xp: 50, completada: true },
      { texto: 'Explicar un resultado a otro estudiante', xp: 40, completada: false },
      { texto: 'Hacer un resumen del ciclo del cultivo', xp: 60, completada: false },
      { texto: 'Presentar los resultados de un experimento', xp: 80, completada: false },
    ],
  },
  {
    key: 'matematicas',
    nombre: 'Matemáticas',
    emoji: '📐',
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    descripcion: 'Analiza números y encuentra patrones',
    niveles: ['Contador', 'Calculador', 'Analizador', 'Estadístico', 'Experto'],
    xp: 210,
    xpMax: 400,
    nivel: 2,
    actividades: [
      { texto: 'Calcular el promedio de humedad del día', xp: 30, completada: true },
      { texto: 'Interpretar el porcentaje de progreso', xp: 20, completada: true },
      { texto: 'Comparar valores mínimos y máximos', xp: 40, completada: true },
      { texto: 'Calcular cuántos días faltan para la cosecha', xp: 50, completada: false },
      { texto: 'Analizar la tendencia de temperatura de la semana', xp: 70, completada: false },
    ],
  },
];

const MEDALLAS = [
  { emoji: '🌱', nombre: 'Primer paso',       descripcion: 'Completaste tu primera actividad',          obtenida: true },
  { emoji: '🔥', nombre: 'En racha',           descripcion: 'Completaste actividades 3 días seguidos',   obtenida: true },
  { emoji: '🧪', nombre: 'Científico',         descripcion: 'Completaste tu primer experimento',         obtenida: true },
  { emoji: '💧', nombre: 'Guardián del agua',  descripcion: 'Aplicaste 3 recomendaciones de riego',     obtenida: false },
  { emoji: '🌟', nombre: 'Estrella STEAM',     descripcion: 'Subiste de nivel en todas las áreas',      obtenida: false },
  { emoji: '🏆', nombre: 'Maestro',            descripcion: 'Llegaste al nivel Experto en un área',     obtenida: false },
];

export default function NivelesPage() {
  const { user } = useAuth();
  const [areas, setAreas] = useState(AREAS);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);

  const xpTotal    = areas.reduce((sum, a) => sum + a.xp, 0);
  const xpTotalMax = areas.reduce((sum, a) => sum + a.xpMax, 0);
  const nivelGlobal = Math.floor(xpTotal / 200) + 1;

  const completarActividad = (areaKey, actIdx) => {
    setAreas(prev => prev.map(a => {
      if (a.key !== areaKey) return a;
      if (a.actividades[actIdx].completada) return a;
      const nuevasActs = a.actividades.map((act, i) =>
        i === actIdx ? { ...act, completada: true } : act
      );
      const nuevoXp  = Math.min(a.xp + a.actividades[actIdx].xp, a.xpMax);
      const nuevoNivel = Math.min(
        Math.floor((nuevoXp / a.xpMax) * (a.niveles.length - 1)),
        a.niveles.length - 1
      );
      return { ...a, actividades: nuevasActs, xp: nuevoXp, nivel: nuevoNivel };
    }));
    // actualizar también el modal
    setAreaSeleccionada(prev => {
      if (!prev || prev.key !== areaKey) return prev;
      if (prev.actividades[actIdx].completada) return prev;
      const nuevasActs = prev.actividades.map((act, i) =>
        i === actIdx ? { ...act, completada: true } : act
      );
      const nuevoXp = Math.min(prev.xp + prev.actividades[actIdx].xp, prev.xpMax);
      const nuevoNivel = Math.min(
        Math.floor((nuevoXp / prev.xpMax) * (prev.niveles.length - 1)),
        prev.niveles.length - 1
      );
      return { ...prev, actividades: nuevasActs, xp: nuevoXp, nivel: nuevoNivel };
    });
  };

  return (
    <div style={{ flex: 1 }}>
      <Topbar title="Mis Niveles STEAM 🏆" subtitle="Completa actividades y sube de nivel" emoji="🏆" />
      <div className="page-wrapper">

        {/* ── PERFIL ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1E7040 0%, #2D9B5A 50%, #38B26A 100%)',
          borderRadius: 'var(--radius-xl)', padding: '28px 32px', marginBottom: 28,
          color: '#fff', display: 'flex', alignItems: 'center', gap: 24,
          boxShadow: '0 8px 32px rgba(45,155,90,0.35)',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, flexShrink: 0,
          }}>{user?.avatar}</div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Estudiante STEAM
            </div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 10 }}>
              {user?.nombre}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.25)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(xpTotal / xpTotalMax) * 100}%`, background: '#fff', borderRadius: 20, transition: 'width 1s ease' }} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {xpTotal} / {xpTotalMax} XP
              </span>
            </div>
          </div>

          <div style={{
            textAlign: 'center', background: 'rgba(255,255,255,0.15)',
            borderRadius: 'var(--radius-lg)', padding: '16px 24px', flexShrink: 0,
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8, marginBottom: 4, textTransform: 'uppercase' }}>Nivel global</div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>{nivelGlobal}</div>
            <div style={{ fontSize: '0.8rem', marginTop: 4 }}>{'⭐'.repeat(Math.min(nivelGlobal, 5))}</div>
          </div>
        </div>

        {/* ── MEDALLAS ── */}
        <div className="card" style={{ marginBottom: 28 }}>
          <h2 className="section-title">🏅 Mis Medallas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {MEDALLAS.map(m => (
              <div key={m.nombre} style={{
                padding: '16px 12px', textAlign: 'center',
                background: m.obtenida ? 'var(--accent-light)' : 'var(--bg)',
                border: `2px solid ${m.obtenida ? '#FCD88A' : 'var(--border)'}`,
                borderRadius: 'var(--radius)', opacity: m.obtenida ? 1 : 0.5,
                transition: 'var(--transition)',
              }}>
                <div style={{ fontSize: 34, marginBottom: 8, filter: m.obtenida ? 'none' : 'grayscale(1)' }}>{m.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: m.obtenida ? '#92400E' : 'var(--text-muted)', marginBottom: 4 }}>{m.nombre}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{m.descripcion}</div>
                {!m.obtenida && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 700 }}>🔒 Por desbloquear</div>}
              </div>
            ))}
          </div>
        </div>

        {/* ── ÁREAS STEAM ── */}
        <h2 className="section-title">📚 Progreso por Área</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {areas.map(area => {
            const pct = Math.round((area.xp / area.xpMax) * 100);
            const completadas = area.actividades.filter(a => a.completada).length;
            return (
              <div key={area.key} style={{
                background: area.bg, border: `2px solid ${area.border}`,
                borderRadius: 'var(--radius-lg)', padding: '22px',
                cursor: 'pointer', transition: 'var(--transition)',
              }}
                onClick={() => setAreaSeleccionada(area)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 32 }}>{area.emoji}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: 700, color: area.color }}>{area.nombre}</div>
                      <div style={{ fontSize: '0.72rem', color: area.color, opacity: 0.8 }}>{area.descripcion}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', background: area.color, borderRadius: 12, padding: '6px 12px', color: '#fff', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.85 }}>NIVEL</div>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1 }}>{area.nivel + 1}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: area.color, background: '#fff', padding: '4px 12px', borderRadius: 20, border: `1px solid ${area.border}`, display: 'inline-block', marginBottom: 14 }}>
                  ⭐ {area.niveles[area.nivel]}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: area.color, opacity: 0.8 }}>{area.xp} / {area.xpMax} XP</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: area.color }}>{pct}%</span>
                </div>
                <div style={{ height: 10, background: '#fff', borderRadius: 20, overflow: 'hidden', border: `1px solid ${area.border}`, marginBottom: 14 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: area.color, borderRadius: 20, transition: 'width 0.8s ease' }} />
                </div>

                <div style={{ fontSize: '0.8rem', color: area.color, fontWeight: 700 }}>
                  ✅ {completadas} de {area.actividades.length} actividades
                </div>
                <div style={{ marginTop: 8, fontSize: '0.78rem', color: area.color, opacity: 0.7, fontWeight: 600 }}>
                  Toca para ver actividades →
                </div>
              </div>
            );
          })}
        </div>

        {/* ── MODAL ACTIVIDADES ── */}
        {areaSeleccionada && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}>
            <div className="card animate-pop" style={{ width: '100%', maxWidth: 500, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>

              {/* Header modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 36 }}>{areaSeleccionada.emoji}</span>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', fontWeight: 700, color: areaSeleccionada.color }}>
                      {areaSeleccionada.nombre}
                    </h2>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: areaSeleccionada.color }}>
                      Nivel {areaSeleccionada.nivel + 1} — {areaSeleccionada.niveles[areaSeleccionada.nivel]}
                    </span>
                  </div>
                </div>
                <button onClick={() => setAreaSeleccionada(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 22, lineHeight: 1 }}>✕</button>
              </div>

              {/* Barra XP con hitos */}
              <div style={{ padding: '14px 16px', background: areaSeleccionada.bg, border: `1.5px solid ${areaSeleccionada.border}`, borderRadius: 'var(--radius)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: areaSeleccionada.color }}>Tu XP en {areaSeleccionada.nombre}</span>
                  <span style={{ fontWeight: 800, color: areaSeleccionada.color }}>{areaSeleccionada.xp} / {areaSeleccionada.xpMax} XP</span>
                </div>
                <div style={{ height: 10, background: '#fff', borderRadius: 20, overflow: 'hidden', border: `1px solid ${areaSeleccionada.border}` }}>
                  <div style={{ height: '100%', width: `${(areaSeleccionada.xp / areaSeleccionada.xpMax) * 100}%`, background: areaSeleccionada.color, borderRadius: 20, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  {areaSeleccionada.niveles.map((n, i) => (
                    <div key={n} style={{ textAlign: 'center' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', margin: '0 auto 4px', background: i <= areaSeleccionada.nivel ? areaSeleccionada.color : 'var(--border)' }} />
                      <div style={{ fontSize: '0.6rem', color: i <= areaSeleccionada.nivel ? areaSeleccionada.color : 'var(--text-muted)', fontWeight: 700 }}>{n}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actividades */}
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
                📋 Actividades para subir de nivel
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {areaSeleccionada.actividades.map((act, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    background: act.completada ? areaSeleccionada.bg : 'var(--bg)',
                    border: `1.5px solid ${act.completada ? areaSeleccionada.border : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', transition: 'var(--transition)',
                  }}>
                    <button
                      onClick={() => completarActividad(areaSeleccionada.key, i)}
                      disabled={act.completada}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${act.completada ? areaSeleccionada.color : 'var(--border)'}`,
                        background: act.completada ? areaSeleccionada.color : '#fff',
                        color: '#fff', fontSize: '0.85rem',
                        cursor: act.completada ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'var(--transition)',
                      }}
                    >
                      {act.completada ? '✓' : ''}
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.88rem', fontWeight: 700,
                        color: act.completada ? areaSeleccionada.color : 'var(--text)',
                        textDecoration: act.completada ? 'line-through' : 'none',
                        opacity: act.completada ? 0.8 : 1,
                      }}>
                        {act.texto}
                      </div>
                    </div>

                    <div style={{
                      padding: '4px 10px', borderRadius: 20, flexShrink: 0,
                      background: act.completada ? areaSeleccionada.color : 'var(--border)',
                      color: act.completada ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.75rem', fontWeight: 800,
                    }}>
                      +{act.xp} XP
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setAreaSeleccionada(null)} className="btn btn-green"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem', marginTop: 20 }}>
                ¡Seguir aprendiendo! 🚀
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}