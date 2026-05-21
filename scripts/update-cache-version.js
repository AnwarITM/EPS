const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const packageJson = require(path.join(rootDir, 'package.json'));
const appVersion = packageJson.version || '1.0.0';

const now = new Date();
const version = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

const filesToUpdate = [
  'index.html',
  'work_planner.html',
  'notes_viewer.html',
  'machine_location.html',
  'admin_notes.html',
  'theme_manager.js',
  'sw.js'
];

const replacements = [
  {
    name: 'app semantic version',
    pattern: /const APP_SEMANTIC_VERSION = '[^']+';/,
    replacement: `const APP_SEMANTIC_VERSION = '${appVersion}';`
  },
  {
    name: 'service worker cache version',
    pattern: /const CACHE_VERSION = '\d{8}';/,
    replacement: `const CACHE_VERSION = '${version}';`
  },
  {
    name: 'app version',
    pattern: /const APP_VERSION = '\d{8}';/,
    replacement: `const APP_VERSION = '${version}';`
  },
  {
    name: 'theme version',
    pattern: /const THEME_VERSION = '\d{8}';/,
    replacement: `const THEME_VERSION = '${version}';`
  },
  {
    name: 'local asset query versions',
    pattern: /(\b(?:href|src)=["'][^"']+\.(?:css|js|html)\?v=)(?:v)?\d{8}/g,
    replacement: `$1${version}`
  }
];

function updateFile(relativePath) {
  const file = path.join(rootDir, relativePath);
  let content = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  let changed = false;

  replacements.forEach(({ pattern, replacement }) => {
    const updated = content.replace(pattern, replacement);
    if (updated !== content) {
      content = updated;
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content);
  }

  return changed;
}

const changedFiles = filesToUpdate.filter(updateFile);

if (changedFiles.length === 0) {
  console.log(`No cache version changes needed for ${version}.`);
} else {
  console.log(`Cache version bumped to ${version}. Updated: ${changedFiles.join(', ')}`);
}
