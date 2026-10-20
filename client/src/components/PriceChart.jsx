import React from 'react';

export function PriceChart({ companies }) {
  if (!companies || companies.length === 0) return null;

  const maxPoints = Math.max(...companies.map(c => c.priceHistory?.length || 1), 2);

  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 25, left: 35 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const minPrice = 10;
  const maxPrice = 250;

  const getX = index => {
    if (maxPoints <= 1) return padding.left;
    return padding.left + (index / (maxPoints - 1)) * innerWidth;
  };

  const getY = price => {
    const clamped = Math.max(minPrice, Math.min(maxPrice, price));
    const ratio = (clamped - minPrice) / (maxPrice - minPrice);
    return padding.top + innerHeight - ratio * innerHeight;
  };

  return (
    <div className="terminal-card" style={{ marginTop: '18px' }}>
      <div className="terminal-card-header">
        <span>Histórico de Cotizaciones</span>
        <span style={{ fontSize: '11px', color: 'var(--ink-secondary)', textTransform: 'none', letterSpacing: 'normal' }}>
          Piso Bs 10 · Techo Bs 250
        </span>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
        {companies.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '1px',
                backgroundColor: c.color || 'var(--ink)',
              }}
            />
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{c.ticker || c.name}</span>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Techo */}
          <line
            x1={padding.left}
            y1={getY(250)}
            x2={width - padding.right}
            y2={getY(250)}
            stroke="var(--accent)"
            strokeDasharray="3 3"
            strokeOpacity="0.6"
          />
          <text x={padding.left - 5} y={getY(250) + 3} fill="var(--accent)" fontSize="8.5" textAnchor="end" fontFamily="var(--font-mono)">
            250
          </text>

          {/* Base 100 */}
          <line
            x1={padding.left}
            y1={getY(100)}
            x2={width - padding.right}
            y2={getY(100)}
            stroke="var(--line-strong)"
            strokeDasharray="2 2"
            strokeOpacity="0.5"
          />
          <text x={padding.left - 5} y={getY(100) + 3} fill="var(--ink-muted)" fontSize="8.5" textAnchor="end" fontFamily="var(--font-mono)">
            100
          </text>

          {/* Piso */}
          <line
            x1={padding.left}
            y1={getY(10)}
            x2={width - padding.right}
            y2={getY(10)}
            stroke="var(--down)"
            strokeDasharray="3 3"
            strokeOpacity="0.6"
          />
          <text x={padding.left - 5} y={getY(10) + 3} fill="var(--down)" fontSize="8.5" textAnchor="end" fontFamily="var(--font-mono)">
            10
          </text>

          {/* Líneas de precio */}
          {companies.map(c => {
            const hist = c.priceHistory || [c.price];
            const points = hist
              .map((p, idx) => `${getX(idx)},${getY(p)}`)
              .join(' ');

            return (
              <g key={c.id}>
                <polyline
                  fill="none"
                  stroke={c.color || 'var(--ink)'}
                  strokeWidth="2"
                  points={points}
                />
                {hist.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={getX(idx)}
                    cy={getY(p)}
                    r="2.8"
                    fill={c.color || 'var(--ink)'}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
