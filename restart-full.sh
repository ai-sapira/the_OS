#!/bin/bash

echo "🛑 Deteniendo procesos de Node.js..."
killall node 2>/dev/null || true
sleep 2

echo "🗑️  Limpiando caché de Next.js..."
rm -rf .next

echo "🗑️  Limpiando caché de node_modules..."
rm -rf node_modules/.cache

echo "🧹 Limpiando localStorage del navegador..."
echo "   👉 Por favor, abre DevTools (F12) y ejecuta:"
echo "   localStorage.clear(); location.reload()"

echo ""
echo "✅ Limpieza completa"
echo ""
echo "🚀 Iniciando servidor..."
echo "   Esperando a que compile completamente..."
echo ""

npm run dev

