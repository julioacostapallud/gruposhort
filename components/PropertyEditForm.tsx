'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { propiedades, Propiedad } from '@/lib/services/propiedades'
import { api } from '@/lib/services/apiClient'
import { ImageUploader } from '@/components/ImageUploader'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Plus } from 'lucide-react';
import Select from 'react-select';
import { useToast } from "@/hooks/use-toast";

type Cat = { id: number; nombre: string }
type Owner = { id: number; nombre_completo: string }

interface PropertyEditFormProps {
  property: Propiedad
  onSuccess?: () => void
  onCancel?: () => void
}

export function PropertyEditForm({ property, onSuccess, onCancel }: PropertyEditFormProps) {
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
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; public_id: string }>>([])
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [newOwner, setNewOwner] = useState({ nombre_completo: '', tipo_documento_id: '', numero_documento: '', email: '', telefono: '' });
  const [savingOwner, setSavingOwner] = useState(false);
  const [ownerModalError, setOwnerModalError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Memoizar existingImages para evitar ciclos infinitos en ImageUploader
  const memoizedExistingImages = useMemo(() => property.imagenes, [property.imagenes])

  const [form, setForm] = useState({
    titulo: property.titulo,
    descripcion: property.descripcion || '',
    precio: parseFloat(property.precio),
    superficie_m2: property.superficie_m2 ? parseFloat(property.superficie_m2) : 0,
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
    calle: property.direccion?.calle || '',
    numero: property.direccion?.numero || '',
    piso: property.direccion?.piso || '',
    departamento: property.direccion?.departamento || ''
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
              }
            }
          })
        }
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validación de dirección obligatoria
    if (!form.provincia_id || !form.ciudad_id || !form.calle.trim() || !form.numero.trim()) {
      setFormError('La dirección (provincia, ciudad, calle y número) es obligatoria.');
      return;
    }
    setFormError(null);
    setSaving(true)
    
    try {
      // Obtener las imágenes marcadas para eliminar
      const imagesToDelete = (window as any).ImageUploaderRef?.getImagesToDelete() || []
      
      await propiedades.update(property.id, {
        tipo_propiedad_id: form.tipo_propiedad_id,
        estado_comercial_id: form.estado_comercial_id,
        estado_situacion_id: form.estado_situacion_id,
        estado_registro_id: form.estado_registro_id,
        estado_fisico_id: form.estado_fisico_id,
        titulo: form.titulo,
        descripcion: form.descripcion,
        precio: form.precio,
        superficie_m2: form.superficie_m2 || undefined,
        dormitorios: form.dormitorios || undefined,
        banos: form.banos || undefined,
        direccion_id: property.direccion?.id,
        id_moneda: form.id_moneda,
        caracteristicas: Array.isArray(form.caracteristicas) ? form.caracteristicas.map(id => ({ id })) : [],
        propietarios: Array.isArray(form.propietarios) ? form.propietarios.map(id => ({ id })) : [],
        provincia_id: form.provincia_id || undefined,
        ciudad_id: form.ciudad_id || undefined,
        calle: form.calle || undefined,
        numero: form.numero || undefined,
        piso: form.piso || undefined,
        departamento: form.departamento || undefined
      })
      
      // Manejar imágenes: eliminar las marcadas y agregar las nuevas
      if (imagesToDelete.length > 0 || uploadedImages.length > 0) {
        try {
          // 1. Eliminar imágenes marcadas para eliminar de Cloudinary
          const { cloudinaryService } = await import('@/lib/services/cloudinary')
          for (const image of imagesToDelete) {
            try {
              await cloudinaryService.deleteImage(image.public_id)
              console.log('Imagen eliminada de Cloudinary:', image.public_id)
            } catch (error) {
              console.error('Error eliminando imagen de Cloudinary:', image.public_id, error)
              // Continuar con las demás imágenes
            }
          }
          
          // 2. Preparar la lista final de imágenes para la base de datos
          // Obtener las imágenes existentes que NO están marcadas para eliminar
          const existingImagesNotDeleted = Array.isArray(property.imagenes) 
            ? property.imagenes
                .map(img => typeof img === 'string' ? { url: img } : img)
                .filter(img => !imagesToDelete.some((toDelete: any) => toDelete.public_id === img.public_id))
            : []
          
          // Combinar imágenes existentes (no eliminadas) + nuevas imágenes
          const finalImages = [...existingImagesNotDeleted, ...uploadedImages]
          
          // 3. Actualizar imágenes en la base de datos
          try {
            await propiedades.updateImages(property.id, finalImages)
            console.log('Imágenes actualizadas en la base de datos:', finalImages.length)
          } catch (error) {
            console.error('Error actualizando imágenes en BD:', error)
            throw new Error('Error al actualizar imágenes en la base de datos')
          }
          
          // 4. Limpiar la lista de imágenes marcadas para eliminar
          (window as any).ImageUploaderRef?.clearImagesToDelete()
        } catch (error) {
          console.error('Error manejando imágenes:', error)
          toast({ 
            title: 'Error al actualizar imágenes', 
            description: 'La propiedad se actualizó pero hubo problemas con las imágenes.', 
            variant: 'destructive'
          })
        }
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

  if (loading) {
    return <div className="text-center py-5">Cargando…</div>
  }

  return (
    <>
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Datos principales */}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
          {/* 3. Estados y moneda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label htmlFor="propietarios" className="block text-sm font-medium text-gray-700 mb-2">
                Propietarios
              </label>
              <Select
                isMulti
                name="propietarios"
                options={owners.map(owner => ({ value: owner.id, label: owner.nombre_completo }))}
                value={owners
                  .filter(owner => form.propietarios.includes(owner.id))
                  .map(owner => ({ value: owner.id, label: owner.nombre_completo }))}
                onChange={selected => {
                  setForm({ ...form, propietarios: selected ? (selected as any[]).map((s: any) => s.value) : [] })
                }}
                classNamePrefix="react-select"
                placeholder="Seleccionar propietarios"
              />
              <button type="button" className="mt-2 px-2 py-1 rounded bg-blue-100 text-blue-600 flex items-center gap-1" onClick={() => setShowOwnerModal(true)}>
                <Plus className="w-4 h-4" /> Agregar propietario
              </button>
            </div>
          </div>
          {/* 6. Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          {/* Eliminar inputs de latitud y longitud y el botón de geolocalizar */}
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
    </>
  )
} 