export default function BrandMark({ compact = false, size = 42, showText = true, subtitle = 'Huerto Inteligente' }) {
  const imageSize = compact ? Math.max(28, Math.round(size * 0.78)) : size;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 10 : 12, minWidth: 0 }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: compact ? 12 : 16,
        background: 'linear-gradient(145deg, #E8F7EE 0%, #4ADE80 52%, #1E7040 100%)',
        boxShadow: 'var(--shadow-green)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        <img
          src="/logo.svg"
          alt="SmartGardenSchool"
          width={imageSize}
          height={imageSize}
          style={{ display: 'block', width: imageSize, height: imageSize }}
        />
      </div>

      {showText && (
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-title)',
            fontWeight: 700,
            fontSize: compact ? '0.98rem' : '1.02rem',
            color: 'var(--text)',
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>SmartGardenSchool</div>
          <div style={{
            fontSize: compact ? '0.68rem' : '0.72rem',
            color: 'var(--text-muted)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{subtitle}</div>
        </div>
      )}
    </div>
  );
}