'use client'

import { useState } from 'react'
import { 
  Home, 
  FileText, 
  BarChart3, 
  ChevronRight,
  Building2,
  Gavel,
  Handshake,
  Eye
} from 'lucide-react'

interface AdminSidebarProps {
  activeSection: 'propiedades' | 'solicitudes' | 'estadisticas'
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onSectionChange: (section: 'propiedades' | 'solicitudes' | 'estadisticas') => void
  tasacionesPendientes?: number
  ventasPendientes?: number
}

export function AdminSidebar({
  activeSection,
  isOpen,
  onToggle,
  onClose,
  onSectionChange,
  tasacionesPendientes = 0,
  ventasPendientes = 0
}: AdminSidebarProps) {

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const menuItems = [
    {
      id: 'propiedades',
      label: 'Propiedades',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      activeBgColor: 'bg-blue-100'
    },
    {
      id: 'solicitudes',
      label: 'Solicitudes',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      activeBgColor: 'bg-green-100',
      badge: tasacionesPendientes + ventasPendientes
    },
    {
      id: 'estadisticas',
      label: 'Estadísticas',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      activeBgColor: 'bg-purple-100'
    }
  ]

  return (
    <>
      {/* Área de transición para evitar parpadeo */}
      {isOpen && (
        <div 
          className="fixed top-0 left-0 w-4 h-full z-40"
          onMouseEnter={() => {}} // Mantener sidebar abierto
          onMouseLeave={onClose} // Cerrar cuando sale del área
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseEnter={() => {}} // Mantener abierto cuando el mouse entra
        onMouseLeave={onClose} // Cerrar sidebar cuando el mouse sale del área
      >
        <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col shadow-xl">
          {/* Header del Sidebar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-center items-center gap-2">
              <img src="/icons/icon.png" alt="Short" className="h-8 w-auto" />
              <span className="text-lg font-bold text-blue-600">MENU</span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id as 'propiedades' | 'solicitudes' | 'estadisticas')
                    onToggle() // Cerrar sidebar después de seleccionar
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive 
                      ? `${item.activeBgColor} ${item.color} border-l-4 border-l-current` 
                      : `${item.bgColor} text-gray-700 hover:${item.activeBgColor} hover:${item.color}`
                  }`}
                >
                                  <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                </button>
              )
            })}
          </nav>

          {/* Footer del Sidebar */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>Short Grupo Inmobiliario</p>
              <p>Panel de Administración</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 