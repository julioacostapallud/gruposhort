'use client'
import { PropertiesTable } from '@/components/PropertiesTable';
import { PropertyForm } from '@/components/PropertyForm';
import { PropertyEditForm } from '@/components/PropertyEditForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Propiedad } from '@/lib/services/propiedades';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store/store';
import { checkAuthStatus } from '@/lib/store/authSlice';

export function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tipo_propiedad: 'all',
    estado_comercial: 'all',  estado_situacion: 'all',
    estado_registro: 'all',
    estado_fisico: 'all',  min_precio: 0,  max_precio: '',
    min_superficie: 0,
    max_superficie:  });
  const [showNewPropertyModal, setShowNewPropertyModal] = useState(false);
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Propiedad | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

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
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const clearFilters = () => {
    setFilters({
      tipo_propiedad: 'all',
      estado_comercial: 'all',
      estado_situacion: 'all',
      estado_registro: 'all',
      estado_fisico: 'all',
      min_precio: 0,
      max_precio: '',      min_superficie: 0,      max_superficie:  });
    setSearchTerm(
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600>Debes iniciar sesión para acceder al panel de administración</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section única, igual que la principal pero con texto de admin */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6ión de Propiedades</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Administra y visualiza todas las propiedades de Short Grupo Inmobiliario
          </p>
          
          {/* Búsqueda principal - Estilo del home */}
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
                className="bg-blue-600 text-white px-6 py-4 hover:bg-blue-700 transition-colors flex items-center">
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
                      <option value="1">Apartamento</option>
                      <option value="2">Casa</option>
                      <option value="3">Terreno</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block>Estado comercial</label>
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
                    <label className="text-sm font-medium text-white mb-2 block>Estado situación</label>
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
                      <option value="1">Activa</option>
                      <option value="2">Inactiva</option>
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
                      <option value="4">Regular</option>
                      <option value="5">Bueno</option>
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
                    <label className="text-sm font-medium text-white mb-2 block">Superficie mínima</label>
                    <input
                      type="number"
                      placeholder="0 m²"
                      value={filters.min_superficie}
                      onChange={(e) => setFilters({...filters, min_superficie: e.target.value})}
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={clearFilters}
                    className="text-white/80 hover:text-white text-sm flex items-center"
                  >
                    <X className="mr-1" size={16} />
                    Limpiar filtros
                  </button>
                  <div className="text-sm text-white/80">
                   {hasActiveFilters() && 'Filtros activos'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PropertiesTable */}
      <PropertiesTable 
        onViewProperty={handleViewProperty}
        onEditProperty={handleEditProperty}
        onNewProperty={handleNewProperty}
      />

      {/* Modales */}
      <Dialog open={showNewPropertyModal} onOpenChange={setShowNewPropertyModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Propiedad</DialogTitle>
          </DialogHeader>
          <PropertyForm onSuccess={handlePropertySuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditPropertyModal} onOpenChange={setShowEditPropertyModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Propiedad</DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <PropertyEditForm 
              property={selectedProperty} 
              onSuccess={handlePropertySuccess} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedProperty && !showEditPropertyModal} onOpenChange={() => setSelectedProperty(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Propiedad</DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedProperty.titulo}</h3>
                  <p className="text-gray-600">{selectedProperty.descripcion}</p>
                  <div className="space-y-2">
                    <p><strong>Precio:</strong>{selectedProperty.moneda.simbolo} {Number(selectedProperty.precio).toLocaleString()}</p>
                    <p><strong>Superficie:</strong>{selectedProperty.superficie_m2} m²</p>
                    <p><strong>Dormitorios:</strong>{selectedProperty.dormitorios}</p>
                    <p><strong>Baños:</strong> {selectedProperty.banos}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Estados</h4>
                  <div className="space-y-1">
                    <p><strong>Tipo:</strong>{selectedProperty.tipo_propiedad.nombre}</p>
                    <p><strong>Comercial:</strong> {selectedProperty.estado_comercial.nombre}</p>
                    <p><strong>Situación:</strong> {selectedProperty.estado_situacion.nombre}</p>
                    <p><strong>Registro:</strong> {selectedProperty.estado_registro.nombre}</p>
                    <p><strong>Físico:</strong> {selectedProperty.estado_fisico.nombre}</p>
                  </div>
                </div>
              </div>
              {selectedProperty.direccion && (
                <div>
                  <h4 className="font-semibold mb-2">Dirección</h4>
                  <p>{selectedProperty.direccion.calle}{selectedProperty.direccion.numero}</p>
                  <p>{selectedProperty.direccion.ciudad},{selectedProperty.direccion.provincia}</p>
                  <p>CP:{selectedProperty.direccion.codigo_postal}</p>
                </div>
              )}
              {selectedProperty.propietarios.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Propietarios</h4>
                  <div className="space-y-1">
                    {selectedProperty.propietarios.map((propietario) => (
                      <p key={propietario.id}>
                        {propietario.nombre_completo}
                        {propietario.email && ` - ${propietario.email}`}
                        {propietario.telefono && ` - ${propietario.telefono}`}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 