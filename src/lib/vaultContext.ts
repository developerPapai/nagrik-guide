import { createContext } from 'react'

export interface VaultContextValue {
  pinEnabled: boolean
  locked: boolean
  unlock: (pin: string) => Promise<void>
  setPin: (pin: string) => Promise<void>
  lock: () => void
  reset: () => void
}

export const VaultContext = createContext<VaultContextValue | null>(null)
