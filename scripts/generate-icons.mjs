import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const assetsDir = join(__dirname, "..", "src", "assets");

const SVG_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1A6FB5"/>
      <stop offset="1" stop-color="#0D4F8C"/>
    </linearGradient>
    <linearGradient id="shine" x1="128" y1="128" x2="384" y2="384" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="white" stop-opacity="0.25"/>
      <stop offset="1" stop-color="white" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <rect width="512" height="512" rx="112" fill="url(#shine)"/>
  <g transform="translate(256,256)">
    <circle r="120" fill="none" stroke="white" stroke-width="24" opacity="0.9"/>
    <circle r="48" fill="white" opacity="0.95"/>
    <line x1="0" y1="-120" x2="0" y2="-160" stroke="white" stroke-width="20" stroke-linecap="round" opacity="0.7"/>
    <line x1="120" y1="0" x2="160" y2="0" stroke="white" stroke-width="20" stroke-linecap="round" opacity="0.7"/>
    <line x1="0" y1="120" x2="0" y2="160" stroke="white" stroke-width="20" stroke-linecap="round" opacity="0.7"/>
    <line x1="-120" y1="0" x2="-160" y2="0" stroke="white" stroke-width="20" stroke-linecap="round" opacity="0.7"/>
    <line x1="85" y1="-85" x2="113" y2="-113" stroke="white" stroke-width="16" stroke-linecap="round" opacity="0.5"/>
    <line x1="85" y1="85" x2="113" y2="113" stroke="white" stroke-width="16" stroke-linecap="round" opacity="0.5"/>
    <line x1="-85" y1="85" x2="-113" y2="113" stroke="white" stroke-width="16" stroke-linecap="round" opacity="0.5"/>
    <line x1="-85" y1="-85" x2="-113" y2="-113" stroke="white" stroke-width="16" stroke-linecap="round" opacity="0.5"/>
    <text y="8" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="72" fill="white" opacity="0.95">PV</text>
  </g>
</svg>`;

const SVG_OG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="1200" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1A6FB5"/>
      <stop offset="1" stop-color="#0D4F8C"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <g transform="translate(600,450)">
    <circle r="160" fill="none" stroke="white" stroke-width="32" opacity="0.9"/>
    <circle r="64" fill="white" opacity="0.95"/>
    <text y="12" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="96" fill="white" opacity="0.95">PV</text>
  </g>
  <text x="600" y="720" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="80" fill="white" opacity="0.95">Pro-Vision</text>
  <text x="600" y="810" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="40" fill="white" opacity="0.7">Plan · Focus · Achieve</text>
</svg>`;

