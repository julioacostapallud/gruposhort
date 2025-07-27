"use client"

import { useState, useEffect } from 'react'
import { useVisitas, EstadisticasVisitas } from '@/lib/services/visitas'
import { Eye, Monitor, Smartphone, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface VisitasStatsProps {
  propiedadId?: number
  showTitle?: boolean
  className?: string
}

export function VisitasStats({ propiedadId, showTitle = true, className = '' }: VisitasStatsProps) {
  const [estadisticas, setEstadisticas] = useState<EstadisticasVisitas | null>(null)
  const [loading, setLoading] = useState(true)
  const { obtenerEstadisticasPagina, obtenerEstadisticasPropiedad } = useVisitas()

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true)
        let stats: EstadisticasVisitas
        
        if (propiedadId) {
          const response = await obtenerEstadisticasPropiedad(propiedadId, 'hoy')
          stats = response.estadisticas
        } else {
          const response = await obtenerEstadisticasPagina('hoy')
          stats = response.estadisticas
        }
        
        setEstadisticas(stats)
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarEstadisticas()
  }, [propiedadId, obtenerEstadisticasPagina, obtenerEstadisticasPropiedad])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm">Cargando estadísticas...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!estadisticas) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        {showTitle && (
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Estadísticas de Visitas
          </CardTitle>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Total</span>
          </div>
          <Badge variant="secondary" className="text-sm">
            {estadisticas.visitas_totales.toLocaleString()}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-green-600" />
            <span className="text-sm">PC</span>
          </div>
          <Badge variant="outline" className="text-sm">
            {estadisticas.visitas_pc.toLocaleString()}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-purple-600" />
            <span className="text-sm">Móvil</span>
          </div>
          <Badge variant="outline" className="text-sm">
            {estadisticas.visitas_movil.toLocaleString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
} 