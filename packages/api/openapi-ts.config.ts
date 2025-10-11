import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  input: './openapi-spec-fixed.json',
  output: {
    format: 'prettier',
    path: './src/generated',
  },
  types: {
    enums: 'javascript',
  },
});
