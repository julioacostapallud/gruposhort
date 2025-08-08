'use client'

import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/lib/store/store"
import { logoutUser } from "@/lib/store/authSlice"
import { User, LogOut, Menu } from "lucide-react"
import { useState } from "react"

interface AdminHeaderProps {
  onLogout?: () => void
  onToggleSidebar?: () => void
}

export function AdminHeader({ onLogout, onToggleSidebar }: AdminHeaderProps) {
  const { user } = useSelector((state: RootState) => state.auth as any)
  const dispatch = useDispatch()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await dispatch(logoutUser() as any)
    if (onLogout) onLogout()
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm w-full">
      <div className="flex items-center justify-between p-4 w-full">
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-4 group"
          >
            <Menu className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Título del panel */}
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-sm text-gray-500">Short Grupo Inmobiliario</p>
          </div>

          {/* Círculo de usuario y menú */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
            >
              <User size={20} />
            </button>
            {/* Menú desplegable */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-blue-600 capitalize">{user?.rol}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para cerrar el menú al hacer click fuera */}
      {showUserMenu && (
        <div 
          className="fixed inset-0"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
} 