const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'sw.js');

const now = new Date();
const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
const nextVersion = `v${dateStamp}`;

const cacheVersionPattern = /const CACHE_VERSION = 'v\d{8}';/;
const originalContent = fs.readFileSync(targetFile, 'utf8').replace(/^\uFEFF/, '');

if (!cacheVersionPattern.test(originalContent)) {
  throw new Error('CACHE_VERSION declaration not found in sw.js');
}

const updatedContent = originalContent.replace(cacheVersionPattern, `const CACHE_VERSION = '${nextVersion}';`);

if (updatedContent === originalContent) {
  console.log(`CACHE_VERSION already set to ${nextVersion}`);
} else {
  fs.writeFileSync(targetFile, updatedContent);
  console.log(`CACHE_VERSION updated to ${nextVersion} in sw.js`);
}
