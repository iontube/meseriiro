import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// ── Icon mark SVG ──
function iconSvg(size = 512) {
  return `
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f07550"/>
        <stop offset="50%" stop-color="#dc5436"/>
        <stop offset="100%" stop-color="#a33219"/>
      </linearGradient>
      <linearGradient id="mg" x1="96" y1="130" x2="416" y2="400" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fde3dc"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="110" fill="url(#bg)"/>
    <path d="M 96 396 L 96 148 L 150 148 L 256 284 L 362 148 L 416 148 L 416 396 L 358 396 L 358 240 L 272 346 Q 256 366 240 346 L 154 240 L 154 396 Z" fill="url(#mg)"/>
    <circle cx="256" cy="128" r="14" fill="#fb923c"/>
  </svg>`;
}

// ── Full logo: icon + text rendered as SVG with embedded font metrics ──
function fullLogoSvg(variant = 'light') {
  const textColor = variant === 'light' ? '#1c1917' : '#ffffff';
  const accentColor = variant === 'light' ? '#dc5436' : '#f9a48a';
  const taglineColor = variant === 'light' ? '#78716c' : '#a8a092';

  return `
  <svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lbg" x1="0" y1="0" x2="140" y2="140" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f07550"/>
        <stop offset="50%" stop-color="#dc5436"/>
        <stop offset="100%" stop-color="#a33219"/>
      </linearGradient>
      <linearGradient id="lmg" x1="20" y1="28" x2="120" y2="112" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fde3dc"/>
      </linearGradient>
    </defs>

    <!-- Icon mark scaled down -->
    <g transform="translate(16, 16)">
      <rect width="168" height="168" rx="38" fill="url(#lbg)"/>
      <path d="M 31.5 130 L 31.5 48.5 L 49 48.5 L 84 93 L 119 48.5 L 136.5 48.5 L 136.5 130 L 117.5 130 L 117.5 79 L 89 114 Q 84 120 79 114 L 50.5 79 L 50.5 130 Z" fill="url(#lmg)"/>
      <circle cx="84" cy="42" r="4.6" fill="#fb923c"/>
    </g>

    <!-- Text: "Meseriile" - using system font with fallback -->
    <text x="208" y="122"
      font-family="'Plus Jakarta Sans','Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif"
      font-weight="800"
      font-size="88"
      fill="${textColor}"
      letter-spacing="-2"
      dominant-baseline="middle"
    >Meseriile</text>

    <!-- Text: ".ro" -->
    <text x="644" y="122"
      font-family="'Plus Jakarta Sans','Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif"
      font-weight="800"
      font-size="88"
      fill="${accentColor}"
      letter-spacing="-2"
      dominant-baseline="middle"
    >.ro</text>
  </svg>`;
}

// ── Full logo wide version with tagline ──
function fullLogoWideSvg(variant = 'light') {
  const textColor = variant === 'light' ? '#1c1917' : '#ffffff';
  const accentColor = variant === 'light' ? '#dc5436' : '#f9a48a';
  const taglineColor = variant === 'light' ? '#78716c' : '#a8a092';

  return `
  <svg viewBox="0 0 900 220" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wbg" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f07550"/>
        <stop offset="50%" stop-color="#dc5436"/>
        <stop offset="100%" stop-color="#a33219"/>
      </linearGradient>
      <linearGradient id="wmg" x1="20" y1="28" x2="130" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fde3dc"/>
      </linearGradient>
    </defs>

    <!-- Icon -->
    <g transform="translate(16, 20)">
      <rect width="172" height="172" rx="38" fill="url(#wbg)"/>
      <path d="M 32 133 L 32 50 L 50 50 L 86 95.5 L 122 50 L 140 50 L 140 133 L 120 133 L 120 80 L 91 117 Q 86 123 81 117 L 52 80 L 52 133 Z" fill="url(#wmg)"/>
      <circle cx="86" cy="43" r="4.8" fill="#fb923c"/>
    </g>

    <!-- Main text -->
    <text x="212" y="112"
      font-family="'Plus Jakarta Sans','Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif"
      font-weight="800"
      font-size="90"
      fill="${textColor}"
      letter-spacing="-2"
      dominant-baseline="middle"
    >Meseriile</text>

    <text x="655" y="112"
      font-family="'Plus Jakarta Sans','Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif"
      font-weight="800"
      font-size="90"
      fill="${accentColor}"
      letter-spacing="-2"
      dominant-baseline="middle"
    >.ro</text>

    <!-- Tagline -->
    <text x="214" y="168"
      font-family="'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif"
      font-weight="600"
      font-size="22"
      fill="${taglineColor}"
      letter-spacing="4"
    >DIRECTOR PROFESIONAL DE MESERII</text>
  </svg>`;
}

async function generate() {
  const icon = iconSvg();

  // Icon sizes
  for (const [size, name] of [[512, 'logo-icon.png'], [192, 'logo-icon-192.png'], [180, 'apple-touch-icon.png'], [32, 'favicon-32.png']]) {
    await sharp(Buffer.from(icon)).resize(size, size).png({ quality: 100 }).toFile(join(publicDir, name));
    console.log(`✓ ${name} (${size}×${size})`);
  }

  // Favicon SVG
  writeFileSync(join(publicDir, 'favicon.svg'), icon.trim());
  console.log('✓ favicon.svg');

  // Full logos - light
  const fullLight = fullLogoSvg('light');
  await sharp(Buffer.from(fullLight)).resize(1600, 400).png({ quality: 100 }).toFile(join(publicDir, 'logo-full.png'));
  console.log('✓ logo-full.png (1600×400) - light');

  // Full logos - dark
  const fullDark = fullLogoSvg('dark');
  await sharp(Buffer.from(fullDark)).resize(1600, 400).png({ quality: 100 }).toFile(join(publicDir, 'logo-full-dark.png'));
  console.log('✓ logo-full-dark.png (1600×400) - dark');

  // Wide with tagline - light
  const wideLight = fullLogoWideSvg('light');
  await sharp(Buffer.from(wideLight)).resize(1800, 440).png({ quality: 100 }).toFile(join(publicDir, 'logo-wide.png'));
  console.log('✓ logo-wide.png (1800×440) - with tagline, light');

  // Wide with tagline - dark
  const wideDark = fullLogoWideSvg('dark');
  await sharp(Buffer.from(wideDark)).resize(1800, 440).png({ quality: 100 }).toFile(join(publicDir, 'logo-wide-dark.png'));
  console.log('✓ logo-wide-dark.png (1800×440) - with tagline, dark');

  // Save SVGs for reference
  writeFileSync(join(publicDir, 'logo-full.svg'), fullLight.trim());
  writeFileSync(join(publicDir, 'logo-full-dark.svg'), fullDark.trim());
  writeFileSync(join(publicDir, 'logo-wide.svg'), wideLight.trim());

  console.log('\nDone! Check in browser:');
  console.log('  http://localhost:4323/logo-full.png');
  console.log('  http://localhost:4323/logo-full-dark.png');
  console.log('  http://localhost:4323/logo-wide.png');
  console.log('  http://localhost:4323/logo-wide-dark.png');
}

generate().catch(console.error);
