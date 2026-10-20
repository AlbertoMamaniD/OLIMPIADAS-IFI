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
        className="terminal-modal-window"
        style={{ maxWidth: '440px', padding: '24px 28px', textAlign: 'left' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'var(--ifi-subtle)',
                color: 'var(--ifi-secondary)',
                border: '1px solid var(--ifi-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Edit3 size={18} />
            </div>
            <div>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                CONFIGURACIÓN DE TERMINAL
              </span>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '17px', fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--ink)' }}>
                Modificar Nombre de Mesa
              </h3>
            </div>
          </div>
          <button
            type="button"
            className="btn-control"
            onClick={onClose}
            style={{ padding: '4px', border: 'none', background: 'transparent', color: 'var(--ink-secondary)', cursor: 'pointer' }}
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 12px',
              background: 'var(--down-subtle)',
              border: '1px solid var(--down-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--down)',
              fontSize: '12px',
              marginBottom: '14px',
            }}
          >
            <AlertCircle size={14} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="team-new-name"
              style={{
                display: 'block',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: 'var(--ink-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
              }}
            >
              Nuevo nombre de la mesa / equipo:
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
              style={{ width: '100%', fontSize: '14px', padding: '10px 12px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
              {name.length}/25 caracteres
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn-control"
              style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: 500 }}
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-primary-action"
              style={{ padding: '8px 18px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
              disabled={submitting || !name.trim()}
            >
              <Check size={14} />
              <span>{submitting ? 'Guardando...' : 'Guardar Cambio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