async function generate() {
  console.log("Generating icons...");

  // Generate logo SVG files
  writeFileSync(join(publicDir, "logo.svg"), SVG_LOGO);
  writeFileSync(join(assetsDir, "logo.svg"), SVG_LOGO);
  console.log("  logo.svg ✓");

  // Favicon sizes
  const favicons = [
    { size: 16, name: "favicon-16x16.png" },
    { size: 32, name: "favicon-32x32.png" },
    { size: 48, name: "favicon-48x48.png" },
    { size: 64, name: "favicon-64x64.png" },
    { size: 96, name: "favicon-96x96.png" },
    { size: 128, name: "favicon-128x128.png" },
    { size: 180, name: "favicon-180x180.png" },
    { size: 192, name: "favicon-192x192.png" },
    { size: 256, name: "favicon-256x256.png" },
    { size: 512, name: "favicon-512x512.png" },
  ];

  for (const { size, name } of favicons) {
    await sharp(Buffer.from(SVG_LOGO))
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`  ${name} ✓`);
  }

  // Apple touch icons
  const appleTouch = [
    { size: 57, name: "apple-touch-icon-57x57.png" },
    { size: 60, name: "apple-touch-icon-60x60.png" },
    { size: 72, name: "apple-touch-icon-72x72.png" },
    { size: 76, name: "apple-touch-icon-76x76.png" },
    { size: 114, name: "apple-touch-icon-114x114.png" },
    { size: 120, name: "apple-touch-icon-120x120.png" },
    { size: 144, name: "apple-touch-icon-144x144.png" },
    { size: 152, name: "apple-touch-icon-152x152.png" },
    { size: 167, name: "apple-touch-icon-167x167.png" },
    { size: 180, name: "apple-touch-icon.png" },
  ];

  for (const { size, name } of appleTouch) {
    await sharp(Buffer.from(SVG_LOGO))
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`  ${name} ✓`);
  }

  // Android icons
  const android = [
    { size: 36, name: "android-icon-36x36.png" },
    { size: 48, name: "android-icon-48x48.png" },
    { size: 72, name: "android-icon-72x72.png" },
    { size: 96, name: "android-icon-96x96.png" },
    { size: 144, name: "android-icon-144x144.png" },
    { size: 192, name: "android-icon-192x192.png" },
    { size: 512, name: "android-icon-512x512.png" },
  ];

  for (const { size, name } of android) {
    await sharp(Buffer.from(SVG_LOGO))
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`  ${name} ✓`);
  }

  // Android adaptive icons (with padding for safe zone)
  const adaptive = [
    { size: 108, name: "android-adaptive-108x108.png" },
    { size: 162, name: "android-adaptive-162x162.png" },
    { size: 216, name: "android-adaptive-216x216.png" },
    { size: 432, name: "android-adaptive-432x432.png" },
  ];

  const adaptiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
    <rect width="512" height="512" rx="112" fill="#1A6FB5"/>
    <g transform="translate(256,256)">
      <circle r="120" fill="none" stroke="white" stroke-width="24" opacity="0.9"/>
      <circle r="48" fill="white" opacity="0.95"/>
      <text y="8" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="72" fill="white" opacity="0.95">PV</text>
    </g>
  </svg>`;

  for (const { size, name } of adaptive) {
    await sharp(Buffer.from(adaptiveSvg))
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`  ${name} ✓`);
  }

  // iOS icons
  const ios = [
    { size: 20, name: "ios-icon-20x20.png" },
    { size: 29, name: "ios-icon-29x29.png" },
    { size: 40, name: "ios-icon-40x40.png" },
    { size: 58, name: "ios-icon-58x58.png" },
    { size: 60, name: "ios-icon-60x60.png" },
    { size: 76, name: "ios-icon-76x76.png" },
    { size: 80, name: "ios-icon-80x80.png" },
    { size: 87, name: "ios-icon-87x87.png" },
    { size: 120, name: "ios-icon-120x120.png" },
    { size: 152, name: "ios-icon-152x152.png" },
    { size: 167, name: "ios-icon-167x167.png" },
    { size: 180, name: "ios-icon-180x180.png" },
    { size: 1024, name: "ios-icon-1024x1024.png" },
  ];

  for (const { size, name } of ios) {
    await sharp(Buffer.from(SVG_LOGO))
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`  ${name} ✓`);
  }

  // macOS icons
  const mac = [
    { size: 16, name: "mac-icon-16x16.png" },
    { size: 32, name: "mac-icon-32x32.png" },
    { size: 64, name: "mac-icon-64x64.png" },
    { size: 128, name: "mac-icon-128x128.png" },
    { size: 256, name: "mac-icon-256x256.png" },
    { size: 512, name: "mac-icon-512x512.png" },
    { size: 1024, name: "mac-icon-1024x1024.png" },
  ];

  for (const { size, name } of mac) {
    await sharp(Buffer.from(SVG_LOGO))
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`  ${name} ✓`);
  }

  // Microsoft tiles
  const mstile = [
    { w: 70, h: 70, name: "mstile-70x70.png" },
    { w: 144, h: 144, name: "mstile-144x144.png" },
    { w: 150, h: 150, name: "mstile-150x150.png" },
    { w: 310, h: 150, name: "mstile-310x150.png" },
    { w: 310, h: 310, name: "mstile-310x310.png" },
  ];

  for (const { w, h, name } of mstile) {
    await sharp(Buffer.from(SVG_LOGO))
      .resize(w, h)
      .png()
      .toFile(join(publicDir, name));
    console.log(`  ${name} ✓`);
  }

  // Logo sizes
  const logos = [
    { size: 512, name: "logo-512x512.png" },
    { size: 1024, name: "logo-1024x1024.png" },
  ];

  for (const { size, name } of logos) {
    await sharp(Buffer.from(SVG_LOGO))
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    await sharp(Buffer.from(SVG_LOGO))
      .resize(size, size)
      .png()
      .toFile(join(assetsDir, name));
    console.log(`  ${name} ✓`);
  }

  // OG image
  await sharp(Buffer.from(SVG_OG))
    .resize(1200, 1200)
    .png()
    .toFile(join(publicDir, "og-image.png"));
  console.log("  og-image.png ✓");

  // Favicon ICO (multi-size)
  const icoSizes = [16, 32, 48];
  const icoBuffers = await Promise.all(
    icoSizes.map((s) =>
      sharp(Buffer.from(SVG_LOGO)).resize(s, s).png().toBuffer(),
    ),
  );

  // Simple ICO: write as single 32x32 PNG renamed to .ico (browsers support PNG-based ICO)
  await sharp(Buffer.from(SVG_LOGO))
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, "favicon.ico"));
  console.log("  favicon.ico ✓");

  console.log(`\nAll icons generated in ${publicDir}`);
}

generate().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
