/**
 * PNG из favicon.svg для PWA и Android launcher.
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const iconSvg = fs.readFileSync(path.join(root, 'public/favicon.svg'));
const BRAND = { r: 45, g: 41, b: 38, alpha: 1 };

async function pngFromSvg(size, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(iconSvg).resize(size, size).png().toFile(outPath);
  console.log(path.relative(root, outPath));
}

const launcher = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

await pngFromSvg(192, path.join(root, 'public/icons/icon-192.png'));
await pngFromSvg(512, path.join(root, 'public/icons/icon-512.png'));

const androidRes = path.join(root, 'android/app/src/main/res');
if (fs.existsSync(androidRes)) {
  for (const [folder, size] of Object.entries(launcher)) {
    const base = path.join(androidRes, folder);
    await pngFromSvg(size, path.join(base, 'ic_launcher.png'));
    await pngFromSvg(size, path.join(base, 'ic_launcher_round.png'));
  }

  const fgSizes = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
  };
  for (const [folder, canvas] of Object.entries(fgSizes)) {
    const inner = Math.round(canvas * 0.66);
    const pad = Math.round((canvas - inner) / 2);
    const out = path.join(androidRes, folder, 'ic_launcher_foreground.png');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await sharp(iconSvg)
      .resize(inner, inner)
      .extend({
        top: pad,
        bottom: pad,
        left: pad,
        right: pad,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(out);
    console.log(path.relative(root, out));
  }

  const valuesDir = path.join(root, 'android/app/src/main/res/values');
  fs.mkdirSync(valuesDir, { recursive: true });
  fs.writeFileSync(
    path.join(valuesDir, 'strings.xml'),
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n  <string name="app_name">Republic 2077</string>\n  <string name="title_activity_main">Republic 2077</string>\n</resources>\n`,
  );
}

console.log('icons ok');
