#!/bin/bash

# 🎯 Setup Script para Demo Gonvarri
# Este script configura automáticamente la base de datos y los datos para la demo

set -e  # Exit on error

echo "🚀 Iniciando setup de demo Gonvarri..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local no encontrado${NC}"
    echo ""
    echo "Crea un archivo .env.local con:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=tu_url"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key"
    echo "  SUPABASE_SERVICE_ROLE_KEY=tu_service_key"
    exit 1
fi

echo -e "${BLUE}📋 Verificando dependencias...${NC}"

# Check if tsx is installed
if ! command -v tsx &> /dev/null; then
    echo -e "${YELLOW}⚠️  tsx no encontrado. Instalando...${NC}"
    npm install -g tsx
    echo -e "${GREEN}✅ tsx instalado${NC}"
else
    echo -e "${GREEN}✅ tsx ya está instalado${NC}"
fi

echo ""
echo -e "${BLUE}🗄️  Paso 1: Aplicar migración SQL${NC}"
echo ""
echo "⚠️  INSTRUCCIONES MANUALES:"
echo "1. Abre Supabase Dashboard → SQL Editor"
echo "2. Copia el contenido de: supabase/migrations/add_gonvarri_fields_to_issues.sql"
echo "3. Ejecuta el SQL"
echo ""
read -p "¿Has aplicado la migración? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Setup cancelado. Por favor, aplica la migración primero.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Migración confirmada${NC}"
echo ""

echo -e "${BLUE}📥 Paso 2: Importar datos de Gonvarri${NC}"
echo ""
echo "Esto creará 36 issues desde el CSV..."
echo ""

# Run import script
npx tsx scripts/import-gonvarri-initiatives.ts

echo ""
echo -e "${GREEN}✅ Importación completada${NC}"
echo ""

echo -e "${BLUE}🔍 Paso 3: Verificación${NC}"
echo ""
echo "Verificando que todo está correcto..."
echo ""

# Check if examples file was created
if [ -f "sapira-teams-bot/bot/gonvarri-examples.json" ]; then
    echo -e "${GREEN}✅ Ejemplos del bot creados${NC}"
else
    echo -e "${YELLOW}⚠️  Archivo de ejemplos no encontrado${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 Setup completado con éxito!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Inicia el servidor de desarrollo:"
echo "   ${BLUE}npm run dev${NC}"
echo ""
echo "2. Abre la página de Triage:"
echo "   ${BLUE}http://localhost:3000/triage-new${NC}"
echo ""
echo "3. Deberías ver 36 issues de Gonvarri"
echo ""
echo "4. Prueba seleccionando:"
echo "   - ${YELLOW}GON-6: Agile Pricing${NC} (P1)"
echo "   - ${YELLOW}GON-50: FraudFinder AI${NC} (P0)"
echo ""
echo "📚 Documentación completa:"
echo "   - ${BLUE}GONVARRI_DEMO_SETUP.md${NC} - Guía de setup"
echo "   - ${BLUE}GONVARRI_CHANGES_SUMMARY.md${NC} - Resumen de cambios"
echo ""
echo "═══════════════════════════════════════════════════════"
