import React from 'react';
import { BookOpen, Sun, Moon, LogOut, Shield } from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';

export function Topbar({ onOpenRules }) {
  const { room, role, myTeam, theme, toggleTheme, resetAll } = useGameSocket();

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <img
          src="/logo-ifi.png"
          alt="Olimpiadas IFI 2026"
          className="brand-logo-img"
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="brand-title-wrap">
          <span className="brand-main-title">
            IFI Trader League {room?.code ? `· Sala ${room.code}` : ''}
          </span>
          <span className="brand-sub-badge">Olimpiadas IFI 2026 · BBV</span>
        </div>
      </div>

      <div className="topbar-actions">
        {myTeam && (
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)', marginRight: '6px' }}>
            Mesa: <strong style={{ color: 'var(--ink)' }}>{myTeam.name}</strong>
          </span>
        )}

        {role === 'broker' && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              background: 'var(--ifi-subtle)',
              color: 'var(--ifi-secondary)',
              border: '1px solid var(--ifi-secondary)',
              padding: '2px 8px',
              borderRadius: 'var(--border-radius-sm)',
              fontWeight: 700,
            }}
          >
            <Shield size={12} />
            BROKER
          </span>
        )}

        <button className="btn-control" onClick={onOpenRules}>
          <BookOpen size={14} />
          <span>Reglamento</span>
        </button>

        <button className="btn-control" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          <span>{theme === 'light' ? 'Oscuro' : 'Claro'}</span>
        </button>

        {room && (
          <button
            className="btn-control"
            style={{ color: 'var(--down)', borderColor: 'var(--down-border)' }}
            onClick={() => {
              if (window.confirm('¿Desea salir de la sala actual?')) resetAll();
            }}
            title="Salir al menú principal"
          >
            <LogOut size={14} />
            <span>Salir</span>
          </button>
        )}
      </div>
    </header>
  );
}
