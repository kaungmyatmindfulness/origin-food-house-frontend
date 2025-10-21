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

// Pattern to match relative imports without extensions
const importPattern = /from\s+['"](\.[^'"]*?)['"];/g;

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
    let content = readFileSync(file, 'utf-8');
    let modified = false;

    // Special case: fix './client.js' to './client/index.js' in root level files
    if (content.includes("from './client.js'")) {
      content = content.replace(/from '\.\/client\.js'/g, "from './client/index.js'");
      modified = true;
    }

    // Fix all relative imports (both ./ and ../)
    const newContent = content.replace(importPattern, (match, importPath) => {
      // Skip if already has .js or .ts extension
      if (importPath.endsWith('.js') || importPath.endsWith('.ts')) {
        return match;
      }
      modified = true;
      return `from '${importPath}.js';`;
    });

    if (modified) {
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
