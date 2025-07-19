import { notFound } from 'next/navigation'
import { propiedades } from '@/lib/services/propiedades'
import { PropertyDetail } from '@/components/PropertyDetail'
import { PropertyNotFound } from '@/components/PropertyNotFound'

interface PropertyPageProps {
  params: {
    slug: string
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  try {
    // Extraer el ID del slug (último segmento después del último guión)
    const idMatch = params.slug.match(/-(\d+)$/)
    if (!idMatch) {
      notFound()
    }
    
    const propertyId = parseInt(idMatch[1])
    if (isNaN(propertyId)) {
      notFound()
    }

    // Buscar la propiedad por ID
    const property = await propiedades.get(propertyId)
    
    // Si la propiedad no existe o no está activa, mostrar página de error
    if (!property || property.estado_registro?.nombre !== 'Activo') {
      return <PropertyNotFound propertyId={propertyId} />
    }

    return <PropertyDetail property={property} />
  } catch (error) {
    console.error('Error loading property:', error)
    notFound()
  }
} 