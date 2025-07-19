'use client'

import { useState, useEffect } from 'react'
import { propiedades } from '@/lib/services/propiedades'
import { Propiedad } from '@/lib/services/propiedades'
import { PropertyCard } from './property-card'
import { Button } from './ui/button'
import { ArrowLeft, Home, Search, Phone, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface PropertyNotFoundProps {
  propertyId: number
}

export function PropertyNotFound({ propertyId }: PropertyNotFoundProps) {
  const [similarProperties, setSimilarProperties] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar propiedades similares (últimas 6 propiedades activas)
    const loadSimilarProperties = async () => {
      try {
        const properties = await propiedades.list({ 
          estado_registro: 1, // Activo
          per_page: 6 
        })
        setSimilarProperties(properties)
      } catch (error) {
        console.error('Error loading similar properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSimilarProperties()
  }, [])

  const formatPrice = (price: string, moneda: any) => {
    const numPrice = parseFloat(price)
    const symbol = moneda?.simbolo || '$'
    return `${symbol}${numPrice.toLocaleString('es-AR')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Propiedad no disponible
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              La propiedad que estás buscando ya no está disponible o ha sido removida de nuestro catálogo.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/">
              <Button className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Ver todas las propiedades
              </Button>
            </Link>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ¿Buscas algo similar?
            </h2>
            <p className="text-gray-600 mb-4">
              Nuestro equipo puede ayudarte a encontrar la propiedad perfecta para ti.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="https://wa.me/5493624727330?text=Hola! Estoy buscando una propiedad similar. ¿Podrían ayudarme?"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Consultar por WhatsApp
              </a>
              <a 
                href="tel:3624727330"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                Llamar ahora
              </a>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Propiedades similares que te pueden interesar
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : similarProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  image={typeof property.imagenes?.[0] === 'string' ? property.imagenes[0] : property.imagenes?.[0]?.url || "/placeholder.svg"}
                  price={formatPrice(property.precio, property.moneda)}
                  beds={property.dormitorios || 0}
                  baths={property.banos || 0}
                  sqft={`${property.superficie_m2 || 0}m²`}
                  address={property.direccion?.calle || ''}
                  city={property.direccion?.ciudad || ''}
                  status={property.estado_comercial?.nombre || ''}
                  daysAgo={formatDate(property.fecha_publicacion)}
                  onClick={() => {
                    // Aquí podríamos abrir el preview de la propiedad
                    console.log('Property clicked:', property.id)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay propiedades similares disponibles en este momento.</p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="text-center">
          <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ¿No encuentras lo que buscas?
            </h3>
            <p className="text-gray-600 mb-6">
              Déjanos saber qué tipo de propiedad necesitas y te ayudaremos a encontrarla.
            </p>
            <a 
              href="https://wa.me/5493624727330?text=Hola! Estoy buscando una propiedad específica. ¿Podrían ayudarme a encontrarla?"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contactar asesor
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 