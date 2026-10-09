import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { isPinEnabled, lockVault, unlockVault, enablePin, isVaultUnlocked } from './storage'
import { VaultContext, type VaultContextValue } from './vaultContext'

export function VaultProvider({ children }: { children: ReactNode }) {
  const [pinEnabled, setPinEnabled] = useState(isPinEnabled)
  const [unlocked, setUnlocked] = useState(isVaultUnlocked)

  useEffect(() => {
    if (!pinEnabled || !unlocked) return
    let timeout: number | undefined
    const scheduleLock = () => {
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        lockVault()
        setUnlocked(false)
      }, 60_000)
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') scheduleLock()
      else window.clearTimeout(timeout)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    let removeAppListener: (() => void) | undefined
    let disposed = false
    if (Capacitor.isNativePlatform()) {
      void CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) window.clearTimeout(timeout)
        else scheduleLock()
      })
        .then((listener) => {
          if (disposed) {
            void listener.remove()
          } else {
            removeAppListener = () => { void listener.remove() }
          }
        })
        .catch((error: unknown) => {
          console.error('Unable to subscribe to native app state changes', error)
        })
    }
    return () => {
      disposed = true
      window.clearTimeout(timeout)
      document.removeEventListener('visibilitychange', handleVisibility)
      removeAppListener?.()
    }
  }, [pinEnabled, unlocked])

  const value = useMemo<VaultContextValue>(() => ({
    pinEnabled,
    locked: pinEnabled && !unlocked,
    async unlock(pin) {
      await unlockVault(pin)
      setUnlocked(true)
    },
    async setPin(pin) {
      await enablePin(pin)
      setPinEnabled(true)
      setUnlocked(true)
    },
    lock() {
      lockVault()
      setUnlocked(false)
    },
    reset() {
      lockVault()
      setPinEnabled(false)
      setUnlocked(true)
    },
  }), [pinEnabled, unlocked])

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
}
