import React, { useState } from 'react';
import {
  Sliders,
  Clock,
  Layers,
  Users,
  Building2,
  Play,
  ArrowLeft,
  Sparkles,
  Check,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Zap,
  Gavel,
  ShieldCheck,
} from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';

const CARD_TYPES = [
  {
    id: '100_10',
    label: '+100 / -10',
    title: 'Alza Sistémica',
    desc: 'Empresa objetivo sube +Bs 100; las demás 4 bajan -Bs 10.',
    icon: TrendingUp,
    badgeClass: 'badge-bullish',
  },
  {
    id: '20_50',
    label: '-50 / +20',
    title: 'Corrección / Rally',
    desc: 'Empresa objetivo baja -Bs 50; las demás 4 suben +Bs 20.',
    icon: TrendingDown,
    badgeClass: 'badge-bearish',
  },
  {
    id: '80_40',
    label: '+80 / -40',
    title: 'Arbitraje Directo',
    desc: 'Empresa objetivo sube +Bs 80; contraparte elegida baja -Bs 40.',
    icon: ArrowRightLeft,
    badgeClass: 'badge-arbitrage',
  },
  {
    id: '2x',
    label: '2x / 0.5x',
    title: 'Multiplicador Doble',
    desc: 'Empresa objetivo duplica (x2); contraparte cae a la mitad (x0.5).',
    icon: Zap,
    badgeClass: 'badge-multiplier',
  },
  {
    id: 'half_2x',
    label: '0.5x / 2x',
    title: 'Inversión de Mitad',
    desc: 'Empresa objetivo cae a la mitad (x0.5); contraparte duplica (x2).',
    icon: Zap,
    badgeClass: 'badge-multiplier',
  },
  {
    id: 'auction',
    label: 'Subasta Pública',
    title: 'Liquidez Forzada',
    desc: 'Convoca a subasta pública obligatoria de 30 acciones en piso.',
    icon: Gavel,
    badgeClass: 'badge-auction',
  },
];

const COMPANY_PRESETS = {
  bbv: {
    id: 'bbv',
    label: 'BBV Líder Corporativo',
    companies: [
      { id: 'c1', name: 'CBN (Cervecería Boliviana)', ticker: 'CBN', color: '#b45309', price: 100 },
      { id: 'c2', name: 'SOBOCE (Cemento Nacional)', ticker: 'SOBO', color: '#1e3a8a', price: 100 },
      { id: 'c3', name: 'Banco BISA S.A.', ticker: 'BISA', color: '#047857', price: 100 },
      { id: 'c4', name: 'Banco Nacional de Bolivia', ticker: 'BNB', color: '#6b21a8', price: 100 },
      { id: 'c5', name: 'Telecel / Tigo Bolivia', ticker: 'TIGO', color: '#0284c7', price: 100 },
    ],
  },
  banking: {
    id: 'banking',
    label: 'Banca & Finanzas',
    companies: [
      { id: 'c1', name: 'Banco Mercantil Santa Cruz', ticker: 'BMSC', color: '#047857', price: 100 },
      { id: 'c2', name: 'Banco BISA S.A.', ticker: 'BISA', color: '#0f766e', price: 100 },
      { id: 'c3', name: 'Banco Nacional de Bolivia', ticker: 'BNB', color: '#6b21a8', price: 100 },
      { id: 'c4', name: 'Banco FIE S.A.', ticker: 'FIE', color: '#c2410c', price: 100 },
      { id: 'c5', name: 'Banco de Crédito BCP', ticker: 'BCP', color: '#1e3a8a', price: 100 },
    ],
  },
  industry: {
    id: 'industry',
    label: 'Industria & Energía',
    companies: [
      { id: 'c1', name: 'YPFB Refinación S.A.', ticker: 'YPFB', color: '#0284c7', price: 100 },
      { id: 'c2', name: 'Minera San Cristóbal', ticker: 'MSC', color: '#b45309', price: 100 },
      { id: 'c3', name: 'Embol S.A. (Coca-Cola)', ticker: 'EMBL', color: '#b91c1c', price: 100 },
      { id: 'c4', name: 'Droguería INTI S.A.', ticker: 'INTI', color: '#047857', price: 100 },
      { id: 'c5', name: 'PIL Andina S.A.', ticker: 'PIL', color: '#4338ca', price: 100 },
    ],
  },
};

