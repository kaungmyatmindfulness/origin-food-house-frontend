#!/usr/bin/env node

/**
 * Post-processing script to add .js extensions to relative imports in generated files.
 * This is required for TypeScript with moduleResolution: NodeNext.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const generatedDir = join(__dirname, '..', 'src', 'generated');

/**
 * Recursively find all .ts files in a directory
 */
function findTsFiles(dir, files = []) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      findTsFiles(fullPath, files);
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function fixImports() {
  console.log('🔧 Fixing import extensions in generated files...');

  // Find all .ts files in the generated directory
  const files = findTsFiles(generatedDir);

  let fixedCount = 0;

  for (const file of files) {
    const originalContent = readFileSync(file, 'utf-8');
    let newContent = originalContent;

    // Special case: fix './client.js' to '@hey-api/client-fetch' (package import)
    if (newContent.includes("from './client.js'")) {
      newContent = newContent.replace(/from '\.\/client\.js'/g, "from '@hey-api/client-fetch'");
    }

    // Remove .js extensions from relative imports for Next.js/Turbopack compatibility
    // Next.js bundler needs to resolve from .ts source files, not compiled .js
    newContent = newContent.replace(/from '(\.[^'"]*?)\.js';/g, "from '$1';");

    // Only write if content actually changed
    if (newContent !== originalContent) {
      writeFileSync(file, newContent, 'utf-8');
      fixedCount++;
    }
  }

  console.log(`✅ Fixed imports in ${fixedCount} files`);
}

try {
  fixImports();
} catch (error) {
  console.error('❌ Error fixing imports:', error);
  process.exit(1);
}
