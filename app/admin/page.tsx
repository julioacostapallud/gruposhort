'use client'
import { AdminSidebar } from '../../components/AdminSidebar'
import { PropertiesTable } from '../../components/PropertiesTable';
import { PropertyForm } from '../../components/PropertyForm';
import { PropertyEditForm } from '../../components/PropertyEditForm';
import { PropertyFilter } from '../../components/PropertyFilter';
import { SolicitudesManager } from '../../components/SolicitudesManager';
import { EstadisticasManager } from '../../components/EstadisticasManager';
import { Plus, Filter, X, Menu, User, LogOut } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useState, useEffect } from 'react';
import { Propiedad } from '../../lib/services/propiedades';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../lib/store/store';
import { checkAuthStatus, logoutUser } from '../../lib/store/authSlice';
import { fetchProperties } from '../../lib/store/propertiesSlice';
import { useRouter } from 'next/navigation';
import { solicitudes } from '../../lib/services/solicitudes'
import { Spinner } from '@/components/ui/spinner'

export default function AdminPage() {
  // Estados para navegación del sidebar
  const [activeSection, setActiveSection] = useState<'propiedades' | 'solicitudes' | 'estadisticas'>('propiedades')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [sidebarTimeout, setSidebarTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Estados para propiedades
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<any>(null);
  const [showNewPropertyModal, setShowNewPropertyModal] = useState(false);
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Propiedad | null>(null);
  const [propertiesVersion, setPropertiesVersion] = useState(0);
  const [filteredProperties, setFilteredProperties] = useState<Propiedad[]>([]);

  // Estados para solicitudes
  const [tasacionesPendientes, setTasacionesPendientes] = useState(0);
  const [ventasPendientes, setVentasPendientes] = useState(0);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth as any);
  const { properties, loading: propertiesLoading } = useSelector((state: RootState) => state.properties);

  // Cargar propiedades usando Redux
  useEffect(() => {
    dispatch(fetchProperties())
  }, [dispatch, propertiesVersion])

  // Inicializar filteredProperties cuando se cargan las propiedades
  useEffect(() => {
    if (properties.length > 0) {
      setFilteredProperties(properties)
    }
  }, [properties])

  // Función para manejar los filtros
  const handleFilter = (filters: any) => {
    setCurrentFilters(filters)
    applyFilters(properties, filters, searchTerm)
  }

  // Función para aplicar filtros y búsqueda
  const applyFilters = (props: Propiedad[], filters: any, search: string) => {
    let filtered = props

    // Aplicar búsqueda por texto
    if (search) {
      filtered = filtered.filter(prop => 
        prop.titulo.toLowerCase().includes(search.toLowerCase()) ||
        prop.descripcion?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Aplicar filtros específicos
    if (filters) {
      filtered = filtered.filter(prop => {
        // Filtro por tipo de propiedad
        if (filters.tipo_propiedad && prop.tipo_propiedad.id !== filters.tipo_propiedad) return false
        
        // Filtro por operación (Venta/Alquiler)
        if (filters.operacion && prop.estado_comercial.id !== filters.operacion) return false
        
        // Filtro por precio mínimo
        if (filters.precio_min) {
          const precio = parseFloat(prop.precio)
          if (precio < parseFloat(filters.precio_min)) return false
        }
        
        // Filtro por precio máximo
        if (filters.precio_max) {
          const precio = parseFloat(prop.precio)
          if (precio > parseFloat(filters.precio_max)) return false
        }
        
        // Filtro por ciudad
        if (filters.ciudad && prop.direccion?.ciudad !== filters.ciudad) return false
        
        // Filtro por dormitorios (solo para casas y departamentos)
        if (filters.dormitorios && (prop.tipo_propiedad.nombre === 'Casa' || prop.tipo_propiedad.nombre === 'Departamento')) {
          if (prop.dormitorios !== filters.dormitorios) return false
        }
        
        // Filtro por moneda
        if (filters.moneda && prop.moneda.id !== filters.moneda) return false
        
        return true
      })
    }
    
    setFilteredProperties(filtered)
  }

  // Cargar datos de solicitudes pendientes
  useEffect(() => {
    const cargarSolicitudesPendientes = async () => {
      try {
        const [tasaciones, ventas] = await Promise.all([
          solicitudes.listarTasaciones(),
          solicitudes.listarVenderAlquilar()
        ])
        
        setTasacionesPendientes(tasaciones.filter((s: any) => !s.atendido).length)
        setVentasPendientes(ventas.filter((s: any) => !s.atendido).length)
      } catch (error) {
        console.error('Error cargando solicitudes pendientes:', error)
      }
    }
    
    cargarSolicitudesPendientes()
  }, [])

  // Verificar autenticación
  useEffect(() => {
    dispatch(checkAuthStatus() as any)
  }, [dispatch])

  const handleLogout = async () => {
    await dispatch(logoutUser() as any)
    router.push('/')
  }

  const handleViewProperty = (property: Propiedad) => {
    setSelectedProperty(property);
  };

  const handleEditProperty = (property: Propiedad) => {
    setSelectedProperty(property);
    setShowEditPropertyModal(true);
  };

  const handleNewProperty = () => {
    setShowNewPropertyModal(true);
  };

  const handlePropertySuccess = () => {
    setShowNewPropertyModal(false);
    setShowEditPropertyModal(false);
    setSelectedProperty(null);
    setPropertiesVersion(v => v + 1);
  };

  // Manejar cambios de sección del sidebar
  const handleSectionChange = (section: 'propiedades' | 'solicitudes' | 'estadisticas') => {
    setActiveSection(section)
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarOpen = () => {
    if (sidebarTimeout) {
      clearTimeout(sidebarTimeout)
      setSidebarTimeout(null)
    }
    setSidebarOpen(true)
  }

  const handleSidebarClose = () => {
    const timeout = setTimeout(() => {
      setSidebarOpen(false)
    }, 300) // 300ms de delay
    setSidebarTimeout(timeout)
  }

  // Usar el hook para manejar Escape
  useEscapeKey(() => setShowUserMenu(false), showUserMenu)

  if (loading || propertiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="xl" color="primary" showText text={loading ? 'Verificando autenticación...' : 'Cargando propiedades...'} />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null; // Redirigirá automáticamente
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        onClose={handleSidebarClose}
        onSectionChange={handleSectionChange}
        tasacionesPendientes={tasacionesPendientes}
        ventasPendientes={ventasPendientes}
      />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header personalizado */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Botón de menú */}
            <div 
              className="relative"
              onMouseEnter={handleSidebarOpen}
            >
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <Menu className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>

            {/* Logo y título centrados */}
            <div className="flex items-center gap-3">
              <img src="/Logo.svg" alt="Short" className="h-8 w-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Panel de Administración</h1>
                <h2 className="text-sm font-medium text-orange-500">
                  {activeSection === 'propiedades' && 'Gestión de Propiedades'}
                  {activeSection === 'solicitudes' && 'Gestión de Solicitudes'}
                  {activeSection === 'estadisticas' && 'Estadísticas'}
                </h2>
              </div>
            </div>

            {/* Menú de usuario */}
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
          </div>
        </header>

        {/* Overlay para cerrar el menú al hacer click fuera */}
        {showUserMenu && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
        )}
        
        <main className="flex-1 bg-gray-50">
          {/* Sección de Propiedades */}
          {activeSection === 'propiedades' && (
            <div className="p-6">
              {/* Búsqueda y Filtros */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Búsqueda */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Buscar propiedades por título o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Botón Filtros */}
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Filter className="mr-2" size={20} />
                    <span>Filtros</span>
                  </button>
                </div>

                {/* Filtros expandibles */}
                {showFilters && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <PropertyFilter onFilter={handleFilter} properties={properties} />
                  </div>
                )}
              </div>

              {/* Tabla de propiedades */}
              <PropertiesTable
                onViewProperty={handleViewProperty}
                onEditProperty={handleEditProperty}
                onNewProperty={handleNewProperty}
                propertiesVersion={propertiesVersion}
                filteredProperties={filteredProperties}
                searchTerm={searchTerm}
              />

              {/* Botón flotante */}
              <div className="fixed bottom-6 right-6">
                <button
                  onClick={handleNewProperty}
                  className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}

          {/* Sección de Solicitudes */}
          {activeSection === 'solicitudes' && (
            <div className="h-full">
              <SolicitudesManager 
                tasacionesPendientes={tasacionesPendientes}
                ventasPendientes={ventasPendientes}
              />
            </div>
          )}

          {/* Sección de Estadísticas */}
          {activeSection === 'estadisticas' && (
            <div className="h-full">
              <EstadisticasManager />
            </div>
          )}
        </main>
      </div>

      {/* Modales */}
      {showNewPropertyModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowNewPropertyModal(false)
            }
          }}
          tabIndex={0}
        >
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Nueva Propiedad</h2>
              <button
                onClick={() => setShowNewPropertyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <PropertyForm onSuccess={handlePropertySuccess} onCancel={() => setShowNewPropertyModal(false)} />
          </div>
        </div>
      )}

      {showEditPropertyModal && selectedProperty && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowEditPropertyModal(false)
            }
          }}
          tabIndex={0}
        >
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Editar Propiedad</h2>
              <button
                onClick={() => setShowEditPropertyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <PropertyEditForm 
              property={selectedProperty} 
              onSuccess={handlePropertySuccess}
              onCancel={() => setShowEditPropertyModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
} 