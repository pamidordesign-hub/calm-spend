// Builds the source images @capacitor/assets expands into native app icons
// and splash screens. Run: node scripts/gen-native-assets.mjs
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const markSvg = readFileSync(join(root, 'public', 'logo-mark.svg'), 'utf8')

// Full-bleed square for the app icon — iOS and Android apply their own mask.
const fullBleed = Buffer.from(markSvg.replace('rx="48"', 'rx="0"'))

const PAGE = '#dce1f1'
const PAGE_DARK = '#12151f'

async function icon() {
  await sharp(fullBleed).resize(1024, 1024).png().toFile(join(root, 'assets', 'icon.png'))
  console.log('wrote assets/icon.png')
}

async function splash(file, background) {
  // Rounded badge centred on the app's own background colour.
  const badge = await sharp(Buffer.from(markSvg)).resize(640, 640).png().toBuffer()
  await sharp({
    create: { width: 2732, height: 2732, channels: 4, background },
  })
    .composite([{ input: badge, gravity: 'centre' }])
    .png()
    .toFile(join(root, 'assets', file))
  console.log('wrote assets/' + file)
}

await icon()
await splash('splash.png', PAGE)
await splash('splash-dark.png', PAGE_DARK)
console.log('done')
