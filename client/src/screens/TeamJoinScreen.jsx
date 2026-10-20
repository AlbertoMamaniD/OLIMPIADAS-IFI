import React, { useState } from 'react';
import { KeyRound, Users, LogIn, ArrowLeft } from 'lucide-react';
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
    <div className="terminal-centered">
      <div className="terminal-panel">
        <h2 className="terminal-heading">Ingreso a la Rueda Bursátil</h2>
        <p className="terminal-subheading">
          Ingrese el código PIN proporcionado por la mesa de control y el nombre de su equipo:
        </p>

        {error && <div className="terminal-alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label-institutional">
              <KeyRound size={13} color="var(--ifi-secondary)" />
              <span>Código de Sala (PIN de 5 letras):</span>
            </label>
            <input
              type="text"
              maxLength="6"
              placeholder="Ej: K9X2J"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              className="form-input-institutional"
              style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '22px', fontWeight: 700 }}
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="form-label-institutional">
              <Users size={13} color="var(--ifi-secondary)" />
              <span>Nombre o Denominación del Equipo:</span>
            </label>
            <input
              type="text"
              maxLength="30"
              placeholder="Ej: Mesa Inversionista 1"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              className="form-input-institutional"
            />
          </div>

          <button type="submit" className="btn-primary-action" style={{ width: '100%' }} disabled={loading}>
            <LogIn size={15} />
            <span>{loading ? 'Validando credenciales...' : 'Ingresar a la Sala'}</span>
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
