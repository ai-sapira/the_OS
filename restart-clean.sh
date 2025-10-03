#!/bin/bash

echo "🧹 Limpiando procesos anteriores..."
killall node 2>/dev/null || true

echo "🗑️  Eliminando caché de Next.js..."
rm -rf .next

echo "🚀 Iniciando servidor..."
npm run dev

