# 📈 IFI Trader League — Juego de la Bolsa (BBV)
### Simulación Bursátil Multijugador en Tiempo Real estilo Kahoot!

Sistema desarrollado para competencias presenciales y virtuales de finanzas (Ingeniería Financiera, UCB Tarija). Permite que **30 a 50 estudiantes** compitan simultáneamente operando acciones, jugando tarjetas de mercado y participando en subastas con un **reloj centralizado autoritativo** administrado por el Broker.

---

## 🏗️ Arquitectura por Carpetas

```text
pruebas/
├── server/                     # BACKEND: Node.js + Express + Socket.io
│   ├── src/
│   │   ├── config/             # Puertos, CORS y caracteres de códigos PIN
│   │   ├── engine/             # MOTOR DE REGLAS PURO (Determinista y testeado)
│   │   │   ├── constants.js    # Precios (piso 10, techo 250), lotes, tiempos
│   │   │   ├── cards.js        # Definición de tarjetas (100/10, 20/50, 80/40, 2x, etc.)
│   │   │   └── rulesEngine.js  # Lógica: compras, ventas, crisis, dividendos, subastas
│   │   ├── managers/           # GESTOR CENTRAL DE SALAS Y RELOJ
│   │   │   └── roomManager.js  # Temporizadores autoritativos y estado en memoria RAM
│   │   ├── socket/             # EVENTOS WEBSOCKET MODULARES
│   │   │   ├── roomHandlers.js # Crear sala, unirse con PIN, lista en vivo
│   │   │   ├── gameHandlers.js # Comprar/vender, jugar tarjeta, terminar turno
│   │   │   ├── auctionHandlers.js # Pujas de subasta y venta para liquidez
│   │   │   └── brokerHandlers.js  # Pausar, reanudar, saltar turno
│   │   └── index.js            # Servidor HTTP + WebSocket + Hosting de cliente
│   └── test/
│       └── engine.test.js      # Pruebas automatizadas de reglas BBV (13/13 pasadas)
│
├── client/                     # FRONTEND: React 18 + Vite (Aestética Wall Street / BBV)
│   ├── src/
│   │   ├── components/         # COMPONENTES REUTILIZABLES
│   │   │   ├── Topbar.jsx      # Barra de estado, PIN, equipo, modo oscuro/claro
│   │   │   ├── TimerBadge.jsx  # Reloj sincronizado con alertas (verde/amarillo/rojo)
│   │   │   ├── MarketBoard.jsx # Cotizaciones en vivo con ▲/▼ y dividendos
│   │   │   ├── CardDeck.jsx    # Mano de tarjetas interactivas del equipo
│   │   │   ├── Portfolio.jsx   # Efectivo, acciones y patrimonio total
│   │   │   ├── EventLog.jsx    # "Qué está pasando" en vivo
│   │   │   ├── PriceChart.jsx  # Gráfica SVG de evolución de precios
│   │   │   ├── AuctionBanner.jsx# Subasta de 30s con pujas en vivo
│   │   │   ├── TradeModal.jsx  # Modal de compra/venta de acciones
│   │   │   ├── CardTargetModal.jsx # Modal para elegir la otra empresa afectada
│   │   │   ├── CrisisModal.jsx # Modal obligatorio de piso (conservar Bs 20 o devolver)
│   │   │   └── RulesModal.jsx  # Manual completo de reglas oficiales
│   │   ├── context/
│   │   │   └── SocketContext.jsx# Conexión WebSocket y sincronización global
│   │   ├── screens/            # PANTALLAS SEGÚN ROL Y ESTADO
│   │   │   ├── RoleSelectScreen.jsx # Elección Broker vs Estudiante
│   │   │   ├── BrokerSetupScreen.jsx# Duración de turnos, auspicios, tarjetas
│   │   │   ├── BrokerLobbyScreen.jsx# PIN gigante tipo Kahoot y lista de alumnos
│   │   │   ├── BrokerLiveDashboard.jsx # Tablero maestro para proyector / moderador
│   │   │   ├── TeamJoinScreen.jsx   # Ingreso de PIN y nombre de equipo
│   │   │   ├── TeamLobbyScreen.jsx  # Sala de espera del alumno
│   │   │   ├── TeamGameScreen.jsx   # Tablero de operaciones del equipo
│   │   │   └── GameOverScreen.jsx   # Podio final con medallas y confeti
│   │   └── styles/
│   │       └── index.css       # Tokens de diseño, modo oscuro y tipografías
│   ├── package.json
│   └── vite.config.js
│
└── package.json                # Scripts unificados de ejecución
```

---

## 🚀 Cómo Ejecutarlo

### Opción 1: Servidor todo-en-uno (Listo para el aula)
```bash
npm start
```
Abre tu navegador en:
👉 **`http://localhost:4000`**

### Opción 2: Modo desarrollo con recarga en vivo (Hot Reload)
En dos terminales separadas:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend React (Vite en puerto 3000)
npm run client
```

### Opción 3: Correr los tests del motor
```bash
npm test
```

---

## 📱 Uso en el Aula con Estudiantes (Aulas C05 / C25 Tarija)

1. **Laptop del Broker (Proyector):**
   - Inicia el servidor con `npm start`.
   - Abre `http://localhost:4000` y elige **"Soy el Broker / Organizador"**.
   - Configura la duración del turno (ej. 60 seg) y haz clic en **"Crear Sala y Abrir Lobby"**.
   - Proyecta en la pantalla grande el **PIN de 5 letras** (ej. `TTVNU`).

2. **Celulares / Laptops de los Estudiantes:**
   - Si están en la misma red Wi-Fi del aula, ingresan a la IP del broker: `http://[IP-DE-TU-LAPTOP]:4000` (o a la URL de Render/Railway si lo subes a la nube).
   - Eligen **"Soy un Equipo / Estudiante"**.
   - Ingresan el PIN y el nombre de su equipo.
   - ¡Aparecerán instantáneamente en la pantalla del proyector!

3. **Inicio de Partida:**
   - Cuando todos los equipos estén conectados, el Broker presiona **"¡Comenzar Partida!"**.
   - El servidor coordina los turnos, las subastas y el reloj automáticamente para todos los dispositivos en milisegundos.
