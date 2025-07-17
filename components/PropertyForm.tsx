// src/components/PropertyForm.tsx
'use client'

import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useState, useEffect } from 'react'
import Select, { OptionsType } from 'react-select'
import { Form, FormGroup, Label, Input, Row, Col, Button } from 'reactstrap'
import { propiedades } from '@/lib/services/propiedades'
import { api } from '@/lib/services/apiClient'
import { ImageUploader } from '@/components/ImageUploader'

type Cat   = { id: number; nombre: string }
type Owner = { id: number; nombre_completo: string }
type Option = { value: number; label: string }

interface PropertyFormProps {
  onSuccess?: () => void;
}

export function PropertyForm({ onSuccess }: PropertyFormProps) {
  const [loading, setLoading]       = useState(true)
  const [tiposProp, setTiposProp]   = useState<Cat[]>([])
  const [estCom,    setEstCom]      = useState<Cat[]>([])
  const [estSit,    setEstSit]      = useState<Cat[]>([])
  const [estReg,    setEstReg]      = useState<Cat[]>([])
  const [estFis,    setEstFis]      = useState<Cat[]>([])
  const [monedas,   setMonedas]     = useState<Cat[]>([])
  const [chars,     setChars]       = useState<Cat[]>([])
  const [owners,    setOwners]      = useState<Owner[]>([])
  const [provincias,setProvincias]  = useState<Cat[]>([])
  const [ciudades,  setCiudades]    = useState<Cat[]>([])
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; public_id: string }>>([])

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
    propietarios:    [] as number[],
    provincia_id:     0,
    ciudad_id:        0,
    calle: '',
    numero: '',
    piso: '',
    departamento: ''
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
      direccion_id: undefined,
      id_moneda: form.id_moneda,
      caracteristicas: form.caracteristicas.map(id => ({ id }))
    })
    
    // Asociar las imágenes subidas a Cloudinary con la propiedad
    if (uploadedImages.length > 0) {
      await propiedades.uploadImages(propId, uploadedImages)
    }
    
    // Llamar al callback de éxito si existe
    onSuccess?.()
  }

  if (loading) {
    return <div className="text-center py-5">Cargando…</div>
  }

  return (
    <Form onSubmit={handleSubmit} className="container-fluid py-3 py-md-4">
      <Row>
        <Col xs={12} md={6}>
          <FormGroup>
            <Label for="titulo">Título *</Label>
            <Input
              id="titulo"
              value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })}
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
              onChange={e => setForm({ ...form, precio: +e.target.value })}
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
          onChange={e => setForm({ ...form, descripcion: e.target.value })}
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
              onChange={e => setForm({ ...form, superficie_m2: +e.target.value })}
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
              onChange={e => setForm({ ...form, dormitorios: +e.target.value })}
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
              onChange={e => setForm({ ...form, banos: +e.target.value })}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        {[
          { label: 'Tipo de propiedad', key: 'tipo_propiedad_id', items: tiposProp },
          { label: 'Estado comercial',  key: 'estado_comercial_id', items: estCom },
          { label: 'Estado situación',  key: 'estado_situacion_id', items: estSit },
          { label: 'Estado registro',   key: 'estado_registro_id', items: estReg },
          { label: 'Estado físico',     key: 'estado_fisico_id', items: estFis },
          { label: 'Moneda',            key: 'id_moneda', items: monedas }
        ].map(({ label, key, items }) => (
          <Col xs={12} sm={6} md={4} className="mb-3" key={key}>
            <FormGroup>
              <Label>{label} *</Label>
              <Select<Option, false>
                options={toOptions(items)}
                value={toOptions(items).find(o => o.value === (form as any)[key]) || null}
                onChange={opt => {
                  const v = (opt as Option)?.value || 0
                  setForm({ ...form, [key]: v } as any)
                }}
                placeholder="Elige…"
              />
            </FormGroup>
          </Col>
        ))}
      </Row>

      <Row className="mt-4">
        <Col xs={12} md={6}>
          <FormGroup>
            <Label>Características</Label>
            <Select<Option, true>
              isMulti
              options={toOptions(chars)}
              value={toOptions(chars).filter(o => form.caracteristicas.includes(o.value))}
              onChange={opts => {
                const arr = (opts as OptionsType<Option>).map(o => o.value)
                setForm({ ...form, caracteristicas: arr })
              }}
              placeholder="Elige…"
            />
          </FormGroup>
        </Col>
        <Col xs={12} md={6}>
          <FormGroup>
            <Label>Propietarios</Label>
            <div className="d-flex flex-column flex-md-row gap-2 align-items-start align-items-md-center">
              <Select<Option, true>
                isMulti
                options={toOptions(owners)}
                value={toOptions(owners).filter(o => form.propietarios.includes(o.value))}
                onChange={opts => {
                  const arr = (opts as OptionsType<Option>).map(o => o.value)
                  setForm({ ...form, propietarios: arr })
                }}
                placeholder="Selecciona…"
                className="flex-grow-1"
              />
              <Button color="secondary" className="w-100 w-md-auto">+ Nuevo</Button>
            </div>
          </FormGroup>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col xs={12} md={6}>
          <FormGroup>
            <Label>Provincia *</Label>
            <Select<Option, false>
              options={toOptions(provincias)}
              value={toOptions(provincias).find(o => o.value === form.provincia_id) || null}
              onChange={opt => setForm({ ...form, provincia_id: (opt as Option).value })}
              placeholder="Elige…"
            />
          </FormGroup>
        </Col>
        <Col xs={12} md={6}>
          <FormGroup>
            <Label>Ciudad *</Label>
            <Select<Option, false>
              options={toOptions(ciudades)}
              value={toOptions(ciudades).find(o => o.value === form.ciudad_id) || null}
              onChange={opt => setForm({ ...form, ciudad_id: (opt as Option).value })}
              placeholder="Elige…"
            />
          </FormGroup>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col xs={12} sm={6} md={3}>
          <FormGroup>
            <Label>Calle *</Label>
            <Input
              value={form.calle}
              onChange={e => setForm({ ...form, calle: e.target.value })}
              required
            />
          </FormGroup>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <FormGroup>
            <Label>Número *</Label>
            <Input
              value={form.numero}
              onChange={e => setForm({ ...form, numero: e.target.value })}
              required
            />
          </FormGroup>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <FormGroup>
            <Label>Piso</Label>
            <Input
              value={form.piso}
              onChange={e => setForm({ ...form, piso: e.target.value })}
            />
          </FormGroup>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <FormGroup>
            <Label>Departamento</Label>
            <Input
              value={form.departamento}
              onChange={e => setForm({ ...form, departamento: e.target.value })}
            />
          </FormGroup>
        </Col>
      </Row>

      <FormGroup className="mt-4">
        <Label>Imágenes</Label>
        <ImageUploader onImagesChange={setUploadedImages} />
      </FormGroup>

      <div className="text-end mt-3">
        <Button color="primary" type="submit">
          Guardar Propiedad
        </Button>
      </div>
    </Form>
  )
}
