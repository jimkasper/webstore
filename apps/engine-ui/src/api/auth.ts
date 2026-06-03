import { api } from './client'

export interface AuthResponse {
  space: SpaceProfile
  tokens: { access_token: string; refresh_token: string; expires_in: number }
}

export interface SpaceProfile {
  id: string
  handle: string
  display_name: string
  public_key: string
  is_local: boolean
  created_at: string
}

export const authApi = {
  register: (body: { handle: string; display_name?: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', body),
  login: (body: { handle: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', body),
  refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }),
  logout: (refresh_token: string) => api.del('/auth/logout', { refresh_token }),
  logoutAll: () => api.del('/auth/logout-all'),
}
