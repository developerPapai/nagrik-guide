const encoder = new TextEncoder()
const decoder = new TextDecoder()
export const PBKDF2_ITERATIONS = 210_000

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

export function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(length))
}

export async function deriveEncryptionKey(pin: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  if (!/^\d{6,}$/.test(pin)) throw new Error('PIN must contain at least 6 digits')
  const material = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptText(plaintext: string, key: CryptoKey): Promise<{ iv: string; ciphertext: string }> {
  const iv = randomBytes(12)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plaintext))
  return { iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)) }
}

export async function decryptText(
  encrypted: { iv: string; ciphertext: string },
  key: CryptoKey,
): Promise<string> {
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(encrypted.iv) },
    key,
    fromBase64(encrypted.ciphertext),
  )
  return decoder.decode(plaintext)
}

export function encodeSalt(salt: Uint8Array): string {
  return toBase64(salt)
}

export function decodeSalt(salt: string): Uint8Array<ArrayBuffer> {
  return fromBase64(salt)
}
