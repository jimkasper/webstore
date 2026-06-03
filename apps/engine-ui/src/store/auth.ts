import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SpaceProfile {
  id: string
  handle: string
  display_name: string
  public_key: string
  is_local: boolean
  created_at: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  space: SpaceProfile | null
  setTokens: (access: string, refresh: string) => void
  setSpace: (space: SpaceProfile) => void
  clear: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      space: null,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setSpace: (space) => set({ space }),
      clear: () => set({ accessToken: null, refreshToken: null, space: null }),
    }),
    { name: 'engine-auth' },
  ),
)
