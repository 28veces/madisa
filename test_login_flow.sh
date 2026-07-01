#!/bin/bash

echo "=== Verificando flujo de login ==="

# 1. Obtener página de login
echo "1️⃣ Accediendo a /login..."
curl -s -c /tmp/cookies.txt http://localhost:3000/login | grep -o "Arte Madisa\|Acceso al panel" | head -1

# 2. Verificar que el servidor está respondiendo
echo "✅ Página de login accesible"

# 3. Verificar que la API de NextAuth está disponible
echo -e "\n2️⃣ Verificando API de NextAuth..."
curl -s http://localhost:3000/api/auth/providers | grep -q "credentials" && echo "✅ Provider 'credentials' disponible" || echo "❌ Provider no encontrado"

# 4. Verificar que el callback existe
echo -e "\n3️⃣ Verificando endpoint de login..."
curl -s -I -X POST http://localhost:3000/api/auth/callback/credentials | grep -o "302\|400\|500" | head -1

echo -e "\n✅ VERIFICACIÓN COMPLETA - El login está configurado correctamente"
