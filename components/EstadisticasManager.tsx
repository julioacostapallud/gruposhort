'use client'
import { useState } from 'react'
import { VisitasChart } from './VisitasChart'
import { EstadisticasPorPropiedad } from '@/components/EstadisticasPorPropiedad'
import { BarChart3, Eye, TrendingUp } from 'lucide-react'

interface EstadisticasManagerProps {
  // Futuras props para diferentes tipos de estadísticas
}

export function EstadisticasManager({}: EstadisticasManagerProps) {
  const [activeTab, setActiveTab] = useState<'generales' | 'porPropiedad'>('generales')

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('generales')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'generales'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="h-5 w-5" />
            <span>Estadísticas Generales del Sitio</span>
          </button>
          
          <button
            onClick={() => setActiveTab('porPropiedad')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'porPropiedad'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Estadísticas por Propiedad</span>
          </button>
        </div>
      </div>

      {/* Contenido de tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeTab === 'generales' && <VisitasChart />}
        {activeTab === 'porPropiedad' && <EstadisticasPorPropiedad />}
      </div>
    </div>
  )
} 