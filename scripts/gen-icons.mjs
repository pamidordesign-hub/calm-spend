// Rasterizes public/logo-mark.svg into the PWA PNG icon set.
// Run: node scripts/gen-icons.mjs
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const roundedSvg = readFileSync(join(OUT, 'logo-mark.svg'))
const fullSvg = Buffer.from(readFileSync(join(OUT, 'logo-mark.svg'), 'utf8').replace('rx="48"', 'rx="0"'))

const gen = async (buf, size, name) => {
  await sharp(buf).resize(size, size).png().toFile(join(OUT, name))
  console.log('wrote', name, size)
}

await gen(roundedSvg, 192, 'pwa-192.png')
await gen(roundedSvg, 512, 'pwa-512.png')
await gen(roundedSvg, 180, 'apple-touch-icon.png')
await gen(roundedSvg, 48, 'favicon-48.png')
await gen(fullSvg, 512, 'pwa-maskable-512.png') // full-bleed for adaptive masking
console.log('done')
