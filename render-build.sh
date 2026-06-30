#!/usr/bin/env bash
# Salir inmediatamente si un comando falla
set -o errexit

# Instalar dependencias de Node.js
npm install

# Instalar yt-dlp usando pip de forma local para el entorno
pip install yt-dlp
