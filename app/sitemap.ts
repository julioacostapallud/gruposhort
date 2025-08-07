import { MetadataRoute } from 'next'
import { propiedades } from '@/lib/services/propiedades'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gruposhort.com.ar'
  
  // Páginas estáticas
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tasaciones`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]

  try {
    // Obtener todas las propiedades activas
    const propiedadesList = await propiedades.list()
    const activeProperties = propiedadesList.filter(prop => {
      const estadoActivo = ['Activo', 'Activa', 'Disponible', 'Publicado', 'Vigente']
      return estadoActivo.includes(prop.estado_registro?.nombre)
    })

    // Generar URLs para propiedades activas con slugs optimizados
    const propertyPages = activeProperties.map(prop => {
      const slug = prop.titulo
        ?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() || `propiedad-${prop.id}`
      
      return {
        url: `${baseUrl}/propiedad/${slug}-${prop.id}`,
        lastModified: new Date(prop.fecha_actualizacion || prop.fecha_publicacion),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    })

    return [...staticPages, ...propertyPages]
  } catch (error) {
    console.error('Error generando sitemap:', error)
    return staticPages
  }
} 