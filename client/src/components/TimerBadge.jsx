import React from 'react';
import { Clock, Pause } from 'lucide-react';

export function TimerBadge({ seconds, paused, isAuction }) {
  if (paused) {
    return (
      <div className="terminal-timer-badge is-paused">
        <Pause size={13} />
        <span className="timer-label">PAUSA MESA</span>
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
    <div className={`terminal-timer-badge ${alertState}`}>
      <Clock size={14} className="timer-icon" />
      <div className="timer-info">
        <span className="timer-label font-mono">
          {isAuction ? 'SUBASTA' : 'TIEMPO TURNO'}
        </span>
        <span className="timer-value font-mono">
          {formatted}
        </span>
      </div>
    </div>
  );
}
