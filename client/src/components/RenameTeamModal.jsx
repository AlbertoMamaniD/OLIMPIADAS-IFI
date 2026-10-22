import React, { useState, useEffect } from 'react';
import { Edit3, Check, X, AlertCircle } from 'lucide-react';

export function RenameTeamModal({ isOpen, onClose, currentName, onRename }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentName || '');
      setError('');
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) {
      setError('Por favor ingrese un nombre de mesa válido');
      return;
    }
    if (clean === currentName) {
      onClose();
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onRename(clean);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al actualizar nombre');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div
        className="terminal-modal-window modal-compact-window"
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="modal-head">
          <div className="modal-icon">
            <Edit3 size={20} />
          </div>
          <div className="modal-head-text">
            <span className="modal-eyebrow">Tu equipo</span>
            <h3 className="modal-title">Cambiar nombre del equipo</h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} title="Cerrar" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="terminal-alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="rename-field">
            <label htmlFor="team-new-name" className="rename-label">
              Nuevo nombre
            </label>
            <input
              id="team-new-name"
              type="text"
              className="terminal-input"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={25}
              autoFocus
              placeholder="Ej: Mesa Inversiones 1"
            />
            <div className="rename-counter">
              {name.length}/25
            </div>
          </div>

          <div className="modal-actions-row">
            <button
              type="button"
              className="btn-secondary-action"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-primary-action"
              disabled={submitting || !name.trim()}
            >
              <Check size={16} />
              <span>{submitting ? 'Guardando...' : 'Guardar nombre'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
