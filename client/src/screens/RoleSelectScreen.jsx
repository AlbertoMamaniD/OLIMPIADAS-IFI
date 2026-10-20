import React, { useState } from 'react';
import { Users, Landmark, Trophy, ArrowRight, Bot, Sparkles } from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';

export function RoleSelectScreen({ onSelectRole }) {
  const { createSoloDemo, error, setError } = useGameSocket();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleStartSoloDemo = async () => {
    setError('');
    setLoadingDemo(true);
    try {
      await createSoloDemo('Mesa Principal (Tú)');
    } catch (err) {
      // error handled in context
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="terminal-centered">
      <div className="terminal-panel" style={{ maxWidth: '560px', textAlign: 'center' }}>
        <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'center' }}>
          <img
            src="/logo-ifi.png"
            alt="Olimpiadas IFI 2026"
            style={{ maxHeight: '70px', width: 'auto', objectFit: 'contain' }}
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ifi-secondary)', fontWeight: 700, background: 'var(--ifi-subtle)', padding: '4px 10px', borderRadius: 'var(--border-radius-sm)', marginBottom: '10px' }}>
          <Trophy size={13} />
          <span>SIMULACIÓN BURSÁTIL · BBV</span>
        </div>

        <h1 className="terminal-heading" style={{ fontSize: '24px' }}>
          Olimpiadas de Ingeniería Financiera
        </h1>
        <p className="terminal-subheading">
          Simulación de renta variable en tiempo real. Seleccione cómo desea operar:
        </p>

        {error && <div className="terminal-alert-error">{error}</div>}

        <div style={{ textAlign: 'left' }}>
          {/* Opción 1: Modo Solo con Bots (Sin requerir personas) */}
          <button
            className="role-card-select"
            style={{ borderLeft: '4px solid var(--ifi-secondary)', background: 'var(--ifi-subtle)' }}
            disabled={loadingDemo}
            onClick={handleStartSoloDemo}
          >
            <div className="role-icon-box" style={{ background: 'var(--ifi-secondary)', color: '#ffffff' }}>
              <Bot size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="role-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Modo Solo / Demostración Rápida</span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'var(--ifi-secondary)', color: '#fff', padding: '2px 6px', borderRadius: '2px' }}>
                  CON BOTS
                </span>
              </div>
              <div className="role-card-desc">
                Juega inmediatamente como inversionista contra 3 mesas simuladas por Inteligencia Artificial. No requiere otras personas.
              </div>
            </div>
            <ArrowRight size={18} color="var(--ifi-secondary)" style={{ alignSelf: 'center' }} />
          </button>

          {/* Opción 2: Estudiante / Mesa de Aula */}
          <button className="role-card-select" onClick={() => onSelectRole('team')}>
            <div className="role-icon-box">
              <Users size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="role-card-title">
                Mesa Inversionista / Estudiantes
              </div>
              <div className="role-card-desc">
                Únete a una sala multijugador existente usando el código PIN de 5 letras generado por el broker.
              </div>
            </div>
            <ArrowRight size={18} color="var(--ink-muted)" style={{ alignSelf: 'center' }} />
          </button>

          {/* Opción 3: Broker Organizador */}
          <button className="role-card-select" onClick={() => onSelectRole('broker')}>
            <div className="role-icon-box">
              <Landmark size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="role-card-title">
                Mesa de Control / Broker Organizador
              </div>
              <div className="role-card-desc">
                Crea una sala oficial para proyectar en el salón, coordinar tiempos y admitir equipos reales o bots.
              </div>
            </div>
            <ArrowRight size={18} color="var(--ink-muted)" style={{ alignSelf: 'center' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
