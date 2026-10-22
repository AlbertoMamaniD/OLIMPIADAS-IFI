import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const UP = 'var(--up)';
const DOWN = 'var(--down)';

// Etiqueta de un punto del eje X: el punto 0 es el precio de apertura
const pointLabel = i => (i === 0 ? 'Inicio' : `Mov. ${i}`);

// Tooltip estilo plataforma de trading
function CustomFinancialTooltip({ active, payload, label, companies, candleCompanyId }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload || {};

  // Modo velas: apertura / cierre / variación de la vela
  if (candleCompanyId) {
    const comp = companies.find(c => c.id === candleCompanyId);
    const open = row.open;
    const close = row.close;
    const diff = open !== undefined ? close - open : 0;
    return (
      <div className="financial-chart-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-turn-title">{pointLabel(label)}</span>
          <span className="tooltip-feed-tag">{comp?.ticker}</span>
        </div>
        <div className="tooltip-body">
          {open !== undefined && (
            <div className="tooltip-entry-row">
              <span className="tooltip-name">Apertura</span>
              <span className="tooltip-price font-mono">Bs {open}</span>
            </div>
          )}
          <div className="tooltip-entry-row">
            <span className="tooltip-name">Cierre</span>
            <span className="tooltip-price font-mono">Bs {close}</span>
          </div>
          {open !== undefined && (
            <div className="tooltip-entry-row">
              <span className="tooltip-name">Variación</span>
              <span className={`tooltip-price font-mono ${diff > 0 ? 'is-up' : diff < 0 ? 'is-down' : ''}`}>
                {diff > 0 ? '+' : ''}
                {diff} ({open ? ((diff / open) * 100).toFixed(1) : '0.0'}%)
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const seen = new Set();
  const entries = payload.filter(e => {
    if (typeof e.dataKey !== 'string' || e.dataKey.startsWith('area_') || seen.has(e.dataKey)) return false;
    seen.add(e.dataKey);
    return true;
  });

  return (
    <div className="financial-chart-tooltip">
      <div className="tooltip-header">
        <span className="tooltip-turn-title">{pointLabel(label)}</span>
        <span className="tooltip-feed-tag">Precio BBV</span>
      </div>
      <div className="tooltip-body">
        {entries
          .sort((a, b) => b.value - a.value)
          .map(entry => {
            const comp = companies.find(c => c.id === entry.dataKey) || {
              name: entry.name,
              ticker: entry.dataKey,
            };
            const prev = label > 0 ? row[`prev_${entry.dataKey}`] : undefined;
            const diff = prev !== undefined ? entry.value - prev : 0;
            return (
              <div key={entry.dataKey} className="tooltip-entry-row">
                <div className="tooltip-entry-left">
                  <span className="tooltip-color-swatch" style={{ backgroundColor: comp.color || entry.color }} />
                  <span className="tooltip-ticker font-mono">{comp.ticker || `E${comp.id}`}</span>
                  <span className="tooltip-name">{comp.name}</span>
                </div>
                <span className="tooltip-price font-mono">
                  Bs {entry.value}
                  {diff !== 0 && (
                    <span className={`tooltip-diff ${diff > 0 ? 'is-up' : 'is-down'}`}>
                      {diff > 0 ? '▲' : '▼'}
                      {Math.abs(diff)}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// Etiqueta del último precio pegada al eje derecho (como en los brokers)
function LastPriceTag({ viewBox, value, color, dy = 0 }) {
  if (!viewBox) return null;
  const { x, width } = viewBox;
  const y = viewBox.y + dy;
  const text = `${value}`;
  const w = Math.max(34, text.length * 8 + 14);
  return (
    <g className="last-price-tag">
      <rect x={x + width + 4} y={y - 10} width={w} height={20} rx={5} fill={color} />
      <text
        x={x + width + 4 + w / 2}
        y={y + 4}
        textAnchor="middle"
        fontSize="11.5"
        fontWeight="700"
        fontFamily="var(--font-mono)"
        fill="#ffffff"
      >
        {text}
      </text>
    </g>
  );
}

// Vela japonesa: cuerpo entre apertura y cierre; línea fina si no hubo cambio
function CandleShape({ x, y, width, height, payload }) {
  if (payload?.open === undefined) return null;
  const up = payload.close >= payload.open;
  const color = payload.close === payload.open ? 'var(--ink-muted)' : up ? UP : DOWN;
  const bodyW = Math.max(6, Math.min(width * 0.62, 34));
  const cx = x + width / 2;
  if (height < 2) {
    return <line x1={cx - bodyW / 2} x2={cx + bodyW / 2} y1={y} y2={y} stroke={color} strokeWidth={2} />;
  }
  return (
    <g>
      <rect x={cx - bodyW / 2} y={y} width={bodyW} height={height} rx={2} fill={color} fillOpacity={0.9} />
    </g>
  );
}

export function PriceChart({ companies }) {
  const [activeCompanyId, setActiveCompanyId] = useState(null); // null = todas visibles
  const [curveMode, setCurveMode] = useState('lines'); // 'lines' | 'candles'
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  React.useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const safeCompanies = companies || [];
  const maxPoints = Math.max(...safeCompanies.map(c => c.priceHistory?.length || 1), 2);

  // En modo velas se muestra una sola empresa (la enfocada o la primera)
  const candleCompanyId = curveMode === 'candles' ? activeCompanyId ?? safeCompanies[0]?.id : null;
  const focusId = candleCompanyId ?? activeCompanyId;

  // Formatear datos para recharts
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 0; i < maxPoints; i++) {
      const row = { turnIndex: i };
      safeCompanies.forEach(c => {
        const hist = c.priceHistory || [c.price];
        const val = hist[i] !== undefined ? hist[i] : hist[hist.length - 1];
        const prev = i > 0 ? (hist[i - 1] !== undefined ? hist[i - 1] : hist[hist.length - 1]) : undefined;
        row[c.id] = val;
        row[`area_${c.id}`] = val;
        if (prev !== undefined) row[`prev_${c.id}`] = prev;
      });
      if (candleCompanyId) {
        const close = row[candleCompanyId];
        const open = row[`prev_${candleCompanyId}`];
        row.close = close;
        if (open !== undefined) {
          row.open = open;
          row.candle = [Math.min(open, close), Math.max(open, close)];
        }
      }
      data.push(row);
    }
    return data;
  }, [safeCompanies, maxPoints, candleCompanyId]);

  // Escala automática con margen, ajustada a las empresas visibles
  const yScale = useMemo(() => {
    const ids = focusId ? [focusId] : safeCompanies.map(c => c.id);
    const vals = chartData.flatMap(r => ids.map(id => r[id])).filter(v => typeof v === 'number');
    if (!vals.length) return { domain: [0, 260], ticks: [0, 50, 100, 150, 200, 250] };
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = Math.max(10, (max - min) * 0.15);
    // Paso "redondo" para que el eje muestre 25, 50, 100…
    const raw = (max - min + pad * 2) / 5;
    const step = [5, 10, 20, 25, 50, 100].find(v => v >= raw) || 100;
    const lo = Math.max(0, Math.floor((min - pad) / step) * step);
    // El precio nunca supera el techo de Bs 250: la escala termina en 260
    const hi = Math.min(260, Math.ceil((max + pad) / step) * step);
    const ticks = [];
    for (let t = lo; t <= hi; t += step) ticks.push(t);
    return { domain: [lo, hi], ticks };
  }, [chartData, focusId, safeCompanies]);

  if (!companies || companies.length === 0) return null;

  const toggleCompanyFocus = id => {
    setActiveCompanyId(prev => (prev === id ? null : id));
  };

  // Resumen de la empresa enfocada (o del mercado completo)
  const focusCompany = focusId ? companies.find(c => c.id === focusId) : null;
  const summary = (() => {
    if (focusCompany) {
      const hist = focusCompany.priceHistory || [focusCompany.price];
      const first = hist[0] ?? focusCompany.price;
      const last = hist[hist.length - 1] ?? focusCompany.price;
      return { label: focusCompany.name, ticker: focusCompany.ticker, color: focusCompany.color, first, last };
    }
    const first = companies.reduce((s, c) => s + ((c.priceHistory || [c.price])[0] ?? c.price), 0) / companies.length;
    const last =
      companies.reduce((s, c) => {
        const h = c.priceHistory || [c.price];
        return s + (h[h.length - 1] ?? c.price);
      }, 0) / companies.length;
    return { label: 'Índice del mercado', ticker: 'PROM', color: null, first: Math.round(first), last: Math.round(last) };
  })();
  const sDiff = summary.last - summary.first;
  const sPct = summary.first ? (sDiff / summary.first) * 100 : 0;
  const TrendIcon = sDiff > 0 ? TrendingUp : sDiff < 0 ? TrendingDown : Minus;

  // Etiquetas de último precio sin duplicar valores iguales
  const lastRow = chartData[chartData.length - 1] || {};
  const tagCompanies = (focusId ? companies.filter(c => c.id === focusId) : companies).filter(
    (c, i, arr) => arr.findIndex(o => lastRow[o.id] === lastRow[c.id]) === i
  );

  // Separa etiquetas cuyos precios quedan muy juntos en pantalla (mín. 22px)
  const chartHeight = isMobile ? 250 : 330;
  const plotH = chartHeight - (isMobile ? 18 : 26) - 30;
  const [lo, hi] = yScale.domain;
  const pxPerUnit = plotH / Math.max(1, hi - lo);
  const tagList = (candleCompanyId ? companies.filter(c => c.id === candleCompanyId) : tagCompanies)
    .map(c => ({ c, v: lastRow[c.id] }))
    .sort((a, b) => b.v - a.v);
  let prevPx = -Infinity;
  tagList.forEach(t => {
    const base = (hi - t.v) * pxPerUnit;
    const px = Math.max(base, prevPx + 22);
    t.dy = px - base;
    prevPx = px;
  });

  const axisTick = { fill: 'var(--ink-muted)', fontSize: isMobile ? 10.5 : 11.5, fontFamily: 'var(--font-mono)', fontWeight: 500 };

  return (
    <div className="terminal-card chart-card pro-chart-card">
      {/* Encabezado con modos */}
      <div className="terminal-card-header chart-header-row">
        <div className="header-icon-label">
          <span className="card-icon-chip">
            <Activity size={18} />
          </span>
          <span className="card-title-strong">
            <span className="chart-title-full">Evolución de precios</span>
            <span className="chart-title-mob">Precios</span>
          </span>
        </div>

        <div className="chart-controls-group">
          <div className="chart-type-toggle" role="group" aria-label="Tipo de gráfico">
            <button
              className={`chart-type-btn ${curveMode === 'lines' ? 'active' : ''}`}
              onClick={() => setCurveMode('lines')}
              title="Gráfico de líneas"
            >
              Líneas
            </button>
            <button
              className={`chart-type-btn ${curveMode === 'candles' ? 'active' : ''}`}
              onClick={() => setCurveMode('candles')}
              title="Velas japonesas: apertura y cierre de cada movimiento"
            >
              Velas
            </button>
          </div>
        </div>
      </div>

      {/* Resumen tipo cotización */}
      <div className="chart-quote-summary">
        <div className="chart-quote-name">
          {summary.color && <span className="legend-color-dot" style={{ '--co': summary.color }} />}
          <span className="chart-quote-ticker font-mono">{summary.ticker}</span>
          <span className="chart-quote-label">{summary.label}</span>
        </div>
        <div className="chart-quote-values">
          <span className="chart-quote-price font-mono">
            <small>Bs</small> {summary.last}
          </span>
          <span className={`chart-quote-change font-mono ${sDiff > 0 ? 'is-up' : sDiff < 0 ? 'is-down' : 'is-flat'}`}>
            <TrendIcon size={14} />
            {sDiff > 0 ? '+' : ''}
            {sDiff} ({sDiff > 0 ? '+' : ''}
            {sPct.toFixed(1)}%)
          </span>
          <span className="chart-quote-since">desde el inicio</span>
        </div>
      </div>

      {/* Selector de empresas (clic para aislar/enfocar) */}
      <div className="chart-interactive-legend-bar">
        <span className="legend-hint">Ver:</span>
        <button
          className={`legend-pill-btn ${activeCompanyId === null && curveMode !== 'candles' ? 'is-all-active' : ''}`}
          onClick={() => {
            setActiveCompanyId(null);
            if (curveMode === 'candles') setCurveMode('lines');
          }}
          title="Ver todas las empresas"
        >
          Todas ({companies.length})
        </button>
        {companies.map(c => {
          const hist = c.priceHistory || [c.price];
          const lastPrice = hist[hist.length - 1] ?? c.price;
          const isSelected = focusId === c.id;

          return (
            <button
              key={c.id}
              className={`legend-pill-btn ${isSelected ? 'is-selected' : ''}`}
              onClick={() => toggleCompanyFocus(c.id)}
              style={{ '--co': c.color || 'var(--ink)' }}
              title={`Ver solo ${c.name}`}
            >
              <span className="legend-color-dot" />
              <span className="legend-ticker font-mono">{c.ticker || `E${c.id}`}</span>
              <span className="legend-price font-mono">Bs {lastPrice}</span>
            </button>
          );
        })}
      </div>

      {/* Gráfico */}
      <div className="recharts-wrapper-container">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart
            data={chartData}
            margin={isMobile ? { top: 14, right: 48, left: 0, bottom: 4 } : { top: 18, right: 62, left: 8, bottom: 8 }}
          >
            <defs>
              {companies.map(c => (
                <linearGradient key={c.id} id={`grad_${c.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={c.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />

            <XAxis
              dataKey="turnIndex"
              tickFormatter={i => (i === 0 ? 'Inicio' : `${i}`)}
              tick={axisTick}
              axisLine={{ stroke: 'var(--line)' }}
              tickLine={false}
              dy={6}
              interval="preserveStartEnd"
              minTickGap={14}
            />

            <YAxis
              orientation="left"
              domain={yScale.domain}
              ticks={yScale.ticks}
              allowDecimals={false}
              tick={axisTick}
              tickFormatter={val => `${val}`}
              axisLine={false}
              tickLine={false}
              width={isMobile ? 34 : 42}
            />

            {/* Límites del reglamento (solo si entran en la escala visible) */}
            {yScale.domain[1] >= 250 && (
              <ReferenceLine y={250} stroke="var(--accent)" strokeDasharray="5 5" strokeWidth={1.2} strokeOpacity={0.8} />
            )}
            {yScale.domain[0] <= 100 && yScale.domain[1] >= 100 && (
              <ReferenceLine y={100} stroke="var(--line-strong)" strokeDasharray="2 4" strokeWidth={1} />
            )}
            {yScale.domain[0] <= 10 && (
              <ReferenceLine y={10} stroke="var(--down)" strokeDasharray="5 5" strokeWidth={1.2} strokeOpacity={0.8} />
            )}

            <Tooltip
              content={<CustomFinancialTooltip companies={companies} candleCompanyId={candleCompanyId} />}
              cursor={{ stroke: 'var(--ink-muted)', strokeWidth: 1, strokeDasharray: '4 4' }}
              isAnimationActive={false}
            />

            {/* Velas japonesas */}
            {candleCompanyId && (
              <Bar dataKey="candle" shape={<CandleShape />} isAnimationActive={false} maxBarSize={40} />
            )}

            {/* Área degradada de la empresa enfocada */}
            {!candleCompanyId && focusId && (
              <Area
                type="linear"
                dataKey={`area_${focusId}`}
                stroke="none"
                fill={`url(#grad_${focusId})`}
                isAnimationActive={false}
                activeDot={false}
                tooltipType="none"
              />
            )}

            {/* Líneas de precio */}
            {!candleCompanyId &&
              companies.map(c => {
                const isFocused = activeCompanyId === null || activeCompanyId === c.id;
                const isLast = i => i === chartData.length - 1;
                return (
                  <Line
                    key={c.id}
                    type="linear"
                    dataKey={c.id}
                    name={c.name}
                    stroke={c.color || 'var(--ink)'}
                    strokeWidth={activeCompanyId === c.id ? 2.75 : 2}
                    strokeOpacity={isFocused ? 1 : 0.12}
                    strokeLinejoin="round"
                    dot={props => {
                      const { cx, cy, index } = props;
                      if (!isFocused || !isLast(index) || cx == null) return <g key={`d${c.id}${index}`} />;
                      return (
                        <g key={`d${c.id}${index}`}>
                          <circle cx={cx} cy={cy} r={7} fill={c.color} opacity={0.2} className="last-dot-pulse" />
                          <circle cx={cx} cy={cy} r={3.5} fill={c.color} stroke="var(--surface)" strokeWidth={1.5} />
                        </g>
                      );
                    }}
                    activeDot={isFocused ? { r: 5, stroke: 'var(--surface)', strokeWidth: 2, fill: c.color } : false}
                    isAnimationActive={false}
                  />
                );
              })}

            {/* Último precio en el borde derecho */}
            {tagList.map(({ c, dy }) => {
              const last = lastRow[c.id];
              const prev = lastRow[`prev_${c.id}`];
              const color = candleCompanyId
                ? last > prev ? UP : last < prev ? DOWN : 'var(--ink-muted)'
                : c.color;
              return (
                <ReferenceLine
                  key={`tag_${c.id}`}
                  y={last}
                  stroke={color}
                  strokeOpacity={0.45}
                  strokeDasharray="2 3"
                  label={<LastPriceTag value={last} color={color} dy={dy} />}
                  ifOverflow="extendDomain"
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Pie */}
      <div className="chart-footer-note">
        <span className="chart-note-legend-desc">
          <span className="note-key"><i className="note-swatch is-ceiling" />Techo Bs 250</span>
          <span className="note-key"><i className="note-swatch is-base" />Inicial Bs 100</span>
          <span className="note-key"><i className="note-swatch is-floor" />Piso Bs 10</span>
        </span>
        <span className="chart-note-focus-desc">
          {candleCompanyId
            ? 'Velas: verde sube, roja baja'
            : activeCompanyId
              ? `Viendo: ${companies.find(c => c.id === activeCompanyId)?.name}`
              : 'Toca una empresa para verla sola'}
        </span>
      </div>
    </div>
  );
}
