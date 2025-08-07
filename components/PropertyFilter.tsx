import React, { useState, useEffect } from "react";
import { ChevronDown, Trash2, Filter, Home, Building, Store, MapPin, TreePine, DollarSign, ShoppingCart } from 'lucide-react';
import Select from "react-select";
import { Propiedad } from '@/lib/services/propiedades';

type Cat = { id: number; nombre: string };
type Moneda = { id: number; nombre: string; codigo_iso: string; simbolo: string };

interface PropertyFilterProps {
  onFilter?: (filters: any) => void;
  properties?: Propiedad[];
}

export function PropertyFilter({ onFilter, properties = [] }: PropertyFilterProps) {
  // Filtros simplificados
  const [tipo_propiedad, setTipoPropiedad] = useState<number>(0);
  const [operacion, setOperacion] = useState<number>(0);
  const [precio_min, setPrecioMin] = useState<string>('');
  const [precio_max, setPrecioMax] = useState<string>('');
  const [ciudad, setCiudad] = useState<string>('');
  const [dormitorios, setDormitorios] = useState<number>(0);
  const [moneda, setMoneda] = useState<number>(0);

  // Opciones de filtros
  const tiposPropiedad = [
    { id: 1, nombre: 'Casa', icon: Home },
    { id: 2, nombre: 'Departamento', icon: Building },
    { id: 4, nombre: 'Local comercial', icon: Store },
    { id: 7, nombre: 'Lote', icon: MapPin },
    { id: 5, nombre: 'Campo', icon: TreePine }
  ];

  const operaciones = [
    { id: 1, nombre: 'Venta', icon: ShoppingCart },
    { id: 2, nombre: 'Alquiler', icon: DollarSign }
  ];

  // Generar ciudades dinámicamente desde las propiedades
  const ciudades = React.useMemo(() => {
    const ciudadesUnicas = [...new Set(properties.map(p => p.direccion?.ciudad).filter(Boolean))];
    return ciudadesUnicas.map(ciudad => {
      // Encontrar la provincia para esta ciudad
      const propiedad = properties.find(p => p.direccion?.ciudad === ciudad);
      const provincia = propiedad?.direccion?.provincia || '';
      
      return {
        value: ciudad,
        label: provincia ? `${ciudad} (${provincia})` : ciudad
      };
    });
  }, [properties]);

  const dormitoriosOptions = [
    { value: 1, label: '1 dormitorio' },
    { value: 2, label: '2 dormitorios' },
    { value: 3, label: '3 dormitorios' },
    { value: 4, label: '4+ dormitorios' }
  ];

  const monedas = [
    { value: 1, label: 'Peso argentino ($)', simbolo: '$' },
    { value: 2, label: 'Dólar estadounidense (US$)', simbolo: 'US$' }
  ];

  // Estilos para react-select más compactos
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '36px',
      height: '36px',
      border: state.isFocused ? '2px solid #2563eb' : '1px solid #d1d5db',
      borderRadius: '6px',
      boxShadow: 'none',
      '&:hover': {
        border: '2px solid #2563eb'
      }
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: '4px 8px'
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
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#dbeafe' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      padding: '8px 12px',
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

  // Aplicar filtros automáticamente
  useEffect(() => {
    const filters = {
      tipo_propiedad: tipo_propiedad || undefined,
      operacion: operacion || undefined,
      precio_min: precio_min || undefined,
      precio_max: precio_max || undefined,
      ciudad: ciudad || undefined,
      dormitorios: dormitorios || undefined,
      moneda: moneda || undefined
    };

    // Solo aplicar si hay al menos un filtro activo
    const hasActiveFilters = Object.values(filters).some(val => val !== undefined);
    
    if (hasActiveFilters) {
      onFilter?.(filters);
    } else {
      // Si no hay filtros, mostrar todas las propiedades
      onFilter?.({});
    }
  }, [tipo_propiedad, operacion, precio_min, precio_max, ciudad, dormitorios, moneda])

  const limpiarFiltros = () => {
    setTipoPropiedad(0);
    setOperacion(0);
    setPrecioMin('');
    setPrecioMax('');
    setCiudad('');
    setDormitorios(0);
    setMoneda(0);
  };

  const hasActiveFilters = tipo_propiedad || operacion || precio_min || precio_max || ciudad || dormitorios || moneda;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <Filter className="h-4 w-4 text-blue-600" />
          
          {/* Operación */}
          <div className="flex flex-wrap gap-2">
            {operaciones.map(op => {
              const IconComponent = op.icon;
              const isSelected = operacion === op.id;
              return (
                <button
                  key={op.id}
                  onClick={() => setOperacion(isSelected ? 0 : op.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md border transition-all duration-200 text-xs font-medium h-8 ${
                    isSelected 
                      ? 'border-orange-600 bg-orange-600 text-white shadow-sm' 
                      : 'border-orange-300 bg-white text-orange-600 hover:border-orange-400 hover:bg-orange-50'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{op.nombre}</span>
                </button>
              );
            })}
          </div>

          {/* Separador vertical */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Tipo de propiedad */}
          <div className="flex flex-wrap gap-2">
            {tiposPropiedad.map(tipo => {
              const IconComponent = tipo.icon;
              const isSelected = tipo_propiedad === tipo.id;
              return (
                <button
                  key={tipo.id}
                  onClick={() => setTipoPropiedad(isSelected ? 0 : tipo.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md border transition-all duration-200 text-xs font-medium h-8 ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm' 
                      : 'border-blue-300 bg-white text-blue-600 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tipo.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={limpiarFiltros}
            className="text-xs text-red-600 hover:text-red-800 flex items-center px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Limpiar
          </button>
        )}
      </div>

      {/* Línea 2: Controles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Ciudad */}
        <div>
          <Select
            instanceId="ciudad-select"
            options={ciudades}
            value={ciudades.find(c => c.value === ciudad) || null}
            onChange={(option) => setCiudad(option?.value || '')}
            placeholder="Ciudad"
            isClearable
            styles={selectStyles}
            className="text-xs"
          />
        </div>

        {/* Dormitorios */}
        <div>
          <Select
            instanceId="dormitorios-select"
            options={dormitoriosOptions}
            value={dormitoriosOptions.find(dorm => dorm.value === dormitorios) || null}
            onChange={(option) => setDormitorios(option?.value || 0)}
            placeholder="Dormitorios"
            isClearable
            styles={selectStyles}
            className="text-xs"
          />
        </div>

        {/* Precio mínimo */}
        <div>
          <input
            type="number"
            value={precio_min}
            onChange={(e) => setPrecioMin(e.target.value)}
            placeholder="Precio mínimo"
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-9"
          />
        </div>

        {/* Precio máximo */}
        <div>
          <input
            type="number"
            value={precio_max}
            onChange={(e) => setPrecioMax(e.target.value)}
            placeholder="Precio máximo"
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-9"
          />
        </div>

        {/* Moneda */}
        <div>
          <Select
            instanceId="moneda-select"
            options={monedas}
            value={monedas.find(mon => mon.value === moneda) || null}
            onChange={(option) => setMoneda(option?.value || 0)}
            placeholder="Moneda"
            isClearable
            styles={selectStyles}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
} 