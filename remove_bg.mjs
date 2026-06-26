import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const input = './logo-wiw.png';
const output = './public/logo-wiw.png';

// Read original image (the one with white background)
const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixels = new Uint8ClampedArray(data);
const { width, height, channels } = info;

// Remove white/near-white background
for (let i = 0; i < pixels.length; i += channels) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];

  // If pixel is white or near-white (threshold: 235)
  if (r > 235 && g > 235 && b > 235) {
    pixels[i + 3] = 0; // full transparent
  }
}

await sharp(pixels, { raw: { width, height, channels } })
  .png()
  .toFile(output);

console.log('✅ Background removed successfully! Saved to', output);
