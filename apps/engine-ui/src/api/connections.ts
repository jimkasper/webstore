import { api } from './client'

export interface Connection {
  id: string
  from_space_id: string | null
  to_space_id: string | null
  conn_type: string
  status: string
  created_at: string
}

export const connectionsApi = {
  follow: (handle: string) => api.post<Connection>(`/connections/follow/${handle}`),
  unfollow: (handle: string) => api.del(`/connections/follow/${handle}`),
  accept: (id: string) => api.put<Connection>(`/connections/${id}/accept`),
  reject: (id: string) => api.put<Connection>(`/connections/${id}/reject`),
  followers: (params?: { limit?: number; offset?: number }) =>
    api.get<Connection[]>(`/connections/followers?limit=${params?.limit ?? 20}&offset=${params?.offset ?? 0}`),
  following: (params?: { limit?: number; offset?: number }) =>
    api.get<Connection[]>(`/connections/following?limit=${params?.limit ?? 20}&offset=${params?.offset ?? 0}`),
}
