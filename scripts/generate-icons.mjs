// Run once to generate placeholder SVG icon for PWA
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../public/icons');
mkdirSync(iconsDir, { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#6366f1"/>
  <text x="256" y="330" font-size="280" text-anchor="middle" fill="white">🧾</text>
</svg>`;

writeFileSync(join(iconsDir, 'icon.svg'), svg);
console.log('Created public/icons/icon.svg');
console.log('Convert to PNG: npx svgexport public/icons/icon.svg public/icons/icon-192.png 192:192');
