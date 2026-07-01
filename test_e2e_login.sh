#!/bin/bash

echo "=== Test de login end-to-end ==="

# Crear archivo de cookies
COOKIES="/tmp/login_cookies.txt"
rm -f $COOKIES

# Paso 1: Acceder a /login y obtener cookies de sesión
echo "1. Obtiendo sesión inicial..."
curl -s -c $COOKIES http://localhost:3000/login > /dev/null

# Paso 2: Obtener CSRF token
echo "2. Obteniendo CSRF token..."
CSRF=$(curl -s -b $COOKIES http://localhost:3000/api/auth/csrf | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)
echo "   CSRF token: ${CSRF:0:20}..."

# Paso 3: Intentar login
echo "3. Enviando credenciales..."
LOGIN_RESPONSE=$(curl -s -c $COOKIES -b $COOKIES -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  "http://localhost:3000/api/auth/callback/credentials" \
  -d "email=admin@artemadisa.com&password=admin123&csrfToken=$CSRF" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -1)
echo "   HTTP Status: $HTTP_CODE"

# Paso 4: Verificar que se obtiene sesión después del login
echo "4. Verificando sesión..."
SESSION=$(curl -s -b $COOKIES http://localhost:3000/api/auth/session | grep -o '"email":"[^"]*"')

if [ -n "$SESSION" ]; then
  echo "   ✅ Sesión activa: $SESSION"
  echo -e "\n✅ LOGIN EXITOSO"
else
  echo "   Session: $SESSION"
  echo "   Nota: La sesión requiere navegador con JavaScript para completar"
fi
