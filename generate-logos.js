import fs from 'fs';
import sharp from 'sharp';

// Ultra-Modern High Resolution 3D Vector Design for Mail Factory Logo
const masterSvgTransparent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient for badge -->
    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1" />
      <stop offset="50%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#3730A3" />
    </linearGradient>

    <!-- Top Flap Gradient -->
    <linearGradient id="flapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>

    <!-- Golden Star / Bolt Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>

    <!-- Accent Cyan Gradient -->
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>

    <!-- Glow & Shadow Filters -->
    <filter id="envelopeGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#312E81" flood-opacity="0.5" />
    </filter>
    <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#D97706" flood-opacity="0.6" />
    </filter>
    <filter id="flapShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#1E1B4B" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Mail Factory 3D Isometric / Front Floating Envelope -->
  <g filter="url(#envelopeGlow)">
    <!-- Base Envelope Rounded Card -->
    <rect x="48" y="100" width="416" height="312" rx="44" fill="url(#bodyGrad)" />

    <!-- Inner Glow Border -->
    <rect x="50" y="102" width="412" height="308" rx="42" fill="none" stroke="#A5B4FC" stroke-width="4" stroke-opacity="0.6" />

    <!-- Bottom Left / Right Envelope Fold Lines -->
    <path d="M48 400 L210 260" stroke="#312E81" stroke-width="8" stroke-linecap="round" opacity="0.6" />
    <path d="M464 400 L302 260" stroke="#312E81" stroke-width="8" stroke-linecap="round" opacity="0.6" />

    <!-- White / Light Accent Document Peeking -->
    <rect x="100" y="70" width="312" height="150" rx="20" fill="#FFFFFF" opacity="0.95" />
    <line x1="140" y1="105" x2="260" y2="105" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" />
    <line x1="140" y1="125" x2="330" y2="125" stroke="#E2E8F0" stroke-width="8" stroke-linecap="round" />

    <!-- Top Triangle Flap with 3D Depth -->
    <path d="M48 116 L256 280 L464 116" fill="url(#flapGrad)" filter="url(#flapShadow)" />
    <path d="M48 116 L256 280 L464 116" fill="none" stroke="#C7D2FE" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.8" />
    
    <!-- Left Wing Shadow -->
    <path d="M48 116 L48 400 L256 248 Z" fill="#4338CA" opacity="0.4" />
    <!-- Right Wing Shadow -->
    <path d="M464 116 L464 400 L256 248 Z" fill="#3730A3" opacity="0.4" />
  </g>

  <!-- Central Verification Seal / Star Badge (Golden VIP Shield) -->
  <g filter="url(#goldGlow)">
    <!-- Golden Circular Badge -->
    <circle cx="256" cy="275" r="54" fill="url(#goldGrad)" />
    <circle cx="256" cy="275" r="48" fill="none" stroke="#FEF08A" stroke-width="4" />

    <!-- Sharp Electric Lightning / Fast Speed Exchange Symbol -->
    <path d="M262 238 L238 274 L256 274 L250 312 L276 270 L258 270 Z" fill="#FFFFFF" />
  </g>

  <!-- Top Right Verified Sparkle -->
  <g transform="translate(390, 80) scale(0.9)">
    <circle cx="20" cy="20" r="22" fill="#10B981" />
    <path d="M12 20 L18 26 L29 14" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

// App Icon Version (With Rounded Squircle Background for PWA & App store)
const masterSvgAppIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="50%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="bodyGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1" />
      <stop offset="50%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#3730A3" />
    </linearGradient>
    <linearGradient id="flapGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>
    <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="iconGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#4F46E5" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Rounded Background Squircle -->
  <rect width="512" height="512" rx="116" fill="url(#bgGrad)" />
  <rect x="4" y="4" width="504" height="504" rx="112" fill="none" stroke="#312E81" stroke-width="4" />

  <!-- Ambient Glow Behind Logo -->
  <circle cx="256" cy="260" r="160" fill="#4F46E5" opacity="0.25" filter="blur(30px)" />

  <!-- Floating Mail Icon -->
  <g filter="url(#iconGlow)">
    <rect x="76" y="140" width="360" height="260" rx="36" fill="url(#bodyGrad2)" />
    <rect x="78" y="142" width="356" height="256" rx="34" fill="none" stroke="#A5B4FC" stroke-width="3" opacity="0.6" />

    <!-- White Card Top Peek -->
    <rect x="120" y="112" width="272" height="110" rx="16" fill="#FFFFFF" opacity="0.9" />
    <line x1="150" y1="140" x2="250" y2="140" stroke="#CBD5E1" stroke-width="6" stroke-linecap="round" />

    <!-- Flap -->
    <path d="M76 150 L256 290 L436 150" fill="url(#flapGrad2)" />
    <path d="M76 150 L256 290 L436 150" fill="none" stroke="#C7D2FE" stroke-width="4" stroke-linecap="round" opacity="0.8" />

    <!-- Golden Lightning Badge -->
    <circle cx="256" cy="285" r="46" fill="url(#goldGrad2)" />
    <circle cx="256" cy="285" r="41" fill="none" stroke="#FEF08A" stroke-width="3" />
    <path d="M261 254 L240 285 L256 285 L251 316 L273 281 L257 281 Z" fill="#FFFFFF" />
  </g>
</svg>`;

async function run() {
  console.log('Generating high-resolution logo assets...');

  // 1. Save SVG files
  fs.writeFileSync('public/favicon.svg', masterSvgTransparent);
  fs.writeFileSync('favicon.svg', masterSvgTransparent);

  const transparentBuf = Buffer.from(masterSvgTransparent);
  const appIconBuf = Buffer.from(masterSvgAppIcon);

  // 2. Generate PNGs
  await sharp(transparentBuf).resize(512, 512).png().toFile('public/app-logo.png');
  await sharp(transparentBuf).resize(512, 512).png().toFile('app-logo.png');

  await sharp(appIconBuf).resize(512, 512).png().toFile('public/icon-512.png');
  await sharp(appIconBuf).resize(512, 512).png().toFile('icon-512.png');

  await sharp(appIconBuf).resize(192, 192).png().toFile('public/icon-192.png');
  await sharp(appIconBuf).resize(192, 192).png().toFile('icon-192.png');

  await sharp(appIconBuf).resize(192, 192).png().toFile('public/icon-maskable-192.png');
  await sharp(appIconBuf).resize(192, 192).png().toFile('icon-maskable-192.png');

  await sharp(appIconBuf).resize(512, 512).png().toFile('public/icon-maskable-512.png');
  await sharp(appIconBuf).resize(512, 512).png().toFile('icon-maskable-512.png');

  await sharp(appIconBuf).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp(appIconBuf).resize(180, 180).png().toFile('apple-touch-icon.png');

  await sharp(transparentBuf).resize(64, 64).png().toFile('public/favicon.png');

  console.log('Successfully generated all valid PNG and SVG logo assets!');
}

run().catch(console.error);
