import React from 'react';
import { Users, Landmark, Trophy, ArrowRight } from 'lucide-react';

export function RoleSelectScreen({ onSelectRole }) {
  return (
    <div className="terminal-centered">
      <div className="terminal-panel" style={{ maxWidth: '540px', textAlign: 'center' }}>
        <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'center' }}>
          <img
            src="/logo-ifi.png"
            alt="Olimpiadas IFI 2026"
            style={{ maxHeight: '72px', width: 'auto', objectFit: 'contain' }}
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--ifi-secondary)', fontWeight: 700, background: 'var(--ifi-subtle)', padding: '4px 10px', borderRadius: 'var(--border-radius-sm)', marginBottom: '10px' }}>
          <Trophy size={13} />
          <span>SIMULACIÓN BURSÁTIL · BBV</span>
        </div>

        <h1 className="terminal-heading" style={{ fontSize: '26px' }}>
          Olimpiadas de Ingeniería Financiera
        </h1>
        <p className="terminal-subheading">
          Competencia multijugador de renta variable en tiempo real. Seleccione su perfil de acceso a la rueda de negociación:
        </p>

        <div style={{ textAlign: 'left' }}>
          <button className="role-card-select" onClick={() => onSelectRole('team')}>
            <div className="role-icon-box">
              <Users size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="role-card-title">
                Mesa Inversionista / Estudiantes
              </div>
              <div className="role-card-desc">
                Acceso para equipos competidores mediante código de sala (PIN de 5 letras) proporcionado por el broker.
              </div>
            </div>
            <ArrowRight size={18} color="var(--ink-muted)" style={{ alignSelf: 'center' }} />
          </button>

          <button className="role-card-select" onClick={() => onSelectRole('broker')}>
            <div className="role-icon-box">
              <Landmark size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="role-card-title">
                Mesa de Control / Broker Organizador
              </div>
              <div className="role-card-desc">
                Creación y configuración de la sala, administración de tiempos y proyección del libro de órdenes central en pantalla gigante.
              </div>
            </div>
            <ArrowRight size={18} color="var(--ink-muted)" style={{ alignSelf: 'center' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
