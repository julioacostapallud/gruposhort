'use client'
import { Header } from '../../components/Header'
import { Footer } from '../../components/footer'
import { PropertiesTable } from '../../components/PropertiesTable';
import { PropertyForm } from '../../components/PropertyForm';
import { PropertyEditForm } from '../../components/PropertyEditForm';
import { Plus, Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Propiedad } from '../../lib/services/propiedades';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../lib/store/store';
import { checkAuthStatus, logoutUser } from '../../lib/store/authSlice';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tipo_propiedad: 'all',
    estado_comercial: 'all',
    estado_situacion: 'all',
    estado_registro: 'all',
    estado_fisico: 'all',
    min_precio: '',
    max_precio: '',
    min_superficie: '',
    max_superficie: '',
    min_ancho: '',
    max_ancho: '',
    min_largo: '',
    max_largo: '',
    max_antiguedad: '',
    min_dormitorios: ''
  });
  const [showNewPropertyModal, setShowNewPropertyModal] = useState(false);
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Propiedad | null>(null);
  const [propertiesVersion, setPropertiesVersion] = useState(0);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth as any);

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
    setPropertiesVersion(v => v + 1); // Fuerza recarga reactiva
  };

  const clearFilters = () => {
    setFilters({
      tipo_propiedad: 'all',
      estado_comercial: 'all',
      estado_situacion: 'all',
      estado_registro: 'all',
      estado_fisico: 'all',
      min_precio: '',
      max_precio: '',
      min_superficie: '',
      max_superficie: '',
      min_ancho: '',
      max_ancho: '',
      min_largo: '',
      max_largo: '',
      max_antiguedad: '',
      min_dormitorios: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm || 
           filters.tipo_propiedad !== 'all' || 
           filters.estado_comercial !== 'all' || 
           filters.estado_situacion !== 'all' || 
           filters.estado_registro !== 'all' || 
           filters.estado_fisico !== 'all' || 
           filters.min_precio || 
           filters.max_precio || 
           filters.min_superficie || 
           filters.max_superficie
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirigirá automáticamente
  }

  return (
    <main className="min-h-screen">
      <Header variant="admin" onLogout={handleLogout} />
      
      {/* Hero Section - Solo HTML nativo y Tailwind */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Gestión de Propiedades</h1>
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
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Tipo de propiedad</label>
                    <select 
                      value={filters.tipo_propiedad} 
                      onChange={(e) => setFilters({...filters, tipo_propiedad: e.target.value})}
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                    >
                      <option value="all">Todos los tipos</option>
                      <option value="1">Casa</option>
                      <option value="2">Departamento</option>
                      <option value="3">Terreno</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Estado comercial</label>
                    <select 
                      value={filters.estado_comercial} 
                      onChange={(e) => setFilters({...filters, estado_comercial: e.target.value})}
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="1">Disponible</option>
                      <option value="2">Reservada</option>
                      <option value="3">Vendida</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Estado situación</label>
                    <select 
                      value={filters.estado_situacion} 
                      onChange={(e) => setFilters({...filters, estado_situacion: e.target.value})}
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="1">Disponible</option>
                      <option value="2">Reservada</option>
                      <option value="3">Vendida</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Estado registro</label>
                    <select 
                      value={filters.estado_registro} 
                      onChange={(e) => setFilters({...filters, estado_registro: e.target.value})}
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="1">Activa</option>                   <option value="2">Inactiva</option>
                      <option value="3">Pendiente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Estado físico</label>
                    <select 
                      value={filters.estado_fisico} 
                      onChange={(e) => setFilters({...filters, estado_fisico: e.target.value})}
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="1">A estrenar</option>
                      <option value="2">Excelente</option>
                      <option value="3">Muy bueno</option>
                      <option value="4">Bueno</option>
                      <option value="5">Regular</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Precio mínimo</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.min_precio}
                      onChange={(e) => setFilters({...filters, min_precio: e.target.value})}
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Precio máximo</label>
                    <input
                      type="number"
                      placeholder="Sin límite"
                      value={filters.max_precio}
                      onChange={(e) => setFilters({...filters, max_precio: e.target.value})}
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Superficie (m²)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.min_superficie}
                        onChange={(e) => setFilters({...filters, min_superficie: e.target.value})}
                        className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.max_superficie}
                        onChange={(e) => setFilters({...filters, max_superficie: e.target.value})}
                        className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Ancho (m)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.min_ancho || ''}
                        onChange={(e) => setFilters({...filters, min_ancho: e.target.value})}
                        className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.max_ancho || ''}
                        onChange={(e) => setFilters({...filters, max_ancho: e.target.value})}
                        className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Largo (m)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.min_largo || ''}
                        onChange={(e) => setFilters({...filters, min_largo: e.target.value})}
                        className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.max_largo || ''}
                        onChange={(e) => setFilters({...filters, max_largo: e.target.value})}
                        className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Antigüedad (años)</label>
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={filters.max_antiguedad || ''}
                      onChange={(e) => setFilters({...filters, max_antiguedad: e.target.value})}
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Dormitorios</label>
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={filters.min_dormitorios || ''}
                      onChange={(e) => setFilters({...filters, min_dormitorios: e.target.value})}
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                    />
                  </div>
                </div>

                {hasActiveFilters() && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={clearFilters}
                      className="bg-white/20 text-white px-4 py-2 rounded-md hover:bg-white/30 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <X className="h-4 w-4" />
                      Limpiar Filtros
                    </button>
                  </div>
                )}
              </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

      <Footer />
    </main>
  )
} 