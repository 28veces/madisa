#!/bin/bash
COOKIES="/tmp/q.txt"
rm -f $COOKIES
curl -s -c $COOKIES http://localhost:3000/api/auth/csrf | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4 > /tmp/csrf.txt
CSRF=$(cat /tmp/csrf.txt)
curl -s -c $COOKIES -b $COOKIES -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  "http://localhost:3000/api/auth/callback/credentials" \
  -d "email=admin@artemadisa.com&password=admin123&csrfToken=$CSRF" \
  -w "\nStatus: %{http_code}\n"
