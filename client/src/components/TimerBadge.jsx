import React from 'react';
import { Clock, Pause, Gavel } from 'lucide-react';

export function TimerBadge({ seconds, paused, isAuction }) {
  if (paused) {
    return (
      <div className="terminal-timer-badge is-paused" role="timer" aria-label="Juego en pausa">
        <span className="timer-icon-wrap">
          <Pause size={16} />
        </span>
        <div className="timer-info">
          <span className="timer-label">Reloj</span>
          <span className="timer-value timer-value-text">En pausa</span>
        </div>
      </div>
    );
  }

  const s = Math.max(0, seconds ?? 0);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  const formatted = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  let alertState = 'is-normal';
  if (s <= 10) alertState = 'is-critical';
  else if (s <= 25) alertState = 'is-warn';

  return (
    <div
      className={`terminal-timer-badge ${alertState} ${isAuction ? 'is-auction' : ''}`}
      role="timer"
      aria-label={`${isAuction ? 'Subasta' : 'Tiempo del turno'}: ${formatted}`}
    >
      <span className="timer-icon-wrap">
        {isAuction ? <Gavel size={16} className="timer-icon" /> : <Clock size={16} className="timer-icon" />}
      </span>
      <div className="timer-info">
        <span className="timer-label">
          {isAuction ? 'Subasta' : 'Tiempo del turno'}
        </span>
        <span className="timer-value font-mono">
          {formatted}
        </span>
      </div>
    </div>
  );
}
