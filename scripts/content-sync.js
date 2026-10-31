#!/usr/bin/env node
/**
 * Content Sync CLI for NihonggoKu
 * 
 * Usage:
 *   npm run content:validate [file]
 *   npm run content:import -- --file ./export.json [--dry-run]
 *   npm run content:export [--file ./export.json]
 */

const fs = require('fs');
const path = require('path');

const BUNDLED_DIR = path.join(__dirname, '..', 'content');

// --- Inline validation (mirrors lib/contentManager.ts) ---

function validateBunpou(item, index) {
  const errors = [];
  const warnings = [];
  if (!item.id) errors.push(`Item #${index + 1}: missing id`);
  if (!item.pattern) errors.push(`Item #${index + 1}: missing pattern`);
  if (!item.meaning) errors.push(`Item #${index + 1}: missing meaning`);
  if (item.examples && Array.isArray(item.examples)) {
    item.examples.forEach((ex, i) => {
      if (!ex.japanese) warnings.push(`Item #${index + 1} example #${i + 1}: missing japanese`);
      if (!ex.translation) warnings.push(`Item #${index + 1} example #${i + 1}: missing translation`);
    });
  }
  return { valid: errors.length === 0, errors, warnings };
}

function validateKotoba(item, index) {
  const errors = [];
  const warnings = [];
  if (!item.id) errors.push(`Item #${index + 1}: missing id`);
  if (!item.word) errors.push(`Item #${index + 1}: missing word`);
  if (!item.reading) errors.push(`Item #${index + 1}: missing reading`);
  if (!item.meaning) errors.push(`Item #${index + 1}: missing meaning`);
  if (item.examples && Array.isArray(item.examples)) {
    item.examples.forEach((ex, i) => {
      if (!ex.japanese) warnings.push(`Item #${index + 1} example #${i + 1}: missing japanese`);
      if (!ex.translation) warnings.push(`Item #${index + 1} example #${i + 1}: missing translation`);
    });
  }
  return { valid: errors.length === 0, errors, warnings };
}

function validateContentPack(pack) {
  const report = {
    valid: true,
    bunpou: { total: 0, valid: 0, invalid: 0, errors: [], warnings: [] },
    kotoba: { total: 0, valid: 0, invalid: 0, errors: [], warnings: [] },
    manifest: { valid: true, errors: [] },
  };
  if (pack.manifest) {
    if (!pack.manifest.manifestVersion) report.manifest.errors.push('Missing manifestVersion');
    if (!pack.manifest.schemaVersion) report.manifest.errors.push('Missing schemaVersion');
    if (!pack.manifest.contentVersion) report.manifest.errors.push('Missing contentVersion');
    if (!pack.manifest.lastUpdated) report.manifest.errors.push('Missing lastUpdated');
    if (!pack.manifest.packName) report.manifest.errors.push('Missing packName');
  }
  if (Array.isArray(pack.bunpou)) {
    report.bunpou.total = pack.bunpou.length;
    for (let i = 0; i < pack.bunpou.length; i++) {
      const r = validateBunpou(pack.bunpou[i], i);
      if (r.valid) report.bunpou.valid++;
      else { report.bunpou.invalid++; report.bunpou.errors.push(...r.errors); }
      report.bunpou.warnings.push(...r.warnings);
    }
  }
  if (Array.isArray(pack.kotoba)) {
    report.kotoba.total = pack.kotoba.length;
    for (let i = 0; i < pack.kotoba.length; i++) {
      const r = validateKotoba(pack.kotoba[i], i);
      if (r.valid) report.kotoba.valid++;
      else { report.kotoba.invalid++; report.kotoba.errors.push(...r.errors); }
      report.kotoba.warnings.push(...r.warnings);
    }
  }
  report.valid = report.manifest.errors.length === 0 && report.bunpou.invalid === 0 && report.kotoba.invalid === 0;
  return report;
}

// --- Commands ---

