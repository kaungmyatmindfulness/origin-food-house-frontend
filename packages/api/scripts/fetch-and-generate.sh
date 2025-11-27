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

# Fix invalid $ref to String and Object schemas, fix incorrect type declarations,
# and handle missing schema references
python3 << EOF
import json
import re

# Read the original spec
with open('$API_DIR/openapi-spec.json', 'r') as f:
    spec = json.load(f)

# Get all defined schemas
defined_schemas = set(spec.get('components', {}).get('schemas', {}).keys())

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

# Track missing refs for reporting
missing_refs = set()

# Replace invalid/missing schema references with inline types
def replace_invalid_refs(obj, path=""):
    if isinstance(obj, dict):
        if '\$ref' in obj:
            ref = obj['\$ref']
            # Handle known invalid refs
            if ref == '#/components/schemas/String':
                return {'type': 'string'}
            elif ref == '#/components/schemas/Object':
                return {'type': 'object', 'additionalProperties': True}
            # Check for missing schema references
            elif ref.startswith('#/components/schemas/'):
                schema_name = ref.split('/')[-1]
                if schema_name not in defined_schemas:
                    missing_refs.add(schema_name)
                    # Replace with unknown type (will be typed as 'unknown' in TypeScript)
                    return {'type': 'object', 'description': f'Missing schema: {schema_name}', 'additionalProperties': True}
        return {k: replace_invalid_refs(v, f"{path}.{k}") for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_invalid_refs(item, f"{path}[{i}]") for i, item in enumerate(obj)]
    return obj

spec = replace_invalid_refs(spec)

# Report missing schemas
if missing_refs:
    print(f'⚠️  Found {len(missing_refs)} missing schema references:')
    for ref in sorted(missing_refs):
        print(f'   - {ref}')
    print('   These have been replaced with generic object types.')

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

echo "📝 Generating schema exports..."

# Generate schemas.ts from OpenAPI spec
python3 << PYEOF
import json
import sys
import os

api_dir = "$API_DIR"

# Read the fixed spec
with open(f'{api_dir}/openapi-spec-fixed.json', 'r') as f:
    spec = json.load(f)

schemas = spec.get('components', {}).get('schemas', {})
schema_names = sorted(schemas.keys())

# Filter out invalid schema names (like "String", "Object" which are primitives)
invalid_names = {'String', 'Object', 'Boolean', 'Number', 'Integer'}
schema_names = [name for name in schema_names if name not in invalid_names]

# Find missing schemas by scanning for "Missing schema:" in descriptions
missing_schemas = set()
def find_missing(obj):
    if isinstance(obj, dict):
        desc = obj.get('description', '')
        if isinstance(desc, str) and 'Missing schema:' in desc:
            schema_name = desc.replace('Missing schema:', '').strip()
            missing_schemas.add(schema_name)
        for v in obj.values():
            find_missing(v)
    elif isinstance(obj, list):
        for item in obj:
            find_missing(item)

find_missing(spec)

# Check which missing schemas have overrides defined
overrides_file = f'{api_dir}/src/generated/schema-overrides.ts'
overrides_defined = set()
if os.path.exists(overrides_file):
    with open(overrides_file, 'r') as f:
        content = f.read()
        for schema in missing_schemas:
            if f'export interface {schema}' in content or f'export type {schema}' in content:
                overrides_defined.add(schema)

missing_without_override = missing_schemas - overrides_defined

# Generate the schemas.ts content
lines = [
    '/**',
    ' * Auto-generated schema type exports from OpenAPI spec.',
    ' * DO NOT EDIT MANUALLY - Run \`npm run generate:api\` to regenerate.',
    ' *',
    " * Usage: import type { CartResponseDto } from '@repo/api/generated/schemas';",
    ' */',
    '',
    "import type { components } from './api';",
    '',
    '// Helper type for accessing schemas',
    "type Schemas = components['schemas'];",
    '',
]

# Group schemas by category based on naming patterns
categories = {
    'Session': [],
    'Order': [],
    'Standard API Response': [],
    'User': [],
    'Cart': [],
    'Quick Sale': [],
    'Kitchen': [],
    'Store': [],
    'Category': [],
    'Menu Item': [],
    'Customization': [],
    'Table': [],
    'Upload': [],
    'Reports': [],
    'Admin': [],
    'Payment': [],
    'Translation': [],
    'Sort': [],
    'Ownership Transfer': [],
    'Business Hours': [],
    'Tax and Service Charge': [],
    'Other': [],
}

