const failuresKey = 'nagrik-pin-failures'
const nextAttemptKey = 'nagrik-pin-next-at'
const delays = [5, 30, 120]

export function remainingPinDelay(): number {
  const nextAttempt = Number(localStorage.getItem(nextAttemptKey) ?? 0)
  return Math.max(0, Math.ceil((nextAttempt - Date.now()) / 1000))
}

export function registerFailedPinAttempt(): number {
  const failures = Number(localStorage.getItem(failuresKey) ?? 0) + 1
  const delay = delays[Math.min(failures - 1, delays.length - 1)]
  localStorage.setItem(failuresKey, String(failures))
  localStorage.setItem(nextAttemptKey, String(Date.now() + delay * 1000))
  return delay
}

export function clearFailedPinAttempts(): void {
  localStorage.removeItem(failuresKey)
  localStorage.removeItem(nextAttemptKey)
}