function cmdValidate(filePath) {
  console.log('\n=== Content Validator ===\n');
  
  // Validate bundled content
  console.log('Validating bundled content...');
  try {
    const manifest = require(path.join(BUNDLED_DIR, 'manifest.json'));
    const bunpou = require(path.join(BUNDLED_DIR, 'bunpou', 'data.json'));
    const kotoba = require(path.join(BUNDLED_DIR, 'kotoba', 'data.json'));
    
    const bundlePack = { manifest, bunpou, kotoba };
    const result = validateContentPack(bundlePack);
    
    console.log(`  Bunpou: ${result.bunpou.valid}/${result.bunpou.total} valid`);
    console.log(`  Kotoba: ${result.kotoba.valid}/${result.kotoba.total} valid`);
    console.log(`  Manifest: ${result.manifest.valid ? 'VALID' : 'INVALID'}`);
    
    if (result.bunpou.errors.length > 0) {
      console.log('\n  Bunpou errors:');
      result.bunpou.errors.forEach(e => console.log(`    - ${e}`));
    }
    if (result.kotoba.errors.length > 0) {
      console.log('\n  Kotoba errors:');
      result.kotoba.errors.forEach(e => console.log(`    - ${e}`));
    }
    
    if (result.valid) {
      console.log('\n  ✓ Bundled content is valid\n');
    } else {
      console.log('\n  ✗ Bundled content has errors\n');
      process.exit(1);
    }
  } catch (e) {
    console.error('  Error validating bundled content:', e.message);
    process.exit(1);
  }
  
  // Validate external file if provided
  if (filePath) {
    console.log(`\nValidating external file: ${filePath}`);
    try {
      const pack = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const result = validateContentPack(pack);
      
      console.log(`  Bunpou: ${result.bunpou.valid}/${result.bunpou.total} valid`);
      console.log(`  Kotoba: ${result.kotoba.valid}/${result.kotoba.total} valid`);
      
      if (result.valid) {
        console.log('\n  ✓ External content is valid\n');
      } else {
        console.log('\n  ✗ External content has errors\n');
        if (result.bunpou.errors.length > 0) {
          console.log('  Bunpou errors:');
          result.bunpou.errors.slice(0, 5).forEach(e => console.log(`    - ${e}`));
        }
        if (result.kotoba.errors.length > 0) {
          console.log('  Kotoba errors:');
          result.kotoba.errors.slice(0, 5).forEach(e => console.log(`    - ${e}`));
        }
        process.exit(1);
      }
    } catch (e) {
      console.error('  Error:', e.message);
      process.exit(1);
    }
  } else {
    console.log('\n(No external file provided — bundled content validated only)\n');
  }
  
  console.log('=== Validation Complete ===\n');
}

