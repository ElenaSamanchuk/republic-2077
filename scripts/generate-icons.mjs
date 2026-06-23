/**
 * PWA + Android launcher icons from game assets and brand colors.
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const BRAND = { r: 45, g: 41, b: 38, alpha: 1 };
const BRAND_HEX = '#2d2926';
const GOLD = { r: 212, g: 180, b: 84 };

const STAT_FILES = [
  'assets/stats/stat-trust.png',
  'assets/stats/stat-people.png',
  'assets/stats/stat-force.png',
  'assets/stats/stat-treasury.png',
];

async function buildStatRow(size) {
  const statH = Math.round(size * 0.24);
  const statW = Math.round(size * 0.12);
  const gap = Math.round(size * 0.035);
  const rowW = 4 * statW + 3 * gap;
  const startX = Math.round((size - rowW) / 2);
  const statY = Math.round(size * 0.17);
  const composites = [];

  for (let i = 0; i < STAT_FILES.length; i += 1) {
    const statPath = path.join(root, 'public', STAT_FILES[i]);
    const resized = await sharp(statPath)
      .resize(statW, statH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .tint(GOLD)
      .png()
      .toBuffer();
    composites.push({
      input: resized,
      left: startX + i * (statW + gap),
      top: statY,
    });
  }

  const labelSvg = Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <text x="${size / 2}" y="${Math.round(size * 0.14)}" text-anchor="middle"
      font-family="monospace" font-size="${Math.round(size * 0.055)}" letter-spacing="0.32em"
      fill="#e8e4dc" opacity="0.55">REPUBLIC</text>
    <text x="${size / 2}" y="${Math.round(size * 0.82)}" text-anchor="middle"
      font-family="monospace" font-size="${Math.round(size * 0.21)}" font-weight="600"
      letter-spacing="-0.04em" fill="#d4b454">2077</text>
  </svg>`);

  composites.push({ input: labelSvg, top: 0, left: 0 });
  return composites;
}

async function buildIconPipeline(size, { transparentBg = false } = {}) {
  const composites = await buildStatRow(size);
  const background = transparentBg ? { r: 0, g: 0, b: 0, alpha: 0 } : BRAND;

  return sharp({
    create: { width: size, height: size, channels: 4, background },
  }).composite(composites);
}

async function writeRichIcon(size, outPath, options = {}) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await (await buildIconPipeline(size, options)).png().toFile(outPath);
  console.log(path.relative(root, outPath));
}

const launcher = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

await writeRichIcon(192, path.join(root, 'public/icons/icon-192.png'));
await writeRichIcon(512, path.join(root, 'public/icons/icon-512.png'));

const androidRes = path.join(root, 'android/app/src/main/res');
if (fs.existsSync(androidRes)) {
  for (const [folder, size] of Object.entries(launcher)) {
    const base = path.join(androidRes, folder);
    await writeRichIcon(size, path.join(base, 'ic_launcher.png'));
    await writeRichIcon(size, path.join(base, 'ic_launcher_round.png'));
  }

  const fgSizes = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
  };
  for (const [folder, canvas] of Object.entries(fgSizes)) {
    const inner = Math.round(canvas * 0.72);
    const pad = Math.round((canvas - inner) / 2);
    const out = path.join(androidRes, folder, 'ic_launcher_foreground.png');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const fgBuffer = await (await buildIconPipeline(inner, { transparentBg: true })).png().toBuffer();
    await sharp(fgBuffer)
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
  fs.writeFileSync(
    path.join(valuesDir, 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n  <color name="ic_launcher_background">${BRAND_HEX}</color>\n</resources>\n`,
  );

  const bgDrawable = path.join(androidRes, 'drawable/ic_launcher_background.xml');
  if (fs.existsSync(path.dirname(bgDrawable))) {
    fs.writeFileSync(
      bgDrawable,
      `<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android"\n    android:width="108dp"\n    android:height="108dp"\n    android:viewportWidth="108"\n    android:viewportHeight="108">\n    <path android:fillColor="${BRAND_HEX}" android:pathData="M0,0h108v108h-108z" />\n</vector>\n`,
    );
  }
}

console.log('icons ok');
