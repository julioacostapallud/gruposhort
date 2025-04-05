'use client';

import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import categorias from '../../../data/opciones/categorias.json';
import subtipos from '../../../data/opciones/subtipos.json';
import fields from '../../../data/estructura_campos.json';

import propiedadSchema from '@/app/schemas/propiedadSchema';

// Importá todos los JSON de opciones acá:
import operaciones from '../../../data/opciones/operaciones.json';
import disponibilidades from '../../../data/opciones/disponibilidades.json';
import estados_legales from '../../../data/opciones/estados_legales.json';
import estados_generales from '../../../data/opciones/estados_generales.json';
import estado_construccion from '../../../data/opciones/estado_construccion.json';
import agua_caliente from '../../../data/opciones/agua_caliente.json';
import tipo_cochera from '../../../data/opciones/tipo_cochera.json';
import ubicacion_en_lote from '../../../data/opciones/ubicacion_en_lote.json';
import zonas from '../../../data/opciones/zonas.json';
import barrios from '../../../data/opciones/barrios.json';
import paises from '../../../data/opciones/paises.json';
import provincias from '../../../data/opciones/provincias.json';
import ciudades from '../../../data/opciones/ciudades.json';
import monedas from '../../../data/opciones/monedas.json';


interface FormData {
  [key: string]: any;
}

// Diccionario de opciones por campo
const opciones: Record<string, string[]> = {
  operacion: operaciones,
  disponibilidad: disponibilidades,
  estado_legal: estados_legales,
  estado_general: estados_generales,
  estado_construccion: estado_construccion,
  agua_caliente: agua_caliente,
  tipo_cochera: tipo_cochera,
  ubicacion_en_lote: ubicacion_en_lote,
  zona: zonas,
  barrio: barrios,
  pais: paises,
  provincia: provincias,
  ciudad: ciudades,
  moneda: monedas,
};

export default function AltaPropiedad() {
  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: yupResolver(propiedadSchema) as any,
    defaultValues: {},
  });

  const [categoria, setCategoria] = useState('');
  const [subtipo, setSubtipo] = useState('');
  const [camposVisibles, setCamposVisibles] = useState<any[]>([]);

  useEffect(() => {
    if (subtipo) {
      const visibles: any[] = [];
      Object.entries(fields).forEach(([seccion, campos]: any) => {
        Object.entries(campos).forEach(([key, value]: any) => {
          if (
            ['categoria', 'subtipo'].includes(key)
          ) return; // 👈 filtramos esos dos campos
  
          if (
            Array.isArray(value.aplica_para) &&
            (value.aplica_para.includes(subtipo) || value.aplica_para.includes('Todos'))
          ) {
            visibles.push({ key, ...value, seccion });
          }
        });
      });
      setCamposVisibles(visibles);
    }
  }, [subtipo]);

  const onError = (errors: any) => {
    console.error('Errores en el formulario:', errors);
  };
  
  const onSubmit = (data: FormData) => {
    console.log('Propiedad a guardar:', data);
  };
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Alta de Propiedad</h1>

      {/* Select Categoría */}
      <div className="mb-4">
        <label className="block font-semibold">Categoría</label>
        <select
          className="border p-2 w-full"
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
            setSubtipo('');
            setCamposVisibles([]);
          }}
        >
          <option value="">Seleccione</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Select Subtipo */}
      {categoria && (
        <div className="mb-4">
          <label className="block font-semibold">Tipo de Propiedad</label>
          <select
            className="border p-2 w-full"
            value={subtipo}
            onChange={(e) => setSubtipo(e.target.value)}
          >
            <option value="">Seleccione</option>
            {(subtipos as Record<string, string[]>)[categoria]?.map((tipo: string) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
      )}

      {/* Campos Dinámicos */}
      {subtipo && camposVisibles.map((campo) => (
        <div className="mb-4" key={campo.key}>
          <label className="block font-medium capitalize">
            {campo.key.replaceAll('_', ' ')}
          </label>
          <Controller
            name={campo.key}
            control={control}
            render={({ field }) => {
              if (typeof campo.value === 'boolean') {
                return (
                  <input type="checkbox" {...field} checked={field.value ?? false} />
                );
              } else if (opciones[campo.key]) {
                return (
                  <select className="border p-2 w-full" {...field} defaultValue={campo.value ?? ''}>
                    <option value="">Seleccione</option>
                    {opciones[campo.key].map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                );
              } else {
                return (
                  <input type="text" className="border p-2 w-full" {...field} defaultValue={campo.value ?? ''} />
                );
              }
            }}
          />
        </div>
      ))}

      {/* Submit */}
      {subtipo && (
        <button
          onClick={handleSubmit(onSubmit, onError)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Guardar Propiedad
        </button>
      )}
    </div>
  );
}
