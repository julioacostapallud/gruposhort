"use client"
import NextImage from "next/image"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/lib/store/store"
import { logoutUser } from "@/lib/store/authSlice"
import { User, LogOut, X, Phone, Mail, MapPin } from "lucide-react"
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
  const [showContactModal, setShowContactModal] = useState(false)

  const handleLogout = async () => {
    await dispatch(logoutUser() as any)
    if (onLogout) onLogout()
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar el formulario al backend
    alert('¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.')
    setShowContactModal(false)
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
            <>
              {/* Versión desktop */}
              <nav className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  ¿Quieres vender o alquilar? Asóciate con nosotros
                </button>
              </nav>
              
              {/* Versión móvil */}
              <button 
                onClick={() => setShowContactModal(true)}
                className="md:hidden text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm px-3 py-1 border border-gray-300 rounded-md"
              >
                Asóciate
              </button>
            </>
          )}

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {/* Botón Panel Admin / Home */}
              {isAdmin && (
                <button 
                  onClick={onToggleAdmin}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {isAdminMode ? 'Panel Admin' : 'Panel Admin'}
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

      {/* Modal de Contacto */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowContactModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 mt-16">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Asóciate con nosotros</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Tienes una propiedad que quieres vender o alquilar? Déjanos tus datos y nos pondremos en contacto contigo.
            </p>

            <form className="space-y-4" onSubmit={handleContactSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu número de teléfono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de operación *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="venta">Vender</option>
                  <option value="alquiler">Alquilar</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección de la propiedad
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dirección aproximada"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cuéntanos más sobre tu propiedad..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Enviar solicitud
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <Phone size={16} className="mr-2" />
                  <span>+54 3624727330</span>
                </div>
                <div className="flex items-center">
                  <Mail size={16} className="mr-2" />
                  <span>contacto@shortinmobiliaria.com</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={16} className="mr-2" />
                <span>Resistencia, Chaco, Argentina</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 