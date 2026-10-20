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
    <div className="terminal-centered" style={{ padding: '24px 16px' }}>
      <div className="terminal-panel broker-setup-panel">
        {/* Encabezado Institucional */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ifi-secondary)' }}>
            <Sliders size={20} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              MESA DE CONTROL (BROKER) · BBV
            </span>
          </div>
          <span className="order-type-chip chip-buy font-mono" style={{ fontSize: '10px' }}>
            REGLAMENTO IFI 2026
          </span>
        </div>

        <h2 className="terminal-heading" style={{ fontSize: '24px', margin: '4px 0 2px 0' }}>
          Parámetros de la Rueda Bursátil
        </h2>
        <p className="terminal-subheading" style={{ marginBottom: '18px' }}>
          Configure el marco operativo, los activos cotizados y la duración de turnos para las mesas universitarias:
        </p>

        {error && <div className="terminal-alert-error font-mono">{error}</div>}

        <form onSubmit={handleCreate}>
          {/* 1. Duración de Turno Operativo */}
          <div className="form-field" style={{ marginBottom: '18px' }}>
            <label className="form-label-institutional" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} />
                <span>Tiempo por Turno de Negociación:</span>
              </span>
              <span className="font-mono text-ifi" style={{ fontSize: '11px', fontWeight: 600 }}>
                {turnSeconds} segundos por mesa
              </span>
            </label>

            <div className="time-pill-grid">
              {[
                { val: 30, lbl: '30 seg', desc: 'Rápido' },
                { val: 45, lbl: '45 seg', desc: 'Dinámico' },
                { val: 60, lbl: '1 min', desc: 'Estándar' },
                { val: 90, lbl: '1:30 min', desc: 'Analítico' },
              ].map(opt => (
                <div
                  key={opt.val}
                  className={`time-pill-card ${turnSeconds === opt.val ? 'active' : ''}`}
                  onClick={() => setTurnSeconds(opt.val)}
                >
                  <span className="time-pill-value">{opt.lbl}</span>
                  <span className="time-pill-label font-mono">{opt.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Rondas (Tarjetas) y Capacidad */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div className="form-field">
              <label className="form-label-institutional">
                <Layers size={13} />
                <span>Tarjetas por mesa (Rondas):</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={handSize}
                  onChange={e => setHandSize(parseInt(e.target.value || '6', 10))}
                  className="terminal-input font-mono"
                  style={{ width: '100%', padding: '10px 12px', fontSize: '14px', fontWeight: 700 }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '11px', fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                  {handSize} rondas
                </span>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label-institutional">
                <Users size={13} />
                <span>Capacidad máxima de mesas:</span>
              </label>
              <input
                type="number"
                min="2"
                max="50"
                placeholder="Ilimitado (Salas 30+)"
                value={maxTeams}
                onChange={e => setMaxTeams(e.target.value)}
                className="terminal-input font-mono"
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* 3. Selección de Emisores Bursátiles con Plantillas de Bolivia */}
          <div className="form-field" style={{ marginBottom: '20px' }}>
            <label className="form-label-institutional" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={13} />
                <span>Emisores y Tickers Bursátiles (5 Activos Cotizados):</span>
              </span>
              <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--ink-muted)' }}>
                Base: Bs 100 · 260 Acciones
              </span>
            </label>

            {/* Selector de Plantillas Rápidas */}
            <div className="preset-selector-bar">
              <button
                type="button"
                className={`preset-tab-btn ${activePreset === 'bbv' ? 'active' : ''}`}
                onClick={() => applyPreset('bbv')}
              >
                <Sparkles size={12} />
                <span>Oficial BBV</span>
              </button>
              <button
                type="button"
                className={`preset-tab-btn ${activePreset === 'banking' ? 'active' : ''}`}
                onClick={() => applyPreset('banking')}
              >
                <span>Banca & Finanzas</span>
              </button>
              <button
                type="button"
                className={`preset-tab-btn ${activePreset === 'industry' ? 'active' : ''}`}
                onClick={() => applyPreset('industry')}
              >
                <span>Industria & Energía</span>
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
                    placeholder="Razón Social del Emisor"
                    className="company-name-input"
                  />
                  <input
                    type="text"
                    value={c.ticker}
                    onChange={e => updateCompanyTicker(idx, e.target.value)}
                    placeholder="TICK"
                    maxLength={4}
                    className="company-ticker-pill"
                    title="Ticker nemotécnico (hasta 4 letras)"
                  />
                  <span className="company-price-tag font-mono">
                    Bs {c.price || 100}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Tarjetas Tácticas Autorizadas con Impacto Visual */}
          <div className="form-field" style={{ marginBottom: '22px' }}>
            <label className="form-label-institutional" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={13} />
                <span>Tarjetas Reglamentarias Habilitadas:</span>
              </span>
              <span className="font-mono text-ifi" style={{ fontSize: '11px', fontWeight: 600 }}>
                {selectedCards.length} de {CARD_TYPES.length} activas
              </span>
            </label>

            <div className="card-tiles-grid">
              {CARD_TYPES.map(card => {
                const isSelected = selectedCards.includes(card.id);
                const Icon = card.icon;

                return (
                  <div
                    key={card.id}
                    className={`card-tile-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleCard(card.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // controlado por el contenedor
                      className="card-tile-checkbox"
                    />
                    <div className="card-tile-content">
                      <div className="card-tile-header">
                        <span className="card-tile-code">{card.label}</span>
                        <span className="card-tile-title">{card.title}</span>
                      </div>
                      <p className="card-tile-desc">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botones de Envío */}
          <button
            type="submit"
            className="btn-primary-action"
            style={{ width: '100%', padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={isSubmitting}
          >
            <Play size={16} />
            <span>{isSubmitting ? 'Aperturando sesión...' : 'Aperturar Sala Bursátil (Generar PIN)'}</span>
          </button>

          <button
            type="button"
            className="btn-control"
            style={{ width: '100%', marginTop: '8px', padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={onBack}
          >
            <ArrowLeft size={14} />
            <span>Volver a Selección de Rol</span>
          </button>
        </form>

        {/* Sello de Auditoría */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--line)', color: 'var(--ink-muted)', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
          <ShieldCheck size={13} className="text-ifi" />
          <span>PARÁMETROS REGULADOS POR EL COMITÉ TÉCNICO · OLIMPIADAS IFI 2026</span>
        </div>
      </div>
    </div>
  );
}
