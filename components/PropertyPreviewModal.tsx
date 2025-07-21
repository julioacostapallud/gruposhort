'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Users, 
  Star,
  Building2,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  Share2,
  Heart,
  Eye,
  Home,
  Map,
  Info,
  Tag,
  MessageCircle
} from 'lucide-react'
import { WhatsAppIcon, TelegramIcon, InstagramIcon, FacebookIcon } from './ui/social-icons'
import NextImage from 'next/image'
import { Propiedad } from '@/lib/services/propiedades'
import { getGoogleMapsEmbedUrl } from '@/lib/config/maps'
import { useIsMobile } from '@/hooks/use-mobile'
import { PropertyPreviewModalMobile } from './PropertyPreviewModalMobile'
import { SharePropertyModal } from './SharePropertyModal'
import { generatePropertyUrl } from '@/lib/utils'

interface PropertyPreviewModalProps {
  property: Propiedad | null
  isOpen: boolean
  onClose: () => void
  isAdminMode?: boolean
}

export function PropertyPreviewModal({ 
  property, 
  isOpen, 
  onClose, 
  isAdminMode = false 
}: PropertyPreviewModalProps) {
  const isMobile = useIsMobile()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasStreetView, setHasStreetView] = useState(false);
  const svCheckedRef = useRef(false);

  // Resetear índice de imagen cuando cambia la propiedad
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [property?.id])

  useEffect(() => {
    setHasStreetView(false);
    svCheckedRef.current = false;
    if (property?.direccion?.latitud && property?.direccion?.longitud && (window as any).google && (window as any).google.maps) {
      const sv = (window as any).google.maps.StreetViewService();
      const lat = Number(property.direccion.latitud);
      const lng = Number(property.direccion.longitud);
      sv.getPanorama({ location: { lat, lng }, radius: 50 }, (data: any, status: string) => {
        if (status === 'OK') {
          setHasStreetView(true);
        } else {
          setHasStreetView(false);
        }
        svCheckedRef.current = true;
      });
    }
  }, [property?.direccion?.latitud, property?.direccion?.longitud]);

  // Si es móvil, renderizar la versión móvil
  if (isMobile) {
    return (
      <PropertyPreviewModalMobile
        property={property}
        isOpen={isOpen}
        onClose={onClose}
        isAdminMode={isAdminMode}
      />
    )
  }

  if (!property) return null

  const images = Array.isArray(property.imagenes) 
    ? property.imagenes.map(img => typeof img === 'string' ? img : img.url)
    : []

  const hasMultipleImages = images.length > 1

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const formatPrice = (price: string, moneda: any) => {
    return `${moneda.simbolo} ${Number(price).toLocaleString('es-AR')}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'disponible':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'reservada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'vendida':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Hoy'
    if (diffDays === 2) return 'Ayer'
    if (diffDays <= 7) return `Hace ${diffDays - 1} días`
    return date.toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  return (
    <>
      {/* Modal de imagen fullscreen SIEMPRE disponible si showImageModal es true */}
      {showImageModal && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center" onClick={() => setShowImageModal(false)}>
          <button
            className="absolute top-8 right-8 bg-white rounded-full p-2 shadow-lg z-50"
            onClick={e => { e.stopPropagation(); setShowImageModal(false); }}
            aria-label="Cerrar"
          >
            <X className="h-7 w-7 text-gray-800" />
          </button>
          <button
            className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-50"
            onClick={e => { e.stopPropagation(); prevImage(); }}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-8 w-8 text-gray-800" />
          </button>
          <button
            className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-50"
            onClick={e => { e.stopPropagation(); nextImage(); }}
            aria-label="Siguiente"
          >
            <ChevronRight className="h-8 w-8 text-gray-800" />
          </button>
          <div className="flex flex-col items-center justify-center w-full h-full">
            <img
              src={images[currentImageIndex]}
              alt="Preview"
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-4 text-white text-lg bg-black/60 px-4 py-1 rounded-full">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header con gradiente y estilos originales */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <NextImage 
                        src="/Logo.svg" 
                        alt="Short Grupo Inmobiliario" 
                        width={48} 
                        height={48} 
                        className="h-12 w-auto mr-3"
                      />
                      <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        {property.titulo}
                      </h2>
                    </div>
                    <div className="flex items-center space-x-3">
                      {isAdminMode && (
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                          Vista Previa
                        </div>
                      )}
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="h-6 w-6 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-gray-600 text-base w-full">
                    {property.descripcion || 'Sin descripción disponible.'}
                  </div>
                </div>

                {/* Main: dos columnas, colores y estilos originales */}
                <div className="flex-1 overflow-hidden flex">
                  {/* Columna izquierda: imágenes y mapa */}
                  <div className="flex-1 flex flex-col">
                    {/* Galería de imágenes (igual que antes) */}
                    <div className="relative h-[400px] bg-blue-600 cursor-pointer" onClick={() => setShowImageModal(true)}>
                      {images.length > 0 ? (
                        <>
                          <div className="w-full h-full flex items-center justify-center">
                            <NextImage
                              src={images[currentImageIndex]}
                              alt={property.titulo}
                              width={800}
                              height={600}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          {/* Navigation Arrows, Counter, Thumbnails (igual que antes) */}
                          {hasMultipleImages && (
                            <>
                              <button
                                onClick={e => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                              >
                                <ChevronLeft className="h-6 w-6 text-gray-800" />
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                              >
                                <ChevronRight className="h-6 w-6 text-gray-800" />
                              </button>
                            </>
                          )}
                          {hasMultipleImages && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                              {currentImageIndex + 1} / {images.length}
                            </div>
                          )}
                          {hasMultipleImages && (
                            <div className="absolute bottom-4 left-4 flex space-x-2">
                              {images.slice(0, 5).map((img, index) => (
                                <button
                                  key={index}
                                  onClick={e => { e.stopPropagation(); setCurrentImageIndex(index); }}
                                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                    index === currentImageIndex 
                                      ? 'border-blue-500' 
                                      : 'border-white/50 hover:border-white'
                                  }`}
                                >
                                  <NextImage
                                    src={img}
                                    alt={`Imagen ${index + 1}`}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <Building2 className="h-16 w-16 mx-auto mb-4 text-white/70" />
                            <p>Sin imágenes disponibles</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Mapa y Street View en columnas (vertical si hay streetview, solo mapa si no) */}
                    {property.direccion?.latitud && property.direccion?.longitud ? (
                      hasStreetView ? (
                        <div className="flex flex-row h-[300px]">
                          <div className="flex-1 bg-gray-100 rounded relative overflow-hidden" style={{ flexBasis: '60%' }}>
                            <iframe
                              src={getGoogleMapsEmbedUrl(property.direccion.latitud, property.direccion.longitud)}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              className="rounded"
                            />
                          </div>
                          <div className="bg-gray-100 relative overflow-hidden" style={{ flexBasis: '40%' }}>
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://www.google.com/maps?q=&layer=c&cbll=${property.direccion.latitud},${property.direccion.longitud}&cbp=11,0,0,0,0&z=17&t=m&output=svembed`}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="h-[300px] bg-gray-100 rounded relative overflow-hidden">
                          <iframe
                            src={getGoogleMapsEmbedUrl(property.direccion.latitud, property.direccion.longitud)}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="rounded"
                          />
                        </div>
                      )
                    ) : (
                      <div className="h-[300px] bg-gray-100 rounded relative overflow-hidden flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>Ubicación no disponible</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Columna derecha: precio, estados, contactos (igual que antes) */}
                  <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
                    {/* Price & Status */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={`font-bold mb-2 flex items-center gap-2 ${property.moneda?.id === 2 ? 'text-2xl text-green-800' : 'text-xl text-blue-700'}`}> 
                            {property.moneda?.id === 2 ? '🇺🇸' : '🇦🇷'}
                            <span>{formatPrice(property.precio, property.moneda)}</span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Publicado {formatDate(property.fecha_publicacion)}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-2" />
                              <span>24 vistas</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium text-center min-w-[120px]">
                            {property.estado_comercial.nombre}
                          </div>
                          <div className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium text-center min-w-[120px]">
                            {property.estado_fisico.nombre}
                          </div>
                          <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-center min-w-[120px]">
                            {property.estado_situacion.nombre}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Contactos (igual que antes) */}
                    <div className="p-4">
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contacto</h3>
                        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                          <Phone className="h-4 w-4 mr-2" />
                          3624-727-330
                        </button>
                        {/* Consultar por */}
                        <div>
                          <div className="flex items-center justify-center gap-3 mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              Consultanos por:
                            </span>
                            <div className="flex items-center">
                              <a 
                                href={`https://wa.me/5493624727330?text=${encodeURIComponent(`¡Hola! Me interesa esta propiedad: ${property.titulo} - ${formatPrice(property.precio, property.moneda)} en ${property.direccion?.barrio || property.direccion?.ciudad}. ¿Podrían enviarme más información?\n\nVer propiedad: ${generatePropertyUrl(property)}`)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:scale-110 transition-transform duration-200"
                                title="WhatsApp"
                              >
                                <WhatsAppIcon />
                              </a>
                              <a 
                                href={`https://t.me/share/url?url=${encodeURIComponent(generatePropertyUrl(property))}&text=${encodeURIComponent(`¡Hola! Me interesa esta propiedad: ${property.titulo} - ${formatPrice(property.precio, property.moneda)} en ${property.direccion?.barrio || property.direccion?.ciudad}. ¿Más información?`)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:scale-110 transition-transform duration-200"
                                title="Telegram"
                              >
                                <TelegramIcon />
                              </a>
                              <a 
                                href={`https://www.instagram.com/short.grupoinmobiliario?text=${encodeURIComponent(`¡Hola! Me interesa esta propiedad: ${property.titulo} - ${formatPrice(property.precio, property.moneda)} en ${property.direccion?.barrio || property.direccion?.ciudad}. ¿Podrían enviarme más información?\n\nVer propiedad: ${generatePropertyUrl(property)}`)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:scale-110 transition-transform duration-200"
                                title="Instagram"
                              >
                                <InstagramIcon />
                              </a>
                              <a 
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatePropertyUrl(property))}&quote=${encodeURIComponent(`¡Hola! Me interesa esta propiedad: ${property.titulo} - ${formatPrice(property.precio, property.moneda)} en ${property.direccion?.barrio || property.direccion?.ciudad}. ¿Podrían enviarme más información?`)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:scale-110 transition-transform duration-200"
                                title="Facebook"
                              >
                                <FacebookIcon />
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                            <Heart className="h-4 w-4 mr-2" />
                            Favorito
                          </button>
                          <button 
                            onClick={() => setShowShareModal(true)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Compartir
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Dirección debajo de contactos */}
                    <div className="p-4 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Dirección
                      </h3>
                      <div className="space-y-1 text-sm">
                        {property.direccion ? (
                          <>
                            <div className="text-gray-700">
                              {property.direccion.calle} {property.direccion.numero}
                              {property.direccion.piso && `, Piso ${property.direccion.piso}`}
                              {property.direccion.departamento && `, Depto ${property.direccion.departamento}`}
                            </div>
                            {property.direccion.barrio && (
                              <div className="text-gray-600">Barrio: {property.direccion.barrio}</div>
                            )}
                            <div className="text-gray-600">
                              {property.direccion.ciudad}, {property.direccion.provincia}
                            </div>
                            <div className="text-gray-600">
                              CP: {property.direccion.codigo_postal}
                            </div>
                            {property.direccion.latitud && property.direccion.longitud && (
                              <div className="text-gray-500 text-xs">
                                Coordenadas: {property.direccion.latitud}, {property.direccion.longitud}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-500">Dirección no especificada</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Footer: características ancho completo, azul claro */}
                <div className="border-t border-gray-200 p-6 bg-blue-50">
                  <div className="flex flex-row gap-2 w-full items-center flex-wrap">
                    {/* Superficie agrupada con ancho y largo */}
                    {(property.superficie_m2 || (property.ancho_m && property.largo_m)) && (
                      <div className="flex items-center p-2 bg-white rounded-lg shadow-sm min-w-[170px] gap-1">
                        <Square className="h-4 w-4 text-blue-600 font-bold" />
                        <span className="font-bold text-gray-900 text-sm">
                          {property.superficie_m2 ? `${property.superficie_m2} m²` : ''}
                          {(property.ancho_m && property.largo_m) ? ` (${property.ancho_m}x${property.largo_m})` : ''}
                        </span>
                        <span className="text-gray-700 text-sm ml-1">Superficie</span>
                      </div>
                    )}
                    {/* Antigüedad */}
                    {property.antiguedad && (
                      <div className="flex items-center p-2 bg-white rounded-lg shadow-sm min-w-[130px] gap-1">
                        <Calendar className="h-4 w-4 text-blue-600 font-bold" />
                        <span className="font-bold text-gray-900 text-sm">{property.antiguedad} años</span>
                        <span className="text-gray-700 text-sm ml-1">Antigüedad</span>
                      </div>
                    )}
                    {/* Dormitorios */}
                    {property.dormitorios && (
                      <div className="flex items-center p-2 bg-white rounded-lg shadow-sm min-w-[130px] gap-1">
                        <Bed className="h-4 w-4 text-blue-600 font-bold" />
                        <span className="font-bold text-gray-900 text-sm">{property.dormitorios}</span>
                        <span className="text-gray-700 text-sm ml-1">Dormitorios</span>
                      </div>
                    )}
                    {/* Baños */}
                    {property.banos && (
                      <div className="flex items-center p-2 bg-white rounded-lg shadow-sm min-w-[110px] gap-1">
                        <Bath className="h-4 w-4 text-blue-600 font-bold" />
                        <span className="font-bold text-gray-900 text-sm">{property.banos}</span>
                        <span className="text-gray-700 text-sm ml-1">Baños</span>
                      </div>
                    )}
                    {/* Tipo */}
                    <div className="flex items-center p-2 bg-white rounded-lg shadow-sm min-w-[130px] gap-1">
                      <Building2 className="h-4 w-4 text-blue-600 font-bold" />
                      <span className="font-bold text-gray-900 text-sm">{property.tipo_propiedad.nombre}</span>
                      <span className="text-gray-700 text-sm ml-1">Tipo</span>
                    </div>
                  </div>
                  {/* Características secundarias, solo badges amarillos */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {property.caracteristicas && property.caracteristicas.length > 0 ? (
                        property.caracteristicas.map((char) => (
                          <span
                            key={char.id}
                            className="px-3 py-1 bg-white text-yellow-700 border border-yellow-300 rounded-full text-sm whitespace-nowrap shadow-sm"
                          >
                            {char.nombre}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Sin características especificadas</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Property Modal */}
      <SharePropertyModal
        property={property}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </>
  )
} 