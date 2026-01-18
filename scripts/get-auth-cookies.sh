#!/bin/bash

# How to Get Supabase Auth Cookies for curl Testing
# ==================================================

# Supabase stores auth session in cookies that look like:
# - sb-{project-ref}-auth-token
# - sb-{project-ref}-auth-token-code-verifier

# For your project (ttpgykxgpveqwkosejzd), the cookie names are:
# - sb-ttpgykxgpveqwkosejzd-auth-token
# - sb-ttpgykxgpveqwkosejzd-auth-token-code-verifier

echo "To get your auth cookies:"
echo "1. Open Chrome DevTools (F12)"
echo "2. Go to Application tab"
echo "3. Click 'Cookies' in left sidebar"
echo "4. Click 'http://localhost:3000'"
echo "5. Look for cookies starting with 'sb-ttpgykxgpveqwkosejzd'"
echo "6. Copy the entire cookie string"
echo ""
echo "Then use curl like this:"
echo ""
echo "curl 'http://localhost:3000/api/recipe/extract' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -b 'sb-ttpgykxgpveqwkosejzd-auth-token=YOUR_TOKEN_HERE' \\"
echo "  --data-raw '{\"url\":\"https://example.com/recipe\"}'"
echo ""
echo "NOTE: The auth token is a JWT and very long (500+ characters)"
