'use client'

import { useState, useEffect } from 'react'
import { propiedades } from '@/lib/services/propiedades'

export default function EstadosPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const props = await propiedades.list({ per_page: 20 })
        setProperties(props)
      } catch (error) {
        console.error('Error loading properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Estados de Propiedades
        </h1>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando propiedades...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Propiedades y sus Estados ({properties.length})
            </h2>
            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">
                        ID: {property.id} - {property.titulo}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Tipo: {property.tipo_propiedad?.nombre}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Estado Registro:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          property.estado_registro?.nombre === 'Activo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {property.estado_registro?.nombre || 'N/A'}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Estado Comercial:</span> 
                        <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {property.estado_comercial?.nombre || 'N/A'}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Estado Situación:</span> 
                        <span className="ml-2 px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                          {property.estado_situacion?.nombre || 'N/A'}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Estado Físico:</span> 
                        <span className="ml-2 px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                          {property.estado_fisico?.nombre || 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 