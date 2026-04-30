#!/bin/bash

# Script para configurar Firefox con una página de inicio local personalizada

set -e

# Colores para salida amigable
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Configuración de página de inicio personalizada para Firefox ===${NC}"

# 1. Validar que sea Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}Error: Este script solo está diseñado para sistemas Linux.${NC}"
    exit 1
fi

# 2. Obtener ruta del proyecto
PROJECT_DIR="$(pwd)"
INDEX_FILE="${PROJECT_DIR}/index.html"

if [[ ! -f "$INDEX_FILE" ]]; then
    echo -e "${RED}Error: No se encontró 'index.html' en el directorio actual: ${PROJECT_DIR}${NC}"
    exit 1
fi

echo -e "Ruta detectada: ${GREEN}${INDEX_FILE}${NC}"

# 3. Localizar instalación de Firefox
FIREFOX_PATH=$(which firefox)
if [[ -z "$FIREFOX_PATH" ]]; then
    echo -e "${RED}Error: Firefox no está instalado o no se encuentra en el PATH.${NC}"
    exit 1
fi

# El script de inicio suele ejecutar /opt/firefox/firefox o similar
# Buscamos la carpeta de instalación principal
INSTALL_DIR=$(grep -oP '(?<=exec ).*(?=/firefox)' "$FIREFOX_PATH" || echo "/opt/firefox")
if [[ ! -d "$INSTALL_DIR" ]]; then
    echo -e "${RED}No se pudo determinar el directorio de instalación automáticamente.${NC}"
    read -p "Por favor, introduce la ruta de instalación de Firefox (ej: /opt/firefox): " INSTALL_DIR
fi

if [[ ! -d "$INSTALL_DIR" ]]; then
    echo -e "${RED}Directorio de instalación no válido.${NC}"
    exit 1
fi

echo -e "Directorio de instalación detectado: ${GREEN}${INSTALL_DIR}${NC}"

# 4. Aplicar AutoConfig
echo -e "${BLUE}Aplicando configuración AutoConfig...${NC}"

sudo mkdir -p "${INSTALL_DIR}/defaults/pref/"

sudo bash -c "echo '// El archivo debe empezar con un comentario
pref(\"general.config.filename\", \"firefox.cfg\");
pref(\"general.config.obscure_value\", 0);
pref(\"general.config.sandbox_enabled\", false);' > '${INSTALL_DIR}/defaults/pref/autoconfig.js'"

sudo bash -c "echo '// El archivo debe empezar con un comentario
try {
  let { AboutNewTab } = ChromeUtils.importESModule(\"resource:///modules/AboutNewTab.sys.mjs\");
  AboutNewTab.newTabURL = \"file://${INDEX_FILE}\";

  pref(\"browser.startup.homepage\", \"file://${INDEX_FILE}\");
  pref(\"browser.startup.page\", 1);
  pref(\"browser.newtabpage.enabled\", true);
} catch (e) {
  Cu.reportError(e);
}' > '${INSTALL_DIR}/firefox.cfg'"

echo -e "${GREEN}¡Configuración aplicada con éxito!${NC}"
echo -e "Por favor, reinicia Firefox para ver los cambios."
