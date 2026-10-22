import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, Medal } from 'lucide-react';
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

  // Solo presentación: orden visual del podio (2.º, 1.º, 3.º)
  const podium = [ranking[1], ranking[0], ranking[2]]
    .map((team, i) => (team ? { team, place: [2, 1, 3][i] } : null))
    .filter(Boolean);

  return (
    <div className="gameover-screen">
      {/* Encabezado de premiación */}
      <section className="gameover-hero">
        <div className="gameover-hero-inner">
          <span className="gameover-eyebrow">
            <Award size={15} />
            Cierre oficial de la rueda bursátil
          </span>

          <div className="gameover-trophy">
            <Trophy size={40} />
          </div>

          <h1 className="gameover-title">
            <span className="gameover-title-label">Campeón</span>
            <span className="gameover-winner">{winner.name}</span>
          </h1>

          <p className="gameover-amount">
            Patrimonio final{' '}
            <strong className="val-num">Bs {winner.cash.toLocaleString()}</strong>
          </p>

          {/* Podio */}
          <div className={`podium podium-count-${podium.length}`}>
            {podium.map(({ team, place }) => (
              <div key={team.id} className={`podium-col podium-place-${place}`}>
                <div className="podium-medal">
                  <Medal size={22} />
                </div>
                <div className="podium-name" title={team.name}>
                  {team.name}
                </div>
                <div className="podium-cash val-num">Bs {team.cash.toLocaleString()}</div>
                <div className="podium-block">
                  <span className="font-mono">{place}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gameover-body">
        {myRank && (
          <div className={`gameover-myrank ${myRank <= 3 ? 'is-podium' : ''}`}>
            <span className="gameover-myrank-pos font-mono">{myRank}.º</span>
            <span>
              Tu equipo <strong>{myTeam.name}</strong> terminó en la posición{' '}
              <strong>{myRank}.º</strong> de {ranking.length} equipos.
            </span>
          </div>
        )}

        {/* Clasificación Final */}
        <div className="terminal-card gameover-table">
          <div className="terminal-card-header">
            <div className="header-icon-label">
              <Award size={18} className="gameover-award-icon" />
              <span className="card-title-strong">Clasificación final</span>
            </div>
            <span className="ui-badge">Acciones liquidadas al precio final</span>
          </div>

          <ol className="gameover-rank-list">
            {ranking.map((team, idx) => (
              <li
                key={team.id}
                className={`gameover-rank-row ${idx < 3 ? `rank-top rank-${idx + 1}` : ''} ${
                  team.id === myTeam?.id ? 'is-mine' : ''
                }`}
              >
                <span className="gameover-rank-pos font-mono">{idx + 1}</span>
                <div className="gameover-rank-team">
                  <strong>{team.name}</strong>
                  {team.id === myTeam?.id && <span className="ui-badge ui-badge--solid">Tu equipo</span>}
                  {team.eliminated && <span className="ui-badge ui-badge--down">Liquidado</span>}
                </div>
                <div className="gameover-rank-cash val-num">Bs {team.cash.toLocaleString()}</div>
              </li>
            ))}
          </ol>
        </div>

        <button className="btn-primary-action gameover-cta" onClick={onPlayAgain}>
          <RotateCcw size={17} />
          <span>Volver al menú principal</span>
        </button>
      </section>
    </div>
  );
}
