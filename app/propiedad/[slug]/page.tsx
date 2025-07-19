import { notFound } from 'next/navigation'
import { propiedades } from '@/lib/services/propiedades'

interface PropertyPageProps {
  params: {
    slug: string
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  try {
    // Extraer el ID del slug (último segmento después del último guión)
    console.log('Slug received:', params.slug)
    
    // Intentar diferentes patrones para extraer el ID
    let propertyId: number | null = null
    
    // Patrón 1: ID al final después del último guión
    const idMatch1 = params.slug.match(/-(\d+)$/)
    if (idMatch1) {
      propertyId = parseInt(idMatch1[1])
      console.log('ID found with pattern 1:', propertyId)
    }
    
    // Patrón 2: ID al final sin guión
    if (!propertyId) {
      const idMatch2 = params.slug.match(/(\d+)$/)
      if (idMatch2) {
        propertyId = parseInt(idMatch2[1])
        console.log('ID found with pattern 2:', propertyId)
      }
    }
    
    // Patrón 3: Buscar cualquier número en el slug
    if (!propertyId) {
      const numbers = params.slug.match(/\d+/g)
      if (numbers && numbers.length > 0) {
        propertyId = parseInt(numbers[numbers.length - 1])
        console.log('ID found with pattern 3:', propertyId)
      }
    }
    
    if (!propertyId || isNaN(propertyId)) {
      console.log('No valid ID found in slug:', params.slug)
      notFound()
    }

    console.log('Looking for property ID:', propertyId)

    // Buscar la propiedad por ID
    const property = await propiedades.get(propertyId)
    
    // Debug: mostrar información de la propiedad
    console.log('Property found:', property)
    console.log('Estado registro:', property?.estado_registro)
    
    // Si la propiedad no existe, mostrar página de error simple
    if (!property) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Propiedad no encontrada
            </h1>
            <p className="text-gray-600 mb-4">
              ID: {propertyId}
            </p>
            <p className="text-gray-600">
              La propiedad con ID {propertyId} no existe en nuestra base de datos.
            </p>
          </div>
        </div>
      )
    }

    // Mostrar información básica de la propiedad
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {property.titulo}
          </h1>
          <p className="text-xl text-blue-600 mb-4">
            {property.precio} {property.moneda?.simbolo}
          </p>
          <p className="text-gray-600 mb-4">
            {property.direccion?.calle} {property.direccion?.numero}, {property.direccion?.ciudad}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <p>Estado Registro: {property.estado_registro?.nombre}</p>
            <p>Estado Comercial: {property.estado_comercial?.nombre}</p>
            <p>Estado Situación: {property.estado_situacion?.nombre}</p>
            <p>Estado Físico: {property.estado_fisico?.nombre}</p>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading property:', error)
    notFound()
  }
} 