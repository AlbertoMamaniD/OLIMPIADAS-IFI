import React, { useState } from 'react';
import { KeyRound, Users, LogIn, ArrowLeft, Info } from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';

export function TeamJoinScreen({ onBack, onJoined }) {
  const { joinRoom, error, setError } = useGameSocket();

  const [roomCode, setRoomCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const cleanCode = roomCode.trim().toUpperCase();
    const cleanName = teamName.trim();

    if (!cleanCode) {
      setError('Ingrese el código de acceso (PIN) de la sala.');
      return;
    }
    if (!cleanName) {
      setError('Ingrese la denominación de su equipo.');
      return;
    }

    setLoading(true);
    try {
      await joinRoom(cleanCode, cleanName);
      onJoined();
    } catch (err) {
      // error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="terminal-centered access-screen">
      <div className="terminal-panel access-panel">
        <div className="access-head">
          <div className="access-icon">
            <KeyRound size={24} />
          </div>
          <span className="ui-eyebrow">Mesa inversionista</span>
          <h2 className="terminal-heading">Ingresa a la sala</h2>
          <p className="terminal-subheading">
            Escribe el código PIN que muestra el broker en la pantalla del aula y el nombre de tu equipo.
          </p>
        </div>

        {error && <div className="terminal-alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label-institutional" htmlFor="join-room-code">
              <KeyRound size={15} className="text-ifi" />
              <span>Código de la sala</span>
            </label>
            <input
              id="join-room-code"
              type="text"
              maxLength="6"
              placeholder="K9X2J"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              className="form-input-institutional pin-input font-mono"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="form-label-institutional" htmlFor="join-team-name">
              <Users size={15} className="text-ifi" />
              <span>Nombre del equipo</span>
            </label>
            <input
              id="join-team-name"
              type="text"
              maxLength="30"
              placeholder="Ej: Los Inversionistas"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              className="form-input-institutional"
            />
          </div>

          <div className="access-actions">
            <button type="submit" className="btn-primary-action" disabled={loading}>
              <LogIn size={17} />
              <span>{loading ? 'Validando…' : 'Ingresar a la sala'}</span>
            </button>

            <button type="button" className="btn-secondary-action" onClick={onBack}>
              <ArrowLeft size={16} />
              <span>Volver</span>
            </button>
          </div>
        </form>

        <p className="access-hint">
          <Info size={14} />
          <span>El PIN tiene 5 caracteres y lo genera el broker al abrir la sala.</span>
        </p>
      </div>
    </div>
  );
}
