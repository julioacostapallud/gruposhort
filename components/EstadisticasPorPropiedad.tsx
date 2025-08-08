'use client'
import { useState, useEffect } from 'react'
import { visitas, TopPropiedad } from '@/lib/services/visitas'
import { TrendingUp, Eye, Monitor, Smartphone, Calendar, BarChart3, Users, Target, Zap } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { OptimizedImage } from '@/components/OptimizedImage'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store/store'
import { api } from '@/lib/services/apiClient'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface EstadisticasPorPropiedadProps {
  // Props futuras si es necesario
}

export function EstadisticasPorPropiedad({}: EstadisticasPorPropiedadProps) {
  const [propiedades, setPropiedades] = useState<TopPropiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ordenamiento, setOrdenamiento] = useState<'total' | 'pc' | 'movil'>('total')
  const [datosGraficos, setDatosGraficos] = useState<{[key: number]: any}>({})
  const { properties } = useSelector((state: RootState) => state.properties)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await visitas.obtenerTopPropiedades()
      
      // Combinar datos de estadísticas con datos de propiedades de Redux
      const propiedadesConImagenes = (data.top_propiedades || []).map((topProp: TopPropiedad) => {
        const propiedadCompleta = properties.find(p => p.id === topProp.id)
        return {
          ...topProp,
          imagenes: propiedadCompleta?.imagenes || []
        }
      })
      
      setPropiedades(propiedadesConImagenes)
      
      // Cargar datos de gráficos para cada propiedad
      const graficosData: {[key: number]: any} = {}
      for (const propiedad of propiedadesConImagenes) {
        try {
          const response = await fetch(`/api/visitas/propiedad?propiedad_id=${propiedad.id}&tipo=historico`)
          if (response.ok) {
            const datos = await response.json()
            graficosData[propiedad.id] = datos
          }
        } catch (err) {
          console.error(`Error cargando gráfico para propiedad ${propiedad.id}:`, err)
        }
      }
      setDatosGraficos(graficosData)
    } catch (err: any) {
      setError(err?.message || 'Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  const ordenarPropiedades = (propiedades: TopPropiedad[]) => {
    return [...propiedades].sort((a, b) => {
      switch (ordenamiento) {
        case 'total':
          return b.visitas_totales - a.visitas_totales
        case 'pc':
          return b.visitas_pc - a.visitas_pc
        case 'movil':
          return b.visitas_movil - a.visitas_movil
        default:
          return b.visitas_totales - a.visitas_totales
      }
    })
  }

  const propiedadesOrdenadas = ordenarPropiedades(propiedades)

  const generarDatosGrafico = (datos: any[], propiedadId: number) => {
    if (!datos || datos.length === 0) return null
    
    const fechas = datos.map((item: any) => new Date(item.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }))
    const visitasTotales = datos.map((item: any) => item.visitas_totales || 0)
    const visitasPC = datos.map((item: any) => item.visitas_pc || 0)
    const visitasMovil = datos.map((item: any) => item.visitas_movil || 0)
    
    return {
      labels: fechas,
      datasets: [
        {
          label: 'Visitas Totales',
          data: visitasTotales,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Visitas PC',
          data: visitasPC,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Visitas Móvil',
          data: visitasMovil,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: 'rgb(239, 68, 68)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    }
  }

  const generarOpcionesGrafico = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 10,
              weight: '600'
            }
          }
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: function(context: any) {
              return `Fecha: ${context[0].label}`
            },
            label: function(context: any) {
              return `${context.dataset.label}: ${context.parsed.y} visitas`
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Fecha',
            font: {
              size: 10,
              weight: '600'
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            maxRotation: 45,
            minRotation: 0,
            font: {
              size: 8
            }
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Visitas',
            font: {
              size: 10,
              weight: '600'
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0,
            font: {
              size: 8
            }
          }
        }
      },
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false
      },
      elements: {
        point: {
          hoverRadius: 6
        }
      }
    }
  }

  const calcularMetricas = (propiedad: TopPropiedad) => {
    const datos = datosGraficos[propiedad.id]
    if (!datos || !datos.datos || datos.datos.length === 0) {
      return {
        tendencia: 'neutral',
        crecimiento: 0,
        promedio: 0,
        maximo: 0,
        minimo: 0
      }
    }

    const visitas = datos.datos.map((item: any) => item.visitas_totales || 0)
    const promedio = visitas.reduce((a: number, b: number) => a + b, 0) / visitas.length
    const maximo = Math.max(...visitas)
    const minimo = Math.min(...visitas)
    
    // Calcular tendencia (últimos 3 días vs anteriores 3 días)
    if (visitas.length >= 6) {
      const ultimos3 = visitas.slice(-3)
      const anteriores3 = visitas.slice(-6, -3)
      const promUltimos3 = ultimos3.reduce((a: number, b: number) => a + b, 0) / ultimos3.length
      const promAnteriores3 = anteriores3.reduce((a: number, b: number) => a + b, 0) / anteriores3.length
      const crecimiento = promAnteriores3 > 0 ? ((promUltimos3 - promAnteriores3) / promAnteriores3) * 100 : 0
      
      return {
        tendencia: crecimiento > 10 ? 'up' : crecimiento < -10 ? 'down' : 'neutral',
        crecimiento: Math.round(crecimiento),
        promedio: Math.round(promedio),
        maximo,
        minimo
      }
    } else {
      // Si no hay suficientes datos, calcular tendencia simple
      const mitad = Math.floor(visitas.length / 2)
      const primeraMitad = visitas.slice(0, mitad)
      const segundaMitad = visitas.slice(mitad)
      
      const promPrimera = primeraMitad.reduce((a: number, b: number) => a + b, 0) / primeraMitad.length
      const promSegunda = segundaMitad.reduce((a: number, b: number) => a + b, 0) / segundaMitad.length
      const crecimiento = promPrimera > 0 ? ((promSegunda - promPrimera) / promPrimera) * 100 : 0
      
      return {
        tendencia: crecimiento > 10 ? 'up' : crecimiento < -10 ? 'down' : 'neutral',
        crecimiento: Math.round(crecimiento),
        promedio: Math.round(promedio),
        maximo,
        minimo
      }
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={cargarEstadisticas}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header con controles */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Top Propiedades por Visitas (Últimos 30 días)
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value as 'total' | 'pc' | 'movil')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="total">Total</option>
              <option value="pc">PC</option>
              <option value="movil">Móvil</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de cards con gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {propiedadesOrdenadas.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay datos de visitas disponibles</p>
          </div>
        ) : (
          propiedadesOrdenadas.map((propiedad, index) => {
            const metricas = calcularMetricas(propiedad)
            const datosGrafico = generarDatosGrafico(datosGraficos[propiedad.id]?.datos || [], propiedad.id)
            
            return (
              <div
                key={propiedad.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header de la card */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Ranking y foto */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        {propiedad.imagenes && propiedad.imagenes.length > 0 ? (
                          <OptimizedImage
                            src={propiedad.imagenes[0].url}
                            alt={propiedad.titulo}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            priority={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Sin imagen
                          </div>
                        )}
                      </div>
                      <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        #{index + 1}
                      </div>
                    </div>
                  </div>

                  {/* Título y métricas principales */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                      {propiedad.titulo}
                    </h4>
                    
                    {/* Métricas principales */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-xs font-medium">Total</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {propiedad.visitas_totales}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                          <Monitor className="h-3 w-3" />
                          <span className="text-xs font-medium">PC</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {propiedad.visitas_pc}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                          <Smartphone className="h-3 w-3" />
                          <span className="text-xs font-medium">Móvil</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {propiedad.visitas_movil}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gráfico */}
                {datosGrafico && (
                  <div className="mb-4">
                    <div className="h-48">
                      <Line
                        data={datosGrafico}
                        options={generarOpcionesGrafico()}
                      />
                    </div>
                  </div>
                )}

                {/* Métricas adicionales para toma de decisiones */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                      <Target className="h-4 w-4" />
                      <span className="text-xs font-medium">Tendencia</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {metricas.tendencia === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {metricas.tendencia === 'down' && <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />}
                      {metricas.tendencia === 'neutral' && <BarChart3 className="h-4 w-4 text-gray-600" />}
                      <span className={`text-sm font-bold ${
                        metricas.tendencia === 'up' ? 'text-green-600' : 
                        metricas.tendencia === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metricas.crecimiento > 0 ? '+' : ''}{metricas.crecimiento}%
                      </span>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-medium">Promedio</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {metricas.promedio} visitas/día
                    </p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <Zap className="h-4 w-4" />
                      <span className="text-xs font-medium">Máximo</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {metricas.maximo} visitas
                    </p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs font-medium">Mínimo</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {metricas.minimo} visitas
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 text-blue-700 mb-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Información</span>
        </div>
        <p className="text-sm text-blue-600">
          Las estadísticas muestran las visitas de los últimos 30 días. 
          Se excluyen visitas duplicadas del mismo dispositivo en un período de 24 horas.
        </p>
      </div>
    </div>
  )
} 