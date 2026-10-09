import { clear, get, set } from 'idb-keyval'
import { decodeSalt, deriveEncryptionKey, encodeSalt, encryptText, decryptText, randomBytes } from './crypto'
import type { VaultData } from '../types'

const vaultKey = 'nagrik-vault'
const pinFlag = 'nagrik-pin-enabled'

interface PlainVault {
  mode: 'plain'
  data: VaultData
}

interface EncryptedVault {
  mode: 'encrypted'
  salt: string
  iv: string
  ciphertext: string
}

type VaultRecord = PlainVault | EncryptedVault
let encryptionKey: CryptoKey | null = null

const emptyVault = (): VaultData => ({ notes: [], contacts: [], checklistTicks: [], knownArticleIds: [] })

function normalizeVaultData(data: Partial<VaultData>): VaultData {
  return {
    notes: data.notes ?? [],
    contacts: data.contacts ?? [],
    checklistTicks: data.checklistTicks ?? [],
    knownArticleIds: data.knownArticleIds ?? [],
  }
}

export function isPinEnabled(): boolean {
  return localStorage.getItem(pinFlag) === 'true'
}

export function isVaultUnlocked(): boolean {
  return !isPinEnabled() || encryptionKey !== null
}

export function lockVault(): void {
  encryptionKey = null
}

export async function enablePin(pin: string): Promise<void> {
  if (!/^\d{6,}$/.test(pin)) throw new Error('PIN must contain at least 6 digits')
  const current = await get<VaultRecord | undefined>(vaultKey)
  if (current?.mode === 'encrypted') throw new Error('A PIN is already set')
  const data = current?.mode === 'plain' ? normalizeVaultData(current.data) : emptyVault()
  const salt = randomBytes(16)
  const key = await deriveEncryptionKey(pin, salt)
  const encrypted = await encryptText(JSON.stringify(data), key)
  await set(vaultKey, {
    mode: 'encrypted',
    salt: encodeSalt(salt),
    ...encrypted,
  })
  encryptionKey = key
  localStorage.setItem(pinFlag, 'true')
}

export async function unlockVault(pin: string): Promise<void> {
  const record = await get<VaultRecord | undefined>(vaultKey)
  if (!record || record.mode !== 'encrypted') {
    throw new Error('Encrypted data is unavailable')
  }
  const key = await deriveEncryptionKey(pin, decodeSalt(record.salt))
  await decryptText(record, key)
  encryptionKey = key
}

export async function readVault(): Promise<VaultData> {
  const record = await get<VaultRecord | undefined>(vaultKey)
  if (!record) return emptyVault()
  if (record.mode === 'plain') return normalizeVaultData(record.data)
  if (!encryptionKey) throw new Error('Unlock the app to read private data')
  return normalizeVaultData(JSON.parse(await decryptText(record, encryptionKey)) as Partial<VaultData>)
}

export async function writeVault(data: VaultData): Promise<void> {
  if (isPinEnabled()) {
    if (!encryptionKey) throw new Error('Unlock the app to save private data')
    const current = await get<VaultRecord | undefined>(vaultKey)
    if (!current || current.mode !== 'encrypted') {
      throw new Error('Encrypted data is unavailable')
    }
    const encrypted = await encryptText(JSON.stringify(data), encryptionKey)
    await set(vaultKey, { mode: 'encrypted', salt: current.salt, ...encrypted })
  } else {
    await set(vaultKey, { mode: 'plain', data })
  }
}

export async function clearAllAppData(): Promise<void> {
  lockVault()
  await clear()
  localStorage.clear()
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((name) => caches.delete(name)))
  }
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  }
}
