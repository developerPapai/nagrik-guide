import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const root = process.cwd()
const scanRoots = [join(root, 'src'), join(root, 'public')]
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.svg'])
const failures: string[] = []

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return extensions.has(extname(entry.name)) ? [path] : []
  })
}

for (const directory of scanRoots) {
  for (const path of sourceFiles(directory)) {
    const source = readFileSync(path, 'utf8')
      .replace(/xmlns(?::[\w-]+)?="https?:\/\/www\.w3\.org\/[^"]+"/g, '')
    const location = relative(root, path)
    if (/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/.test(source)) {
      failures.push(`${location}: direct network APIs are not allowed`)
    }
    if (/https?:\/\/[^\s"'<>]+/i.test(source)) {
      failures.push(`${location}: external URLs are not allowed`)
    }
  }
}

const html = readFileSync(join(root, 'index.html'), 'utf8')
if (!/connect-src\s+'none'/.test(html)) failures.push('index.html: CSP must set connect-src none')

const manifest = readFileSync(join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'), 'utf8')
if (/android\.permission\.INTERNET/i.test(manifest)) {
  failures.push('AndroidManifest.xml: INTERNET permission must not be present')
}
if (!/android:allowBackup="false"/.test(manifest)) {
  failures.push('AndroidManifest.xml: allowBackup must be false')
}
if (!/android:usesCleartextTraffic="false"/.test(manifest)) {
  failures.push('AndroidManifest.xml: cleartext traffic must be disabled')
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'))
  process.exitCode = 1
} else {
  console.log('Offline checks passed: no external URLs or direct network APIs; CSP and Android permissions are hardened.')
}