function cmdImport(args) {
  const filePath = args.find(a => a.startsWith('--file='))?.split('=')[1] ||
                   args.find(a => a.startsWith('--file '))?.split(' ')[1];
  const dryRun = args.includes('--dry-run') || args.includes('--preview');
  
  if (!filePath) {
    console.error('Error: --file is required');
    console.error('Usage: npm run content:import -- --file ./export.json [--dry-run]');
    process.exit(1);
  }
  
  console.log('\n=== Content Import ===\n');
  
  // Read and validate
  let pack;
  try {
    pack = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error('Error reading file:', e.message);
    process.exit(1);
  }
  
  const validationResult = validateContentPack(pack);
  
  console.log(`Validation: ${validationResult.valid ? 'PASS' : 'FAIL'}`);
  console.log(`Bunpou: ${validationResult.bunpou.valid}/${validationResult.bunpou.total} valid`);
  console.log(`Kotoba: ${validationResult.kotoba.valid}/${validationResult.kotoba.total} valid`);
  
  if (!validationResult.valid) {
    console.error('\nImport rejected due to validation errors.');
    if (validationResult.bunpou.errors.length > 0) {
      console.error('Bunpou errors:', validationResult.bunpou.errors.slice(0, 3).join(', '));
    }
    if (validationResult.kotoba.errors.length > 0) {
      console.error('Kotoba errors:', validationResult.kotoba.errors.slice(0, 3).join(', '));
    }
    process.exit(1);
  }
  
  // Preview changes
  console.log('\n--- Preview ---');
  console.log(`Would import: ${validationResult.bunpou.valid} bunpou, ${validationResult.kotoba.valid} kotoba`);
  
  if (pack.manifest) {
    console.log(`Content version: ${pack.manifest.contentVersion}`);
    console.log(`Pack name: ${pack.manifest.packName}`);
  }
  
  // Detect conflicts (items with same IDs as bundled)
  const bundledManifest = require(path.join(BUNDLED_DIR, 'manifest.json'));
  const bundledBunpou = require(path.join(BUNDLED_DIR, 'bunpou', 'data.json'));
  const bundledKotoba = require(path.join(BUNDLED_DIR, 'kotoba', 'data.json'));
  
  const bunpouIds = new Set(bundledBunpou.map(b => b.id));
  const kotobaIds = new Set(bundledKotoba.map(k => k.id));
  
  const bunpouConflicts = (pack.bunpou || []).filter(b => bunpouIds.has(b.id));
  const kotobaConflicts = (pack.kotoba || []).filter(k => kotobaIds.has(k.id));
  
  if (bunpouConflicts.length > 0) {
    console.log(`\n⚠ ${bunpouConflicts.length} bunpou items conflict with bundled content (will update)`);
  }
  if (kotobaConflicts.length > 0) {
    console.log(`⚠ ${kotobaConflicts.length} kotoba items conflict with bundled content (will update)`);
  }
  
  // Write to content directory
  if (!dryRun) {
    console.log('\nApplying changes...');
    
    // Update bunpou
    if (pack.bunpou) {
      const updatedBunpou = [...bundledBunpou];
      for (const item of pack.bunpou) {
        const idx = updatedBunpou.findIndex(b => b.id === item.id);
        if (idx >= 0) {
          updatedBunpou[idx] = { ...updatedBunpou[idx], ...item, updatedAt: Date.now() };
        } else {
          updatedBunpou.push({ ...item, source: 'bundled', createdAt: Date.now(), updatedAt: Date.now() });
        }
      }
      fs.writeFileSync(
        path.join(BUNDLED_DIR, 'bunpou', 'data.json'),
        JSON.stringify(updatedBunpou, null, 2)
      );
      console.log(`  Updated ${pack.bunpou.length} bunpou items`);
    }
    
    // Update kotoba
    if (pack.kotoba) {
      const updatedKotoba = [...bundledKotoba];
      for (const item of pack.kotoba) {
        const idx = updatedKotoba.findIndex(k => k.id === item.id);
        if (idx >= 0) {
          updatedKotoba[idx] = { ...updatedKotoba[idx], ...item, updatedAt: Date.now() };
        } else {
          updatedKotoba.push({ ...item, source: 'bundled', createdAt: Date.now(), updatedAt: Date.now() });
        }
      }
      fs.writeFileSync(
        path.join(BUNDLED_DIR, 'kotoba', 'data.json'),
        JSON.stringify(updatedKotoba, null, 2)
      );
      console.log(`  Updated ${pack.kotoba.length} kotoba items`);
    }
    
    // Update manifest
    if (pack.manifest) {
      const updatedManifest = {
        ...bundledManifest,
        ...pack.manifest,
        lastUpdated: new Date().toISOString(),
        bunpouCount: (pack.bunpou || bundledBunpou).length,
        kotobaCount: (pack.kotoba || bundledKotoba).length,
      };
      fs.writeFileSync(
        path.join(BUNDLED_DIR, 'manifest.json'),
        JSON.stringify(updatedManifest, null, 2)
      );
      console.log('  Updated manifest');
    }
    
    console.log('\n✓ Import complete!');
  } else {
    console.log('\n[Dry run — no changes applied]');
  }
  
  console.log('\n=== Import Complete ===\n');
}

function cmdExport(args) {
  console.log('\n=== Content Export ===\n');
  console.log('This command generates a content export for AI Agents.');
  console.log('In a real implementation, this would read from IndexedDB.');
  console.log('For CLI usage, use the Settings page to export content.\n');
  
  // Generate sample export structure
  const sampleExport = {
    exportVersion: '1.0.0',
    exportDate: new Date().toISOString(),
    baseManifestVersion: '1',
    baseContentVersion: '1.0.0',
    bunpou: [],
    kotoba: [],
    deletions: [],
    overrides: { bunpou: [], kotoba: [] },
  };
  
  const outputFile = args.find(a => a.startsWith('--file='))?.split('=')[1] || 
                     args.find(a => a.startsWith('--file '))?.split(' ')[1];
  
  if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(sampleExport, null, 2));
    console.log(`Sample export written to: ${outputFile}`);
    console.log('\nNote: Full export requires browser access to IndexedDB.');
    console.log('Use the Settings page in the app for complete export.\n');
  } else {
    console.log('No output file specified. Use --file to save export.\n');
    console.log('Full export available via the app Settings page.\n');
  }
  
  console.log('=== Export Complete ===\n');
}

// --- Main ---

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log(`
NihonggoKu Content Sync CLI

Commands:
  validate [file]    Validate bundled or external content
  import             Import content from exported JSON
  export             Export content for AI Agents

Examples:
  npm run content:validate
  npm run content:validate ./my-content.json
  npm run content:import -- --file ./export.json --dry-run
  npm run content:import -- --file ./export.json --apply
  npm run content:export -- --file ./export.json
`);
  process.exit(0);
}

switch (command) {
  case 'validate':
    cmdValidate(args[1]);
    break;
  case 'import':
    cmdImport(args.slice(1));
    break;
  case 'export':
    cmdExport(args.slice(1));
    break;
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
