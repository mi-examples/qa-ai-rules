import path from 'path';
import fs from 'fs';

/**
 * Rename package archive to latest version
 * This script is called after npm pack to create a "latest" version reference
 */

const appDirectory = fs.realpathSync(process.cwd());
const packageJsonPath = path.resolve(appDirectory, 'package.json');

// Validate package.json exists and is readable
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found in current directory');
  process.exit(1);
}

let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('❌ Error: Failed to parse package.json:', error.message);
  process.exit(1);
}

// Validate required fields
if (!packageJson.version) {
  console.error('❌ Error: package.json missing version field');
  process.exit(1);
}

if (!packageJson.name) {
  console.error('❌ Error: package.json missing name field');
  process.exit(1);
}

const packName = `metricinsights-qa-ai-rules-${packageJson.version}.tgz`;
const sourcePath = path.resolve(appDirectory, packName);
const targetPath = path.resolve(appDirectory, 'metricinsights-qa-ai-rules-latest.tgz');

console.log(`📦 Package: ${packageJson.name}@${packageJson.version}`);
console.log(`🔍 Looking for source package: ${packName}`);

// Check if source package exists
if (!fs.existsSync(sourcePath)) {
  console.error(`❌ Error: Source package not found: ${packName}`);
  console.error('💡 Make sure to run "npm pack" before this script');
  process.exit(1);
}

try {
  // Remove existing latest package if it exists
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
    console.log('🗑️  Removed existing latest package');
  }

  // Copy and rename the package
  fs.copyFileSync(sourcePath, targetPath);

  // Verify the copy was successful
  if (!fs.existsSync(targetPath)) {
    throw new Error('Copy operation failed - target file not found');
  }

  const sourceStats = fs.statSync(sourcePath);
  const targetStats = fs.statSync(targetPath);

  if (sourceStats.size !== targetStats.size) {
    throw new Error(`File size mismatch: source ${sourceStats.size} bytes, target ${targetStats.size} bytes`);
  }

  console.log('✅ Successfully created latest package');
  console.log(`📁 Source: ${sourcePath}`);
  console.log(`📁 Target: ${targetPath}`);
  console.log(`📊 Size: ${(targetStats.size / 1024).toFixed(2)} KB`);
} catch (error) {
  console.error('❌ Error: Failed to create latest package:', error.message);
  process.exit(1);
}