def categorize_schema(name):
    name_lower = name.lower()
    if 'session' in name_lower:
        return 'Session'
    elif 'orderitem' in name_lower or (name_lower.startswith('order') and 'item' in name_lower):
        return 'Order'
    elif 'order' in name_lower:
        return 'Order'
    elif 'standardapi' in name_lower or 'pagination' in name_lower or 'paginated' in name_lower:
        return 'Standard API Response'
    elif 'user' in name_lower or 'staff' in name_lower or 'invite' in name_lower or 'suspend' in name_lower.replace('store', '') or 'ban' in name_lower.replace('store', '') or 'reactivate' in name_lower.replace('store', ''):
        if 'store' in name_lower:
            return 'Admin'
        return 'User'
    elif 'cart' in name_lower:
        return 'Cart'
    elif 'quicksale' in name_lower:
        return 'Quick Sale'
    elif 'kitchen' in name_lower:
        return 'Kitchen'
    elif 'store' in name_lower:
        return 'Store'
    elif 'category' in name_lower and 'menu' not in name_lower:
        return 'Category'
    elif 'menuitem' in name_lower or name_lower.startswith('menu'):
        return 'Menu Item'
    elif 'customization' in name_lower:
        return 'Customization'
    elif 'table' in name_lower:
        return 'Table'
    elif 'upload' in name_lower or 'image' in name_lower:
        return 'Upload'
    elif 'sales' in name_lower or 'popular' in name_lower or 'breakdown' in name_lower:
        return 'Reports'
    elif 'admin' in name_lower or 'validate' in name_lower:
        return 'Admin'
    elif 'payment' in name_lower or 'refund' in name_lower or 'split' in name_lower:
        return 'Payment'
    elif 'translation' in name_lower:
        return 'Translation'
    elif 'sort' in name_lower:
        return 'Sort'
    elif 'ownership' in name_lower or 'otp' in name_lower:
        return 'Ownership Transfer'
    elif 'businesshours' in name_lower or 'dayhours' in name_lower:
        return 'Business Hours'
    elif 'tax' in name_lower or 'servicecharge' in name_lower or 'loyalty' in name_lower:
        return 'Tax and Service Charge'
    else:
        return 'Other'

# Categorize all schemas
for name in schema_names:
    category = categorize_schema(name)
    categories[category].append(name)

# Generate exports grouped by category
for category, names in categories.items():
    if not names:
        continue

    lines.append(f'// {category} DTOs')
    for name in sorted(names):
        lines.append(f"export type {name} = Schemas['{name}'];")
    lines.append('')

# Re-export override types if they exist
if os.path.exists(overrides_file) and overrides_defined:
    lines.append('// =============================================================================')
    lines.append('// Schema Overrides (manually defined for missing backend schemas)')
    lines.append('// These types are defined in schema-overrides.ts because the backend')
    lines.append('// OpenAPI spec does not export them. Remove when backend is fixed.')
    lines.append('// =============================================================================')
    lines.append('')
    lines.append("export * from './schema-overrides';")
    lines.append('')

# Write the file
with open(f'{api_dir}/src/generated/schemas.ts', 'w') as f:
    f.write('\n'.join(lines))

print(f'✅ Generated {len(schema_names)} schema exports from OpenAPI')

# Report status
if missing_schemas:
    print(f'')
    print(f'📋 Missing Schemas Report:')
    print(f'   Total missing: {len(missing_schemas)}')
    print(f'   With overrides: {len(overrides_defined)}')
    print(f'   Need attention: {len(missing_without_override)}')

    if overrides_defined:
        print(f'')
        print(f'   ✅ Covered by schema-overrides.ts:')
        for name in sorted(overrides_defined):
            print(f'      - {name}')

    if missing_without_override:
        print(f'')
        print(f'   ⚠️  NOT covered (add to schema-overrides.ts):')
        for name in sorted(missing_without_override):
            print(f'      - {name}')
        print(f'')
        print(f'   💡 Add these types to: packages/api/src/generated/schema-overrides.ts')
else:
    print(f'✅ All schemas are properly defined in OpenAPI spec!')
PYEOF

echo ""
echo "🎉 Done! TypeScript types generated successfully"
echo "   📄 src/generated/api.d.ts - Full OpenAPI types"
echo "   📄 src/generated/schemas.ts - Schema exports"
echo "   📄 src/generated/schema-overrides.ts - Manual type overrides"
