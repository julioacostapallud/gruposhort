import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera un slug SEO friendly para una propiedad.
 * Ejemplo: casa-3-dormitorios-resistencia-centro-123
 */
export function generatePropertySlug({
  tipo,
  dormitorios,
  barrio,
  ciudad,
  id
}: {
  tipo: string
  dormitorios?: number
  barrio?: string
  ciudad?: string
  id: number | string
}): string {
  // Normaliza y limpia los textos
  const slugify = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/--+/g, '-');

  const parts = [
    tipo,
    dormitorios ? `${dormitorios}-dormitorios` : undefined,
    barrio || ciudad,
    id
  ].filter(Boolean).map(x => slugify(String(x)));

  return parts.join('-');
}

/**
 * Genera la URL completa de una propiedad.
 * Ejemplo: https://www.gruposhort.com.ar/propiedad/casa-3-dormitorios-resistencia-centro-123
 */
export function generatePropertyUrl(property: any, baseUrl?: string): string {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://www.gruposhort.com.ar');
  
  const slug = generatePropertySlug({
    tipo: property.tipo_propiedad?.nombre || 'propiedad',
    dormitorios: property.dormitorios,
    barrio: property.direccion?.barrio,
    ciudad: property.direccion?.ciudad,
    id: property.id
  });
  
  return `${origin}/propiedad/${slug}`;
}
