import { notFound } from 'next/navigation'
import { propiedades } from '@/lib/services/propiedades'
import { PropertyDetail } from '@/components/PropertyDetail'
import { PropertyNotFound } from '@/components/PropertyNotFound'
import { VisitaTracker } from '@/components/VisitaTracker'

interface PropertyPageProps {
  params: {
    slug: string
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  try {
    // Await params para cumplir con Next.js 15
    const { slug } = await params
    
    // Extraer el ID del slug (último segmento después del último guión)
    let propertyId: number | null = null
    
    // Patrón 1: ID al final después del último guión
    const idMatch1 = slug.match(/-(\d+)$/)
    if (idMatch1) {
      propertyId = parseInt(idMatch1[1])
    }
    
    // Patrón 2: ID al final sin guión
    if (!propertyId) {
      const idMatch2 = slug.match(/(\d+)$/)
      if (idMatch2) {
        propertyId = parseInt(idMatch2[1])
      }
    }
    
    // Patrón 3: Buscar cualquier número en el slug
    if (!propertyId) {
      const numbers = slug.match(/\d+/g)
      if (numbers && numbers.length > 0) {
        propertyId = parseInt(numbers[numbers.length - 1])
      }
    }
    
    if (!propertyId || isNaN(propertyId)) {
      notFound()
    }

    // Buscar la propiedad por ID
    const property = await propiedades.get(propertyId)
    
    // Debug: mostrar información de la propiedad
    console.log('Property found:', property)
    console.log('Estado registro:', property?.estado_registro)
    console.log('Estado registro nombre:', property?.estado_registro?.nombre)
    
    // Si la propiedad no existe, mostrar página de error
    if (!property) {
      return <PropertyNotFound propertyId={propertyId} />
    }
    
    // Si la propiedad no está activa, mostrar página de error
    const estadoActivo = ['Activo', 'Activa', 'Disponible', 'Publicado', 'Vigente']
    if (!estadoActivo.includes(property.estado_registro?.nombre)) {
      console.log('Property not active, estado:', property.estado_registro?.nombre)
      return <PropertyNotFound propertyId={propertyId} />
    }

    return (
      <>
        <VisitaTracker propiedadId={propertyId} />
        <PropertyDetail property={property} />
      </>
    )
  } catch (error) {
    console.error('Error loading property:', error)
    notFound()
  }
} 