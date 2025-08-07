'use client'
import { Header } from '../../components/Header'
import { Footer } from '../../components/footer'
import { PropertiesTable } from '../../components/PropertiesTable';
import { PropertyForm } from '../../components/PropertyForm';
import { PropertyEditForm } from '../../components/PropertyEditForm';
import { PropertyFilter } from '../../components/PropertyFilter';
import { Plus, Filter, X, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Propiedad } from '../../lib/services/propiedades';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../lib/store/store';
import { checkAuthStatus, logoutUser } from '../../lib/store/authSlice';
import { fetchProperties } from '../../lib/store/propertiesSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import { solicitudes } from '../../lib/services/solicitudes'
import { visitas } from '../../lib/services/visitas'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Spinner, LoadingScreen } from '@/components/ui/spinner'

function HeroSolicitudes({ value, onChange, title }: { value: string, onChange: (v: string) => void, title: string }) {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{title}</h1>
        <div className="max-w-3xl mx-auto relative mb-8">
          <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-lg">
            <input
              type="text"
              placeholder="Buscar solicitud..."
              value={value}
              onChange={e => onChange(e.target.value)}
              className="flex-grow px-6 py-4 text-gray-800 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function TablaSolicitudesTasacion() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalId, setModalId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => { cargar() }, [])
  const cargar = () => {
    setLoading(true)
    solicitudes.listarTasaciones().then(setData).finally(() => setLoading(false))
  }
  const atender = async (id: number) => {
    await solicitudes.marcarTasacionAtendida(id)
    setModalId(null)
    cargar()
  }
  const filtered = data.filter(s => {
    const q = search.toLowerCase()
    return (
      s.nombre?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.telefono?.toLowerCase().includes(q) ||
      s.mensaje?.toLowerCase().includes(q) ||
      (s.atendido ? 'sí' : 'no').includes(q)
    )
  })
  return (
    <>
      <HeroSolicitudes value={search} onChange={setSearch} title="Solicitudes de Tasación" />
      <div className="container mx-auto px-4 mt-16 pb-16">
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-700">
                <TableHead className="text-white font-bold">Nombre</TableHead>
                <TableHead className="text-white font-bold">Email</TableHead>
                <TableHead className="text-white font-bold">Teléfono</TableHead>
                <TableHead className="text-white font-bold">Mensaje</TableHead>
                <TableHead className="text-white font-bold">Atendido</TableHead>
                <TableHead className="text-white font-bold">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className={s.atendido ? '' : 'bg-red-50'}>
                  <TableCell>{s.nombre}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.telefono}</TableCell>
                  <TableCell><span className="whitespace-pre-line">{s.mensaje}</span></TableCell>
                  <TableCell>{s.atendido ? 'Sí' : 'No'}</TableCell>
                  <TableCell>
                    {!s.atendido && (
                      <>
                        <Button onClick={() => setModalId(s.id)} size="sm">Atender</Button>
                        {modalId === s.id && (
                          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded shadow">
                              <p>¿Marcar como atendida?</p>
                              <div className="flex gap-2 mt-4">
                                <Button onClick={() => atender(s.id)} size="sm" variant="default">Confirmar</Button>
                                <Button onClick={() => setModalId(null)} size="sm" variant="secondary">Cancelar</Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && <div className="text-center py-4">Cargando...</div>}
        </div>
      </div>
    </>
  )
}

function TablaSolicitudesVenderAlquilar() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalId, setModalId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => { cargar() }, [])
  const cargar = () => {
    setLoading(true)
    solicitudes.listarVenderAlquilar().then(setData).finally(() => setLoading(false))
  }
  const atender = async (id: number) => {
    await solicitudes.marcarVenderAlquilarAtendida(id)
    setModalId(null)
    cargar()
  }
  const filtered = data.filter(s => {
    const q = search.toLowerCase()
    return (
      s.nombre?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.telefono?.toLowerCase().includes(q) ||
      s.mensaje?.toLowerCase().includes(q) ||
      (s.atendido ? 'sí' : 'no').includes(q)
    )
  })
  return (
    <>
      <HeroSolicitudes value={search} onChange={setSearch} title="Solicitudes de Ventas y Alquiler" />
      <div className="container mx-auto px-4 mt-16 pb-16">
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-700">
                <TableHead className="text-white font-bold">Nombre</TableHead>
                <TableHead className="text-white font-bold">Email</TableHead>
                <TableHead className="text-white font-bold">Teléfono</TableHead>
                <TableHead className="text-white font-bold">Mensaje</TableHead>
                <TableHead className="text-white font-bold">Atendido</TableHead>
                <TableHead className="text-white font-bold">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className={s.atendido ? '' : 'bg-red-50'}>
                  <TableCell>{s.nombre}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.telefono}</TableCell>
                  <TableCell><span className="whitespace-pre-line">{s.mensaje}</span></TableCell>
                  <TableCell>{s.atendido ? 'Sí' : 'No'}</TableCell>
                  <TableCell>
                    {!s.atendido && (
                      <>
                        <Button onClick={() => setModalId(s.id)} size="sm">Atender</Button>
                        {modalId === s.id && (
                          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded shadow">
                              <p>¿Marcar como atendida?</p>
                              <div className="flex gap-2 mt-4">
                                <Button onClick={() => atender(s.id)} size="sm" variant="default">Confirmar</Button>
                                <Button onClick={() => setModalId(null)} size="sm" variant="secondary">Cancelar</Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && <div className="text-center py-4">Cargando...</div>}
        </div>
      </div>
    </>
  )
}

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<any>(null);
  
  const [showNewPropertyModal, setShowNewPropertyModal] = useState(false);
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Propiedad | null>(null);
  const [propertiesVersion, setPropertiesVersion] = useState(0);
  
  const [adminView, setAdminView] = useState<'panel' | 'tasaciones' | 'venderAlquilar'>('panel');
  const [tasacionesPendientes, setTasacionesPendientes] = useState(0);
  const [ventasPendientes, setVentasPendientes] = useState(0);
  const [visitasSitio, setVisitasSitio] = useState(0);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth as any);
  const { properties, loading: propertiesLoading } = useSelector((state: RootState) => state.properties);
  const [filteredProperties, setFilteredProperties] = useState<Propiedad[]>([]);

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

  // Asegurar que filteredProperties se inicialice con las propiedades cuando estén disponibles
  useEffect(() => {
    if (properties.length > 0 && filteredProperties.length === 0) {
      setFilteredProperties(properties)
    }
  }, [properties, filteredProperties.length])

  // Función para actualizar URL con filtros
  const updateUrlWithFilters = (filters: any) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value))
      }
    })
    router.replace(`/admin?${params.toString()}`, { scroll: false })
  }

  // Función para manejar los filtros
  const handleFilter = (filters: any) => {
    setCurrentFilters(filters)
    
    // Actualizar URL con filtros
    updateUrlWithFilters(filters)
    
    // Aplicar filtros a las propiedades
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
    
    // Actualizar propiedades filtradas
    setFilteredProperties(filtered)
  }

  // Cargar filtros desde URL al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined' && properties.length > 0) {
      const urlParams = new URLSearchParams(window.location.search)
      const filtersFromUrl: any = {}

      // Mapear parámetros de URL a filtros
      const urlFilters = {
        tipo_propiedad: urlParams.get('tipo_propiedad'),
        operacion: urlParams.get('operacion'),
        precio_min: urlParams.get('precio_min'),
        precio_max: urlParams.get('precio_max'),
        ciudad: urlParams.get('ciudad'),
        dormitorios: urlParams.get('dormitorios'),
        moneda: urlParams.get('moneda')
      }

      // Solo agregar filtros que tengan valor
      Object.entries(urlFilters).forEach(([key, value]) => {
        if (value) {
          filtersFromUrl[key] = value
        }
      })

      if (Object.keys(filtersFromUrl).length > 0) {
        setCurrentFilters(filtersFromUrl)
        applyFilters(properties, filtersFromUrl, searchTerm)
      }
    }
  }, [properties]) // Se ejecuta cuando se cargan las propiedades

  // Filtrar por término de búsqueda
  useEffect(() => {
    applyFilters(properties, currentFilters, searchTerm)
  }, [searchTerm, properties, currentFilters])

  // Cargar contadores de pendientes y visitas del sitio
  useEffect(() => {
    solicitudes.listarTasaciones().then(data => {
      setTasacionesPendientes(data.filter((s: any) => !s.atendido).length)
    })
    solicitudes.listarVenderAlquilar().then(data => {
      setVentasPendientes(data.filter((s: any) => !s.atendido).length)
    })
    // Cargar estadísticas de visitas del sitio
    visitas.obtenerEstadisticasPagina('hoy').then(data => {
      setVisitasSitio(data.estadisticas.visitas_totales)
    }).catch(error => {
      console.error('Error cargando visitas del sitio:', error)
    })
  }, [adminView])

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/');
  };

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
    <main className="min-h-screen flex flex-col">
      <Header
        variant="admin"
        isAdminMode={true}
        onLogout={handleLogout}
        adminTab={adminView}
        onChangeAdminTab={setAdminView}
        tasacionesPendientes={tasacionesPendientes}
        ventasPendientes={ventasPendientes}
      />
      <div className="flex-1">
        {/* Vistas condicionales */}
        {adminView === 'panel' && (
          <>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
              <div className="container mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <h1 className="text-4xl md:text-5xl font-bold">Panel Admin</h1>
                  
                  {/* Badge de visitas al sitio */}
                  <div className="inline-flex items-center bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    <Eye className="h-4 w-4 mr-2" />
                    Visitas al sitio: {visitasSitio}
                  </div>
                </div>
                
                <p className="text-xl mb-8 max-w-2xl mx-auto">
                  Administra y visualiza todas las propiedades de Short Grupo Inmobiliario
                </p>
                
                {/* Búsqueda principal */}
                <div className="max-w-3xl mx-auto relative mb-8">
                  <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-lg">
                    <input
                      type="text"
                      placeholder="Buscar propiedades por título o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-grow px-6 py-4 text-gray-800 focus:outline-none"
                    />
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="bg-blue-600 text-white px-6 py-4 hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Filter className="mr-2" size={20} />
                      <span>Filtros</span>
                    </button>
                  </div>
                </div>

                {/* Filtros expandibles */}
                {showFilters && (
                  <div className="max-w-4xl mx-auto">
                    <PropertyFilter onFilter={handleFilter} properties={properties} />
                  </div>
                )}
              </div>
            </section>

            {/* Tabla de propiedades */}
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <PropertiesTable
                  onViewProperty={handleViewProperty}
                  onEditProperty={handleEditProperty}
                  onNewProperty={handleNewProperty}
                  propertiesVersion={propertiesVersion}
                  filteredProperties={filteredProperties}
                  searchTerm={searchTerm}
                />
              </div>
            </section>

            {/* Botón flotante */}
            <div className="fixed bottom-6 right-6">
              <button
                onClick={handleNewProperty}
                className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>

            {/* Modales simplificados - Solo HTML nativo */}
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
          </>
        )}
        {adminView === 'tasaciones' && (
          <section className="py-16 bg-gray-50 min-h-[60vh]">
            <TablaSolicitudesTasacion />
          </section>
        )}
        {adminView === 'venderAlquilar' && (
          <section className="py-16 bg-gray-50 min-h-[60vh]">
            <TablaSolicitudesVenderAlquilar />
          </section>
        )}
      </div>
      <Footer />
    </main>
  )
} 