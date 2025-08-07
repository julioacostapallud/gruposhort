'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { propiedades, Propiedad } from '@/lib/services/propiedades'
import { api } from '@/lib/services/apiClient'
import { ImageUploader } from '@/components/ImageUploader'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Plus, Edit, Trash2, MapPin, Brush } from 'lucide-react';
import Select from 'react-select';
import { useToast } from "@/hooks/use-toast";

type Cat = { id: number; nombre: string }
type Owner = { 
  id: number; 
  nombre_completo: string;
  email?: string;
  telefono?: string;
  tipo_documento_id?: number;
  numero_documento?: string;
}

interface PropertyEditFormProps {
  property: Propiedad
  onSuccess?: () => void
  onCancel?: () => void
}

// Componente personalizado para las opciones del select de propietarios
const CustomOption = ({ data, innerProps, isSelected }: any) => (
  <div 
    {...innerProps}
    className={`flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer ${
      isSelected ? 'bg-blue-50' : ''
    }`}
  >
    <span className="flex-1">{data.label}</span>
    <div className="flex items-center gap-1 ml-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          data.onEdit(data.owner);
        }}
        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
        title="Editar propietario"
      >
        <Edit size={14} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          data.onDelete(data.owner);
        }}
        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
        title="Eliminar propietario"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

