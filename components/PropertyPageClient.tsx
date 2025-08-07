'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/lib/store/hooks'
import { setSelectedProperty } from '@/lib/store/propertiesSlice'
import { PropertyDetail } from './PropertyDetail'
import { Propiedad } from '@/lib/services/propiedades'

interface PropertyPageClientProps {
  property: Propiedad
}

export function PropertyPageClient({ property }: PropertyPageClientProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Cuando se carga la página de propiedad, seleccionarla en Redux
  useEffect(() => {
    dispatch(setSelectedProperty(property))
  }, [dispatch, property])

  // Función para volver a la página principal
  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Botón para volver */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={handleBackToHome}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a propiedades
        </button>
      </div>
      
      {/* Detalle de la propiedad */}
      <PropertyDetail property={property} />
    </div>
  )
} 