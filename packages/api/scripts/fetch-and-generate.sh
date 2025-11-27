#!/bin/bash

# Script to fetch OpenAPI spec from backend and generate TypeScript types
# Uses openapi-typescript for type generation
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

# Fix invalid $ref to String and Object schemas, and fix incorrect type declarations
python3 << EOF
import json

# Read the original spec
with open('$API_DIR/openapi-spec.json', 'r') as f:
    spec = json.load(f)

# Fix incorrect type declarations (type: object with maxLength should be type: string)
def fix_incorrect_types(obj):
    if isinstance(obj, dict):
        # If this is a property with type: object but has maxLength (string indicator), fix it
        if obj.get('type') == 'object' and 'maxLength' in obj:
            # This should be a string type
            return {k: v for k, v in obj.items() if k != 'type'} | {'type': 'string'}
        return {k: fix_incorrect_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [fix_incorrect_types(item) for item in obj]
    return obj

spec = fix_incorrect_types(spec)

# Remove invalid schema references by replacing them with inline types
def replace_invalid_refs(obj):
    if isinstance(obj, dict):
        if '\$ref' in obj:
            if obj['\$ref'] == '#/components/schemas/String':
                return {'type': 'string'}
            elif obj['\$ref'] == '#/components/schemas/Object':
                return {'type': 'object', 'additionalProperties': True}
        return {k: replace_invalid_refs(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_invalid_refs(item) for item in obj]
    return obj

spec = replace_invalid_refs(spec)

# Write the fixed spec
with open('$API_DIR/openapi-spec-fixed.json', 'w') as f:
    json.dump(spec, f, indent=2)

print('✅ OpenAPI spec fixed')
EOF

echo "⚡ Generating TypeScript types with openapi-typescript..."

# Create the generated directory if it doesn't exist
mkdir -p "$API_DIR/src/generated"

# Run openapi-typescript to generate types
npx openapi-typescript "$API_DIR/openapi-spec-fixed.json" -o "$API_DIR/src/generated/api.d.ts"

echo "🎉 Done! TypeScript types generated successfully at src/generated/api.d.ts"
