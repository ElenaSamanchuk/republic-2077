/**
 * Подписывает release-сборку debug-ключом (как в vital-coach) — иначе Gradle
 * кладёт только app-release-unsigned.apk, а CI ждёт app-release.apk.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const gradlePath = path.join(root, 'android/app/build.gradle');

if (!fs.existsSync(gradlePath)) {
  console.warn('skip patch: android/app/build.gradle not found');
  process.exit(0);
}

let src = fs.readFileSync(gradlePath, 'utf8');

if (src.includes('signingConfig signingConfigs.debug')) {
  console.log('android release signing already patched');
  process.exit(0);
}

const releaseBlock = /release\s*\{[^}]*\}/s;
if (!releaseBlock.test(src)) {
  console.error('release buildType not found in build.gradle');
  process.exit(1);
}

src = src.replace(releaseBlock, (block) => {
  if (block.includes('signingConfig')) return block;
  const trimmed = block.replace(/\s*\}$/, '');
  return `${trimmed}\n            signingConfig signingConfigs.debug\n        }`;
});

fs.writeFileSync(gradlePath, src);
console.log('patched android/app/build.gradle for release signing');
