'use client'

import React, { useState, useEffect } from 'react'
import { 
  Eye, 
  Edit, 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  DollarSign, 
  Ruler, 
  Bed, 
  Bath, 
  Home, 
  Users, 
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  SlidersHorizontal,
  Trash2,
  Calendar
} from 'lucide-react'
import { Propiedad } from '@/lib/services/propiedades'
import { propiedadesConDelete as propiedades } from '@/lib/services/propiedades'
import NextImage from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { PropertyPreviewModal } from './PropertyPreviewModal'

interface PropertiesTableProps {
  onViewProperty: (property: Propiedad) => void
  onEditProperty: (property: Propiedad) => void
  onNewProperty: () => void
  propertiesVersion?: number
}

export function PropertiesTable({ onViewProperty, onEditProperty, onNewProperty, propertiesVersion }: PropertiesTableProps) {
  const [properties, setProperties] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    tipo_propiedad: 'all',
    estado_comercial: 'all',
    estado_situacion: 'all',
    estado_registro: 'all',
    estado_fisico: 'all',
    min_precio: '',
    max_precio: '',
    min_superficie: '',
    max_superficie: ''
  })
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewProperty, setPreviewProperty] = useState<Propiedad | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadProperties()
  }, [propertiesVersion])

  const loadProperties = async () => {
    try {
      const data = await propiedades.list()
      setProperties(data)
    } catch (error) {
      console.error('Error cargando propiedades:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(parseFloat(price))
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'disponible':
        return 'bg-green-100 text-green-800'
      case 'reservada':
        return 'bg-yellow-100 text-yellow-800'
      case 'vendida':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'disponible':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'reservada':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'vendida':
        return <Star className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  }

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
      max_superficie: ''
    })
    setSearchTerm('')
  }

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
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTipo = filters.tipo_propiedad === 'all' || 
                       property.tipo_propiedad.id.toString() === filters.tipo_propiedad
    
    const matchesEstadoComercial = filters.estado_comercial === 'all' || 
                                  property.estado_comercial.id.toString() === filters.estado_comercial
    
    const matchesEstadoSituacion = filters.estado_situacion === 'all' || 
                                  property.estado_situacion.id.toString() === filters.estado_situacion
    
    const matchesEstadoRegistro = filters.estado_registro === 'all' || 
                                 property.estado_registro.id.toString() === filters.estado_registro
    
    const matchesEstadoFisico = filters.estado_fisico === 'all' || 
                               property.estado_fisico.id.toString() === filters.estado_fisico
    
    const matchesMinPrice = !filters.min_precio || parseFloat(property.precio) >= parseFloat(filters.min_precio)
    const matchesMaxPrice = !filters.max_precio || parseFloat(property.precio) <= parseFloat(filters.max_precio)
    
    const matchesMinSuperficie = !filters.min_superficie || 
                                (property.superficie_m2 && parseFloat(property.superficie_m2) >= parseFloat(filters.min_superficie))
    const matchesMaxSuperficie = !filters.max_superficie || 
                                (property.superficie_m2 && parseFloat(property.superficie_m2) <= parseFloat(filters.max_superficie))
    
    return matchesSearch && matchesTipo && matchesEstadoComercial && matchesEstadoSituacion && 
           matchesEstadoRegistro && matchesEstadoFisico && matchesMinPrice && matchesMaxPrice && 
           matchesMinSuperficie && matchesMaxSuperficie
  })

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await propiedades.delete(deleteId);
      setProperties(prev => prev.filter(p => p.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar la propiedad. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando propiedades...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Grid de Propiedades */}
      <div className="container mx-auto px-4 py-16">
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No se encontraron propiedades
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {hasActiveFilters() 
                ? "Intenta ajustar los filtros de búsqueda para encontrar más propiedades."
                : "Aún no hay propiedades registradas. ¡Crea la primera!"
              }
            </p>
            {!hasActiveFilters() && (
              <button 
                onClick={onNewProperty} 
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Building2 className="h-4 w-4" />
                Crear Primera Propiedad
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow relative">
                {/* Botón de eliminar */}
                <button
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-red-100 z-10"
                  title="Eliminar propiedad"
                  onClick={() => setDeleteId(property.id)}
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>
                {/* Imagen principal */}
                <div className="relative h-48">
                  {property.imagenes && property.imagenes.length > 0 ? (
                    <img
                      src={typeof property.imagenes[0] === 'string' ? property.imagenes[0] : (property.imagenes[0] as any)?.url}
                      alt={property.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <span>Sin imagen</span>
                    </div>
                  )}
                  
                  {/* Badges superpuestos */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className={`px-3 py-1 rounded-md text-sm font-medium ${getStatusColor(property.estado_comercial.nombre)} flex items-center gap-1`}>
                      {getStatusIcon(property.estado_comercial.nombre)}
                      {property.estado_comercial.nombre}
                    </div>
                    <div className="px-3 py-1 rounded-md text-sm font-medium bg-white/95 backdrop-blur-sm border border-gray-300 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {property.tipo_propiedad.nombre}
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                      <p className={`text-lg font-bold flex items-center gap-1 ${property.moneda.id === 2 ? 'text-green-800' : 'text-blue-700'}`}>
                        {property.moneda.id === 2 ? '🇺🇸' : '🇦🇷'}
                        <span>{property.moneda.simbolo}</span>
                        <span className="ml-1">{parseFloat(property.precio).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contenido de la card */}
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    {property.titulo}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {property.descripcion || 'Sin descripción disponible'}
                  </p>

                  {/* Características principales y adicionales */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {property.superficie_m2 && (
                      <div className="flex items-center text-gray-600 bg-gray-100 rounded px-2 py-1 text-xs">
                        <Ruler className="h-4 w-4 mr-1" />
                        <span>{property.superficie_m2} m²</span>
                      </div>
                    )}
                    {property.ancho_m && (
                      <div className="flex items-center text-gray-600 bg-gray-100 rounded px-2 py-1 text-xs">
                        <Ruler className="h-4 w-4 mr-1" />
                        <span>{property.ancho_m} m ancho</span>
                      </div>
                    )}
                    {property.largo_m && (
                      <div className="flex items-center text-gray-600 bg-gray-100 rounded px-2 py-1 text-xs">
                        <Ruler className="h-4 w-4 mr-1" />
                        <span>{property.largo_m} m largo</span>
                      </div>
                    )}
                    {property.antiguedad && (
                      <div className="flex items-center text-gray-600 bg-gray-100 rounded px-2 py-1 text-xs">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{property.antiguedad} años</span>
                      </div>
                    )}
                    {property.dormitorios && (
                      <div className="flex items-center text-gray-600 bg-gray-100 rounded px-2 py-1 text-xs">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{property.dormitorios} Hab</span>
                      </div>
                    )}
                    {property.banos && (
                      <div className="flex items-center text-gray-600 bg-gray-100 rounded px-2 py-1 text-xs">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{property.banos} Baño{property.banos > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {/* Todas las características */}
                    {property.caracteristicas && property.caracteristicas.length > 0 && property.caracteristicas.map((car) => (
                      <div key={car.id} className="flex items-center text-gray-600 bg-blue-50 rounded px-2 py-1 text-xs">
                        <Star className="h-4 w-4 mr-1 text-blue-400" />
                        <span>{car.nombre}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ubicación */}
                  {property.direccion && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{property.direccion.ciudad}, {property.direccion.provincia}{property.direccion.barrio ? ` - ${property.direccion.barrio}` : ''}</span>
                    </div>
                  )}

                  {/* Estados adicionales con íconos */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <div className="px-2 py-1 rounded-md text-xs bg-orange-100 text-orange-800 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {property.estado_registro.nombre}
                    </div>
                    <div className="px-2 py-1 rounded-md text-xs bg-indigo-100 text-indigo-800 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {property.estado_fisico.nombre}
                    </div>
                  </div>

                  {/* Propietarios */}
                  {property.propietarios && property.propietarios.length > 0 && (
                    <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Propietarios:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {property.propietarios.map((prop) => (
                          <div key={prop.id} className="px-2 py-1 rounded-md text-xs bg-emerald-100 text-emerald-800">
                            {prop.nombre_completo}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPreviewProperty(property);
                        setShowPreview(true);
                      }}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <button
                      onClick={() => onEditProperty(property)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal de confirmación de eliminación */}
      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar propiedad</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Preview Modal */}
      <PropertyPreviewModal
        property={previewProperty}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewProperty(null);
        }}
        isAdminMode={true}
      />
    </div>
  )
} 