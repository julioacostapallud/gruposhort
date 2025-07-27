"use client"

import { useEffect } from 'react'
import { useVisitas } from '@/lib/services/visitas'

interface VisitaTrackerProps {
  propiedadId: number
}

export function VisitaTracker({ propiedadId }: VisitaTrackerProps) {
  const { registrarVisitaPropiedad } = useVisitas()

  useEffect(() => {
    // Registrar visita a la propiedad cuando el componente se monta
    registrarVisitaPropiedad(propiedadId)
  }, [propiedadId, registrarVisitaPropiedad])

  // Este componente no renderiza nada visible
  return null
} 