import React from 'react';
import { Briefcase, Wallet, PieChart, ShieldCheck, AlertCircle } from 'lucide-react';

export function Portfolio({ team, companies }) {
  if (!team) return null;

  const cash = team.cash || 0;
  const holdings = team.holdings || {};

  let stockValue = 0;
  const activePositions = [];

  companies.forEach(c => {
    const qty = holdings[c.id] || 0;
    if (qty > 0) {
      const positionVal = qty * c.price;
      stockValue += positionVal;
      activePositions.push({
        company: c,
        qty,
        positionVal,
      });
    }
  });

  const totalValue = cash + stockValue;
  const cashRatio = totalValue > 0 ? ((cash / totalValue) * 100).toFixed(0) : 100;

  return (
    <div className="terminal-card portfolio-card">
      <div className="terminal-card-header">
        <div className="header-icon-label">
          <span className="panel-icon-chip">
            <Briefcase size={17} />
          </span>
          <span className="card-title-strong">Mi portafolio</span>
        </div>
        <div className="portfolio-status-pill">
          {team.eliminated ? (
            <span className="status-liquidated">
              <AlertCircle size={14} />
              <span>Posición liquidada</span>
            </span>
          ) : (
            <span className="status-solvent">
              <ShieldCheck size={14} />
              <span>Mesa solvente</span>
            </span>
          )}
        </div>
      </div>

      {/* Resumen patrimonial */}
      <div className="portfolio-summary-grid">
        <div className="portfolio-stat-box highlight-box">
          <div className="stat-box-label">
            <Briefcase size={15} />
            <span>Patrimonio total</span>
          </div>
          <div className="stat-box-val font-mono total-equity">
            <span className="stat-currency">Bs</span> {totalValue.toLocaleString()}
          </div>
          <div className="equity-mix-bar" aria-hidden="true">
            <span className="equity-mix-cash" style={{ width: `${cashRatio}%` }} />
          </div>
          <div className="equity-mix-legend">
            <span><i className="legend-dot dot-cash" /> Efectivo</span>
            <span><i className="legend-dot dot-stocks" /> Acciones</span>
          </div>
        </div>

        <div className="portfolio-stat-box">
          <div className="stat-box-label">
            <Wallet size={15} />
            <span>Efectivo</span>
          </div>
          <div className="stat-box-val font-mono">
            <span className="stat-currency">Bs</span> {cash.toLocaleString()}
          </div>
          <div className="stat-box-sub">
            <span className="font-mono">{cashRatio}%</span> del patrimonio
          </div>
        </div>

        <div className="portfolio-stat-box">
          <div className="stat-box-label">
            <PieChart size={15} />
            <span>En acciones</span>
          </div>
          <div className="stat-box-val font-mono">
            <span className="stat-currency">Bs</span> {stockValue.toLocaleString()}
          </div>
          <div className="stat-box-sub">
            <span className="font-mono">{activePositions.length}</span> empresa{activePositions.length !== 1 ? 's' : ''} en cartera
          </div>
        </div>
      </div>

      {/* Posiciones activas */}
      <div className="portfolio-holdings-section">
        <div className="holdings-section-title">
          <span>Tus acciones</span>
        </div>

        {activePositions.length === 0 ? (
          <div className="no-holdings-msg">
            <PieChart size={22} className="no-holdings-icon" />
            <span>Todavía no tienes acciones. Compra en el mercado para empezar a invertir.</span>
          </div>
        ) : (
          <div className="holdings-mini-table-wrapper">
            <div className="holdings-list-head">
              <span>Empresa</span>
              <span className="text-right">Acciones</span>
              <span className="text-right">Precio</span>
              <span className="text-right">Valor</span>
            </div>
            <ul className="holdings-list">
              {activePositions.map(({ company, qty, positionVal }) => (
                <li
                  key={company.id}
                  className="holding-row"
                  title={`${company.name} (${company.ticker || `E${company.id}`})`}
                >
                  <div className="holding-ticker-cell">
                    <span
                      className="holding-color-dot"
                      style={{ backgroundColor: company.color || 'var(--ink)' }}
                    />
                    <span className="holding-ticker font-mono">{company.ticker || `E${company.id}`}</span>
                    <span className="holding-name">{company.name}</span>
                  </div>
                  <span className="holding-qty font-mono text-right">
                    {qty}<small> acc.</small>
                  </span>
                  <span className="holding-price font-mono text-right">Bs {company.price}</span>
                  <span className="holding-value font-mono text-right">
                    Bs {positionVal.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
