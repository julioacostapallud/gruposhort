// lib/services/propiedades.ts
import { api } from './apiClient';

export interface Catalogo { id: number; nombre: string; }
export interface Moneda { id: number; nombre: string; codigo_iso: string; simbolo: string; }
export interface Direccion { /* define según lo que devuelve tu backend */ }

export interface Propiedad {
  id: number;
  tipo_propiedad: Catalogo;
  estado_comercial: Catalogo;
  estado_situacion: Catalogo;
  estado_registro: Catalogo;
  estado_fisico: Catalogo;
  titulo: string;
  descripcion: string | null;
  precio: string;
  superficie_m2: string | null;
  dormitorios: number | null;
  banos: number | null;
  direccion: {
    id: number;
    calle: string;
    numero: string;
    piso: string | null;
    departamento: string | null;
    ciudad: string;
    provincia: string;
    codigo_postal: string;
  } | null;
  moneda: Moneda;
  fecha_publicacion: string;
  fecha_actualizacion: string;
  imagenes: string[];
  caracteristicas: Catalogo[];
  propietarios: Array<{
    id: number;
    nombre_completo: string;
    email: string | null;
    telefono: string | null;
  }>;
}

export interface NewPropiedad {
  tipo_propiedad_id: number;
  estado_comercial_id: number;
  estado_situacion_id: number;
  estado_registro_id: number;
  estado_fisico_id: number;
  titulo: string;
  descripcion?: string;
  precio: number;
  superficie_m2?: number;
  dormitorios?: number;
  banos?: number;
  direccion_id?: number;
  id_moneda: number;
  caracteristicas?: ({ id?: number; nombre?: string })[];
  propietarios?: ({ id: number })[];
  // Campos de dirección completa
  provincia_id?: number;
  ciudad_id?: number;
  calle?: string;
  numero?: string;
  piso?: string;
  departamento?: string;
}

type FilterProps = {
  tipo_propiedad?: number;
  estado_comercial?: number;
  estado_situacion?: number;
  estado_registro?: number;
  estado_fisico?: number;
  min_precio?: number;
  max_precio?: number;
  min_superficie?: number;
  max_superficie?: number;
  page?: number;
  per_page?: number;
  caracteristicas?: number[];
  propietarios?: number[];
};

function toQuery(filters?: FilterProps) {
  if (!filters) return '';
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v == null) return;
    if (Array.isArray(v)) v.forEach(x => q.append(k, String(x)));
    else q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const propiedades = {
  // listado con filtros opcionales
  list: (filters?: FilterProps) =>
    api.list<Propiedad[]>(`propiedades${toQuery(filters)}`),

  // obtener 1 por id
  get: (id: number) =>
    api.get<Propiedad>('propiedades', id),

  // crea y devuelve sólo el nuevo id
  create: (data: NewPropiedad) =>
    api.create<{ id: number }>('propiedades', data),

  // edita
  update: (id: number, data: Partial<NewPropiedad>) =>
    api.update<Propiedad>('propiedades', id, data),

  // borra
  remove: (id: number) =>
    api.remove('propiedades', id),

  // subir imágenes: ahora acepta URLs de Cloudinary
  uploadImages: (propiedadId: number, imagenes: Array<{ url: string }>) => {
    return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')}/api/propiedades/${propiedadId}/imagenes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imagenes }),
    }).then(async res => {
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<Array<{ id: number; url: string; orden: number }>>;
    });
  },

  // obtener imágenes de una propiedad
  getImages: (propiedadId: number) =>
    api.get<Array<{ id: number; url: string; orden: number }>>('propiedades', `${propiedadId}/imagenes`),

  // actualizar imágenes de una propiedad
  updateImages: (propiedadId: number, imagenes: Array<{ url: string }>) => {
    return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')}/api/propiedades/${propiedadId}/imagenes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imagenes }),
    }).then(async res => {
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<Array<{ id: number; url: string; orden: number }>>;
    });
  },

  // eliminar todas las imágenes de una propiedad
  deleteImages: (propiedadId: number) =>
    api.remove('propiedades', `${propiedadId}/imagenes`),
};
