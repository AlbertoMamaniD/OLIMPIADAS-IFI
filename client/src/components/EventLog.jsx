import React, { useRef, useEffect } from 'react';
import { Activity } from 'lucide-react';

export function EventLog({ log }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="terminal-card">
      <div className="terminal-card-header">
        <div className="header-icon-label">
          <Activity size={15} color="var(--ifi-secondary)" />
          <span>Registro de Operaciones</span>
        </div>
        <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)' }}>
          TRANSMISIÓN EN VIVO
        </span>
      </div>

      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxHeight: '190px',
          overflowY: 'auto',
          fontSize: '12px',
        }}
      >
        {(!log || log.length === 0) ? (
          <div style={{ color: 'var(--ink-muted)', fontStyle: 'italic', padding: '10px 0' }}>
            Sin operaciones registradas en el libro
          </div>
        ) : (
          log.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '10px',
                lineHeight: 1.45,
                borderBottom: '1px solid var(--surface-subtle)',
                paddingBottom: '4px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ifi-secondary)',
                  fontWeight: 700,
                  fontSize: '11px',
                  flexShrink: 0,
                }}
              >
                T{item.turn < 10 ? `0${item.turn}` : item.turn}
              </span>
              <span style={{ color: 'var(--ink)' }}>{item.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
