import { useState, useEffect } from 'react';
import Topbar from '../components/common/Topbar';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api';
import { AREA_COLORS, getTooltipStyle } from '../utils/colorScheme';

const SEMANA = [
  { dia:'Lun', exp:3, ses:5 }, { dia:'Mar', exp:4, ses:6 }, { dia:'Mie', exp:2, ses:4 },
  { dia:'Jue', exp:5, ses:7 }, { dia:'Vie', exp:6, ses:8 }, { dia:'Sab', exp:2, ses:3 }, { dia:'Dom', exp:1, ses:2 },
];
const TT = getTooltipStyle();

const DATOS_INICIALES = {
  experimentos_activos: 0, observaciones_totales: 0,
  variables_monitoreadas: 4, sesiones_semana: 0,
  areas: [],
};

export default function IndicadoresPage() {
  const [datos, setDatos]     = useState(DATOS_INICIALES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIndicadores()
      .then(data => setDatos(data || DATOS_INICIALES))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { experimentos_activos, observaciones_totales, variables_monitoreadas, sesiones_semana, areas } = datos;

  const metrics = [
    { label:'Experimentos Activos',    value: experimentos_activos,    icon:'🔬', delta:'+3 esta semana', color:'#4ADE80' },
    { label:'Observaciones Totales',   value: observaciones_totales,   icon:'📋', delta:'+45 esta semana', color:'#60A5FA' },
    { label:'Variables Monitoreadas',  value: variables_monitoreadas,  icon:'📡', sub:'Humedad, Temp, Luz...', color:'#F59E0B' },
    { label:'Sesiones de la Semana',   value: sesiones_semana,         icon:'👥', delta:'+6 vs semana anterior', color:'#A78BFA' },
  ];

  return (
    <div style={{ flex: 1 }}>
      <Topbar title="Panel de Indicadores STEAM" subtitle="Métricas de participación y progreso educativo" />
      <div className="page-wrapper">

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>⏳ Cargando indicadores...</div>
        ) : (
          <>
            <div className="metrics-grid" style={{ marginBottom: 24 }}>
              {metrics.map(m => (
                <div key={m.label} className="card" style={{ padding: 20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <span style={{ fontSize:28 }}>{m.icon}</span>
                    {m.delta && <span style={{ fontSize:'0.67rem', fontWeight:700, color:m.color, background:`${m.color}18`, padding:'2px 8px', borderRadius:20 }}>{m.delta}</span>}
                  </div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'2.2rem', fontWeight:800, color:m.color, marginBottom:4 }}>{m.value}</div>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{m.label}</div>
                  {m.sub && <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:4 }}>{m.sub}</div>}
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
              <div className="card">
                <h2 className="section-title">📅 Actividad Semanal</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={SEMANA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="dia" tick={{ fill:'#5C8460', fontSize:10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill:'#5C8460', fontSize:10 }} tickLine={false} axisLine={false} />
                    <Tooltip {...TT} />
                    <Bar dataKey="exp" name="Experimentos" fill="#1A7A4A" radius={[4,4,0,0]} />
                    <Bar dataKey="ses" name="Sesiones"     fill="#3B82F6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h2 className="section-title">📈 Tendencia Mensual</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[{mes:'Ene',a:42,b:30},{mes:'Feb',a:58,b:38},{mes:'Mar',a:75,b:45},{mes:'Abr',a:80,b:52}]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="mes" tick={{ fill:'#5C8460', fontSize:10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill:'#5C8460', fontSize:10 }} tickLine={false} axisLine={false} />
                    <Tooltip {...TT} />
                    <Line type="monotone" dataKey="a" name="2024" stroke="#4ADE80" strokeWidth={2.5} dot={{ r:4, fill:'#4ADE80' }} />
                    <Line type="monotone" dataKey="b" name="2023" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {areas.length > 0 && (
              <div className="card">
                <h2 className="section-title">🎯 Progreso por Área STEAM</h2>
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {areas.map(a => {
                    const color = AREA_COLORS[a.area] || '#4ADE80';
                    return (
                      <div key={a.area}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                          <div>
                            <span style={{ fontWeight:800, color:'var(--text-primary)', fontSize:'0.9rem' }}>{a.area}</span>
                            <span style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginLeft:8 }}>— {a.descripcion}</span>
                          </div>
                          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{a.actividades} actividades</span>
                            <span style={{ fontWeight:800, color, fontSize:'0.9rem', minWidth:36, textAlign:'right' }}>{a.progreso}%</span>
                          </div>
                        </div>
                        <div style={{ height:8, background:'var(--bg-border)', borderRadius:4, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${a.progreso}%`, background:`linear-gradient(90deg,${color}66,${color})`, borderRadius:4 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
