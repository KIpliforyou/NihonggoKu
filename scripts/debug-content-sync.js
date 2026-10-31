// Debug script for ContentSync
const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
const bunpouPath = path.join(contentDir, 'bunpou', 'data.json');
const kotobaPath = path.join(contentDir, 'kotoba', 'data.json');
const manifestPath = path.join(contentDir, 'manifest.json');

console.log('=== Debug ContentSync ===');
console.log('Bunpou file exists:', fs.existsSync(bunpouPath));
console.log('Kotoba file exists:', fs.existsSync(kotobaPath));
console.log('Manifest file exists:', fs.existsSync(manifestPath));

if (fs.existsSync(bunpouPath)) {
  const bunpouData = JSON.parse(fs.readFileSync(bunpouPath, 'utf8'));
  console.log('Bunpou items:', bunpouData.length);
  console.log('First item:', bunpouData[0]);
}

if (fs.existsSync(kotobaPath)) {
  const kotobaData = JSON.parse(fs.readFileSync(kotobaPath, 'utf8'));
  console.log('Kotoba items:', kotobaData.length);
  console.log('First item:', kotobaData[0]);
}

if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log('Manifest:', JSON.stringify(manifest, null, 2));
}

console.log('=== End Debug ===');