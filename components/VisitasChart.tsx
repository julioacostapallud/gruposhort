'use client'

import { useEffect, useState } from 'react'
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
import { visitas } from '@/lib/services/visitas'
import { Spinner } from '@/components/ui/spinner'

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

interface VisitaHistorica {
  fecha: string
  visitas_totales: number
  visitas_pc: number
  visitas_movil: number
}

export function VisitasChart() {
  const [datos, setDatos] = useState<VisitaHistorica[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/visitas?tipo=historico`)
        const data = await response.json()
        
        if (data.tipo === 'historico' && Array.isArray(data.datos)) {
          setDatos(data.datos)
        } else {
          setError('Formato de datos inválido')
        }
      } catch (err) {
        console.error('Error cargando datos de visitas:', err)
        setError('Error al cargar los datos de visitas')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" color="primary" showText text="Cargando datos de visitas..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (datos.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-600 font-medium">No hay datos de visitas disponibles</p>
      </div>
    )
  }

  // Preparar datos para el gráfico
  const labels = datos.map(item => {
    const fecha = new Date(item.fecha)
    return fecha.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  })

  const visitasTotales = datos.map(item => item.visitas_totales)
  const visitasPC = datos.map(item => item.visitas_pc)
  const visitasMovil = datos.map(item => item.visitas_movil)

  const chartData = {
    labels,
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
        pointRadius: 6,
        pointHoverRadius: 8
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        text: 'Evolución de Visitas a la Página',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
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
            size: 14,
            weight: '600'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Cantidad de Visitas',
          font: {
            size: 14,
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
          precision: 0
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
        hoverRadius: 8
      }
    }
  }

  // Calcular estadísticas
  const totalVisitas = visitasTotales.reduce((sum, val) => sum + val, 0)
  const promedioVisitas = totalVisitas / datos.length
  const maxVisitas = Math.max(...visitasTotales)
  const minVisitas = Math.min(...visitasTotales)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-blue-600 font-medium">Total Visitas</p>
          <p className="text-2xl font-bold text-blue-700">{totalVisitas}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-green-600 font-medium">Promedio</p>
          <p className="text-2xl font-bold text-green-700">{promedioVisitas.toFixed(1)}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-sm text-yellow-600 font-medium">Máximo</p>
          <p className="text-2xl font-bold text-yellow-700">{maxVisitas}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-sm text-red-600 font-medium">Mínimo</p>
          <p className="text-2xl font-bold text-red-700">{minVisitas}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>

      {/* Información adicional */}
      <div className="mt-6 text-sm text-gray-600 text-center">
        <p>
          Datos desde {datos[0]?.fecha ? new Date(datos[0].fecha).toLocaleDateString('es-AR') : 'N/A'} 
          hasta {datos[datos.length - 1]?.fecha ? new Date(datos[datos.length - 1].fecha).toLocaleDateString('es-AR') : 'N/A'}
        </p>
        <p className="mt-1">Total de días con datos: {datos.length}</p>
      </div>
    </div>
  )
} 