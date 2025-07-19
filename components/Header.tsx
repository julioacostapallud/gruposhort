"use client"
import NextImage from "next/image"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/lib/store/store"
import { logoutUser } from "@/lib/store/authSlice"
import { User, LogOut } from "lucide-react"
import { useState } from "react"

interface HeaderProps {
  variant?: 'main' | 'admin'
  onLogout?: () => void
  onLoginClick?: () => void
  onToggleAdmin?: () => void
  isAdminMode?: boolean
}

export function Header({ 
  variant = 'main',
  onLogout, 
  onLoginClick, 
  onToggleAdmin,
  isAdminMode = false 
}: HeaderProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth as any)
  const dispatch = useDispatch()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await dispatch(logoutUser() as any)
    if (onLogout) onLogout()
  }

  const isAdmin = user?.rol === 'administrador'

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm w-full">
      <div className="flex items-center justify-between p-4 w-full">
        <div className="flex items-center flex-shrink-0">
          <a href="/">
            <img src="/Logo.svg" alt="Short Grupo Inmobiliario" className="h-14 w-auto" />
          </a>
        </div>

        <div className="flex items-center space-x-4">
          {!isAdminMode && (
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Comprar</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Alquilar</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Vender</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Explorar</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Noticias</a>
            </nav>
          )}

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {/* Botón Panel Admin / Home */}
              {isAdmin && (
                <button 
                  onClick={onToggleAdmin}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {isAdminMode ? 'Home' : 'Panel Admin'}
                </button>
              )}

              {/* Círculo de usuario */}
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
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </button>
          )}
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