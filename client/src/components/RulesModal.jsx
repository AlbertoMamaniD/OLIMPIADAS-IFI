import React from 'react';

export function RulesModal({ onClose }) {
  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div
        className="terminal-modal-window"
        style={{ maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              BOLSA BOLIVIANA DE VALORES (BBV)
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, margin: '2px 0 0 0' }}>
              Reglamento Oficial de Operaciones
            </h2>
          </div>
          <button className="btn-control" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div style={{ fontSize: '12.5px', lineHeight: 1.6, color: 'var(--ink-secondary)' }}>
          <div style={{ marginBottom: '14px' }}>
            <h4 style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontSize: '14.5px', marginBottom: '3px' }}>
              1. Condiciones Iniciales y Objetivo
            </h4>
            <p>
              Cada equipo inicia con un capital de <strong>Bs 1.000</strong> y 0 acciones. El mercado dispone de 5 emisores con un precio base de <strong>Bs 100</strong> por acción y 260 acciones en custodia del broker. El objetivo es maximizar el valor patrimonial neto liquidado al término de la ronda.
            </p>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <h4 style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontSize: '14.5px', marginBottom: '3px' }}>
              2. Fases del Turno Operativo
            </h4>
            <p>El turno de cada equipo se divide en cuatro fases secuenciales:</p>
            <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
              <li><strong>Operación previa (opcional):</strong> Compra o venta de acciones de cualquier emisor con liquidez.</li>
              <li><strong>Ejecución de tarjeta (obligatoria):</strong> Altera los precios de mercado o convoca a subasta.</li>
              <li><strong>Operación posterior (opcional):</strong> Compra o venta, con exclusión del emisor negociado en la operación previa.</li>
              <li><strong>Cierre de turno:</strong> Vence y transfiere la custodia al siguiente equipo. Si expira el plazo, el sistema descarta una tarjeta al azar.</li>
            </ul>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <h4 style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontSize: '14.5px', marginBottom: '3px' }}>
              3. Banda de Precios: Techo y Piso
            </h4>
            <p>
              <strong>Techo (Bs 250):</strong> Todo excedente sobre los Bs 250 se liquida automáticamente como <strong>dividendo en efectivo</strong> a prorrata entre los accionistas vigentes, reajustando la cotización a Bs 250.
            </p>
            <p style={{ marginTop: '4px' }}>
              <strong>Piso (Bs 10):</strong> Al tocar el piso se suspende el reloj e inicia la crisis: cada titular debe optar por pagar una tasa de rescate de Bs 20/acción para conservarla o devolverla sin costo al broker.
            </p>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <h4 style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontSize: '14.5px', marginBottom: '3px' }}>
              4. Tarjetas de Mercado
            </h4>
            <ul style={{ paddingLeft: '18px' }}>
              <li><strong>100 / 10:</strong> +100 a la empresa objetivo; -10 a las cuatro restantes.</li>
              <li><strong>20 / 50:</strong> -50 a la empresa objetivo; +20 a las cuatro restantes.</li>
              <li><strong>80 / 40:</strong> +80 a la empresa objetivo; -40 a una contraparte seleccionada.</li>
              <li><strong>2x:</strong> Duplica el precio objetivo; reduce a la mitad la contraparte.</li>
              <li><strong>1/2x:</strong> Reduce a la mitad el precio objetivo; duplica la contraparte.</li>
              <li><strong>Subasta:</strong> Activa una subasta forzosa de 30 acciones de ese emisor.</li>
            </ul>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <h4 style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontSize: '14.5px', marginBottom: '3px' }}>
              5. Mecanismo de Subasta Extraordinaria
            </h4>
            <p>
              Los accionistas aportan obligatoriamente hasta 5 acciones (liquidadas al precio base) y el broker completa el lote de 30. Durante 30 segundos rige una puja abierta (incrementos de Bs 10). Los participantes pueden vender otras acciones para generar liquidez inmediata. El lote se adjudica a la mejor oferta solvente.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontSize: '14.5px', marginBottom: '3px' }}>
              6. Cierre y Liquidación Final
            </h4>
            <p>
              En el último turno de la partida <strong>únicamente se autorizan órdenes de venta</strong>. Al agotarse las tarjetas en todos los equipos, las acciones restantes se liquidan al precio de mercado vigente y se proclama la clasificación final.
            </p>
          </div>
        </div>

        <button className="btn-primary-action" style={{ width: '100%', marginTop: '18px' }} onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
}