export function BrokerSetupScreen({ onBack, onRoomCreated }) {
  const { createRoom, error, setError } = useGameSocket();

  const [turnSeconds, setTurnSeconds] = useState(60);
  const [handSize, setHandSize] = useState(6);
  const [maxTeams, setMaxTeams] = useState('');
  const [selectedCards, setSelectedCards] = useState(CARD_TYPES.map(c => c.id));
  const [activePreset, setActivePreset] = useState('bbv');
  const [companies, setCompanies] = useState(COMPANY_PRESETS.bbv.companies);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyPreset = presetKey => {
    setActivePreset(presetKey);
    if (COMPANY_PRESETS[presetKey]) {
      setCompanies(COMPANY_PRESETS[presetKey].companies);
    }
  };

  const toggleCard = id => {
    setSelectedCards(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const updateCompanyName = (index, name) => {
    setActivePreset('custom');
    setCompanies(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name };
      return copy;
    });
  };

  const updateCompanyTicker = (index, ticker) => {
    setActivePreset('custom');
    setCompanies(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ticker: ticker.toUpperCase().slice(0, 4) };
      return copy;
    });
  };

  const handleCreate = async e => {
    e.preventDefault();
    setError('');

    if (selectedCards.length === 0) {
      setError('Debe autorizar al menos un tipo de tarjeta reglamentaria para la sesión.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRoom({
        turnSeconds,
        handSize,
        maxTeams: maxTeams ? parseInt(maxTeams, 10) : null,
        enabledCardIds: selectedCards,
        companies,
      });
      onRoomCreated();
    } catch (err) {
      // error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="terminal-centered access-screen setup-screen">
      <div className="terminal-panel broker-setup-panel">
        {/* Encabezado */}
        <div className="setup-header">
          <div className="setup-header-icon">
            <Sliders size={22} />
          </div>
          <div className="setup-header-text">
            <span className="ui-eyebrow">Mesa de control · Broker</span>
            <h2 className="terminal-heading">Configura la rueda bursátil</h2>
            <p className="terminal-subheading">
              Define la duración de los turnos, las empresas que cotizan y las tarjetas que se usarán en la partida.
            </p>
          </div>
        </div>

        {error && <div className="terminal-alert-error">{error}</div>}

        <form onSubmit={handleCreate}>
          {/* 1. Duración de Turno Operativo */}
          <section className="setup-section">
            <div className="setup-section-head">
              <span className="setup-step">1</span>
              <div className="setup-section-title">
                <h3>
                  <Clock size={16} />
                  Tiempo por turno
                </h3>
                <p>Cuánto tiene cada equipo para operar en su turno.</p>
              </div>
              <span className="ui-badge ui-badge--brand">
                <span className="font-mono">{turnSeconds}</span> s por equipo
              </span>
            </div>

            <div className="time-pill-grid">
              {[
                { val: 30, lbl: '30 seg', desc: 'Rápido' },
                { val: 45, lbl: '45 seg', desc: 'Dinámico' },
                { val: 60, lbl: '1 min', desc: 'Estándar' },
                { val: 90, lbl: '1:30 min', desc: 'Analítico' },
              ].map(opt => (
                <div
                  key={opt.val}
                  role="button"
                  aria-pressed={turnSeconds === opt.val}
                  className={`time-pill-card ${turnSeconds === opt.val ? 'active' : ''}`}
                  onClick={() => setTurnSeconds(opt.val)}
                >
                  <span className="time-pill-value font-mono">{opt.lbl}</span>
                  <span className="time-pill-label">{opt.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Rondas (Tarjetas) y Capacidad */}
          <section className="setup-section">
            <div className="setup-section-head">
              <span className="setup-step">2</span>
              <div className="setup-section-title">
                <h3>
                  <Users size={16} />
                  Rondas y equipos
                </h3>
                <p>Cada tarjeta equivale a una ronda de juego por equipo.</p>
              </div>
            </div>

            <div className="broker-setup-params-grid">
              <div className="form-field">
                <label className="form-label-institutional" htmlFor="setup-hand-size">
                  Tarjetas por equipo
                </label>
                <div className="setup-input-suffix">
                  <input
                    id="setup-hand-size"
                    type="number"
                    min="2"
                    max="15"
                    value={handSize}
                    onChange={e => setHandSize(parseInt(e.target.value || '6', 10))}
                    className="form-input-institutional font-mono"
                  />
                  <span className="setup-suffix-label">{handSize} rondas</span>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label-institutional" htmlFor="setup-max-teams">
                  Máximo de equipos
                </label>
                <input
                  id="setup-max-teams"
                  type="number"
                  min="2"
                  max="50"
                  placeholder="Sin límite"
                  value={maxTeams}
                  onChange={e => setMaxTeams(e.target.value)}
                  className="form-input-institutional font-mono"
                />
              </div>
            </div>
          </section>

          {/* 3. Selección de Emisores Bursátiles con Plantillas de Bolivia */}
          <section className="setup-section">
            <div className="setup-section-head">
              <span className="setup-step">3</span>
              <div className="setup-section-title">
                <h3>
                  <Building2 size={16} />
                  Empresas que cotizan
                </h3>
                <p>Elige una plantilla o edita el nombre y el ticker de cada empresa.</p>
              </div>
              <span className="ui-badge">
                Base <span className="font-mono">Bs 100 · 260</span> acc.
              </span>
            </div>

            {/* Selector de Plantillas Rápidas */}
            <div className="preset-selector-bar">
              <button
                type="button"
                className={`preset-tab-btn ${activePreset === 'bbv' ? 'active' : ''}`}
                onClick={() => applyPreset('bbv')}
              >
                <Sparkles size={14} />
                <span>Oficial BBV</span>
              </button>
              <button
                type="button"
                className={`preset-tab-btn ${activePreset === 'banking' ? 'active' : ''}`}
                onClick={() => applyPreset('banking')}
              >
                <span>Banca y finanzas</span>
              </button>
              <button
                type="button"
                className={`preset-tab-btn ${activePreset === 'industry' ? 'active' : ''}`}
                onClick={() => applyPreset('industry')}
              >
                <span>Industria y energía</span>
              </button>
              <button
                type="button"
                className={`preset-tab-btn ${activePreset === 'custom' ? 'active' : ''}`}
                onClick={() => setActivePreset('custom')}
              >
                <span>Personalizado</span>
              </button>
            </div>

            {/* Lista de Empresas con Ticker y Color */}
            <div className="company-edit-grid">
              {companies.map((c, idx) => (
                <div key={c.id} className="company-edit-row">
                  <span className="company-color-indicator" style={{ backgroundColor: c.color }} />
                  <input
                    type="text"
                    value={c.name}
                    onChange={e => updateCompanyName(idx, e.target.value)}
                    placeholder="Nombre de la empresa"
                    className="company-name-input"
                    aria-label={`Nombre de la empresa ${idx + 1}`}
                  />
                  <input
                    type="text"
                    value={c.ticker}
                    onChange={e => updateCompanyTicker(idx, e.target.value)}
                    placeholder="TICK"
                    maxLength={4}
                    className="company-ticker-pill"
                    title="Ticker nemotécnico (hasta 4 letras)"
                    aria-label={`Ticker de la empresa ${idx + 1}`}
                  />
                  <span className="company-price-tag font-mono">
                    Bs {c.price || 100}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Tarjetas Tácticas Autorizadas con Impacto Visual */}
          <section className="setup-section">
            <div className="setup-section-head">
              <span className="setup-step">4</span>
              <div className="setup-section-title">
                <h3>
                  <Layers size={16} />
                  Tarjetas habilitadas
                </h3>
                <p>Toca una tarjeta para activarla o desactivarla.</p>
              </div>
              <span className="ui-badge ui-badge--brand">
                <span className="font-mono">
                  {selectedCards.length}/{CARD_TYPES.length}
                </span>{' '}
                activas
              </span>
            </div>

            <div className="card-tiles-grid">
              {CARD_TYPES.map(card => {
                const isSelected = selectedCards.includes(card.id);
                const Icon = card.icon;

                return (
                  <div
                    key={card.id}
                    role="button"
                    aria-pressed={isSelected}
                    className={`card-tile-item ${card.badgeClass} ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleCard(card.id)}
                  >
                    <span className="card-tile-icon">
                      <Icon size={18} />
                    </span>
                    <div className="card-tile-content">
                      <div className="card-tile-header">
                        <span className="card-tile-code font-mono">{card.label}</span>
                        <span className="card-tile-title">{card.title}</span>
                      </div>
                      <p className="card-tile-desc">{card.desc}</p>
                    </div>
                    <span className="card-tile-check" aria-hidden="true">
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // controlado por el contenedor
                      className="card-tile-checkbox"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Botones de Envío */}
          <div className="setup-actions">
            <button type="button" className="btn-secondary-action" onClick={onBack}>
              <ArrowLeft size={16} />
              <span>Volver</span>
            </button>

            <button type="submit" className="btn-primary-action" disabled={isSubmitting}>
              <Play size={17} />
              <span>{isSubmitting ? 'Abriendo sala…' : 'Abrir sala y generar PIN'}</span>
            </button>
          </div>
        </form>

        {/* Sello */}
        <div className="setup-seal">
          <ShieldCheck size={15} />
          <span>Parámetros del reglamento oficial · Olimpiadas IFI 2026</span>
        </div>
      </div>
    </div>
  );
}
