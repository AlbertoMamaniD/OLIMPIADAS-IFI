import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Activity } from 'lucide-react';

// Tooltip Institucional de Alta Precisión
function CustomFinancialTooltip({ active, payload, label, companies }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="financial-chart-tooltip font-mono">
      <div className="tooltip-header">
        <span className="tooltip-turn-title">Ronda {label}</span>
        <span className="tooltip-feed-tag">BBV OFICIAL</span>
      </div>
      <div className="tooltip-body">
        {payload.map(entry => {
          const comp = companies.find(c => c.id === entry.dataKey) || {
            name: entry.name,
            ticker: entry.dataKey,
            color: entry.color,
          };
          const price = entry.value;

          return (
            <div key={entry.dataKey} className="tooltip-entry-row">
              <div className="tooltip-entry-left">
                <span
                  className="tooltip-color-swatch"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="tooltip-ticker font-bold">
                  [{comp.ticker || `E${comp.id}`}]
                </span>
                <span className="tooltip-name">{comp.name}</span>
              </div>
              <span className="tooltip-price font-bold">
                Bs {price}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PriceChart({ companies }) {
  const [activeCompanyId, setActiveCompanyId] = useState(null); // null = todas visibles
  const [curveMode, setCurveMode] = useState('curves'); // 'curves' | 'lines'
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  React.useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (!companies || companies.length === 0) return null;

  const maxPoints = Math.max(...companies.map(c => c.priceHistory?.length || 1), 2);

  // Formatear datos para recharts
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 0; i < maxPoints; i++) {
      const row = {
        turnIndex: i,
        turnLabel: i === 0 ? 'T0' : `T${i < 10 ? '0' : ''}${i}`,
      };
      companies.forEach(c => {
        const hist = c.priceHistory || [c.price];
        row[c.id] = hist[i] !== undefined ? hist[i] : hist[hist.length - 1];
      });
      data.push(row);
    }
    return data;
  }, [companies, maxPoints]);

  const toggleCompanyFocus = id => {
    setActiveCompanyId(prev => (prev === id ? null : id));
  };

  return (
    <div className="terminal-card chart-card pro-chart-card">
      {/* Encabezado Pro con Filtros y Modos */}
      <div className="terminal-card-header chart-header-row">
        <div className="header-icon-label">
          <Activity size={17} className="text-ifi" />
          <span className="card-title-strong">
            <span className="chart-title-full">Evolución de Cotizaciones en Rueda</span>
            <span className="chart-title-mob">Evolución de Cotizaciones</span>
          </span>
          <span className="chart-range-indicator font-mono">Banda [10 - 250]</span>
        </div>

        <div className="chart-controls-group">
          <div className="chart-type-toggle font-mono">
            <button
              className={`chart-type-btn ${curveMode === 'curves' ? 'active' : ''}`}
              onClick={() => setCurveMode('curves')}
              title="Trazado con curvas suaves de interpolación"
            >
              Curvas
            </button>
            <button
              className={`chart-type-btn ${curveMode === 'lines' ? 'active' : ''}`}
              onClick={() => setCurveMode('lines')}
              title="Trazado directo de cotizaciones punto a punto"
            >
              Líneas
            </button>
          </div>
        </div>
      </div>

      {/* Barra Interactiva de Emisores (Click para aislar/enfocar) */}
      <div className="chart-interactive-legend-bar">
        <span className="legend-hint font-mono">ENFOQUE:</span>
        <button
          className={`legend-pill-btn ${activeCompanyId === null ? 'is-all-active' : ''}`}
          onClick={() => setActiveCompanyId(null)}
          title="Ver todos los emisores simultáneamente"
        >
          Todos (5)
        </button>
        {companies.map(c => {
          const hist = c.priceHistory || [c.price];
          const lastPrice = hist[hist.length - 1] ?? c.price;
          const isSelected = activeCompanyId === c.id;

          return (
            <button
              key={c.id}
              className={`legend-pill-btn ${isSelected ? 'is-selected' : ''}`}
              onClick={() => toggleCompanyFocus(c.id)}
              style={{
                borderColor: isSelected ? c.color : 'var(--line)',
                background: isSelected ? `${c.color}25` : 'var(--surface-subtle)',
              }}
              title={`Click para enfocar ${c.name}`}
            >
              <span
                className="legend-color-dot"
                style={{ backgroundColor: c.color || 'var(--ink)' }}
              />
              <span className="legend-ticker font-mono">[{c.ticker || `E${c.id}`}]</span>
              <span className="legend-price font-mono font-bold">Bs {lastPrice}</span>
            </button>
          );
        })}
      </div>

      {/* Gráfico Recharts de Alta Fidelidad sin Solapamientos */}
      <div className="recharts-wrapper-container">
        <ResponsiveContainer width="100%" height={isMobile ? 225 : 320}>
          <LineChart
            data={chartData}
            margin={isMobile ? { top: 12, right: 12, left: -10, bottom: 4 } : { top: 20, right: 30, left: 15, bottom: 12 }}
          >
            <CartesianGrid
              strokeDasharray="2 3"
              stroke="var(--line)"
              opacity={0.5}
              vertical={true}
            />

            <XAxis
              dataKey="turnLabel"
              tick={{ fill: 'var(--ink-secondary)', fontSize: isMobile ? 10 : 11.5, fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              axisLine={{ stroke: 'var(--line-strong)' }}
              tickLine={{ stroke: 'var(--line)' }}
              dy={4}
            />

            <YAxis
              domain={[10, 250]}
              ticks={[10, 50, 100, 150, 200, 250]}
              tick={{ fill: 'var(--ink-secondary)', fontSize: isMobile ? 9.5 : 11, fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              tickFormatter={val => `Bs ${val}`}
              axisLine={{ stroke: 'var(--line-strong)' }}
              tickLine={{ stroke: 'var(--line)' }}
              width={isMobile ? 46 : 64}
            />

            {/* Líneas de Guía Reglamentarias BBV (Líneas limpias SIN etiquetas de texto que choquen con los puntos) */}
            <ReferenceLine
              y={250}
              stroke="var(--accent)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              strokeOpacity={0.8}
            />
            <ReferenceLine
              y={100}
              stroke="var(--line-strong)"
              strokeDasharray="3 3"
              strokeWidth={1.2}
              strokeOpacity={0.65}
            />
            <ReferenceLine
              y={10}
              stroke="var(--down)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              strokeOpacity={0.8}
            />

            <Tooltip
              content={<CustomFinancialTooltip companies={companies} />}
              cursor={{ stroke: 'var(--ifi-secondary)', strokeWidth: 1.5, strokeDasharray: '3 3' }}
            />

            {companies.map(c => {
              const isFocused = activeCompanyId === null || activeCompanyId === c.id;
              const opacity = isFocused ? 1 : 0.12;

              return (
                <Line
                  key={c.id}
                  type={curveMode === 'curves' ? 'monotone' : 'linear'}
                  dataKey={c.id}
                  name={c.name}
                  stroke={c.color || 'var(--ink)'}
                  strokeWidth={isFocused && activeCompanyId === c.id ? 3.5 : 2.5}
                  dot={{ r: isMobile ? 3 : 4, strokeWidth: 1.5, fill: 'var(--surface)', stroke: c.color }}
                  activeDot={{ r: isMobile ? 5 : 6.5, stroke: '#ffffff', strokeWidth: 2, fill: c.color }}
                  strokeOpacity={opacity}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Nota oficial del pie */}
      <div className="chart-footer-note">
        <span className="chart-note-legend-desc">
          * Línea dorada: Techo (Bs 250). Punteada: Base (Bs 100). Roja: Piso (Bs 10).
        </span>
        <span className="font-mono text-ifi font-bold chart-note-focus-desc">
          {activeCompanyId ? `Enfoque: ${companies.find(c => c.id === activeCompanyId)?.name}` : 'Visualización Consolidada'}
        </span>
      </div>
    </div>
  );
}
