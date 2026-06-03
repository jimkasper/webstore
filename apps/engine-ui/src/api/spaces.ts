import { api } from './client'
import type { SpaceProfile } from './auth'

export const spacesApi = {
  getMe: () => api.get<SpaceProfile>('/me'),
  updateMe: (display_name: string) => api.put<SpaceProfile>('/me', { display_name }),
  deleteMe: () => api.del('/me'),
  getByHandle: (handle: string) => api.get<SpaceProfile>(`/spaces/${handle}`),
}
