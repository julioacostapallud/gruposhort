"use client"

import { motion } from "framer-motion"
import { Bed, Bath, Square, Building2, Tag, Shield, Wrench, Ruler, Calendar, MapPin } from "lucide-react"
import NextImage from "next/image"

interface PropertyCardProps {
  image: string
  price: string
  moneda?: any
  beds: string | number
  baths: string | number
  sqft: string
  address: string
  city: string
  status: string
  fecha_publicacion?: string
  tipoPropiedad?: string
  estadoComercial?: string
  estadoSituacion?: any
  estadoFisico?: string
  ancho_m?: string
  largo_m?: string
  antiguedad?: number
  onClick?: () => void
}

export function PropertyCard({ image, price, moneda, beds, baths, sqft, address, city, status, fecha_publicacion, tipoPropiedad, estadoComercial, estadoSituacion, estadoFisico, ancho_m, largo_m, antiguedad, onClick }: PropertyCardProps) {
  
  const getEstadoSituacionColor = (estadoSituacion: any) => {
    if (!estadoSituacion || !estadoSituacion.id) return 'bg-gray-100/60';
    
    switch (estadoSituacion.id) {
      case 1: return 'bg-green-100/60'; // Verde
      case 2: return 'bg-orange-100/60'; // Naranja
      case 3: return 'bg-red-100/60'; // Rojo
      case 4: return 'bg-red-100/60'; // Rojo
      case 5: return 'bg-yellow-100/60'; // Amarillo
      default: return 'bg-gray-100/60'; // Gris
    }
  };

  const getEstadoSituacionDropShadow = (estadoSituacion: any) => {
    if (!estadoSituacion || !estadoSituacion.id) return 'drop-shadow-[0_0_6px_rgba(200,200,200,0.7)]';
    
    switch (estadoSituacion.id) {
      case 1: return 'drop-shadow-[0_0_6px_rgba(200,255,200,0.7)]'; // Verde
      case 2: return 'drop-shadow-[0_0_6px_rgba(255,200,100,0.7)]'; // Naranja
      case 3: return 'drop-shadow-[0_0_6px_rgba(255,200,200,0.7)]'; // Rojo
      case 4: return 'drop-shadow-[0_0_6px_rgba(255,200,200,0.7)]'; // Rojo
      case 5: return 'drop-shadow-[0_0_6px_rgba(255,255,200,0.7)]'; // Amarillo
      default: return 'drop-shadow-[0_0_6px_rgba(200,200,200,0.7)]'; // Gris
    }
  };

  const getDaysAgo = (fecha_publicacion: string) => {
    if (!fecha_publicacion) return 'Hace 1 día';
    
    const fechaPub = new Date(fecha_publicacion);
    const fechaActual = new Date();
    const diferenciaMs = fechaActual.getTime() - fechaPub.getTime();
    const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias === 0) return 'Hoy';
    if (diferenciaDias === 1) return 'Hace 1 día';
    return `Hace ${diferenciaDias} días`;
  };

  const daysAgoText = getDaysAgo(fecha_publicacion || '');

  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="relative h-64">
        <NextImage
          src={image || "/placeholder.svg"}
          alt={address}
          width={500}
          height={300}
          className="w-full h-64 object-cover"
        />
        {/* Marca de agua con el logo */}
        <img
          src="/Logo.svg"
          alt="Marca de agua Short"
          className="absolute bottom-0 right-0 opacity-50 pointer-events-none select-none w-40 h-auto drop-shadow-[0_0_8px_white] p-1"
          style={{ zIndex: 2 }}
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {tipoPropiedad && (
            <div className="bg-white/60 text-gray-900 font-semibold px-3 py-1 rounded-md text-sm flex items-center gap-1 shadow-sm backdrop-blur-sm drop-shadow-[0_0_6px_rgba(200,200,200,0.7)]">
              <Building2 className="h-4 w-4 mr-1 text-blue-700" />
              <span className="drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]">{tipoPropiedad}</span>
            </div>
          )}
          {estadoComercial && (
            <div className="bg-blue-100/60 text-gray-900 font-semibold px-3 py-1 rounded-md text-sm flex items-center gap-1 shadow-sm backdrop-blur-sm drop-shadow-[0_0_6px_rgba(200,200,255,0.7)]">
              <Tag className="h-4 w-4 mr-1 text-blue-700" />
              <span className="drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]">{estadoComercial}</span>
            </div>
          )}
          {estadoFisico && (
            <div className="bg-yellow-100/60 text-gray-900 font-semibold px-3 py-1 rounded-md text-sm flex items-center gap-1 shadow-sm backdrop-blur-sm drop-shadow-[0_0_6px_rgba(255,255,200,0.7)]">
              <Wrench className="h-4 w-4 mr-1 text-blue-700" />
              <span className="drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]">{estadoFisico}</span>
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <div className="bg-white text-gray-800 px-3 py-1 rounded-md text-sm">
            {daysAgoText}
          </div>
          {estadoSituacion && (
            <div className={`${getEstadoSituacionColor(estadoSituacion)} text-gray-900 font-semibold px-3 py-1 rounded-md text-sm flex items-center gap-1 shadow-sm backdrop-blur-sm ${getEstadoSituacionDropShadow(estadoSituacion)}`}>
              <Shield className="h-4 w-4 mr-1 text-blue-700" />
              <span className="drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]">{estadoSituacion.nombre || estadoSituacion}</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        <div className={`text-2xl font-bold mb-2 flex items-center gap-1 ${moneda?.id === 2 ? 'text-green-800' : 'text-blue-700'}`}>
          {moneda?.id === 2 ? '🇺🇸' : '🇦🇷'}
          <span>{price}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 mb-3">
          {(typeof beds === 'number' && beds > 0) && (
            <div className="flex items-center text-gray-600 text-sm">
              <Bed className="h-5 w-5 mr-1 text-blue-700" />
              <span>{beds} Hab</span>
            </div>
          )}
          {(typeof baths === 'number' && baths > 0) && (
            <div className="flex items-center text-gray-600 text-sm">
              <Bath className="h-5 w-5 mr-1 text-blue-700" />
              <span>{baths} Baño{baths > 1 ? 's' : ''}</span>
            </div>
          )}
          {((parseFloat(sqft) > 0) || (ancho_m && largo_m && ancho_m !== '0' && largo_m !== '0')) && (
            <div className="flex items-center text-gray-600 text-sm">
              <Square className="h-5 w-5 mr-1 text-blue-700" />
              <span>
                {parseFloat(sqft) > 0 ? `${sqft}` : ''}
                {(ancho_m && largo_m && ancho_m !== '0' && largo_m !== '0') ? ` (${ancho_m}x${largo_m})` : ''}
              </span>
            </div>
          )}
          {(typeof antiguedad === 'number') && (
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="h-5 w-5 mr-1 text-blue-700" />
              <span>{antiguedad} años</span>
            </div>
          )}
        </div>
        <div className="flex items-center text-gray-800 truncate">
          <MapPin className="h-5 w-5 mr-1 text-blue-700" />
          <span>{address}</span>
        </div>
        <div className="text-gray-600 truncate">{city}</div>
      </div>
    </motion.div>
  )
}

