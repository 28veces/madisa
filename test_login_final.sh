#!/bin/bash

echo "=== Test de login (después del rebuild) ==="

# Crear archivo de cookies
COOKIES="/tmp/login_final.txt"
rm -f $COOKIES

# Paso 1: Acceder a /login
echo "1. Accediendo a /login..."
curl -s -c $COOKIES http://localhost:3000/login | grep -o "Arte Madisa" >/dev/null && echo "   ✅ Página accesible"

# Paso 2: Obtener CSRF token
echo "2. Obteniendo CSRF token..."
CSRF=$(curl -s -b $COOKIES http://localhost:3000/api/auth/csrf | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)
[ -n "$CSRF" ] && echo "   ✅ Token obtenido" || echo "   ❌ No se obtuvo token"

# Paso 3: Enviar login
echo "3. Enviando credenciales..."
RESPONSE=$(curl -s -w "%{http_code}" -c $COOKIES -b $COOKIES -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  "http://localhost:3000/api/auth/callback/credentials" \
  -d "email=admin@artemadisa.com&password=admin123&csrfToken=$CSRF")

HTTP_CODE="${RESPONSE: -3}"
echo "   HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "302" ]; then
  echo "   ✅ Redirección exitosa (302)"
  echo -e "\n✅ LOGIN FUNCIONA CORRECTAMENTE"
else
  echo "   ⚠️ Status inesperado"
fi
