# Juego de la Bolsa — Documento de traspaso

Proyecto de Jaime Salinas (Ingeniería Financiera, UCB Tarija). Simulación multijugador por turnos de inversión en renta variable, basada en el "Juego de la Bolsa" de la Bolsa Boliviana de Valores (BBV).

## Contenido del paquete
- `juego-bolsa.html` — el juego completo en un solo archivo (CSS + JS embebido). Es la versión más reciente, con los 4 bugs corregidos.
- `pruebas/` — script que extrae el motor de reglas y lo prueba (subasta sin fondos, último turno). Uso: `sh pruebas/correr-pruebas.sh juego-bolsa.html` (requiere node y python3).
- `CONTEXTO_JUEGO_BOLSA.md` — este documento.

## Cómo retomarlo en la cuenta Pro
1. Abre un chat nuevo (idealmente dentro de un Project llamado "Juego de la Bolsa") y adjunta `juego-bolsa.html` y este documento.
2. Pega el prompt de arranque (al final de este documento).
3. Pide que lo publique como artifact. Desde la cuenta Pro puedes compartir el enlace desde el menú "Compartir" de la página.
4. **Verifica el almacenamiento compartido antes de usarlo en clase.** El juego guarda la sala y la partida con `window.storage` en modo compartido (`shared = true`), que sincroniza a los equipos por sondeo cada 1,5 s. Eso funciona dentro del entorno de artifacts de Claude; hay que comprobar con 2–3 dispositivos reales, con la cuenta Pro, que todos ven la misma sala. Si los estudiantes no pueden abrir el artifact sin cuenta de Claude, se necesita el backend propio descrito en "Pendientes".

## Reglas del juego (implementadas)
- Equipos de hasta 3 jugadores, un dispositivo por equipo (entra el vocero con el código de sala). Capital inicial Bs 1.000. 5 empresas ("Empresa 1"–"Empresa 5", precio inicial 100, editables para auspicios). Máximo 260 acciones por empresa; "Acc. Broker" es el inventario del broker.
- Precio: piso 10, techo 250. Si supera el techo, el excedente se paga como dividendo por acción poseída y el precio vuelve a 250. Si toca el piso hay crisis: cada accionista decide conservar sus acciones pagando Bs 20/acción o devolverlas al broker; el reloj se pausa hasta resolver.
- Turno: duración elegida por el broker (30 s, 1, 1:30 o 2 min). Orden: operar antes (opcional) → jugar una tarjeta (obligatorio) → operar después (no se puede operar la misma empresa operada antes) → terminar turno. Si se acaba el tiempo sin jugar, se descarta una tarjeta al azar y el turno pasa solo.
- Tarjetas (cada una trae fija su empresa; la "otra empresa" se elige al jugarla): 100/10, 20/50, 80/40, 2x, 1/2x y Subasta. El broker elige qué tipos están disponibles y cuántas tarjetas recibe cada equipo (1–20, por defecto 6).
- Subasta: aporte obligatorio e inmediato de hasta 5 acciones por accionista; el broker completa hasta 30. Puja desde Bs 10/acción, subiendo de 10 en 10, por el lote completo. Dura 30 s y se cierra sola; se adjudica a la mejor puja que aún pueda pagarse (si alguien vendió y ya no le alcanza, queda descalificado y pasa a la siguiente). Sin pujas, el lote vuelve al broker. Los aportantes se liquidan al precio vigente al iniciar. Durante la subasta cualquier equipo puede vender acciones (botón rojo "Vender" del Mercado) aunque no sea su turno. Se muestra como barra llamativa arriba, sin tapar los precios.
- Último turno: cuando al equipo en turno le queda 1 tarjeta y nadie más tiene, solo se puede vender.
- Fin: cuando todas las manos quedan vacías. Las acciones restantes se liquidan al precio final y se muestra el leaderboard con medallas (equipos y broker).
- Reconexión: si un equipo recarga la pestaña, vuelve a entrar con "Unirse" usando el mismo código y el mismo nombre de equipo.
- Panel del broker: crear sala, pausar/reanudar, saltar turno, monitorear equipos y ver el registro de eventos.

## Diseño
Fondo blanco con modo oscuro opcional, barra superior con título. Pantalla de equipo: Mercado (comprar/vender), tarjetas con descripción en lenguaje simple al tocarlas, portafolio (acciones + efectivo + total), registro "Qué está pasando" y gráfico de precios. Indicador ▲/▼ con el monto del cambio y la insignia "💰 dividendo". Guía de reglas al entrar y botón "Reglas" durante la partida.

## Arquitectura actual
- Un solo HTML. Motor de reglas puro (funciones sobre un objeto de estado serializable) + capa de UI que dibuja con innerHTML y eventos `data-action`.
- Estado en `window.storage` (claves `room:CÓDIGO` y `game:CÓDIGO`). Cada acción lee el estado, lo modifica con el motor y lo reescribe completo.
- Relojes: el turno se calcula con `turnStartedAt`; cierres automáticos con respaldo escalonado (jugador en turno → broker → otros equipos) verificando que siga siendo el mismo turno.
- Acciones bloqueadas mientras otra está en curso (`runAction`) para evitar clics dobles.

## Bugs corregidos en la última sesión
1. Botón de duración de turno invisible (variable CSS inexistente) y campos del setup que se borraban al redibujar.
2. Subasta trabada si se desconectaba quien la disparó o si el ganador ya no tenía efectivo.
3. Fin de turno dependía solo del equipo en turno; ahora hay respaldo.
4. Regla del último turno no estaba implementada.

## Pendientes y recomendaciones
- **Backend en tiempo real** (Firebase o Supabase) con transacciones: hoy dos acciones casi simultáneas pueden pisarse porque se reescribe el estado completo. Eliminaría el sondeo y permitiría que los estudiantes entren solo con un enlace y el código, sin cuenta de Claude. Hosting sugerido: Vercel.
- Que el broker sea árbitro único de los relojes (turno y subasta).
- Empresas editables para auspicios (nombres y logos).
- Probar una partida completa con 3+ dispositivos reales antes del evento.

## Contexto del evento
Se usará en una actividad de 2 días con 2 partidas, para estudiantes de promoción de colegios de Tarija; presencial, con los equipos/dispositivos provistos por la organización; aulas C05 y C25. El formulario de aprobación de la Sede Tarija (puntos 1–9) ya fue redactado.

## Prompt de arranque para el chat nuevo
> Adjunto `juego-bolsa.html` y el documento de contexto de mi proyecto "Juego de la Bolsa". Léelos completos. Quiero (1) publicarlo como artifact para compartirlo, (2) verificar que el almacenamiento compartido funciona entre varios dispositivos, y (3) migrar a un backend en tiempo real (Firebase o Supabase) para usarlo en clase. Prefiero respuestas concisas, y construir pieza por pieza.
