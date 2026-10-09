import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const resourceFiles = [
  'drawable-v24/ic_launcher_foreground.xml',
  'mipmap-anydpi/ic_launcher.xml',
  'mipmap-anydpi-v26/ic_launcher.xml',
  'mipmap-anydpi-v26/ic_launcher_round.xml',
  'values/ic_launcher_background.xml',
]
const sourceRoot = resolve('android-icon-resources')
const targetRoot = resolve('android/app/src/main/res')

if (!existsSync(targetRoot)) {
  throw new Error('Android resources not found. Run `npx cap add android` first.')
}

for (const resourceFile of resourceFiles) {
  const source = resolve(sourceRoot, resourceFile)
  const target = resolve(targetRoot, resourceFile)
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(source, target)
}
