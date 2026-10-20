import React from 'react';
import { Clock, Pause } from 'lucide-react';

export function TimerBadge({ seconds, paused, isAuction }) {
  if (paused) {
    return (
      <div className="institutional-timer" style={{ color: 'var(--ink-secondary)' }}>
        <Pause size={14} />
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PAUSADO</span>
      </div>
    );
  }

  const s = Math.max(0, seconds ?? 0);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  const formatted = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  let alertClass = '';
  if (s <= 10) alertClass = 'critical';
  else if (s <= 30) alertClass = 'warn';

  return (
    <div className={`institutional-timer ${alertClass}`}>
      <Clock size={15} />
      <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--ink-secondary)', letterSpacing: '0.04em' }}>
        {isAuction ? 'Subasta' : 'Turno'}
      </span>
      <span className="val-num" style={{ fontWeight: 700 }}>
        {formatted}
      </span>
    </div>
  );
}
