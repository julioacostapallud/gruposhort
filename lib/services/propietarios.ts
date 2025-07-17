// lib/services/propietarios.ts
import { api } from './apiClient';

export interface Propietario {
  id: number;
  nombre_completo: string;
  tipo_documento_id: number;
  numero_documento: string;
  email: string | null;
  telefono: string | null;
  direccion_id: number | null;
  // añade más campos si tienes auditoría...
}
export interface NewPropietario {
  nombre_completo: string;
  tipo_documento_id: number;
  numero_documento: string;
  email?: string;
  telefono?: string;
  direccion_id?: number;
}

export const propietarios = {
  list: () => api<Propietario[]>('/api/propietarios'),
  get: (id: number) => api<Propietario>(`/api/propietarios/${id}`),
  create: (data: NewPropietario) =>
    api<Propietario>('/api/propietarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<NewPropietario>) =>
    api<Propietario>(`/api/propietarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    api<{ deleted: number }>(`/api/propietarios/${id}`, {
      method: 'DELETE',
    }),
};
