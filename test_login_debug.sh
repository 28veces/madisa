#!/bin/bash

COOKIES="/tmp/debug.txt"
rm -f $COOKIES

echo "=== Debug del Login ==="

# Obtener CSRF
echo "1. Obteniendo CSRF token..."
CSRF=$(curl -s -c $COOKIES http://localhost:3000/api/auth/csrf | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)
echo "   CSRF: ${CSRF:0:30}..."

# Hacer login
echo "2. Intentando login..."
RESPONSE=$(curl -s -c $COOKIES -b $COOKIES -w "\n%{http_code}\n%{redirect_url}" -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  "http://localhost:3000/api/auth/callback/credentials" \
  -d "email=admin@artemadisa.com&password=admin123&csrfToken=$CSRF")

HTTP_CODE=$(echo "$RESPONSE" | tail -2 | head -1)
REDIRECT=$(echo "$RESPONSE" | tail -1)

echo "   HTTP: $HTTP_CODE"
echo "   Redirect: $REDIRECT"

# Seguir redirección
if [[ $REDIRECT == /login* ]]; then
  echo "3. Redirección a login con error"
  ERROR=$(echo "$REDIRECT" | grep -o "error=[^&]*" | cut -d'=' -f2)
  echo "   Error: $ERROR"
fi
