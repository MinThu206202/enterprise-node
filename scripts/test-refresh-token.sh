#!/usr/bin/env bash
# ============================================================
# End-to-end refresh token test
#
# Usage:
#   ./scripts/test-refresh-token.sh <email> <password>
#
# Verifies:
#   1. Login returns access + refresh tokens
#   2. Access token works on a protected endpoint
#   3. POST /v1/auth/refresh rotates to a NEW token pair
#   4. New access token works on a protected endpoint
#   5. Reusing the OLD refresh token is rejected (rotation)
# ============================================================
set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
EMAIL="${1:?Usage: $0 <email> <password>}"
PASSWORD="${2:?Usage: $0 <email> <password>}"

pass=0
fail=0

ok()   { printf '  \033[32mPASS\033[0m %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  \033[31mFAIL\033[0m %s\n' "$1"; fail=$((fail+1)); }
step() { printf '\n== %s ==\n' "$1"; }

json_get() {
  node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(eval('d'+process.argv[1])??'')" "$1"
}

post() {
  curl -s -m 10 -X POST "$BASE_URL$1" -H 'Content-Type: application/json' -d "$2"
}

get_me() {
  curl -s -m 10 -o /dev/null -w '%{http_code}' "$BASE_URL/v1/users/me" \
    -H "Authorization: Bearer $1"
}

# ------------------------------------------------------------
step "1. Login as $EMAIL"
login=$(post "/v1/auth/login" "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if [ "$(json_get "$login" ".data.requiresVerification")" = "true" ]; then
  echo "This account requires login OTP verification."
  echo "Test with an account that logs in without OTP, or add OTP handling first."
  exit 1
fi

ACCESS_1=$(json_get "$login" ".data.accessToken")
REFRESH_1=$(json_get "$login" ".data.refreshToken")

if [ -n "$ACCESS_1" ] && [ -n "$REFRESH_1" ] && [ "$ACCESS_1" != "" ]; then
  ok "Login returned accessToken + refreshToken"
else
  bad "Login did not return both tokens:"
  echo "$login"
  exit 1
fi

# ------------------------------------------------------------
step "2. Access token works on GET /v1/users/me"
code=$(get_me "$ACCESS_1")
[ "$code" = "200" ] && ok "GET /v1/users/me -> $code" || bad "GET /v1/users/me -> $code (expected 200)"

# ------------------------------------------------------------
step "3. POST /v1/auth/refresh rotates the pair"
refreshed=$(post "/v1/auth/refresh" "{\"refreshToken\":\"$REFRESH_1\"}")

ACCESS_2=$(json_get "$refreshed" ".data.accessToken")
REFRESH_2=$(json_get "$refreshed" ".data.refreshToken")

if [ -n "$ACCESS_2" ] && [ -n "$REFRESH_2" ]; then
  ok "Refresh returned a new accessToken + refreshToken"
else
  bad "Refresh failed:"
  echo "$refreshed"
  exit 1
fi

if [ "$REFRESH_2" != "$REFRESH_1" ]; then
  ok "Refresh token was rotated (new value differs from old)"
else
  bad "Refresh token was NOT rotated (same value returned)"
fi

# ------------------------------------------------------------
step "4. New access token works on GET /v1/users/me"
code=$(get_me "$ACCESS_2")
[ "$code" = "200" ] && ok "GET /v1/users/me -> $code" || bad "GET /v1/users/me -> $code (expected 200)"

# ------------------------------------------------------------
step "5. OLD refresh token must now be rejected (reuse detection)"
reused=$(post "/v1/auth/refresh" "{\"refreshToken\":\"$REFRESH_1\"}")
error_code=$(json_get "$reused" ".error.code")

if [ "$error_code" = "Unauthorized" ]; then
  msg=$(json_get "$reused" ".error.message")
  ok "Reuse rejected with Unauthorized: \"$msg\""
else
  bad "Old refresh token still accepted! Response: $reused"
fi

# ------------------------------------------------------------
printf '\n=========================\n'
printf 'Result: %d passed, %d failed\n' "$pass" "$fail"

[ "$fail" -eq 0 ]
