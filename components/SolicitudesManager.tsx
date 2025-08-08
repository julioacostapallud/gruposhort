'use client'

import { useState, useEffect } from 'react'
import { solicitudes } from '@/lib/services/solicitudes'
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
import { Spinner } from '@/components/ui/spinner'
import { Gavel, Handshake } from 'lucide-react'

interface SolicitudesManagerProps {
  tasacionesPendientes?: number
  ventasPendientes?: number
}

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

export function SolicitudesManager({ tasacionesPendientes = 0, ventasPendientes = 0 }: SolicitudesManagerProps) {
  const [activeTab, setActiveTab] = useState<'tasaciones' | 'venderAlquilar'>('tasaciones')

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('tasaciones')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'tasaciones'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Gavel className="h-5 w-5" />
            <span>Solicitudes de Tasación</span>
            {tasacionesPendientes > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {tasacionesPendientes}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('venderAlquilar')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'venderAlquilar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Handshake className="h-5 w-5" />
            <span>Solicitudes de Venta/Alquiler</span>
            {ventasPendientes > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {ventasPendientes}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contenido de tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeTab === 'tasaciones' && <TablaSolicitudesTasacion />}
        {activeTab === 'venderAlquilar' && <TablaSolicitudesVenderAlquilar />}
      </div>
    </div>
  )
} 