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
    let propertyId: number | null = null
    
    // Patrón 1: ID al final después del último guión
    const idMatch1 = params.slug.match(/-(\d+)$/)
    if (idMatch1) {
      propertyId = parseInt(idMatch1[1])
    }
    
    // Patrón 2: ID al final sin guión
    if (!propertyId) {
      const idMatch2 = params.slug.match(/(\d+)$/)
      if (idMatch2) {
        propertyId = parseInt(idMatch2[1])
      }
    }
    
    // Patrón 3: Buscar cualquier número en el slug
    if (!propertyId) {
      const numbers = params.slug.match(/\d+/g)
      if (numbers && numbers.length > 0) {
        propertyId = parseInt(numbers[numbers.length - 1])
      }
    }
    
    if (!propertyId || isNaN(propertyId)) {
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