'use client'

import { useState, useEffect } from 'react'
import { generatePropertySlug } from '@/lib/utils'
import { propiedades, Propiedad } from '@/lib/services/propiedades'

export default function DebugPage() {
  const [slug, setSlug] = useState('')
  const [properties, setProperties] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const props = await propiedades.list({ per_page: 10 })
        setProperties(props)
      } catch (error) {
        console.error('Error loading properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  const generateSlugFromProperty = (property: Propiedad) => {
    const generatedSlug = generatePropertySlug({
      tipo: property.tipo_propiedad.nombre,
      dormitorios: property.dormitorios || undefined,
      barrio: property.direccion?.barrio || undefined,
      ciudad: property.direccion?.ciudad || undefined,
      id: property.id
    })
    setSlug(generatedSlug)
    console.log('Generated slug for property', property.id, ':', generatedSlug)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Debug: Propiedades Reales y Slugs
        </h1>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando propiedades...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Propiedades Disponibles ({properties.length})
              </h2>
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">
                          ID: {property.id} - {property.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Tipo: {property.tipo_propiedad.nombre} | 
                          Dormitorios: {property.dormitorios || 'N/A'} | 
                          Ubicación: {property.direccion?.barrio || property.direccion?.ciudad || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Estado: {property.estado_registro?.nombre} | 
                          Comercial: {property.estado_comercial?.nombre}
                        </p>
                      </div>
                      <button
                        onClick={() => generateSlugFromProperty(property)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ml-4"
                      >
                        Generar Slug
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {slug && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Slug Generado</h2>
                <p className="text-lg font-mono bg-gray-100 p-3 rounded-lg mb-4">
                  {slug}
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    URL completa: <span className="font-mono">/propiedad/{slug}</span>
                  </p>
                  <a
                    href={`/propiedad/${slug}`}
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Probar URL
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 