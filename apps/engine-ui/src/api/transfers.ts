import { api } from './client'

export interface Transfer {
  id: string
  from_space_id: string
  to_space_id: string | null
  status: string
  expires_at: string
  created_at: string
}

export const transfersApi = {
  create: (body: { to_handle?: string; to_ap_actor?: string; payload: unknown; ttl_hours?: number }) =>
    api.post<Transfer>('/transfers', body),
  get: (id: string) => api.get<Transfer>(`/transfers/${id}`),
  accept: (id: string) => api.put(`/transfers/${id}/accept`),
  cancel: (id: string) => api.del(`/transfers/${id}`),
}
