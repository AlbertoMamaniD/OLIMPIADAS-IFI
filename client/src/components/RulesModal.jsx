import React from 'react';
import { BookOpen, X } from 'lucide-react';

export function RulesModal({ onClose }) {
  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div
        className="terminal-modal-window rules-modal-window"
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-icon">
            <BookOpen size={22} />
          </div>
          <div className="modal-head-text">
            <span className="modal-eyebrow">Guía del juego · BBV</span>
            <h2 className="modal-title">Reglamento oficial</h2>
          </div>
          <button className="btn-modal-close" onClick={onClose} title="Cerrar" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="rules-body">
          <section className="rules-section">
            <span className="rules-section-num">1</span>
            <div className="rules-section-content">
              <h4>Condiciones iniciales y objetivo</h4>
              <p>
                Cada equipo empieza con <strong>Bs 1.000</strong> en efectivo y sin acciones. En el mercado hay 5 empresas, cada una a <strong>Bs 100</strong> por acción y con 260 acciones en manos del broker. Gana el equipo que termine con el <strong>mayor patrimonio</strong> al final de la partida.
              </p>
            </div>
          </section>

          <section className="rules-section">
            <span className="rules-section-num">2</span>
            <div className="rules-section-content">
              <h4>Tu turno, paso a paso</h4>
              <ul className="rules-steps">
                <li>
                  <span className="rules-step-tag rules-step-tag--opt">Opcional</span>
                  <span><strong>Operar antes:</strong> compra o vende acciones de cualquier empresa que tenga acciones disponibles.</span>
                </li>
                <li>
                  <span className="rules-step-tag rules-step-tag--req">Obligatorio</span>
                  <span><strong>Jugar una tarjeta:</strong> cambia los precios del mercado o abre una subasta.</span>
                </li>
                <li>
                  <span className="rules-step-tag rules-step-tag--opt">Opcional</span>
                  <span><strong>Operar después:</strong> vuelve a comprar o vender, pero no la misma empresa que operaste antes.</span>
                </li>
                <li>
                  <span className="rules-step-tag rules-step-tag--end">Cierre</span>
                  <span><strong>Terminar turno:</strong> el turno pasa al siguiente equipo. Si se acaba el tiempo, el sistema descarta una de tus tarjetas al azar.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="rules-section">
            <span className="rules-section-num">3</span>
            <div className="rules-section-content">
              <h4>Techo y piso de precios</h4>
              <div className="rules-band">
                <div className="rules-band-tile rules-band-tile--up">
                  <span className="rules-band-title">
                    Techo · <span className="font-mono">Bs 250</span>
                  </span>
                  Lo que pase de Bs 250 se paga como <strong>dividendo en efectivo</strong> a quienes tengan acciones de esa empresa, y el precio vuelve a Bs 250.
                </div>
                <div className="rules-band-tile rules-band-tile--down">
                  <span className="rules-band-title">
                    Piso · <span className="font-mono">Bs 10</span>
                  </span>
                  Se pausa el reloj y empieza la <strong>crisis</strong>: cada accionista paga Bs 20 por acción para conservarla o la devuelve gratis al broker.
                </div>
              </div>
            </div>
          </section>

          <section className="rules-section">
            <span className="rules-section-num">4</span>
            <div className="rules-section-content">
              <h4>Tarjetas de mercado</h4>
              <div className="rules-cards-grid">
                <div className="rules-card-item">
                  <span className="rules-card-chip">100 / 10</span>
                  <span>+100 a la empresa objetivo y −10 a las otras cuatro.</span>
                </div>
                <div className="rules-card-item">
                  <span className="rules-card-chip">20 / 50</span>
                  <span>−50 a la empresa objetivo y +20 a las otras cuatro.</span>
                </div>
                <div className="rules-card-item">
                  <span className="rules-card-chip">80 / 40</span>
                  <span>+80 a la empresa objetivo y −40 a otra empresa que tú eliges.</span>
                </div>
                <div className="rules-card-item">
                  <span className="rules-card-chip">2x</span>
                  <span>Duplica el precio de la objetivo y reduce a la mitad otra que eliges.</span>
                </div>
                <div className="rules-card-item">
                  <span className="rules-card-chip">1/2x</span>
                  <span>Reduce a la mitad la objetivo y duplica otra que eliges.</span>
                </div>
                <div className="rules-card-item">
                  <span className="rules-card-chip">Subasta</span>
                  <span>Abre una subasta obligatoria de 30 acciones de esa empresa.</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rules-section">
            <span className="rules-section-num">5</span>
            <div className="rules-section-content">
              <h4>Cómo funciona la subasta</h4>
              <p>
                Cada accionista aporta obligatoriamente hasta 5 acciones (pagadas al precio base) y el broker completa el lote de 30. Durante <strong>30 segundos</strong> se puja por el lote completo, subiendo de <strong>Bs 10 en Bs 10</strong>. Mientras tanto puedes vender otras acciones para conseguir efectivo. Gana la mejor oferta que se pueda pagar.
              </p>
            </div>
          </section>

          <section className="rules-section">
            <span className="rules-section-num">6</span>
            <div className="rules-section-content">
              <h4>Final de la partida</h4>
              <p>
                En el último turno <strong>solo se puede vender</strong>. Cuando ningún equipo tiene tarjetas, las acciones que queden se venden al precio final del mercado y se anuncia la clasificación.
              </p>
            </div>
          </section>
        </div>

        <div className="rules-footer">
          <button className="btn-primary-action" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
