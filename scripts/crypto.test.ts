import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decodeSalt, deriveEncryptionKey, encryptText, decryptText, randomBytes } from '../src/lib/crypto'

test('AES-GCM encrypts and decrypts data with a derived key', async () => {
  const pin = '271804'
  const salt = randomBytes(16)
  const key = await deriveEncryptionKey(pin, salt)
  const original = JSON.stringify({ message: 'offline private note' })
  const encrypted = await encryptText(original, key)

  assert.notEqual(encrypted.ciphertext, original)
  assert.equal(await decryptText(encrypted, key), original)
  assert.equal(decodeSalt(Buffer.from(salt).toString('base64')).length, 16)
})

test('AES-GCM rejects a wrong PIN-derived key', async () => {
  const salt = randomBytes(16)
  const key = await deriveEncryptionKey('271804', salt)
  const wrongKey = await deriveEncryptionKey('817204', salt)
  const encrypted = await encryptText('private', key)

  await assert.rejects(decryptText(encrypted, wrongKey))
})
