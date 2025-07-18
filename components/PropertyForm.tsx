'use client'

import React, { useState, useEffect } from 'react'
import { propiedades } from '@/lib/services/propiedades'
import { api } from '@/lib/services/apiClient'
import { ImageUploader } from '@/components/ImageUploader'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Plus } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Input } from 'reactstrap';
import Select from 'react-select';
import { useToast } from "@/hooks/use-toast";

type Cat = { id: number; nombre: string }
type Owner = { id: number; nombre_completo: string }

interface PropertyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PropertyForm({ onSuccess, onCancel }: PropertyFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true)
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

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    precio: 0,
    superficie_m2: 0,
    dormitorios: 0,
    banos: 0,
    tipo_propiedad_id: 0,
    estado_comercial_id: 0,
    estado_situacion_id: 0,
    estado_registro_id: 0,
    estado_fisico_id: 0,
    id_moneda: 0,
    caracteristicas: [] as number[],
    propietarios: [] as number[],
    provincia_id: 0,
    ciudad_id: 0,
    calle: '',
    numero: '',
    piso: '',
    departamento: '',
    latitud: '',
    longitud: ''
  })

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
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (form.provincia_id) {
      api.list<Cat[]>(`ciudades?provincia_id=${form.provincia_id}`)
         .then(setCiudades)
    }
  }, [form.provincia_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validación de dirección obligatoria
    if (!form.provincia_id || !form.ciudad_id || !form.calle.trim() || !form.numero.trim()) {
      setFormError('La dirección (provincia, ciudad, calle y número) es obligatoria.');
      return;
    }
    setFormError(null);
    try {
      const { id: propId } = await propiedades.create({
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
        id_moneda: form.id_moneda,
        caracteristicas: form.caracteristicas, // array de IDs
        propietarios: form.propietarios, // array de IDs
        provincia_id: form.provincia_id || undefined,
        ciudad_id: form.ciudad_id || undefined,
        calle: form.calle || undefined,
        numero: form.numero || undefined,
        piso: form.piso || undefined,
        departamento: form.departamento || undefined,
        latitud: form.latitud || undefined,
        longitud: form.longitud || undefined
      })
      if (uploadedImages.length > 0) {
        await propiedades.uploadImages(propId, uploadedImages)
      }
      toast({ title: 'Propiedad creada correctamente', description: '', })
      onSuccess?.()
    } catch (err) {
      toast({ title: 'Error al crear la propiedad', description: err?.message || '', })
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

  // Opciones de tipo de documento según la tabla
  const tiposDocumento = [
    { value: 1, label: 'DNI' },
    { value: 2, label: 'CUIT' },
    { value: 3, label: 'LC' },
    { value: 4, label: 'LE' },
    { value: 5, label: 'Pasaporte' },
  ];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              id="titulo"
              type="text"
              value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })}
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
              onChange={e => setForm({ ...form, precio: +e.target.value })}
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
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
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
              onChange={e => setForm({ ...form, superficie_m2: +e.target.value })}
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
              onChange={e => setForm({ ...form, dormitorios: +e.target.value })}
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
              onChange={e => setForm({ ...form, banos: +e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tipo_propiedad" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Propiedad *
            </label>
            <select
              id="tipo_propiedad"
              value={form.tipo_propiedad_id}
              onChange={e => setForm({ ...form, tipo_propiedad_id: +e.target.value })}
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
              onChange={e => setForm({ ...form, id_moneda: +e.target.value })}
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

        {/* Select múltiple de características */}
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
              setForm({ ...form, caracteristicas: selected ? selected.map((s: any) => s.value) : [] })
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
              onChange={e => setForm({ ...form, estado_comercial_id: +e.target.value })}
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
              onChange={e => setForm({ ...form, estado_situacion_id: +e.target.value })}
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
              onChange={e => setForm({ ...form, estado_registro_id: +e.target.value })}
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
              onChange={e => setForm({ ...form, estado_fisico_id: +e.target.value })}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes
          </label>
          <ImageUploader onImagesChange={setUploadedImages} isEditMode={false} />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="propietarios" className="block text-sm font-medium text-gray-700 mb-2">
              Propietarios
            </label>
            <Select
              isMulti
              name="propietarios"
              options={owners.map(owner => ({ value: owner.id, label: owner.nombre_completo }))}
              value={owners.filter(owner => form.propietarios.includes(owner.id)).map(owner => ({ value: owner.id, label: owner.nombre_completo }))}
              onChange={selected => {
                setForm({ ...form, propietarios: selected ? selected.map((s: any) => s.value) : [] })
              }}
              classNamePrefix="react-select"
              placeholder="Seleccionar propietarios"
            />
            <button type="button" className="mt-2 px-2 py-1 rounded bg-blue-100 text-blue-600 flex items-center gap-1" onClick={() => setShowOwnerModal(true)}>
              <Plus className="w-4 h-4" /> Agregar propietario
            </button>
          </div>
        </div>

        {/* Dirección completa */}
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
          <div>
            <label htmlFor="latitud" className="block text-sm font-medium text-gray-700 mb-2">Latitud</label>
            <input id="latitud" type="text" value={form.latitud} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
          </div>
          <div>
            <label htmlFor="longitud" className="block text-sm font-medium text-gray-700 mb-2">Longitud</label>
            <input id="longitud" type="text" value={form.longitud} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
          </div>
          <div className="col-span-2 flex items-center gap-2 mt-2">
            <button type="button" onClick={handleGeolocalizar} className="px-3 py-2 bg-blue-600 text-white rounded shadow disabled:opacity-50" disabled={geoLoading}>
              {geoLoading ? 'Obteniendo ubicación...' : 'Geolocalizar'}
            </button>
            {geoError && <span className="text-red-600 text-sm ml-2">{geoError}</span>}
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

        {formError && <div className="text-red-600 font-semibold mb-2">{formError}</div>}

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </form>
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
              onChange={e => setNewOwner({ ...newOwner, tipo_documento_id: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Tipo de documento</option>
              {tiposDocumento.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
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
