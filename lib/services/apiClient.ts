// lib/services/apiClient.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'https://short-backend-five.vercel.app'

export const api = {
  list: async <T = any>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_BASE}/api/${endpoint}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? res.statusText)
    }
    return res.json()
  },
  get: async <T = any>(endpoint: string, id: number | string): Promise<T> => {
    const res = await fetch(`${API_BASE}/api/${endpoint}/${id}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? res.statusText)
    }
    return res.json()
  },
  create: async <T = any>(endpoint: string, body: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? res.statusText)
    }
    return res.json()
  },
  update: async <T = any>(endpoint: string, id: number | string, body: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}/api/${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? res.statusText)
    }
    return res.json()
  },
  remove: async (endpoint: string, id: number | string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/${endpoint}/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? res.statusText)
    }
  }
}
