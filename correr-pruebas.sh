#!/bin/sh
# Uso: sh correr-pruebas.sh ../juego-bolsa.html
set -e
T=$(mktemp -d)
python3 -I "$(dirname "$0")/extract.py" "$1" "$T/full.js" "$T/engine.js"
node --check "$T/full.js" && echo "SINTAXIS OK"
node "$(dirname "$0")/test-motor.js" "$T/engine.js"
