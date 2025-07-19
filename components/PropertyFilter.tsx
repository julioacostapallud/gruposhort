import React, { useState, useEffect } from "react";
import Select from "react-select";
import { ChevronDown, Trash2 } from 'lucide-react';
import { api } from '@/lib/services/apiClient';

type Cat = { id: number; nombre: string };
type Moneda = { id: number; nombre: string; codigo_iso: string; simbolo: string };

export function PropertyFilter({ onFilter }: { onFilter?: (filters: any) => void }) {
  // Estado de filtros principales
  const [operacion, setOperacion] = useState<string>("");
  const [tipo, setTipo] = useState<number>(0);
  const [tiposProp, setTiposProp] = useState<Cat[]>([]);
  const [provincia, setProvincia] = useState<number>(0);
  const [provincias, setProvincias] = useState<Cat[]>([]);
  const [ciudad, setCiudad] = useState<number>(0);
  const [ciudades, setCiudades] = useState<Cat[]>([]);
  const [precio, setPrecio] = useState<[number, number]>([0, 0]);

  // Secundarios
  const [barrio, setBarrio] = useState<number>(0);
  const [superficie, setSuperficie] = useState<[number, number]>([0, 1000]);
  const [ancho, setAncho] = useState<[number, number]>([0, 100]);
  const [largo, setLargo] = useState<[number, number]>([0, 100]);
  const [antiguedad, setAntiguedad] = useState<[number, number]>([0, 100]);
  const [dormitorios, setDormitorios] = useState<[number, number]>([0, 10]);
  const [banos, setBanos] = useState<[number, number]>([0, 5]);
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
  // Filtros avanzados
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [soloFotos, setSoloFotos] = useState(false);
  const [soloNuevas, setSoloNuevas] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cargar catálogos
  useEffect(() => {
    // Cargar solo los endpoints que sabemos que funcionan
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
    }
    setCiudad(0);
  }, [provincia]);

  // Limpiar solo filtros secundarios
  function limpiarFiltrosSecundarios() {
    setSuperficie([0, 1000]);
    setAncho([0, 100]);
    setLargo([0, 100]);
    setAntiguedad([0, 100]);
    setDormitorios([0, 10]);
    setBanos([0, 5]);
    setEstadoComercial(0);
    setEstadoFisico(0);
    setEstadoSituacion(0);
    setEstadoRegistro(0);
    setCaracts([]);
    setSoloFotos(false);
    setSoloNuevas(false);
  }
  // Limpiar todos los filtros (opcional, si se quiere un botón global)
  function limpiarFiltros() {
    // Limpiar filtros principales
    setOperacion("");
    setTipo(0);
    setProvincia(0);
    setCiudad(0);
    setBarrio(0);
    setMoneda(0);
    setPrecio([0, 0]);
    
    // Limpiar filtros secundarios
    limpiarFiltrosSecundarios();
    
    // Cerrar filtros avanzados si están abiertos
    setShowAdvanced(false);
    
    // Ejecutar búsqueda con filtros limpios
    onFilter?.({});
  }

  function handleBuscar() {
    const filters = {
      tipo_propiedad: tipo || undefined,
      estado_fisico: estadoFisico || undefined,
      estado_situacion: estadoSituacion || undefined,
      estado_registro: estadoRegistro || undefined,
      min_precio: precio[0] > 0 ? precio[0] : undefined,
      max_precio: precio[1] < 1000000 ? precio[1] : undefined,
      min_superficie: superficie[0] > 0 ? superficie[0] : undefined,
      max_superficie: superficie[1] < 1000 ? superficie[1] : undefined,
      min_ancho: ancho[0] > 0 ? ancho[0] : undefined,
      max_ancho: ancho[1] < 100 ? ancho[1] : undefined,
      min_largo: largo[0] > 0 ? largo[0] : undefined,
      max_largo: largo[1] < 100 ? largo[1] : undefined,
      max_antiguedad: antiguedad[1] < 100 ? antiguedad[1] : undefined,
      min_dormitorios: dormitorios[0] > 0 ? dormitorios[0] : undefined,
      min_banos: banos[0] > 0 ? banos[0] : undefined,
      moneda: moneda || undefined,
      caracteristicas: caracts.length > 0 ? caracts : undefined,
      // Nota: provincia, ciudad y barrio necesitarían endpoints específicos en el backend
    };
    
    onFilter?.(filters);
  }

  // Utilidad para saber si un campo tiene valor
  function hasValue(val: any) {
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'number') return val !== 0;
    return !!val;
  }

  // Helper para manejar valores undefined en react-select
  const handleSelectChange = (value: any, setter: (value: number) => void) => {
    setter(Number(value?.value || 0));
  };

  // Estilos para react-select
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '36px',
      height: '36px',
      border: state.isFocused ? '1px solid #2563eb' : '1px solid #bfdbfe',
      borderRadius: '8px',
      boxShadow: 'none',
      '&:hover': {
        border: '1px solid #2563eb'
      }
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      height: '36px',
      padding: '0 12px'
    }),
    input: (provided: any) => ({
      ...provided,
      margin: '0px',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      height: '36px',
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      position: 'absolute',
      width: '100%',
      minWidth: '200px'
    }),
    menuList: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      maxHeight: '200px'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#dbeafe' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#2563eb' : '#dbeafe'
      }
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#374151'
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6b7280'
    })
  };

  return (
    <div className="w-full flex justify-center">
      {/* Barra principal de filtros + expansión */}
      <div
        className={`bg-white bg-opacity-95 shadow-lg border border-blue-100 px-2 md:px-4 pt-2 md:pt-3 pb-2 md:pb-3 rounded-2xl transition-all duration-300 flex flex-col items-stretch`}
      >
        <div className="flex flex-col md:flex-row md:flex-nowrap flex-wrap gap-2 md:gap-3 items-stretch w-full">
          {/* Operación */}
          <div className="flex gap-1">
            {["Comprar", "Alquilar"].map(op => (
              <button
                key={op}
                onClick={() => setOperacion(op)}
                className={`px-3 h-9 rounded-lg text-sm font-medium border transition-colors ${operacion === op ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'} ${operacion === op ? 'border-blue-600' : 'border-blue-200'}`}
                style={{ minWidth: 80 }}
              >
                {op}
              </button>
            ))}
          </div>
          {/* Tipo de propiedad */}
          <div className="relative" style={{ overflow: 'visible' }}>
            <Select
              instanceId="tipo-select"
              options={tiposProp.map(t => ({ value: t.id, label: t.nombre }))}
              value={tipo ? { value: tipo, label: tiposProp.find(t => t.id === tipo)?.nombre || "Tipo" } : null}
              onChange={e => setTipo(Number(e?.value || 0))}
              placeholder="Tipo"
              styles={selectStyles}
              isSearchable={false}
              isClearable={true}
              className="min-w-[110px]"
            />
          </div>
          {/* Provincia */}
          <div className="relative" style={{ overflow: 'visible' }}>
            <Select
              instanceId="provincia-select"
              options={provincias.map(p => ({ value: p.id, label: p.nombre }))}
              value={provincia ? { value: provincia, label: provincias.find(p => p.id === provincia)?.nombre || "Provincia" } : null}
              onChange={e => setProvincia(Number(e?.value || 0))}
              placeholder="Provincia"
              styles={selectStyles}
              isSearchable={false}
              isClearable={true}
              className="min-w-[110px]"
            />
          </div>
          {/* Ciudad */}
          <div className="relative" style={{ overflow: 'visible' }}>
            <Select
              instanceId="ciudad-select"
              options={ciudades.map(c => ({ value: c.id, label: c.nombre }))}
              value={ciudad ? { value: ciudad, label: ciudades.find(c => c.id === ciudad)?.nombre || "Ciudad" } : null}
              onChange={e => handleSelectChange(e, setCiudad)}
              placeholder="Ciudad"
              styles={selectStyles}
              isSearchable={false}
              isClearable={true}
              className="min-w-[110px]"
            />
          </div>
          {/* Barrio */}
          <div className="relative" style={{ overflow: 'visible' }}>
            <Select
              instanceId="barrio-main-select"
              options={barrios.map(b => ({ value: b.id, label: b.nombre }))}
              value={barrio ? { value: barrio, label: barrios.find(b => b.id === barrio)?.nombre || "Barrio" } : null}
              onChange={e => setBarrio(Number(e?.value || 0))}
              placeholder="Barrio"
              styles={selectStyles}
              isSearchable={false}
              isClearable={true}
              className="min-w-[110px]"
            />
          </div>

          {/* Moneda */}
          <div className="relative" style={{ overflow: 'visible' }}>
            <Select
              instanceId="moneda-main-select"
              options={monedas.map(m => ({ value: m.id, label: m.nombre }))}
              value={moneda ? { value: moneda, label: monedas.find(m => m.id === moneda)?.nombre || "Moneda" } : null}
              onChange={e => setMoneda(Number(e?.value || 0))}
              placeholder="Moneda"
              styles={selectStyles}
              isSearchable={false}
              isClearable={true}
              className="min-w-[110px]"
            />
          </div>
          {/* Monto */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={precio[0] || ''}
              min={0}
              max={precio[1]}
              onChange={e => setPrecio([+e.target.value || 0, precio[1]])}
              className={`w-24 bg-white border ${precio[0] > 0 ? 'border-blue-600' : 'border-blue-200'} text-gray-800 px-2 h-9 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-600 outline-none transition`}
              placeholder={moneda ? `${monedas.find(m => m.id === moneda)?.simbolo || '$'} Min` : '$ Min'}
            />
            <span className="text-gray-400 flex-shrink-0">-</span>
            <input
              type="number"
              value={precio[1] || ''}
              min={precio[0]}
              max={10000000}
              onChange={e => setPrecio([precio[0], +e.target.value || 0])}
              className={`w-24 bg-white border ${precio[1] > 0 ? 'border-blue-600' : 'border-blue-200'} text-gray-800 px-2 h-9 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-600 outline-none transition`}
              placeholder={moneda ? `${monedas.find(m => m.id === moneda)?.simbolo || '$'} Max` : '$ Max'}
            />
          </div>





          {/* Más/Menos filtros */}
          <button
            type="button"
            onClick={() => {
              if (showAdvanced) {
                setShowAdvanced(false);
                limpiarFiltrosSecundarios();
              } else {
                setShowAdvanced(true);
              }
            }}
            className={`px-3 h-9 rounded-lg border ${showAdvanced ? 'border-blue-600' : 'border-blue-400'} bg-white text-blue-700 text-sm font-medium hover:bg-blue-50 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none whitespace-nowrap`}
            style={{ minWidth: 90, maxWidth: 120 }}
          >
            <span className="hidden sm:inline">{showAdvanced ? 'Menos filtros' : 'Más filtros'}</span>
            <span className="inline sm:hidden">{showAdvanced ? 'Menos' : 'Más'}</span>
          </button>
          {/* Buscar */}
          <button
            onClick={handleBuscar}
            className="px-5 h-9 rounded-lg bg-blue-600 text-white font-semibold text-base shadow hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
            style={{ minWidth: 90 }}
          >
            Buscar
          </button>
          {/* Limpiar Filtros */}
          <button
            onClick={limpiarFiltros}
            className="px-3 h-9 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm shadow hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-400 focus:outline-none flex items-center gap-2"
            style={{ minWidth: 90 }}
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        </div>
        {showAdvanced && (
          isMobile ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setShowAdvanced(false)} />
              <div className="relative bg-white rounded-2xl shadow-2xl px-4 py-6 w-[95vw] max-w-md mx-auto animate-fade-in flex flex-col gap-4">
                <button onClick={() => setShowAdvanced(false)} className="absolute top-2 right-4 text-2xl text-blue-700">×</button>
                <h3 className="text-lg font-semibold mb-2 text-blue-700">Filtros avanzados</h3>
                <div className="flex flex-col gap-4">

                  {/* Dormitorios */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Dormitorios</label>
                    <input type="number" value={dormitorios[0]} onChange={e => setDormitorios([+e.target.value, dormitorios[1]])} className={`border ${dormitorios[0] > 0 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-full text-gray-800`} placeholder="Cantidad" />
                  </div>

                  {/* Baños */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Baños</label>
                    <input type="number" value={banos[0]} onChange={e => setBanos([+e.target.value, banos[1]])} className={`border ${banos[0] > 0 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-full text-gray-800`} placeholder="Cantidad" />
                  </div>

                  {/* Ancho */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Ancho (m)</label>
                    <div className="flex gap-2">
                      <input type="number" value={ancho[0]} onChange={e => setAncho([+e.target.value, ancho[1]])} className={`border ${ancho[0] > 0 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-20 text-gray-800`} placeholder="Min" />
                      <span className="text-gray-400 self-center">-</span>
                      <input type="number" value={ancho[1]} onChange={e => setAncho([ancho[0], +e.target.value])} className={`border ${ancho[1] < 100 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-20 text-gray-800`} placeholder="Max" />
                    </div>
                  </div>

                  {/* Largo */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Largo (m)</label>
                    <div className="flex gap-2">
                      <input type="number" value={largo[0]} onChange={e => setLargo([+e.target.value, largo[1]])} className={`border ${largo[0] > 0 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-20 text-gray-800`} placeholder="Min" />
                      <span className="text-gray-400 self-center">-</span>
                      <input type="number" value={largo[1]} onChange={e => setLargo([largo[0], +e.target.value])} className={`border ${largo[1] < 100 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-20 text-gray-800`} placeholder="Max" />
                    </div>
                  </div>

                  {/* Antigüedad */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Antigüedad (años)</label>
                    <input type="number" value={antiguedad[1]} onChange={e => setAntiguedad([0, +e.target.value])} className={`border ${antiguedad[1] < 100 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-full text-gray-800`} placeholder="Máximo" />
                  </div>


                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Estado Físico</label>
                    <Select
                      instanceId="estado-fisico-select"
                      options={estFis.map(e => ({ value: e.id, label: e.nombre }))}
                      value={{ value: estadoFisico, label: estFis.find(e => e.id === estadoFisico)?.nombre || "Todos" }}
                      onChange={e => setEstadoFisico(Number(e?.value))}
                      placeholder="Todos"
                      styles={selectStyles}
                      isSearchable={false}
                      isClearable={false}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Estado Situación</label>
                    <Select
                      instanceId="estado-situacion-select"
                      options={estSit.map(e => ({ value: e.id, label: e.nombre }))}
                      value={{ value: estadoSituacion, label: estSit.find(e => e.id === estadoSituacion)?.nombre || "Todos" }}
                      onChange={e => setEstadoSituacion(Number(e?.value))}
                      placeholder="Todos"
                      styles={selectStyles}
                      isSearchable={false}
                      isClearable={false}
                      className="w-full"
                    />
                  </div>

                  {/* Características */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Características</label>
                    <div className="flex flex-wrap gap-1">
                      {caracteristicas.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCaracts(caracts.includes(c.id) ? caracts.filter(x => x !== c.id) : [...caracts, c.id])}
                          className={`px-2 h-9 rounded-lg border text-xs mb-1 ${caracts.includes(c.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200'}`}
                        >
                          {c.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Opciones eliminadas */}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full pt-4">
              <div className="flex flex-wrap gap-4 items-end">

                                  {/* Dormitorios */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Dormitorios</label>
                    <input type="number" value={dormitorios[0]} onChange={e => setDormitorios([+e.target.value, dormitorios[1]])} className={`border ${dormitorios[0] > 0 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-20 text-gray-800`} placeholder="Cantidad" />
                  </div>

                                  {/* Baños */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Baños</label>
                    <input type="number" value={banos[0]} onChange={e => setBanos([+e.target.value, banos[1]])} className={`border ${banos[0] > 0 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-20 text-gray-800`} placeholder="Cantidad" />
                  </div>

                                  {/* Ancho */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Ancho (m)</label>
                    <div className="flex gap-2">
                      <input type="number" value={ancho[0]} onChange={e => setAncho([+e.target.value, ancho[1]])} className={`border ${ancho[0] > 0 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-20 text-gray-800`} placeholder="Min" />
                      <span className="text-gray-400 self-center">-</span>
                      <input type="number" value={ancho[1]} onChange={e => setAncho([ancho[0], +e.target.value])} className={`border ${ancho[1] < 100 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-20 text-gray-800`} placeholder="Max" />
                    </div>
                  </div>

                                  {/* Largo */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Largo (m)</label>
                    <div className="flex gap-2">
                      <input type="number" value={largo[0]} onChange={e => setLargo([+e.target.value, largo[1]])} className={`border ${largo[0] > 0 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-20 text-gray-800`} placeholder="Min" />
                      <span className="text-gray-400 self-center">-</span>
                      <input type="number" value={largo[1]} onChange={e => setLargo([largo[0], +e.target.value])} className={`border ${largo[1] < 100 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-20 text-gray-800`} placeholder="Max" />
                    </div>
                  </div>

                                  {/* Antigüedad */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Antigüedad (años)</label>
                    <input type="number" value={antiguedad[1]} onChange={e => setAntiguedad([0, +e.target.value])} className={`border ${antiguedad[1] < 100 ? 'border-blue-600' : 'border-blue-200'} rounded-lg px-3 h-9 text-sm w-20 text-gray-800`} placeholder="Máximo" />
                  </div>


                <div>
                  <label className="block text-xs text-gray-600 mb-1">Estado Físico</label>
                  <Select
                    instanceId="estado-fisico-desktop-select"
                    options={estFis.map(e => ({ value: e.id, label: e.nombre }))}
                    value={{ value: estadoFisico, label: estFis.find(e => e.id === estadoFisico)?.nombre || "Todos" }}
                    onChange={e => setEstadoFisico(Number(e?.value))}
                    placeholder="Todos"
                    styles={selectStyles}
                    isSearchable={false}
                    isClearable={false}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Estado Situación</label>
                  <Select
                    instanceId="estado-situacion-desktop-select"
                    options={estSit.map(e => ({ value: e.id, label: e.nombre }))}
                    value={{ value: estadoSituacion, label: estSit.find(e => e.id === estadoSituacion)?.nombre || "Todos" }}
                    onChange={e => setEstadoSituacion(Number(e?.value))}
                    placeholder="Todos"
                    styles={selectStyles}
                    isSearchable={false}
                    isClearable={false}
                    className="w-full"
                  />
                </div>
                
                {/* Características */}
                <div className="min-w-[200px]">
                  <label className="block text-xs text-gray-600 mb-1">Características</label>
                  <div className="flex flex-wrap gap-1">
                    {caracteristicas.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCaracts(caracts.includes(c.id) ? caracts.filter(x => x !== c.id) : [...caracts, c.id])}
                        className={`px-2 h-9 rounded-lg border text-xs mb-1 ${caracts.includes(c.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200'}`}
                      >
                        {c.nombre}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Opciones eliminadas */}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
} 