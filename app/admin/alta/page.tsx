'use client';

import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import categorias from '../../../data/opciones/categorias.json';
import subtipos from '../../../data/opciones/subtipos.json';
import fields from '../../../data/estructura_campos.json';

import propiedadSchema from '@/app/schemas/propiedadSchema';

// JSONs de opciones
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
      fields.secciones.forEach((seccion: any) => {
        const grupo: any[] = [];
        Object.entries(seccion.campos).forEach(([key, value]: any) => {
          if (["categoria", "subtipo"].includes(key)) return;
          if (
            Array.isArray(value.aplica_para) &&
            (value.aplica_para.includes(subtipo) || value.aplica_para.includes("Todos"))
          ) {
            grupo.push({ key, ...value, seccion: seccion.nombre });
          }
        });
        if (grupo.length > 0) {
          visibles.push({ nombre: seccion.nombre, campos: grupo });
        }
      });
      setCamposVisibles(visibles);
    }
  }, [subtipo]);

  const onError = (errors: any) => {
    console.error("Errores en el formulario:", errors);
  };

  const onSubmit = (data: FormData) => {
    const resultado = { ...data, categoria, subtipo };
    console.log("Propiedad a guardar:", resultado);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Logo y título */}
      <div className="text-center mb-8">
        <Image src="/logo.png" alt="Short Inmobiliaria" width={120} height={120} className="mx-auto mb-2" />
        <h1 className="text-4xl font-extrabold text-gray-800">Alta de Propiedad</h1>
        <p className="text-sm text-gray-500">Admin</p>
      </div>

      {/* Select Categoría */}
      <div className="bg-white shadow p-4 rounded-md mb-4">
        <label className="block font-semibold mb-1 text-gray-700">Categoría</label>
        <select
          className="border border-gray-300 p-2 w-full rounded-md"
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
        <div className="bg-white shadow p-4 rounded-md mb-6">
          <label className="block font-semibold mb-1 text-gray-700">Tipo de Propiedad</label>
          <select
            className="border border-gray-300 p-2 w-full rounded-md"
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

      {/* Secciones y Campos Dinámicos */}
      {subtipo && camposVisibles.map((seccion, idx) => (
        <div key={idx} className="bg-white shadow rounded-md p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-700 border-b pb-2 mb-4">{seccion.nombre}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {seccion.campos.map((campo: any) => (
              <div key={campo.key} className="flex flex-col">
                <label className="font-medium mb-1 text-gray-700 capitalize">
                  {campo.key.replaceAll('_', ' ')}
                </label>
                <Controller
                  name={campo.key}
                  control={control}
                  render={({ field }) => {
                    if (typeof campo.value === 'boolean') {
                      return (
                        <input type="checkbox" {...field} checked={field.value ?? false} className="mr-2" />
                      );
                    } else if (opciones[campo.key]) {
                      return (
                        <select className="border border-gray-300 p-2 rounded-md" {...field} defaultValue={campo.value ?? ''}>
                          <option value="">Seleccione</option>
                          {opciones[campo.key].map((op) => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>
                      );
                    } else {
                      return (
                        <input type="text" className="border border-gray-300 p-2 rounded-md" {...field} defaultValue={campo.value ?? ''} />
                      );
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Submit */}
      {subtipo && (
        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit(onSubmit, onError)}
            className="bg-blue-700 hover:bg-blue-800 transition text-white px-8 py-3 rounded-md shadow-md font-semibold"
          >
            Guardar Propiedad
          </button>
        </div>
      )}
    </div>
  );
}
