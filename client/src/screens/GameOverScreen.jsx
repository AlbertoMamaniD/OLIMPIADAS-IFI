import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw } from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';

export function GameOverScreen({ onPlayAgain }) {
  const { game, myTeam } = useGameSocket();

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignorar si no está disponible
    }
  }, []);

  if (!game) return null;

  const ranking = [...game.teams].sort((a, b) => b.cash - a.cash);
  const winner = ranking[0];
  const myRank = myTeam ? ranking.findIndex(t => t.id === myTeam.id) + 1 : null;

  return (
    <div className="terminal-centered">
      <div className="terminal-panel" style={{ maxWidth: '620px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <div
            style={{
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              padding: '14px',
              borderRadius: '50%',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trophy size={36} />
          </div>
        </div>

        <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ifi-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          ACTA DE LIQUIDACIÓN Y CIERRE BURSÁTIL
        </span>
        <h1 className="terminal-heading" style={{ fontSize: '26px', margin: '4px 0 6px 0' }}>
          Primer Lugar: {winner.name}
        </h1>
        <p className="terminal-subheading" style={{ marginBottom: '20px' }}>
          Patrimonio neto liquidado al cierre:{' '}
          <strong className="val-num" style={{ color: 'var(--ifi-primary)', fontSize: '16px' }}>
            Bs {winner.cash.toLocaleString()}
          </strong>.
          {myRank && (
            <span style={{ display: 'block', marginTop: '6px', fontSize: '12.5px' }}>
              Su equipo ({myTeam.name}) concluyó en la posición <strong>{myRank}.º</strong> de {ranking.length} mesas participantes.
            </span>
          )}
        </p>

        {/* Clasificación Final */}
        <div style={{ textAlign: 'left', margin: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid var(--line)', paddingBottom: '4px' }}>
            <Award size={13} color="var(--accent)" />
            <span>CUADRO DE RENDIMIENTO FINAL (ACCIONES LIQUIDADAS):</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ranking.map((team, idx) => (
              <div
                key={team.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: idx === 0 ? 'var(--ifi-subtle)' : 'var(--surface-subtle)',
                  border: idx === 0 ? '1px solid var(--ifi-secondary)' : '1px solid var(--line)',
                  borderRadius: 'var(--border-radius-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, width: '36px', color: idx === 0 ? 'var(--ifi-secondary)' : 'var(--ink-secondary)' }}>
                    {idx + 1}.º
                  </span>
                  <div>
                    <strong style={{ fontSize: '13.5px', color: 'var(--ink)' }}>
                      {team.name}
                    </strong>
                    {team.id === myTeam?.id && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          background: 'var(--ink)',
                          color: 'var(--bg)',
                          padding: '1px 5px',
                          borderRadius: '2px',
                          marginLeft: '8px',
                          fontWeight: 700,
                        }}
                      >
                        SU EQUIPO
                      </span>
                    )}
                    {team.eliminated && (
                      <span style={{ color: 'var(--down)', fontSize: '10.5px', marginLeft: '6px', fontFamily: 'var(--font-mono)' }}>
                        [LIQUIDADO]
                      </span>
                    )}
                  </div>
                </div>

                <div className="val-num" style={{ fontSize: '15px', fontWeight: 700 }}>
                  Bs {team.cash.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary-action" style={{ width: '100%' }} onClick={onPlayAgain}>
          <RotateCcw size={15} />
          <span>Retornar al Menú Principal</span>
        </button>
      </div>
    </div>
  );
}
