import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera un slug SEO friendly para una propiedad.
 * Ejemplo: casa-3-dormitorios-resistencia-centro-123
 */
export function generatePropertySlug(property: Propiedad): string {
  if (!property.titulo) {
    return `propiedad-${property.id}`
  }
  
  const baseSlug = property.titulo
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  return `${baseSlug}-${property.id}`
}

/**
 * Genera la URL completa de una propiedad.
 * Ejemplo: https://www.gruposhort.com.ar/propiedad/casa-3-dormitorios-resistencia-centro-123
 */
export function generatePropertyUrl(property: Propiedad): string {
  const slug = generatePropertySlug(property)
  return `https://gruposhort.com.ar/propiedad/${slug}`
}
