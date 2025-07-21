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
import Select from 'react-select';
import { api } from '../../lib/services/apiClient';
import { solicitudes } from '../../lib/services/solicitudes'
import { Button } from "@/components/ui/button" // Usa tu propio botón o reemplaza por button nativo
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

type Cat = { id: number; nombre: string };
type Moneda = { id: number; nombre: string; codigo_iso: string; simbolo: string };

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
  
  // Filtros principales - TODOS VACÍOS INICIALMENTE
  const [operacion, setOperacion] = useState<string>("");
  const [tipo, setTipo] = useState<number>(0);
  const [tiposProp, setTiposProp] = useState<Cat[]>([]);
  const [provincia, setProvincia] = useState<number>(0);
  const [provincias, setProvincias] = useState<Cat[]>([]);
  const [ciudad, setCiudad] = useState<number>(0);
  const [ciudades, setCiudades] = useState<Cat[]>([]);
  const [precio, setPrecio] = useState<[number, number]>([0, 0]);

  // Secundarios - TODOS VACÍOS INICIALMENTE
  const [barrio, setBarrio] = useState<number>(0);
  const [superficie, setSuperficie] = useState<[number, number]>([0, 0]);
  const [ancho, setAncho] = useState<[number, number]>([0, 0]);
  const [largo, setLargo] = useState<[number, number]>([0, 0]);
  const [antiguedad, setAntiguedad] = useState<[number, number]>([0, 0]);
  const [dormitorios, setDormitorios] = useState<[number, number]>([0, 0]);
  const [banos, setBanos] = useState<[number, number]>([0, 0]);
  const [estadoComercial, setEstadoComercial] = useState<number>(0);
  const [estadoFisico, setEstadoFisico] = useState<number>(0);
  const [estadoSituacion, setEstadoSituacion] = useState<number>(0);
  const [estadoRegistro, setEstadoRegistro] = useState<number>(0);
  const [moneda, setMoneda] = useState<number>(0);
  const [caracts, setCaracts] = useState<number[]>([]);
  const [caracteristicas, setCaracteristicas] = useState<Cat[]>([]);
  const [barrios, setBarrios] = useState<Cat[]>([]);
  const [estCom, setEstCom] = useState<Cat[]>([]);
  const [estFis, setEstFis] = useState<Cat[]>([]);
  const [estSit, setEstSit] = useState<Cat[]>([]);
  const [estReg, setEstReg] = useState<Cat[]>([]);
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  
  const [showNewPropertyModal, setShowNewPropertyModal] = useState(false);
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Propiedad | null>(null);
  const [propertiesVersion, setPropertiesVersion] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  
  // Estado para modal de nuevo barrio
  const [showNewBarrioModal, setShowNewBarrioModal] = useState(false);
  const [newBarrioNombre, setNewBarrioNombre] = useState('');
  const [isCreatingBarrio, setIsCreatingBarrio] = useState(false);

  const [adminView, setAdminView] = useState<'panel' | 'tasaciones' | 'venderAlquilar'>('panel');
  const [tasacionesPendientes, setTasacionesPendientes] = useState(0);
  const [ventasPendientes, setVentasPendientes] = useState(0);

  // Cargar contadores de pendientes
  useEffect(() => {
    solicitudes.listarTasaciones().then(data => {
      setTasacionesPendientes(data.filter((s: any) => !s.atendido).length)
    })
    solicitudes.listarVenderAlquilar().then(data => {
      setVentasPendientes(data.filter((s: any) => !s.atendido).length)
    })
  }, [adminView])

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth as any);

  // Función para construir los filtros
  const buildFilters = () => {
    return {
      operacion: operacion || undefined,
      tipo_propiedad: tipo > 0 ? tipo : undefined,
      estado_comercial: estadoComercial > 0 ? estadoComercial : undefined,
      estado_fisico: estadoFisico > 0 ? estadoFisico : undefined,
      estado_situacion: estadoSituacion > 0 ? estadoSituacion : undefined,
      estado_registro: estadoRegistro > 0 ? estadoRegistro : undefined,
      provincia: provincia > 0 ? provincias.find(p => p.id === provincia)?.nombre : undefined,
      ciudad: ciudad > 0 ? ciudades.find(c => c.id === ciudad)?.nombre : undefined,
      barrio: barrio > 0 ? barrios.find(b => b.id === barrio)?.nombre : undefined,
      min_precio: precio[0] > 0 ? precio[0] : undefined,
      max_precio: precio[1] > 0 ? precio[1] : undefined,
      min_superficie: superficie[0] > 0 ? superficie[0] : undefined,
      max_superficie: superficie[1] > 0 ? superficie[1] : undefined,
      min_ancho: ancho[0] > 0 ? ancho[0] : undefined,
      max_ancho: ancho[1] > 0 ? ancho[1] : undefined,
      min_largo: largo[0] > 0 ? largo[0] : undefined,
      max_largo: largo[1] > 0 ? largo[1] : undefined,
      max_antiguedad: antiguedad[1] > 0 ? antiguedad[1] : undefined,
      min_dormitorios: dormitorios[0] > 0 ? dormitorios[0] : undefined,
      min_banos: banos[0] > 0 ? banos[0] : undefined,
      moneda: moneda > 0 ? moneda : undefined,
      caracteristicas: caracts.length > 0 ? caracts : undefined,
    };
  };

  // Aplicar filtros automáticamente cuando cambien los valores
  useEffect(() => {
    const filters = buildFilters();
    setAppliedFilters(filters);
  }, [operacion, tipo, provincia, ciudad, barrio, moneda, precio, estadoComercial, estadoFisico, 
      estadoSituacion, estadoRegistro, superficie, ancho, largo, antiguedad, 
      dormitorios, banos, caracts]);

  // Cargar catálogos
  useEffect(() => {
    Promise.all([
      api.list<Cat[]>("tipos_propiedad").catch(() => []),
      api.list<Cat[]>("tipos_estado_comercial").catch(() => []),
      api.list<Cat[]>("tipos_estado_fisico").catch(() => []),
      api.list<Cat[]>("tipos_estado_situacion").catch(() => []),
      api.list<Cat[]>("tipos_estado_registro").catch(() => []),
      api.list<Moneda[]>("monedas").catch(() => []),
      api.list<Cat[]>("caracteristicas").catch(() => []),
      api.list<Cat[]>("provincias").catch(() => []),
      api.list<Cat[]>("barrios").catch(() => [])
    ]).then(([tp, ec, ef, es, er, m, c, provs, barr]) => {
      setTiposProp(tp || []);
      setEstCom(ec || []);
      setEstFis(ef || []);
      setEstSit(es || []);
      setEstReg(er || []);
      setMonedas(m || []);
      setCaracteristicas(c || []);
      setProvincias(provs || []);
      setBarrios(barr || []);
    }).catch(error => {
      console.error("Error cargando catálogos:", error);
    });
  }, []);

  // Cargar ciudades según provincia
  useEffect(() => {
    if (provincia) {
      api.list<Cat[]>(`ciudades?provincia_id=${provincia}`).then(setCiudades);
    } else {
      setCiudades([]);
      setCiudad(0);
    }
  }, [provincia]);

  // Cargar barrios según ciudad
  useEffect(() => {
    if (ciudad) {
      api.list<Cat[]>(`barrios?ciudad_id=${ciudad}`).then(setBarrios);
    } else {
      setBarrios([]);
      setBarrio(0);
    }
  }, [ciudad]);

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

  const clearFilters = () => {
    setOperacion("");
    setTipo(0);
    setProvincia(0);
    setCiudad(0);
    setBarrio(0);
    setMoneda(0);
    setPrecio([0, 0]);
    setSuperficie([0, 0]);
    setAncho([0, 0]);
    setLargo([0, 0]);
    setAntiguedad([0, 0]);
    setDormitorios([0, 0]);
    setBanos([0, 0]);
    setEstadoComercial(0);
    setEstadoFisico(0);
    setEstadoSituacion(0);
    setEstadoRegistro(0);
    setCaracts([]);
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm || 
           operacion || 
           tipo > 0 || 
           provincia > 0 || 
           ciudad > 0 || 
           barrio > 0 || 
           moneda > 0 || 
           precio[0] > 0 || 
           precio[1] > 0 || 
           estadoComercial > 0 || 
           estadoFisico > 0 || 
           estadoSituacion > 0 || 
           estadoRegistro > 0 ||
           superficie[0] > 0 || 
           superficie[1] > 0 || 
           ancho[0] > 0 || 
           ancho[1] > 0 ||
           largo[0] > 0 || 
           largo[1] > 0 || 
           antiguedad[1] > 0 || 
           dormitorios[0] > 0 ||
           banos[0] > 0 || 
           caracts.length > 0;
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
            {/* Hero Section - Solo HTML nativo y Tailwind */}
            <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
              <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Panel Admin</h1>
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
                            value={tipo} 
                            onChange={(e) => setTipo(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          >
                            <option value="0">Todos los tipos</option>
                            {tiposProp.map(tp => (
                              <option key={tp.id} value={tp.id}>{tp.nombre}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Operación</label>
                          <select 
                            value={operacion} 
                            onChange={(e) => setOperacion(e.target.value)}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          >
                            <option value="">Todas las operaciones</option>
                            <option value="venta">Venta</option>
                            <option value="alquiler">Alquiler</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Provincia</label>
                          <select 
                            value={provincia} 
                            onChange={(e) => setProvincia(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          >
                            <option value="0">Todas las provincias</option>
                            {provincias.map(p => (
                              <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Ciudad</label>
                          <select 
                            value={ciudad} 
                            onChange={(e) => setCiudad(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          >
                            <option value="0">Todas las ciudades</option>
                            {ciudades.map(c => (
                              <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Barrio</label>
                          <select 
                            value={barrio} 
                            onChange={(e) => setBarrio(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          >
                            <option value="0">Todos los barrios</option>
                            {barrios.map(b => (
                              <option key={b.id} value={b.id}>{b.nombre}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Moneda</label>
                          <select 
                            value={moneda} 
                            onChange={(e) => setMoneda(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          >
                            <option value="0">Todas las monedas</option>
                            {monedas.map(m => (
                              <option key={m.id} value={m.id}>{m.nombre}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Precio</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={precio[0] || ''}
                              onChange={(e) => setPrecio([Number(e.target.value) || 0, precio[1]])}
                              className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={precio[1] || ''}
                              onChange={(e) => setPrecio([precio[0], Number(e.target.value) || 0])}
                              className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Superficie (m²)</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={superficie[0] || ''}
                              onChange={(e) => setSuperficie([Number(e.target.value) || 0, superficie[1]])}
                              className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={superficie[1] || ''}
                              onChange={(e) => setSuperficie([superficie[0], Number(e.target.value) || 0])}
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
                              value={ancho[0] || ''}
                              onChange={(e) => setAncho([Number(e.target.value) || 0, ancho[1]])}
                              className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={ancho[1] || ''}
                              onChange={(e) => setAncho([ancho[0], Number(e.target.value) || 0])}
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
                              value={largo[0] || ''}
                              onChange={(e) => setLargo([Number(e.target.value) || 0, largo[1]])}
                              className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={largo[1] || ''}
                              onChange={(e) => setLargo([largo[0], Number(e.target.value) || 0])}
                              className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Antigüedad (años)</label>
                          <input
                            type="number"
                            placeholder="Máximo"
                            value={antiguedad[1] || ''}
                            onChange={(e) => setAntiguedad([antiguedad[0], Number(e.target.value) || 0])}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Dormitorios</label>
                          <input
                            type="number"
                            placeholder="Mínimo"
                            value={dormitorios[0] || ''}
                            onChange={(e) => setDormitorios([Number(e.target.value) || 0, dormitorios[1]])}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Baños</label>
                          <input
                            type="number"
                            placeholder="Mínimo"
                            value={banos[0] || ''}
                            onChange={(e) => setBanos([Number(e.target.value) || 0, banos[1]])}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Estado comercial</label>
                          <select 
                            value={estadoComercial} 
                            onChange={(e) => setEstadoComercial(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          >
                            <option value="0">Todos los estados</option>
                            {estCom.map(ec => (
                              <option key={ec.id} value={ec.id}>{ec.nombre}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Estado físico</label>
                          <select 
                            value={estadoFisico} 
                            onChange={(e) => setEstadoFisico(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          >
                            <option value="0">Todos los estados</option>
                            {estFis.map(ef => (
                              <option key={ef.id} value={ef.id}>{ef.nombre}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Estado situación</label>
                          <select 
                            value={estadoSituacion} 
                            onChange={(e) => setEstadoSituacion(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          >
                            <option value="0">Todos los estados</option>
                            {estSit.map(es => (
                              <option key={es.id} value={es.id}>{es.nombre}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Estado registro</label>
                          <select 
                            value={estadoRegistro} 
                            onChange={(e) => setEstadoRegistro(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-white/70"
                          >
                            <option value="0">Todos los estados</option>
                            {estReg.map(er => (
                              <option key={er.id} value={er.id}>{er.nombre}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="lg:col-span-3">
                          <label className="text-sm font-medium text-white mb-2 block">Características</label>
                          <Select
                            isMulti
                            options={caracteristicas.map(c => ({ value: c.id, label: c.nombre }))}
                            value={caracts.map(id => ({ value: id, label: caracteristicas.find(c => c.id === id)?.nombre || '' }))}
                            onChange={(selected) => setCaracts(selected ? selected.map(s => s.value) : [])}
                            placeholder="Seleccionar características"
                            className="w-full"
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '6px',
                                minHeight: '44px',
                                boxShadow: state.isFocused ? '0 0 0 2px rgba(255, 255, 255, 0.5)' : 'none',
                                '&:hover': {
                                  border: '1px solid rgba(255, 255, 255, 0.5)'
                                }
                              }),
                              menu: (provided) => ({
                                ...provided,
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
                                color: state.isSelected ? 'white' : '#374151',
                                '&:hover': {
                                  backgroundColor: state.isSelected ? '#3b82f6' : '#f3f4f6'
                                }
                              }),
                              multiValue: (provided) => ({
                                ...provided,
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '4px'
                              }),
                              multiValueLabel: (provided) => ({
                                ...provided,
                                color: 'white',
                                fontWeight: '500'
                              }),
                              multiValueRemove: (provided) => ({
                                ...provided,
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                  color: 'white'
                                }
                              }),
                              placeholder: (provided) => ({
                                ...provided,
                                color: 'rgba(255, 255, 255, 0.7)'
                              }),
                              singleValue: (provided) => ({
                                ...provided,
                                color: 'white'
                              }),
                              input: (provided) => ({
                                ...provided,
                                color: 'white'
                              })
                            }}
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