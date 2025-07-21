import { api } from './apiClient'

export const solicitudes = {
  // Tasación
  crearTasacion: (data: { nombre: string, email: string, telefono: string, mensaje: string }) =>
    api.create('solicitudes-tasacion', data),
  listarTasaciones: () =>
    api.list('solicitudes-tasacion'),
  marcarTasacionAtendida: (id: number) =>
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/solicitudes-tasacion`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(r => r.json()),

  // Vender o Alquilar
  crearVenderAlquilar: (data: { nombre: string, email: string, telefono?: string, mensaje?: string }) =>
    api.create('solicitudes-vender-alquilar', data),
  listarVenderAlquilar: () =>
    api.list('solicitudes-vender-alquilar'),
  marcarVenderAlquilarAtendida: (id: number) =>
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/solicitudes-vender-alquilar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(r => r.json()),
} 