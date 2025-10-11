#!/bin/bash

# Script to fetch OpenAPI spec from backend and generate TypeScript types
# Usage: npm run generate (from packages/api or root with workspace flag)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(dirname "$SCRIPT_DIR")"

echo "📥 Fetching OpenAPI spec from backend..."

# Fetch the OpenAPI spec
curl -s http://localhost:3000/api-docs-json > "$API_DIR/openapi-spec.json"

if [ ! -s "$API_DIR/openapi-spec.json" ]; then
  echo "❌ Failed to fetch OpenAPI spec. Make sure backend is running at http://localhost:3000"
  exit 1
fi

echo "✅ OpenAPI spec fetched successfully"

echo "🔧 Fixing OpenAPI spec issues..."

# Fix invalid $ref to String schema using Python
python3 << EOF
import json

# Read the original spec
with open('$API_DIR/openapi-spec.json', 'r') as f:
    spec = json.load(f)

# Remove the invalid String schema reference by replacing it with inline type
def replace_string_refs(obj):
    if isinstance(obj, dict):
        if '\$ref' in obj and obj['\$ref'] == '#/components/schemas/String':
            return {'type': 'string'}
        return {k: replace_string_refs(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_string_refs(item) for item in obj]
    return obj

spec = replace_string_refs(spec)

# Write the fixed spec
with open('$API_DIR/openapi-spec-fixed.json', 'w') as f:
    json.dump(spec, f, indent=2)

print('✅ OpenAPI spec fixed')
EOF

echo "⚡ Generating TypeScript types..."

# Run openapi-ts
openapi-ts

echo "🎉 Done! TypeScript types generated successfully"
