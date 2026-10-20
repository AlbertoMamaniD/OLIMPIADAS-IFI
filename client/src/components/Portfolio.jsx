import React from 'react';
import { Briefcase, Wallet, PieChart, ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react';

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
          <Briefcase size={18} className="text-ifi" />
          <span className="card-title-strong">Estado Patrimonial y Tenencias</span>
        </div>
        <div className="portfolio-status-pill">
          {team.eliminated ? (
            <span className="status-liquidated">
              <AlertCircle size={13} />
              <span>POSICIÓN LIQUIDADA</span>
            </span>
          ) : (
            <span className="status-solvent font-mono">
              <ShieldCheck size={14} />
              <span>MESA SOLVENTE</span>
            </span>
          )}
        </div>
      </div>

      {/* Grid de Resumen Patrimonial con Cajas Amplias */}
      <div className="portfolio-summary-grid">
        <div className="portfolio-stat-box">
          <div className="stat-box-label">
            <Wallet size={14} />
            <span>Liquidez en Efectivo</span>
          </div>
          <div className="stat-box-val font-mono">
            Bs {cash.toLocaleString()}
          </div>
          <div className="stat-box-sub text-muted font-mono">
            {cashRatio}% del patrimonio
          </div>
        </div>

        <div className="portfolio-stat-box">
          <div className="stat-box-label">
            <PieChart size={14} />
            <span>Renta Variable</span>
          </div>
          <div className="stat-box-val font-mono">
            Bs {stockValue.toLocaleString()}
          </div>
          <div className="stat-box-sub text-muted font-mono">
            {activePositions.length} emisor{activePositions.length !== 1 ? 'es' : ''} en cartera
          </div>
        </div>

        <div className="portfolio-stat-box highlight-box">
          <div className="stat-box-label">
            <Briefcase size={14} />
            <span>Patrimonio Neto Total</span>
          </div>
          <div className="stat-box-val font-mono total-equity">
            Bs {totalValue.toLocaleString()}
          </div>
          <div className="stat-box-sub font-mono text-ifi">
            Valoración consolidada
          </div>
        </div>
      </div>

      {/* Desglose de Posiciones Activas */}
      <div className="portfolio-holdings-section">
        <div className="holdings-section-title">
          <span>Desglose de Títulos en Posición</span>
        </div>

        {activePositions.length === 0 ? (
          <div className="no-holdings-msg font-mono">
            Cartera 100% líquida. No registra tenencias en renta variable actualmente.
          </div>
        ) : (
          <div className="holdings-mini-table-wrapper">
            <table className="holdings-mini-table font-mono">
              <thead>
                <tr>
                  <th>Emisor</th>
                  <th className="text-right">Títulos</th>
                  <th className="text-right">Precio Mercado</th>
                  <th className="text-right">Valuación Total</th>
                </tr>
              </thead>
              <tbody>
                {activePositions.map(({ company, qty, positionVal }) => (
                  <tr key={company.id}>
                    <td>
                      <div className="holding-ticker-cell">
                        <span
                          className="holding-color-dot"
                          style={{ backgroundColor: company.color || 'var(--ink)' }}
                        />
                        <span className="holding-ticker">[{company.ticker || `E${company.id}`}]</span>
                        <span className="holding-name">{company.name}</span>
                      </div>
                    </td>
                    <td className="text-right font-bold">{qty} acc.</td>
                    <td className="text-right">Bs {company.price}</td>
                    <td className="text-right font-bold text-highlight">
                      Bs {positionVal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
