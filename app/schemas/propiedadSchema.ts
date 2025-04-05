import * as yup from 'yup';

const propiedadSchema = yup.object().shape({
  operacion: yup.string().required('La operación es obligatoria'),
  disponibilidad: yup.string().required('Debe indicar si está disponible'),
  estado_legal: yup.string().required('Debe indicar el estado legal'),
  apto_credito: yup.boolean(),

  estado_general: yup.string(),
  antiguedad_anios: yup.number().integer(),
  estado_construccion: yup.string(),

  // categoria: yup.string().required('Debe seleccionar una categoría'),
  // subtipo: yup.string().required('Debe seleccionar un subtipo'),

  // Ejemplos de ubicación
  direccion: yup.object().shape({
    calle: yup.string(),
    numero: yup.string(),
    ciudad: yup.string(),
    provincia: yup.string(),
    pais: yup.string()
  }),

  // Ejemplos de superficies
  terreno_m2: yup.number().positive().integer(),
  cubierta_m2: yup.number().positive().integer(),
  total_m2: yup.number().positive().integer(),

  // Características comunes
  ambientes: yup.number().integer().min(0),
  dormitorios: yup.number().integer().min(0),
  banios: yup.number().integer().min(0),

  // Servicios
  agua_corriente: yup.boolean(),
  luz: yup.boolean(),
  gas: yup.boolean(),
  internet: yup.boolean()
});

export default propiedadSchema;
