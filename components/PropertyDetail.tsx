'use client'

import { useState } from 'react'
import { Propiedad } from '@/lib/services/propiedades'
import { PropertyPreviewModal } from './PropertyPreviewModal'

interface PropertyDetailProps {
  property: Propiedad
}

export function PropertyDetail({ property }: PropertyDetailProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(true)

  const handleClosePreview = () => {
    // Redirigir a la página principal cuando se cierre el preview
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyPreviewModal
        property={property}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        isAdminMode={false}
      />
    </div>
  )
} 