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
