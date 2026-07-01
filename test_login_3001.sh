#!/bin/bash

COOKIES="/tmp/login_3001.txt"
rm -f $COOKIES

echo "=== Probando login en puerto 3001 ==="

# Obtener CSRF
CSRF=$(curl -s -c $COOKIES http://localhost:3001/api/auth/csrf | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)
echo "1. CSRF token: ${CSRF:0:30}..."

# Hacer login
RESPONSE=$(curl -s -c $COOKIES -b $COOKIES -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  "http://localhost:3001/api/auth/callback/credentials" \
  -d "email=admin@artemadisa.com&password=admin123&csrfToken=$CSRF")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "2. HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "302" ]; then
  echo "3. ✅ Login exitoso (redirección 302)"
  # Verificar sesión
  SESSION=$(curl -s -b $COOKIES http://localhost:3001/api/auth/session | grep -o '"email":"admin')
  if [ -n "$SESSION" ]; then
    echo "4. ✅ Sesión activa"
  fi
  echo -e "\n✅ LOGIN FUNCIONA CORRECTAMENTE"
else
  echo "Error: $BODY"
fi
