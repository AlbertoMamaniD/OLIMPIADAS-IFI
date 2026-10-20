import React, { useState } from 'react';
import { Sliders, Clock, Layers, Users, Building2, Play, ArrowLeft } from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';

const CARD_TYPES = [
  { id: '100_10', label: '100 / 10', desc: '+100 objetivo, -10 resto' },
  { id: '20_50', label: '20 / 50', desc: '-50 objetivo, +20 resto' },
  { id: '80_40', label: '80 / 40', desc: '+80 objetivo, -40 contraparte' },
  { id: '2x', label: '2x', desc: 'Duplica objetivo, mitad contraparte' },
  { id: 'half_2x', label: '1/2x', desc: 'Mitad objetivo, duplica contraparte' },
  { id: 'auction', label: 'Subasta', desc: 'Subasta obligatoria de 30 acciones' },
];

const DEFAULT_COMPANIES = [
  { id: 'c1', name: 'Empresa 1', ticker: 'E1', color: '#4a5568', price: 100 },
  { id: 'c2', name: 'Empresa 2', ticker: 'E2', color: '#2b6cb0', price: 100 },
  { id: 'c3', name: 'Empresa 3', ticker: 'E3', color: '#975a16', price: 100 },
  { id: 'c4', name: 'Empresa 4', ticker: 'E4', color: '#805ad5', price: 100 },
  { id: 'c5', name: 'Empresa 5', ticker: 'E5', color: '#22543d', price: 100 },
];

export function BrokerSetupScreen({ onBack, onRoomCreated }) {
  const { createRoom, error, setError } = useGameSocket();

  const [turnSeconds, setTurnSeconds] = useState(120);
  const [handSize, setHandSize] = useState(6);
  const [maxTeams, setMaxTeams] = useState('');
  const [selectedCards, setSelectedCards] = useState(CARD_TYPES.map(c => c.id));
  const [companies, setCompanies] = useState(DEFAULT_COMPANIES);
  const [showCompanyEdit, setShowCompanyEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCard = id => {
    setSelectedCards(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const updateCompanyName = (index, name) => {
    setCompanies(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name };
      return copy;
    });
  };

  const updateCompanyTicker = (index, ticker) => {
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
      setError('Debe habilitar al menos un tipo de tarjeta reglamentaria.');
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
    <div className="terminal-centered">
      <div className="terminal-panel" style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ifi-secondary)', marginBottom: '4px' }}>
          <Sliders size={20} />
          <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            CONFIGURACIÓN DEL BROKER
          </span>
        </div>

        <h2 className="terminal-heading">Parámetros de la Rueda Bursátil</h2>
        <p className="terminal-subheading">Configure las variables de mercado para la sesión olímpica:</p>

        {error && <div className="terminal-alert-error">{error}</div>}

        <form onSubmit={handleCreate}>
          {/* Duración de Turno */}
          <div className="form-field">
            <label className="form-label-institutional">
              <Clock size={13} />
              <span>Tiempo por turno operativo:</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { val: 30, lbl: '30 seg' },
                { val: 60, lbl: '1 min' },
                { val: 90, lbl: '1:30 min' },
                { val: 120, lbl: '2 min' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  className="btn-control"
                  style={{
                    padding: '8px 4px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    borderColor: turnSeconds === opt.val ? 'var(--ifi-secondary)' : 'var(--line)',
                    backgroundColor: turnSeconds === opt.val ? 'var(--ifi-subtle)' : 'transparent',
                    color: turnSeconds === opt.val ? 'var(--ifi-secondary)' : 'var(--ink)',
                    fontWeight: turnSeconds === opt.val ? 700 : 400,
                  }}
                  onClick={() => setTurnSeconds(opt.val)}
                >
                  {opt.lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Tarjetas y Límite */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-field">
              <label className="form-label-institutional">
                <Layers size={13} />
                <span>Tarjetas por equipo:</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={handSize}
                onChange={e => setHandSize(parseInt(e.target.value || '6', 10))}
                className="form-input-institutional"
              />
            </div>

            <div className="form-field">
              <label className="form-label-institutional">
                <Users size={13} />
                <span>Límite de equipos (opcional):</span>
              </label>
              <input
                type="number"
                min="2"
                placeholder="Ilimitado"
                value={maxTeams}
                onChange={e => setMaxTeams(e.target.value)}
                className="form-input-institutional"
              />
            </div>
          </div>

          {/* Tarjetas autorizadas */}
          <div className="form-field">
            <label className="form-label-institutional">
              <Layers size={13} />
              <span>Tarjetas autorizadas para la sesión:</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {CARD_TYPES.map(card => (
                <label
                  key={card.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: 'var(--border-radius-sm)',
                    background: 'var(--surface-subtle)',
                    border: '1px solid var(--line)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCards.includes(card.id)}
                    onChange={() => toggleCard(card.id)}
                  />
                  <span>
                    <strong>{card.label}</strong>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Empresas emisoras */}
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              className="btn-control"
              style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '12px' }}
              onClick={() => setShowCompanyEdit(!showCompanyEdit)}
            >
              <Building2 size={14} />
              <span>{showCompanyEdit ? 'Ocultar emisores' : 'Personalizar emisores bursátiles (Auspicios)'}</span>
            </button>

            {showCompanyEdit && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {companies.map((c, idx) => (
                  <div key={c.id} style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      value={c.name}
                      onChange={e => updateCompanyName(idx, e.target.value)}
                      placeholder="Nombre del emisor"
                      className="form-input-institutional"
                      style={{ flex: 1, padding: '7px 10px', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      value={c.ticker}
                      onChange={e => updateCompanyTicker(idx, e.target.value)}
                      placeholder="TICK"
                      className="form-input-institutional"
                      style={{ width: '70px', padding: '7px 10px', fontSize: '12px', textAlign: 'center' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary-action" style={{ width: '100%' }} disabled={isSubmitting}>
            <Play size={15} />
            <span>{isSubmitting ? 'Aperturando sesión...' : 'Aperturar Sala Bursátil'}</span>
          </button>

          <button type="button" className="btn-secondary-action" style={{ width: '100%', marginTop: '8px' }} onClick={onBack}>
            <ArrowLeft size={14} />
            <span>Volver</span>
          </button>
        </form>
      </div>
    </div>
  );
}
