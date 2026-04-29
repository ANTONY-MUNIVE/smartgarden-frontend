/**
 * Color scheme helper for theme-aware UI components
 * Returns appropriate colors based on current theme
 */

function isDarkMode() {
  if (typeof window === 'undefined') return false;
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

export const EXPERIMENTOS_CFG = () => {
  const dark = isDarkMode();
  return {
    activo: {
      emoji: '🔬',
      label: 'En curso',
      bg: dark ? '#1a3a2a' : '#E8F7EE',
      border: dark ? '#4ade80' : '#A7D7B8',
      color: dark ? '#4ade80' : '#1E7040',
    },
    completado: {
      emoji: '✅',
      label: 'Terminado',
      bg: dark ? '#132855' : '#EFF6FF',
      border: dark ? '#60a5fa' : '#BFDBFE',
      color: dark ? '#60a5fa' : '#1D4ED8',
    },
    pendiente: {
      emoji: '⏳',
      label: 'Por iniciar',
      bg: dark ? '#332815' : '#FEF3DC',
      border: dark ? '#fbbf24' : '#FCD88A',
      color: dark ? '#fbbf24' : '#92400E',
    },
  };
};

export const RECOMENDACIONES_CFG = () => {
  const dark = isDarkMode();
  return {
    alta: {
      emoji: '🚨',
      label: 'Urgente',
      bg: dark ? '#4a2626' : '#FEF2F2',
      border: dark ? '#f87171' : '#FECACA',
      color: dark ? '#f87171' : '#991B1B',
      btn: dark ? '#ef4444' : '#EF4444',
    },
    media: {
      emoji: '⚠️',
      label: 'Importante',
      bg: dark ? '#332815' : '#FEF3DC',
      border: dark ? '#fbbf24' : '#FCD88A',
      color: dark ? '#fbbf24' : '#92400E',
      btn: dark ? '#f59e0b' : '#F5A623',
    },
    baja: {
      emoji: '💡',
      label: 'Sugerencia',
      bg: dark ? '#132855' : '#EFF6FF',
      border: dark ? '#60a5fa' : '#BFDBFE',
      color: dark ? '#60a5fa' : '#1D4ED8',
      btn: dark ? '#3b82f6' : '#3B82F6',
    },
  };
};

export const ETAPAS_CFG = () => {
  const dark = isDarkMode();
  return {
    completado: {
      color: dark ? '#4ade80' : '#4ADE80',
      label: '✓ Completado',
      bg: dark ? 'rgba(74,222,128,0.15)' : 'rgba(26,122,74,0.15)',
    },
    en_progreso: {
      color: dark ? '#60a5fa' : '#60A5FA',
      label: '▶ En Progreso',
      bg: dark ? 'rgba(96,165,250,0.15)' : 'rgba(59,130,246,0.12)',
    },
    pendiente: {
      color: dark ? '#a0aec0' : '#5C8460',
      label: '⏸ Pendiente',
      bg: dark ? 'rgba(160,174,192,0.08)' : 'rgba(255,255,255,0.03)',
    },
  };
};

export const USUARIOS_CFG = () => {
  const dark = isDarkMode();
  return {
    estudiante: {
      color: dark ? '#4ade80' : '#4ADE80',
      bg: dark ? 'rgba(74,222,128,0.15)' : 'rgba(26,122,74,0.15)',
      label: 'Estudiante',
    },
    docente: {
      color: dark ? '#60a5fa' : '#60A5FA',
      bg: dark ? 'rgba(96,165,250,0.15)' : 'rgba(59,130,246,0.12)',
      label: 'Docente',
    },
    admin: {
      color: dark ? '#fbbf24' : '#F59E0B',
      bg: dark ? 'rgba(251,191,36,0.15)' : 'rgba(245,158,11,0.12)',
      label: 'Admin',
    },
  };
};

export const AREA_COLORS = {
  Ciencia: '#4ADE80',
  Tecnología: '#60A5FA',
  Ingeniería: '#F59E0B',
  Arte: '#A78BFA',
  Matemáticas: '#FB7185',
};

export const getTooltipStyle = () => {
  const dark = isDarkMode();
  return {
    contentStyle: {
      background: dark ? '#1a2332' : '#fff',
      border: dark ? '1px solid #2d3d54' : '1px solid #E2EBE4',
      borderRadius: 12,
      fontSize: '0.82rem',
      boxShadow: dark ? '0 12px 24px rgba(0,0,0,0.28)' : '0 4px 16px rgba(0,0,0,0.08)',
      color: dark ? '#e5eef7' : '#1A2E1E',
    },
  };
};