export function PropertyEditForm({ property, onSuccess, onCancel }: PropertyEditFormProps) {
  console.log('PropertyEditForm - Property recibida:', property);
  console.log('PropertyEditForm - Dirección:', property.direccion);
  console.log('PropertyEditForm - unidad_funcional:', property.direccion?.unidad_funcional);
  console.log('PropertyEditForm - manzana:', property.direccion?.manzana);
  console.log('PropertyEditForm - parcela:', property.direccion?.parcela);
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tiposProp, setTiposProp] = useState<Cat[]>([])
  const [estCom, setEstCom] = useState<Cat[]>([])
  const [estSit, setEstSit] = useState<Cat[]>([])
  const [estReg, setEstReg] = useState<Cat[]>([])
  const [estFis, setEstFis] = useState<Cat[]>([])
  const [monedas, setMonedas] = useState<Cat[]>([])
  const [chars, setChars] = useState<Cat[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [provincias, setProvincias] = useState<Cat[]>([])
  const [ciudades, setCiudades] = useState<Cat[]>([])
  const [barrios, setBarrios] = useState<Cat[]>([])
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; public_id: string }>>([])
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [newOwner, setNewOwner] = useState({ nombre_completo: '', tipo_documento_id: '', numero_documento: '', email: '', telefono: '' });
  const [savingOwner, setSavingOwner] = useState(false);
  const [ownerModalError, setOwnerModalError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  
  // Estado para modal de nuevo barrio
  const [showNewBarrioModal, setShowNewBarrioModal] = useState(false);
  const [newBarrioNombre, setNewBarrioNombre] = useState('');
  const [isCreatingBarrio, setIsCreatingBarrio] = useState(false);
  
  // Estado para modales de propietarios
  const [showEditOwnerModal, setShowEditOwnerModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [isDeletingOwner, setIsDeletingOwner] = useState(false);
  
  // Estado para modal de confirmación de eliminación
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);

  // Memoizar existingImages para evitar ciclos infinitos en ImageUploader
  const memoizedExistingImages = useMemo(() => property.imagenes, [property.imagenes])

  const [form, setForm] = useState({
    titulo: property.titulo,
    descripcion: property.descripcion || '',
    precio: parseFloat(property.precio),
    superficie_m2: property.superficie_m2 ? parseFloat(property.superficie_m2) : 0,
    ancho_m: property.ancho_m ? parseFloat(property.ancho_m) : 0,
    largo_m: property.largo_m ? parseFloat(property.largo_m) : 0,
    antiguedad: property.antiguedad || 0,
    dormitorios: property.dormitorios || 0,
    banos: property.banos || 0,
    tipo_propiedad_id: property.tipo_propiedad.id,
    estado_comercial_id: property.estado_comercial.id,
    estado_situacion_id: property.estado_situacion.id,
    estado_registro_id: property.estado_registro.id,
    estado_fisico_id: property.estado_fisico.id,
    id_moneda: property.moneda.id,
    caracteristicas: property.caracteristicas.map(c => c.id),
    propietarios: property.propietarios ? property.propietarios.map(p => p.id) : [],
    provincia_id: 0, // se setea luego en el useEffect
    ciudad_id: 0,    // se setea luego en el useEffect
    barrio_id: 0,    // se setea luego en el useEffect
    calle: property.direccion?.calle || '',
    numero: property.direccion?.numero || '',
    piso: property.direccion?.piso || '',
    departamento: property.direccion?.departamento || '',
    latitud: property.direccion?.latitud || '',
    longitud: property.direccion?.longitud || '',
    unidad_funcional: property.direccion?.unidad_funcional || '',
    manzana: property.direccion?.manzana || '',
    parcela: property.direccion?.parcela || '',
    fecha_publicacion: property.fecha_publicacion ? new Date(property.fecha_publicacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  })

  // Precarga ciudades si hay provincia inicial (por nombre)
  useEffect(() => {
    if (property.direccion?.provincia) {
      // Buscar el id de la provincia por nombre
      api.list<Cat[]>(`provincias`).then(provs => {
        const provinciaObj = provs.find(p => p.nombre === property.direccion?.provincia)
        if (provinciaObj) {
          api.list<Cat[]>(`ciudades?provincia_id=${provinciaObj.id}`)
            .then(setCiudades)
        }
      })
    }
  }, [property.direccion?.provincia])

  // Cargar barrios cuando cambie la ciudad
  useEffect(() => {
    if (form.ciudad_id) {
      api.list<Cat[]>(`barrios?ciudad_id=${form.ciudad_id}`)
         .then(setBarrios)
         .catch(() => setBarrios([])) // Si no hay endpoint específico, usar el genérico
    } else {
      setBarrios([])
    }
  }, [form.ciudad_id])

  useEffect(() => {
    Promise.all([
      api.list<Cat[]>('tipos_propiedad'),
      api.list<Cat[]>('tipos_estado_comercial'),
      api.list<Cat[]>('tipos_estado_situacion'),
      api.list<Cat[]>('tipos_estado_registro'),
      api.list<Cat[]>('tipos_estado_fisico'),
      api.list<Cat[]>('monedas'),
      api.list<Cat[]>('caracteristicas'),
      api.list<Owner[]>('propietarios'),
      api.list<Cat[]>('provincias')
    ]).then(([tp, tec, tes, ter, tef, m, c, o, provs]) => {
      setTiposProp(tp)
      setEstCom(tec)
      setEstSit(tes)
      setEstReg(ter)
      setEstFis(tef)
      setMonedas(m)
      setChars(c)
      setOwners(o)
      setProvincias(provs)

      // Precarga provincia_id si hay dirección
      if (property.direccion && property.direccion.provincia) {
        const provinciaObj = provs.find(p => p.nombre === property.direccion?.provincia)
        if (provinciaObj) {
          setForm(f => ({ ...f, provincia_id: provinciaObj.id }))
          // Cargar ciudades de esa provincia y precargar ciudad_id
          api.list<Cat[]>(`ciudades?provincia_id=${provinciaObj.id}`).then(ciuds => {
            setCiudades(ciuds)
            if (property.direccion && property.direccion.ciudad) {
              const ciudadObj = ciuds.find(c => c.nombre === property.direccion?.ciudad)
              if (ciudadObj) {
                setForm(f => ({ ...f, ciudad_id: ciudadObj.id }))
                // Cargar barrios de esa ciudad y precargar barrio_id
                api.list<Cat[]>(`barrios?ciudad_id=${ciudadObj.id}`).then(barrios => {
                  setBarrios(barrios)
                  if (property.direccion && property.direccion.barrio) {
                    const barrioObj = barrios.find(b => b.nombre === property.direccion?.barrio)
                    if (barrioObj) {
                      setForm(f => ({ ...f, barrio_id: barrioObj.id }))
                    }
                  }
                })
              }
            }
          })
        }
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación de campos obligatorios
    if (!form.tipo_propiedad_id || form.tipo_propiedad_id === 0) {
      setFormError('Debe seleccionar un tipo de propiedad.');
      return;
    }
    if (!form.estado_comercial_id || form.estado_comercial_id === 0) {
      setFormError('Debe seleccionar un estado comercial.');
      return;
    }
    if (!form.estado_situacion_id || form.estado_situacion_id === 0) {
      setFormError('Debe seleccionar un estado de situación.');
      return;
    }
    if (!form.estado_registro_id || form.estado_registro_id === 0) {
      setFormError('Debe seleccionar un estado de registro.');
      return;
    }
    if (!form.estado_fisico_id || form.estado_fisico_id === 0) {
      setFormError('Debe seleccionar un estado físico.');
      return;
    }
    if (!form.id_moneda || form.id_moneda === 0) {
      setFormError('Debe seleccionar una moneda.');
      return;
    }
    if (!form.titulo.trim()) {
      setFormError('El título es obligatorio.');
      return;
    }
    if (!form.precio || form.precio <= 0) {
      setFormError('El precio debe ser mayor a 0.');
      return;
    }
    
    // Validación de dirección obligatoria
    if (!form.provincia_id || !form.ciudad_id || !form.calle.trim() || !form.numero.trim()) {
      setFormError('La dirección (provincia, ciudad, calle y número) es obligatoria.');
      return;
    }

    // Validar coordenadas si están presentes
    if (form.latitud && form.longitud) {
      const lat = parseFloat(form.latitud);
      const lng = parseFloat(form.longitud);
      
      if (isNaN(lat) || isNaN(lng)) {
        setFormError('Las coordenadas deben ser números válidos');
        return;
      }
      
      if (lat < -90 || lat > 90) {
        setFormError('La latitud debe estar entre -90 y 90');
        return;
      }
      
      if (lng < -180 || lng > 180) {
        setFormError('La longitud debe estar entre -180 y 180');
        return;
      }
    }
    
    setFormError(null);
    setSaving(true)
    
    try {
      // Obtener las imágenes marcadas para eliminar
      const imagesToDelete = (window as any).ImageUploaderRef?.getImagesToDelete() || []
      // Si se va a enviar latitud o longitud, asegúrate de enviar también los campos de dirección requeridos
      const needsDireccionCompleta = form.latitud || form.longitud;
      const updateData = {
        tipo_propiedad_id: form.tipo_propiedad_id,
        estado_comercial_id: form.estado_comercial_id,
        estado_situacion_id: form.estado_situacion_id,
        estado_registro_id: form.estado_registro_id,
        estado_fisico_id: form.estado_fisico_id,
        titulo: form.titulo,
        descripcion: form.descripcion,
        precio: form.precio,
        superficie_m2: form.superficie_m2 || undefined,
        ancho_m: form.ancho_m || undefined,
        largo_m: form.largo_m || undefined,
        antiguedad: form.antiguedad || undefined,
        dormitorios: form.dormitorios || undefined,
        banos: form.banos || undefined,
        direccion_id: property.direccion?.id,
        id_moneda: form.id_moneda,
        caracteristicas: Array.isArray(form.caracteristicas) ? form.caracteristicas : [],
        propietarios: Array.isArray(form.propietarios) ? form.propietarios : [],
        ...(needsDireccionCompleta && { provincia_id: form.provincia_id, ciudad_id: form.ciudad_id, calle: form.calle, numero: form.numero }),
        ...(form.calle !== property.direccion?.calle && { calle: form.calle }),
        ...(form.numero !== property.direccion?.numero && { numero: form.numero }),
        ...(form.piso !== property.direccion?.piso && { piso: form.piso || undefined }),
        ...(form.departamento !== property.direccion?.departamento && { departamento: form.departamento || undefined }),
        ...(form.latitud !== property.direccion?.latitud && { latitud: form.latitud ? parseFloat(form.latitud) : undefined }),
        ...(form.longitud !== property.direccion?.longitud && { longitud: form.longitud ? parseFloat(form.longitud) : undefined }),
        unidad_funcional: form.unidad_funcional || undefined,
        manzana: form.manzana || undefined,
        parcela: form.parcela || undefined,
        fecha_publicacion: form.fecha_publicacion
      };
      console.log('Payload a guardar (edición):', updateData);
      await propiedades.update(property.id, updateData)
      
      // Si se están actualizando campos de dirección específicos, usar el endpoint específico
      if (property.direccion?.id) {
        await propiedades.updateDireccion(property.id, {
          direccion_id: property.direccion.id,
          unidad_funcional: form.unidad_funcional !== undefined ? form.unidad_funcional : undefined,
          manzana: form.manzana !== undefined ? form.manzana : undefined,
          parcela: form.parcela !== undefined ? form.parcela : undefined
        });
      }
      
      // Manejar imágenes: obtener el estado completo del ImageUploader
      try {
        // Obtener las imágenes marcadas para eliminar
        const imagesToDelete = (window as any).ImageUploaderRef?.getImagesToDelete() || []
        
        // 1. Eliminar imágenes marcadas para eliminar de Cloudinary
        if (imagesToDelete.length > 0) {
          const { cloudinaryService } = await import('@/lib/services/cloudinary')
          for (const image of imagesToDelete) {
            try {
              await cloudinaryService.deleteImage(image.public_id)
            } catch (error) {
              console.error('Error eliminando imagen de Cloudinary:', image.public_id, error)
              // Continuar con las demás imágenes
            }
          }
        }
        
        // 2. Actualizar imágenes en la base de datos
        // uploadedImages contiene TODAS las imágenes que deben estar en la BD
        // (existentes no eliminadas + nuevas)
        try {
          await propiedades.updateImages(property.id, uploadedImages)
        } catch (error) {
          console.error('Error actualizando imágenes en BD:', error)
          throw new Error('Error al actualizar imágenes en la base de datos')
        }
        
        // 3. Limpiar la lista de imágenes marcadas para eliminar
        (window as any).ImageUploaderRef?.clearImagesToDelete()
      } catch (error) {
        console.error('Error manejando imágenes:', error)
        toast({ 
          title: 'Error al actualizar imágenes', 
          description: 'La propiedad se actualizó pero hubo problemas con las imágenes.', 
          variant: 'destructive'
        })
      }
      
      toast({ title: 'Propiedad actualizada correctamente', description: '', })
      onSuccess?.()
    } catch (error) {
      toast({ title: 'Error al actualizar la propiedad', description: (error as any)?.message || String(error), })
      console.error('Error actualizando propiedad:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleGeolocalizar = () => {
    setGeoLoading(true);
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('La geolocalización no está soportada en este navegador.');
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({ ...f, latitud: pos.coords.latitude.toString(), longitud: pos.coords.longitude.toString() }));
        setGeoLoading(false);
      },
      (err) => {
        let msg = 'No se pudo obtener la ubicación.';
        if (err.code === 1) {
          msg = 'Permiso de ubicación denegado. Por favor, permite el acceso en la configuración del navegador.';
        } else if (err.code === 2) {
          msg = 'No se pudo determinar la ubicación. Verifica tu conexión o activa el GPS.';
        } else if (err.code === 3) {
          msg = 'La solicitud de ubicación expiró. Intenta nuevamente.';
        }
        setGeoError(msg);
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  };

  // Función para capitalizar texto (primera letra mayúscula, resto minúsculas)
  const capitalizarTexto = (texto: string): string => {
    return texto.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Función para crear nuevo barrio
  const handleCreateBarrio = async () => {
    if (!newBarrioNombre.trim() || !form.ciudad_id) {
      toast({ 
        title: 'Error', 
        description: 'Por favor ingresa el nombre del barrio y asegúrate de tener una ciudad seleccionada', 
      });
      return;
    }

    setIsCreatingBarrio(true);
    try {
      const nombreCapitalizado = capitalizarTexto(newBarrioNombre.trim());
      
      const response = await api.create('barrios', {
        nombre: nombreCapitalizado,
        ciudad_id: form.ciudad_id
      });

      if (response.success) {
        // Agregar el nuevo barrio a la lista
        const nuevoBarrio = response.barrio;
        setBarrios(prev => [...prev, { id: nuevoBarrio.id, nombre: nuevoBarrio.nombre }]);
        
        // Seleccionar automáticamente el nuevo barrio
        setForm(prev => ({ ...prev, barrio_id: nuevoBarrio.id }));
        
        // Cerrar modal y limpiar
        setShowNewBarrioModal(false);
        setNewBarrioNombre('');
        
        toast({ 
          title: 'Barrio creado exitosamente', 
          description: `"${nombreCapitalizado}" ha sido agregado a la lista`, 
        });
      }
    } catch (error: any) {
      let errorMessage = 'Error al crear el barrio';
      if (error.error === 'Ya existe un barrio con ese nombre en esta ciudad') {
        errorMessage = 'Ya existe un barrio con ese nombre en esta ciudad';
      }
      toast({ 
        title: 'Error', 
        description: errorMessage, 
      });
    } finally {
      setIsCreatingBarrio(false);
    }
  };

  // Función para abrir modal de nuevo barrio
  const handleOpenNewBarrioModal = () => {
    if (!form.ciudad_id) {
      toast({ 
        title: 'Error', 
        description: 'Primero debes seleccionar una ciudad', 
      });
      return;
    }
    setShowNewBarrioModal(true);
    setNewBarrioNombre('');
  };

  // Función para editar propietario
  const handleEditOwner = (owner: Owner) => {
    setEditingOwner(owner);
    setShowEditOwnerModal(true);
  };

  // Función para guardar edición de propietario
  const handleSaveEditOwner = async (updatedData: any) => {
    if (!editingOwner) return;

    setIsEditingOwner(true);
    try {
      const response = await api.update(`propietarios`, editingOwner.id, updatedData);
      
      if (response.success) {
        // Actualizar la lista de propietarios
        setOwners(prev => prev.map(owner => 
          owner.id === editingOwner.id 
            ? { ...owner, ...response.propietario }
            : owner
        ));
        
        setShowEditOwnerModal(false);
        setEditingOwner(null);
        
        toast({ 
          title: 'Propietario actualizado exitosamente', 
          description: 'Los datos han sido guardados correctamente', 
        });
      }
    } catch (error: any) {
      toast({ 
        title: 'Error al actualizar propietario', 
        description: error.message || 'Ocurrió un error inesperado', 
      });
    } finally {
      setIsEditingOwner(false);
    }
  };

  // Función para eliminar propietario
  const handleDeleteOwner = async (owner: Owner) => {
    setOwnerToDelete(owner);
    setShowDeleteConfirmModal(true);
  };

  // Función para confirmar eliminación
  const confirmDeleteOwner = async () => {
    if (!ownerToDelete) return;

    setIsDeletingOwner(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'https://short-backend-five.vercel.app'}/api/propietarios/${ownerToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 409) {
          // El propietario tiene propiedades asociadas
          toast({ 
            title: 'No se puede eliminar', 
            description: 'El propietario tiene propiedades asociadas y no puede ser eliminado', 
          });
          return;
        }
        
        throw new Error(errorData.error || errorData.message || 'Error al eliminar propietario');
      }
      
      // Remover de la lista de propietarios
      setOwners(prev => prev.filter(o => o.id !== ownerToDelete.id));
      
      // Remover de los propietarios seleccionados si estaba seleccionado
      setForm(prev => ({
        ...prev,
        propietarios: prev.propietarios.filter(id => id !== ownerToDelete.id)
      }));
      
      toast({ 
        title: 'Propietario eliminado exitosamente', 
        description: 'El propietario ha sido removido del sistema', 
      });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Error al eliminar propietario', 
      });
    } finally {
      setIsDeletingOwner(false);
      setShowDeleteConfirmModal(false);
      setOwnerToDelete(null);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Cargando…</div>
  }

  return (
    <>
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primera línea: Título y Tipo de Propiedad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                id="titulo"
                type="text"
                value={form.titulo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, titulo: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="tipo_propiedad" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Propiedad *
              </label>
              <select
                id="tipo_propiedad"
                value={form.tipo_propiedad_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, tipo_propiedad_id: +e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Seleccionar tipo</option>
                {tiposProp.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Segunda línea: Moneda y Precio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="moneda" className="block text-sm font-medium text-gray-700 mb-2">
                Moneda *
              </label>
              <select
                id="moneda"
                value={form.id_moneda}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, id_moneda: +e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Seleccionar moneda</option>
                {monedas.map(moneda => (
                  <option key={moneda.id} value={moneda.id}>{moneda.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <input
                id="precio"
                type="number"
                min={0}
                value={form.precio}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, precio: +e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tercera línea: Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="descripcion"
              rows={3}
              value={form.descripcion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Cuarta línea: Fecha */}
          <div>
            <label htmlFor="fecha_publicacion" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Publicación *
            </label>
            <input
              id="fecha_publicacion"
              type="date"
              value={form.fecha_publicacion}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, fecha_publicacion: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div>
              <label htmlFor="superficie" className="block text-sm font-medium text-gray-700 mb-2">
                Superficie (m²)
              </label>
              <input
                id="superficie"
                type="number"
                min={0}
                value={form.superficie_m2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, superficie_m2: +e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="ancho" className="block text-sm font-medium text-gray-700 mb-2">
                Ancho (m)
              </label>
              <input
                id="ancho"
                type="number"
                min={0}
                step={0.1}
                value={form.ancho_m}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, ancho_m: +e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="largo" className="block text-sm font-medium text-gray-700 mb-2">
                Largo (m)
              </label>
              <input
                id="largo"
                type="number"
                min={0}
                step={0.1}
                value={form.largo_m}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, largo_m: +e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="antiguedad" className="block text-sm font-medium text-gray-700 mb-2">
                Antigüedad
              </label>
              <input
                id="antiguedad"
                type="number"
                min={0}
                value={form.antiguedad}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, antiguedad: +e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="dormitorios" className="block text-sm font-medium text-gray-700 mb-2">
                Dormitorios
              </label>
              <input
                id="dormitorios"
                type="number"
                min={0}
                value={form.dormitorios}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, dormitorios: +e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="banos" className="block text-sm font-medium text-gray-700 mb-2">
                Baños
              </label>
              <input
                id="banos"
                type="number"
                min={0}
                value={form.banos}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, banos: +e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {/* 2. Características */}
          <div>
            <label htmlFor="caracteristicas" className="block text-sm font-medium text-gray-700 mb-2">
              Características
            </label>
            <Select
              isMulti
              name="caracteristicas"
              options={chars.map(char => ({ value: char.id, label: char.nombre }))}
              value={chars.filter(char => form.caracteristicas.includes(char.id)).map(char => ({ value: char.id, label: char.nombre }))}
              onChange={selected => {
                setForm({ ...form, caracteristicas: selected ? (selected as any[]).map((s: any) => s.value) : [] })
              }}
              classNamePrefix="react-select"
              placeholder="Seleccionar características"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="estado_comercial" className="block text-sm font-medium text-gray-700 mb-2">
                Estado Comercial *
              </label>
              <select
                id="estado_comercial"
                value={form.estado_comercial_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, estado_comercial_id: +e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Seleccionar estado</option>
                {estCom.map(estado => (
                  <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="estado_situacion" className="block text-sm font-medium text-gray-700 mb-2">
                Estado Situación *
              </label>
              <select
                id="estado_situacion"
                value={form.estado_situacion_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, estado_situacion_id: +e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Seleccionar estado</option>
                {estSit.map(estado => (
                  <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="estado_registro" className="block text-sm font-medium text-gray-700 mb-2">
                Estado Registro *
              </label>
              <select
                id="estado_registro"
                value={form.estado_registro_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, estado_registro_id: +e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Seleccionar estado</option>
                {estReg.map(estado => (
                  <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="estado_fisico" className="block text-sm font-medium text-gray-700 mb-2">
                Estado Físico *
              </label>
              <select
                id="estado_fisico"
                value={form.estado_fisico_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, estado_fisico_id: +e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Seleccionar estado</option>
                {estFis.map(estado => (
                  <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          {/* 4. Imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes
            </label>
            <ImageUploader 
              onImagesChange={setUploadedImages} 
              existingImages={Array.isArray(property.imagenes) ? property.imagenes.map(img => typeof img === 'string' ? { url: img } : img) : []}
              isEditMode={true}
              propiedadId={property.id}
            />
          </div>
          {/* 5. Propietarios */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="propietarios" className="block text-sm font-medium text-gray-700">
                  Propietarios
                </label>
                <button 
                  type="button" 
                  className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-xs" 
                  onClick={() => setShowOwnerModal(true)}
                  title="Agregar propietario"
                >
                  <Plus size={12} />
                </button>
              </div>
              <Select
                isMulti
                name="propietarios"
                options={owners.map(owner => ({ 
                  value: owner.id, 
                  label: owner.nombre_completo,
                  owner: owner,
                  onEdit: handleEditOwner,
                  onDelete: handleDeleteOwner
                }))}
                value={owners
                  .filter(owner => form.propietarios.includes(owner.id))
                  .map(owner => ({ 
                    value: owner.id, 
                    label: owner.nombre_completo,
                    owner: owner,
                    onEdit: handleEditOwner,
                    onDelete: handleDeleteOwner
                  }))}
                onChange={selected => {
                  setForm({ ...form, propietarios: selected ? (selected as any[]).map((s: any) => s.value) : [] })
                }}
                classNamePrefix="react-select"
                placeholder="Seleccionar propietarios"
                components={{ Option: CustomOption }}
              />
            </div>
          </div>
          {/* 6. Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label htmlFor="provincia" className="block text-sm font-medium text-gray-700 mb-2">
                Provincia
              </label>
              <select
                id="provincia"
                value={form.provincia_id}
                onChange={e => setForm({ ...form, provincia_id: +e.target.value, ciudad_id: 0 })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Seleccionar provincia</option>
                {provincias.map(prov => (
                  <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad
              </label>
              <select
                id="ciudad"
                value={form.ciudad_id}
                onChange={e => setForm({ ...form, ciudad_id: +e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!form.provincia_id}
              >
                <option value={0}>Seleccionar ciudad</option>
                {ciudades.map(ciudad => (
                  <option key={ciudad.id} value={ciudad.id}>{ciudad.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="barrio" className="block text-sm font-medium text-gray-700">
                  Barrio
                </label>
                <button
                  type="button"
                  onClick={handleOpenNewBarrioModal}
                  className={`px-2 py-1 rounded-md transition-colors flex items-center justify-center text-xs ${
                    form.ciudad_id 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={form.ciudad_id ? "Agregar nuevo barrio" : "Primero selecciona una ciudad"}
                  disabled={!form.ciudad_id}
                >
                  <Plus size={12} />
                </button>
              </div>
              <select
                id="barrio"
                value={form.barrio_id}
                onChange={e => setForm({ ...form, barrio_id: +e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!form.ciudad_id}
              >
                <option value={0}>Seleccionar barrio</option>
                {barrios.map(barrio => (
                  <option key={barrio.id} value={barrio.id}>{barrio.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="calle" className="block text-sm font-medium text-gray-700 mb-2">
                Calle
              </label>
              <input
                id="calle"
                type="text"
                value={form.calle}
                onChange={e => setForm({ ...form, calle: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-2">
                Número
              </label>
              <input
                id="numero"
                type="text"
                value={form.numero}
                onChange={e => setForm({ ...form, numero: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="piso" className="block text-sm font-medium text-gray-700 mb-2">
                Piso
              </label>
              <input
                id="piso"
                type="text"
                value={form.piso}
                onChange={e => setForm({ ...form, piso: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-2">
                Departamento
              </label>
              <input
                id="departamento"
                type="text"
                value={form.departamento}
                onChange={e => setForm({ ...form, departamento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Campos adicionales de dirección */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="unidad_funcional" className="block text-sm font-medium text-gray-700 mb-2">
                Unidad Funcional
              </label>
              <input
                id="unidad_funcional"
                type="text"
                value={form.unidad_funcional}
                onChange={e => setForm({ ...form, unidad_funcional: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="manzana" className="block text-sm font-medium text-gray-700 mb-2">
                Manzana
              </label>
              <input
                id="manzana"
                type="text"
                value={form.manzana}
                onChange={e => setForm({ ...form, manzana: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="parcela" className="block text-sm font-medium text-gray-700 mb-2">
                Parcela
              </label>
              <input
                id="parcela"
                type="text"
                value={form.parcela}
                onChange={e => setForm({ ...form, parcela: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* 7. Geolocalización */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="latitud" className="block text-sm font-medium text-gray-700 mb-2">Latitud</label>
              <input 
                id="latitud" 
                type="number" 
                step="any"
                placeholder="Ej: -27.4516"
                value={form.latitud} 
                onChange={e => setForm({ ...form, latitud: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label htmlFor="longitud" className="block text-sm font-medium text-gray-700 mb-2">Longitud</label>
              <input 
                id="longitud" 
                type="number" 
                step="any"
                placeholder="Ej: -58.9867"
                value={form.longitud} 
                onChange={e => setForm({ ...form, longitud: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div className="flex items-end gap-4">
              <button 
                type="button" 
                onClick={handleGeolocalizar} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2" 
                disabled={geoLoading}
              >
                <MapPin size={14} />
                {geoLoading ? 'Obteniendo...' : 'Geolocalizar'}
              </button>
              <button 
                type="button" 
                onClick={() => setForm({ ...form, latitud: '', longitud: '' })}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                title="Limpiar coordenadas"
              >
                <Brush size={14} />
                Limpiar
              </button>
            </div>
          </div>
          {geoError && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
              {geoError}
            </div>
          )}
          <div className="flex justify-end space-x-4">
            <button 
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
      {/* Modal de alta de propietario fuera del form principal */}
      <Dialog open={showOwnerModal} onOpenChange={setShowOwnerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Propietario</DialogTitle>
            <DialogDescription>Completa los datos del nuevo propietario</DialogDescription>
          </DialogHeader>
          {ownerModalError && <div className="text-red-600 font-semibold mb-2">{ownerModalError}</div>}
          <form onSubmit={async e => {
            e.preventDefault();
            setSavingOwner(true);
            setOwnerModalError(null);
            try {
              if (!newOwner.nombre_completo || !newOwner.tipo_documento_id || !newOwner.numero_documento) {
                setOwnerModalError('Todos los campos obligatorios deben estar completos.');
                setSavingOwner(false);
                return;
              }
              const res = await api.create('propietarios', newOwner);
              setOwners(prev => [...prev, res]);
              setForm(f => ({ ...f, propietarios: [...f.propietarios, res.id] }));
              setShowOwnerModal(false);
              setNewOwner({ nombre_completo: '', tipo_documento_id: '', numero_documento: '', email: '', telefono: '' });
            } catch (err) {
              setOwnerModalError('Error al crear propietario.');
            } finally {
              setSavingOwner(false);
            }
          }} className="space-y-4">
            <input required type="text" placeholder="Nombre completo" value={newOwner.nombre_completo} onChange={e => setNewOwner({ ...newOwner, nombre_completo: e.target.value })} className="w-full px-3 py-2 border rounded" />
            <select
              required
              value={newOwner.tipo_documento_id}
              onChange={e => setNewOwner({ ...newOwner, tipo_documento_id: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Tipo de documento</option>
              <option value="1">DNI</option>
              <option value="2">CUIT</option>
              <option value="3">LC</option>
              <option value="4">LE</option>
              <option value="5">Pasaporte</option>
            </select>
            <input required type="text" placeholder="Número de documento" value={newOwner.numero_documento} onChange={e => setNewOwner({ ...newOwner, numero_documento: e.target.value })} className="w-full px-3 py-2 border rounded" />
            <input type="email" placeholder="Email" value={newOwner.email} onChange={e => setNewOwner({ ...newOwner, email: e.target.value })} className="w-full px-3 py-2 border rounded" />
            <input type="text" placeholder="Teléfono" value={newOwner.telefono} onChange={e => setNewOwner({ ...newOwner, telefono: e.target.value })} className="w-full px-3 py-2 border rounded" />
            <DialogFooter>
              <button type="button" onClick={() => setShowOwnerModal(false)} className="px-4 py-2 border rounded">Cancelar</button>
              <button type="submit" disabled={savingOwner} className="px-4 py-2 bg-blue-600 text-white rounded">{savingOwner ? 'Guardando...' : 'Guardar'}</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de nuevo barrio */}
      <Dialog open={showNewBarrioModal} onOpenChange={setShowNewBarrioModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Barrio</DialogTitle>
            <DialogDescription>
              Crear nuevo barrio para {ciudades.find(c => c.id === form.ciudad_id)?.nombre}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="newBarrioNombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del barrio
              </label>
              <input
                id="newBarrioNombre"
                type="text"
                value={newBarrioNombre}
                onChange={e => setNewBarrioNombre(e.target.value)}
                placeholder="Ingresa el nombre del barrio"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateBarrio();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <button 
              type="button" 
              onClick={() => setShowNewBarrioModal(false)} 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={handleCreateBarrio}
              disabled={isCreatingBarrio || !newBarrioNombre.trim()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isCreatingBarrio ? 'Creando...' : 'Crear Barrio'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edición de propietario */}
      <Dialog open={showEditOwnerModal} onOpenChange={setShowEditOwnerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Propietario</DialogTitle>
            <DialogDescription>
              Modificar datos de {editingOwner?.nombre_completo}
            </DialogDescription>
          </DialogHeader>
          
          {editingOwner && (
            <form onSubmit={async e => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updatedData = {
                nombre_completo: formData.get('nombre_completo') as string,
                email: formData.get('email') as string,
                telefono: formData.get('telefono') as string
              };
              await handleSaveEditOwner(updatedData);
            }} className="space-y-4">
              <div>
                <label htmlFor="edit-nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  id="edit-nombre"
                  name="nombre_completo"
                  type="text"
                  defaultValue={editingOwner.nombre_completo}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editingOwner.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="edit-telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  id="edit-telefono"
                  name="telefono"
                  type="text"
                  defaultValue={editingOwner.telefono || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <DialogFooter>
                <button 
                  type="button" 
                  onClick={() => setShowEditOwnerModal(false)} 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isEditingOwner} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isEditingOwner ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar a "{ownerToDelete?.nombre_completo}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button 
              type="button" 
              onClick={() => setShowDeleteConfirmModal(false)} 
              className="px-4 py-2 border rounded"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={confirmDeleteOwner} 
              disabled={isDeletingOwner} 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeletingOwner ? 'Eliminando...' : 'Eliminar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}