'use client'

import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { Form, FormGroup, Label, Input, Row, Col, Button } from 'reactstrap'
import { propiedades, Propiedad } from '@/lib/services/propiedades'
import { api } from '@/lib/services/apiClient'
import { ImageUploader } from '@/components/ImageUploader'

type Cat = { id: number; nombre: string }
type Owner = { id: number; nombre_completo: string }
type Option = { value: number; label: string }

interface PropertyEditFormProps {
  property: Propiedad
  onSuccess?: () => void
  onCancel?: () => void
}

export function PropertyEditForm({ property, onSuccess, onCancel }: PropertyEditFormProps) {
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

  // Inicializar el formulario con los datos de la propiedad
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
    // Campos de dirección
    provincia_id: 0,
    ciudad_id: 0,
    calle: property.direccion ? property.direccion.calle : '',
    numero: property.direccion ? property.direccion.numero : '',
    piso: property.direccion ? property.direccion.piso || '' : '',
    departamento: property.direccion ? property.direccion.departamento || '' : ''
  })

  const toOptions = (items: Cat[] | Owner[]): Option[] =>
    items.map(i => ({
      value: i.id,
      label: 'nombre_completo' in i ? i.nombre_completo : i.nombre
    }))

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
    setSaving(true)
    
    try {
      // Actualizar la propiedad con todos los campos
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
        caracteristicas: form.caracteristicas.map(id => ({ id })),
        propietarios: form.propietarios.map(id => ({ id })),
        // Campos de dirección
        provincia_id: form.provincia_id || undefined,
        ciudad_id: form.ciudad_id || undefined,
        calle: form.calle || undefined,
        numero: form.numero || undefined,
        piso: form.piso || undefined,
        departamento: form.departamento || undefined
      })
      
      // Actualizar las imágenes si hay nuevas
      if (uploadedImages.length > 0) {
        await propiedades.updateImages(property.id, uploadedImages)
      }
      
      onSuccess?.()
    } catch (error) {
      console.error('Error actualizando propiedad:', error)
      alert('Error al actualizar la propiedad')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-5">Cargando…</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold">Editar Propiedad</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <Button 
            color="secondary" 
            onClick={onCancel}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            color="primary"
            disabled={saving}
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <Form onSubmit={handleSubmit} className="container-fluid py-3 py-md-4">
        <Row>
          <Col xs={12} md={6}>
            <FormGroup>
              <Label for="titulo">Título *</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, titulo: e.target.value })}
                required
              />
            </FormGroup>
          </Col>
          <Col xs={12} md={6}>
            <FormGroup>
              <Label for="precio">Precio *</Label>
              <Input
                id="precio"
                type="number"
                min={0}
                value={form.precio}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, precio: +e.target.value })}
                required
              />
            </FormGroup>
          </Col>
        </Row>

        <FormGroup>
          <Label for="descripcion">Descripción</Label>
          <Input
            id="descripcion"
            type="textarea"
            rows={3}
            value={form.descripcion}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, descripcion: e.target.value })}
          />
        </FormGroup>

        <Row>
          <Col xs={12} sm={4}>
            <FormGroup>
              <Label>Superficie (m²)</Label>
              <Input
                type="number"
                min={0}
                value={form.superficie_m2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, superficie_m2: +e.target.value })}
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={4}>
            <FormGroup>
              <Label>Dormitorios</Label>
              <Input
                type="number"
                min={0}
                value={form.dormitorios}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, dormitorios: +e.target.value })}
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={4}>
            <FormGroup>
              <Label>Baños</Label>
              <Input
                type="number"
                min={0}
                value={form.banos}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, banos: +e.target.value })}
              />
            </FormGroup>
          </Col>
        </Row>

        <Row>
          {[
            { label: 'Tipo de propiedad', key: 'tipo_propiedad_id', items: tiposProp },
            { label: 'Estado comercial', key: 'estado_comercial_id', items: estCom },
            { label: 'Estado situación', key: 'estado_situacion_id', items: estSit },
            { label: 'Estado registro', key: 'estado_registro_id', items: estReg },
            { label: 'Estado físico', key: 'estado_fisico_id', items: estFis },
            { label: 'Moneda', key: 'id_moneda', items: monedas }
          ].map(({ label, key, items }) => (
            <Col xs={12} sm={6} md={4} key={key}>
              <FormGroup>
                <Label>{label}</Label>
                <Select
                  value={toOptions(items).find(opt => opt.value === form[key as keyof typeof form])}
                  onChange={(option: any) => setForm({ ...form, [key]: option.value })}
                  options={toOptions(items)}
                  placeholder={`Seleccionar ${label.toLowerCase()}`}
                />
              </FormGroup>
            </Col>
          ))}
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <FormGroup>
              <Label>Características</Label>
              <Select
                isMulti
                value={toOptions(chars).filter(opt => form.caracteristicas.includes(opt.value))}
                onChange={(options: any) => 
                  setForm({ ...form, caracteristicas: options.map((opt: Option) => opt.value) })
                }
                options={toOptions(chars)}
                placeholder="Seleccionar características"
              />
            </FormGroup>
          </Col>
          <Col xs={12} md={6}>
            <FormGroup>
              <Label>Propietarios</Label>
              <Select
                isMulti
                value={toOptions(owners).filter(opt => form.propietarios.includes(opt.value))}
                onChange={(options: any) => 
                  setForm({ ...form, propietarios: options.map((opt: Option) => opt.value) })
                }
                options={toOptions(owners)}
                placeholder="Seleccionar propietarios"
              />
            </FormGroup>
          </Col>
        </Row>

        {/* Campos de dirección */}
        <Row className="mt-4">
          <Col xs={12}>
            <h5>Dirección</h5>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col xs={12} sm={6} md={3}>
            <FormGroup>
              <Label>Provincia</Label>
              <Select
                value={toOptions(provincias).find(opt => opt.value === form.provincia_id)}
                onChange={(option: any) => setForm({ ...form, provincia_id: option.value })}
                options={toOptions(provincias)}
                placeholder="Seleccionar provincia"
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <FormGroup>
              <Label>Ciudad</Label>
              <Select
                value={toOptions(ciudades).find(opt => opt.value === form.ciudad_id)}
                onChange={(option: any) => setForm({ ...form, ciudad_id: option.value })}
                options={toOptions(ciudades)}
                placeholder="Seleccionar ciudad"
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <FormGroup>
              <Label>Calle</Label>
              <Input
                value={form.calle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, calle: e.target.value })}
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <FormGroup>
              <Label>Número</Label>
              <Input
                value={form.numero}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, numero: e.target.value })}
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <FormGroup>
              <Label>Piso</Label>
              <Input
                value={form.piso}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, piso: e.target.value })}
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <FormGroup>
              <Label>Departamento</Label>
              <Input
                value={form.departamento}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, departamento: e.target.value })}
              />
            </FormGroup>
          </Col>
        </Row>

        <FormGroup>
          <Label>Imágenes</Label>
          <ImageUploader
            onImagesChange={setUploadedImages}
            existingImages={(property.imagenes || []).map(url => ({ url }))}
          />
        </FormGroup>
      </Form>
    </div>
  )
} 