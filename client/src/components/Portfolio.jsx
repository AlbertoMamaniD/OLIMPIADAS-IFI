import React from 'react';
import { Briefcase, Wallet, PieChart, ShieldCheck } from 'lucide-react';

export function Portfolio({ team, companies }) {
  if (!team) return null;

  const cash = team.cash || 0;
  const holdings = team.holdings || {};

  let stockValue = 0;
  companies.forEach(c => {
    const qty = holdings[c.id] || 0;
    stockValue += qty * c.price;
  });

  const totalValue = cash + stockValue;

  return (
    <div className="terminal-card">
      <div className="terminal-card-header">
        <div className="header-icon-label">
          <Briefcase size={15} color="var(--ifi-secondary)" />
          <span>Estado Patrimonial</span>
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          {team.eliminated ? (
            <span style={{ color: 'var(--down)', fontWeight: 700 }}>POSICIÓN LIQUIDADA</span>
          ) : (
            <span style={{ color: 'var(--up)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <ShieldCheck size={12} />
              OPERATIVO
            </span>
          )}
        </span>
      </div>

      <div className="portfolio-statement-row">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--ink-secondary)' }}>
          <Wallet size={14} color="var(--ink-muted)" />
          <span>Efectivo disponible</span>
        </span>
        <span className="val-num">Bs {cash.toLocaleString()}</span>
      </div>

      <div className="portfolio-statement-row">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--ink-secondary)' }}>
          <PieChart size={14} color="var(--ink-muted)" />
          <span>Valuación de cartera accionaria</span>
        </span>
        <span className="val-num">Bs {stockValue.toLocaleString()}</span>
      </div>

      <div className="portfolio-statement-row total-row">
        <span>Patrimonio Neto Total</span>
        <span className="val-num" style={{ color: 'var(--ifi-primary)' }}>
          Bs {totalValue.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
