import React, { useState } from 'react';
import { Users, Landmark, ArrowRight, Bot, TrendingUp, Wallet, Building2, Zap } from 'lucide-react';
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
    <div className="landing">
      <section className="landing-hero">
        {/* Gráfico de velas decorativo */}
        <svg className="landing-hero-candles" viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            points="0,210 50,190 100,200 150,160 200,170 250,120 300,135 350,95 400,110 450,70 500,82 550,40 600,52"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          {[
            [40, 150, 200, 1], [90, 170, 215, 0], [140, 130, 180, 1], [190, 150, 190, 0],
            [240, 95, 140, 1], [290, 115, 150, 0], [340, 70, 115, 1], [390, 90, 128, 0],
            [440, 50, 92, 1], [490, 62, 100, 0], [540, 22, 60, 1],
          ].map(([x, y1, y2, up]) => (
            <g key={x} className={up ? 'candle-up' : 'candle-down'}>
              <line x1={x} x2={x} y1={y1 - 14} y2={y2 + 14} strokeWidth="2" />
              <rect x={x - 7} y={y1} width="14" height={y2 - y1} rx="2" />
            </g>
          ))}
        </svg>

        <div className="landing-hero-inner">
          <div className="landing-copy">
            <div className="landing-logo-chip">
              <img
                src="/logo-ifi.png"
                alt="Olimpiadas IFI 2026"
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <span className="landing-eyebrow">
              <span className="landing-eyebrow-dot" />
              Simulación bursátil en tiempo real · BBV
            </span>

            <h1 className="landing-title">
              Olimpiadas de <span className="landing-title-accent">Ingeniería Financiera</span>
            </h1>

            <p className="landing-lead">
              Forma tu equipo, compra y vende acciones, juega cartas tácticas que mueven el mercado
              y lleva a tu mesa al podio. Así se vive la bolsa en la universidad.
            </p>

            <ul className="landing-stats">
              <li>
                <Wallet size={18} />
                <div>
                  <strong className="font-mono">Bs 1.000</strong>
                  <span>Capital inicial</span>
                </div>
              </li>
              <li>
                <Building2 size={18} />
                <div>
                  <strong className="font-mono">5</strong>
                  <span>Empresas cotizadas</span>
                </div>
              </li>
              <li>
                <TrendingUp size={18} />
                <div>
                  <strong>En vivo</strong>
                  <span>Precios y turnos</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="landing-panel">
            <div className="landing-panel-head">
              <h2>¿Cómo quieres participar?</h2>
              <p>Elige tu rol para ingresar a la rueda bursátil.</p>
            </div>

            {error && <div className="terminal-alert-error">{error}</div>}

            <div className="role-options">
              {/* Opción 1: Modo Solo con Bots (Sin requerir personas) */}
              <button
                className="role-card-select role-card-featured"
                disabled={loadingDemo}
                onClick={handleStartSoloDemo}
              >
                <div className="role-icon-box">
                  <Bot size={22} />
                </div>
                <div className="role-card-body">
                  <div className="role-card-title">
                    <span>Modo Solo · Práctica rápida</span>
                    <span className="role-card-tag">
                      <Zap size={11} /> Con bots
                    </span>
                  </div>
                  <div className="role-card-desc">
                    {loadingDemo
                      ? 'Preparando la sala de práctica…'
                      : 'Juega al instante contra 3 mesas simuladas. No necesitas a nadie más.'}
                  </div>
                </div>
                <ArrowRight size={18} className="role-card-arrow" />
              </button>

              {/* Opción 2: Estudiante / Mesa de Aula */}
              <button className="role-card-select" onClick={() => onSelectRole('team')}>
                <div className="role-icon-box">
                  <Users size={22} />
                </div>
                <div className="role-card-body">
                  <div className="role-card-title">Mesa Inversionista · Estudiantes</div>
                  <div className="role-card-desc">
                    Únete a una sala con el código PIN de 5 letras que te da el broker.
                  </div>
                </div>
                <ArrowRight size={18} className="role-card-arrow" />
              </button>

              {/* Opción 3: Broker Organizador */}
              <button className="role-card-select" onClick={() => onSelectRole('broker')}>
                <div className="role-icon-box">
                  <Landmark size={22} />
                </div>
                <div className="role-card-body">
                  <div className="role-card-title">Mesa de Control · Broker</div>
                  <div className="role-card-desc">
                    Crea la sala oficial, proyéctala en el aula y coordina los turnos de los equipos.
                  </div>
                </div>
                <ArrowRight size={18} className="role-card-arrow" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Carrera de Ingeniería Financiera · UCB Sede Tarija</span>
        <span className="landing-footer-sep" aria-hidden="true">•</span>
        <span>Olimpiadas IFI 2026</span>
      </footer>
    </div>
  );
}
