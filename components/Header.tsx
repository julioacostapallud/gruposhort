"use client"
import NextImage from "next/image"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/lib/store/store"
import { logoutUser } from "@/lib/store/authSlice"
import { User, LogOut, X, Phone, Mail, MapPin, Power, Home, FileText, Users, LayoutDashboard, Gavel, Handshake, BarChart3 } from "lucide-react"
import { useState } from "react"
import { solicitudes } from "@/lib/services/solicitudes"
import { useToast } from "@/hooks/use-toast"
import { ButtonSpinner } from '@/components/ui/spinner'
import { useEscapeKey } from '@/hooks/useEscapeKey'

interface HeaderProps {
  variant?: 'main' | 'admin'
  onLogout?: () => void
  onLoginClick?: () => void
  onToggleAdmin?: () => void
  isAdminMode?: boolean
  // NUEVO: Props para tabs admin
  adminTab?: 'panel' | 'tasaciones' | 'venderAlquilar' | 'visitas'
  onChangeAdminTab?: (tab: 'panel' | 'tasaciones' | 'venderAlquilar' | 'visitas') => void
  tasacionesPendientes?: number
  ventasPendientes?: number
}

export function Header({ 
  variant = 'main',
  onLogout, 
  onLoginClick, 
  onToggleAdmin,
  isAdminMode = false,
  adminTab,
  onChangeAdminTab,
  tasacionesPendientes = 0,
  ventasPendientes = 0
}: HeaderProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth as any)
  const dispatch = useDispatch()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactForm, setContactForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '', operacion: '', direccion: '' })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactEnviado, setContactEnviado] = useState(false)
  const { toast } = useToast();

  // Usar el hook para manejar Escape
  useEscapeKey(() => setShowContactModal(false), showContactModal)

  const handleLogout = async () => {
    await dispatch(logoutUser() as any)
    if (onLogout) onLogout()
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value })
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactLoading(true)
    try {
      await solicitudes.crearVenderAlquilar({
        nombre: contactForm.nombre,
        email: contactForm.email,
        telefono: contactForm.telefono,
        mensaje: `Operación: ${contactForm.operacion || '-'}\nDirección: ${contactForm.direccion || '-'}\nMensaje: ${contactForm.mensaje || '-'}`
      })
      setContactEnviado(true)
      setContactForm({ nombre: '', email: '', telefono: '', mensaje: '', operacion: '', direccion: '' })
      toast({ title: '¡Solicitud enviada!', description: 'Nos comunicaremos a la brevedad.' })
    } catch (err: any) {
      toast({ title: 'Error al enviar', description: err?.message || 'Ocurrió un error al enviar la solicitud', variant: 'destructive' })
    } finally {
      setContactLoading(false)
    }
  }

  const isAdmin = user?.rol === 'administrador'

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm w-full">
      <div className="flex items-center justify-between p-4 w-full">
        <div className="flex items-center flex-shrink-0">
          <a href="/">
            <img src="/Logo.svg" alt="Short Grupo Inmobiliario" className="h-10 md:h-14 w-auto" />
          </a>
        </div>
        <div className="flex items-center space-x-4">
          {/* Restaurar botón vender/alquilar para vista pública */}
          {!isAdminMode && (
            <>
              {/* Versión desktop */}
              <nav className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  ¿Quieres vender o alquilar? Contactá a nuestro equipo de asesores
                </button>
              </nav>
              {/* Versión móvil */}
              <button 
                onClick={() => setShowContactModal(true)}
                className="md:hidden text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm px-3 py-1 border border-gray-300 rounded-md"
              >
                <span className="block md:hidden">Contactanos</span>
                <span className="hidden md:block">Asóciate</span>
              </button>
            </>
          )}
          {/* Tabs de admin a la derecha, reemplazando el botón Panel Admin */}
          {isAdminMode && isAdmin && (
            <nav className="flex items-center gap-2">
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2` + (adminTab === 'panel' ? ' bg-blue-600 text-white' : ' bg-gray-100 text-gray-700 hover:bg-blue-50')}
                onClick={() => onChangeAdminTab && onChangeAdminTab('panel')}
              >
                <span className="block md:hidden"><LayoutDashboard className="h-5 w-5" /></span>
                <span className="hidden md:block">Panel Admin</span>
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2` + (adminTab === 'tasaciones' ? ' bg-blue-600 text-white' : ' bg-gray-100 text-gray-700 hover:bg-blue-50')}
                onClick={() => onChangeAdminTab && onChangeAdminTab('tasaciones')}
              >
                <span className="block md:hidden"><Gavel className="h-5 w-5" /></span>
                <span className="hidden md:block">Solicitudes de Tasación</span>
                {tasacionesPendientes > 0 && (
                  <span className="ml-1 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {tasacionesPendientes}
                  </span>
                )}
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2` + (adminTab === 'venderAlquilar' ? ' bg-blue-600 text-white' : ' bg-gray-100 text-gray-700 hover:bg-blue-50')}
                onClick={() => onChangeAdminTab && onChangeAdminTab('venderAlquilar')}
              >
                <span className="block md:hidden"><Handshake className="h-5 w-5" /></span>
                <span className="hidden md:block">Solicitudes de Ventas y Alquiler</span>
                {ventasPendientes > 0 && (
                  <span className="ml-1 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {ventasPendientes}
                  </span>
                )}
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2` + (adminTab === 'visitas' ? ' bg-blue-600 text-white' : ' bg-gray-100 text-gray-700 hover:bg-blue-50')}
                onClick={() => onChangeAdminTab && onChangeAdminTab('visitas')}
              >
                <span className="block md:hidden"><BarChart3 className="h-5 w-5" /></span>
                <span className="hidden md:block">Estadísticas de Visitas</span>
              </button>
            </nav>
          )}
          {/* Círculo de usuario y menú */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              aria-label="Iniciar Sesión"
            >
              <Power className="h-5 w-5" />
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
        <div 
          className="fixed inset-0 z-50 flex items-start justify-end p-4"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowContactModal(false)
            }
          }}
          tabIndex={0}
        >
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
            {!contactEnviado ? (
              <form className="space-y-4" onSubmit={handleContactSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={contactForm.nombre}
                    onChange={handleContactChange}
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
                    name="telefono"
                    value={contactForm.telefono}
                    onChange={handleContactChange}
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
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
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
                    name="operacion"
                    value={contactForm.operacion}
                    onChange={handleContactChange}
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
                    name="direccion"
                    value={contactForm.direccion}
                    onChange={handleContactChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Dirección aproximada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    name="mensaje"
                    value={contactForm.mensaje}
                    onChange={handleContactChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cuéntanos más sobre tu propiedad..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
                >
                  {contactLoading ? <ButtonSpinner text="Enviando..." /> : 'Enviar solicitud'}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <LogOut className="h-12 w-12 text-green-400 mb-4" />
                <h4 className="text-xl font-bold text-gray-900 mb-2">¡Solicitud enviada!</h4>
                <p className="text-gray-600 text-center">Gracias por contactarnos. Nos comunicaremos a la brevedad.</p>
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <Phone size={16} className="mr-2" />
                  <span>+54 3624727330</span>
                </div>
                <div className="flex items-center">
                  <Mail size={16} className="mr-2" />
                  <span>leonardofabianshort@gmail.com</span>
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