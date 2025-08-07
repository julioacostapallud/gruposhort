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
import NextImage from 'next/image'
import { Propiedad } from '@/lib/services/propiedades'
import { getGoogleMapsEmbedUrl } from '@/lib/config/maps'
import { useIsMobile } from '@/hooks/use-mobile'
import { PropertyPreviewModalMobile } from './PropertyPreviewModalMobile'
import { SharePropertyModal } from './SharePropertyModal'
import { generatePropertyUrl } from '@/lib/utils'
import { useToast } from "@/hooks/use-toast";
import { CustomMap } from './CustomMap'
import { useRouter } from 'next/navigation'
import { usePropertyNavigation } from '@/hooks/usePropertyNavigation'
import { useEscapeKey } from '@/hooks/useEscapeKey'

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
  const router = useRouter()
  const { closeProperty } = usePropertyNavigation()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasStreetView, setHasStreetView] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const svCheckedRef = useRef(false);
  const { toast } = useToast();

  // Resetear índice de imagen cuando cambia la propiedad
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [property?.id])

  const formatPrice = (price: string, moneda: any) => {
    return `${moneda.simbolo} ${Number(price).toLocaleString('es-AR')}`
  }

  // Generar el mensaje de chat solo en el cliente para evitar problemas de hidratación
  useEffect(() => {
    if (property) {
      const message = `¡Hola! Me interesa esta propiedad: ${property.titulo} - ${formatPrice(property.precio, property.moneda)} en ${property.direccion?.barrio || property.direccion?.ciudad}. ¿Podrían enviarme más información?\n\nVer propiedad: ${generatePropertyUrl(property)}`;
      setChatMsg(message);
    }
  }, [property]);

  // Función para manejar el cierre del modal
  const handleClose = () => {
    closeProperty()
    onClose()
  }

  // Usar el hook para manejar Escape
  useEscapeKey(handleClose, isOpen)

  // Si es móvil, renderizar la versión móvil
  if (isMobile) {
    return (
      <PropertyPreviewModalMobile
        property={property}
        isOpen={isOpen}
        onClose={handleClose}
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
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center" 
          onClick={() => setShowImageModal(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowImageModal(false)
            }
          }}
          tabIndex={0}
        >
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
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full flex items-center justify-center p-4 overflow-x-hidden"
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
                        onClick={handleClose}
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
                          <div className="w-full h-full flex items-center justify-center relative">
                            <NextImage
                              src={images[currentImageIndex]}
                              alt={property.titulo}
                              width={800}
                              height={600}
                              className="max-w-full max-h-full object-contain"
                            />
                            {/* Marca de agua centrada arriba */}
                            <img
                              src="/Logo.svg"
                              alt="Marca de agua Short"
                              className="absolute top-0 left-1/2 -translate-x-1/2 mt-2 opacity-50 pointer-events-none select-none w-32 h-auto drop-shadow-[0_0_8px_white]"
                              style={{ zIndex: 2 }}
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
                    {/* Mapa (solo mapa tradicional, sin streetview) */}
                    {property.direccion?.latitud && property.direccion?.longitud ? (
                      <div className="h-[300px] bg-gray-100 rounded relative overflow-hidden">
                        <CustomMap 
                          lat={parseFloat(property.direccion.latitud)} 
                          lng={parseFloat(property.direccion.longitud)} 
                          height="100%" 
                          width="100%" 
                        />
                      </div>
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
                              <span>{property.estadisticas_visitas?.visitas_totales || 0} vistas</span>
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
                        <a 
                          href="tel:+543624727330"
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          3624-727-330
                        </a>
                        {/* Consultar por */}
                        <div>
                          <div className="flex items-center justify-center gap-3 mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              Consultanos por:
                            </span>
                            <div className="flex items-center gap-2">
                              {/* WhatsApp */}
                              <a 
                                href={`https://wa.me/5493624727330?text=${encodeURIComponent(chatMsg)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors duration-200"
                                title="WhatsApp"
                              >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                              </a>
                              {/* Telegram */}
                              <a 
                                href={`https://t.me/shortgrupoinmobiliario?text=${encodeURIComponent(chatMsg)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200"
                                title="Telegram"
                              >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                </svg>
                              </a>
                              {/* Instagram */}
                              <a
                                href="https://www.instagram.com/short.grupoinmobiliario/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-2 rounded-lg transition-all duration-200"
                                title="Instagram"
                              >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              </a>
                              {/* Facebook */}
                              <a
                                href="https://www.facebook.com/profile.php?id=100077725346540"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
                                title="Facebook"
                              >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setShowShareModal(true)}
                            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Compartir
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Dirección debajo de contactos */}
                    <div className="p-4 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Dirección
                      </h3>
                      <div className="space-y-2 text-sm">
                        {property.direccion ? (
                          <>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="font-medium text-gray-900 mb-1">
                                {property.direccion.calle} {property.direccion.numero}
                                {property.direccion.piso && `, Piso ${property.direccion.piso}`}
                                {property.direccion.departamento && `, Depto ${property.direccion.departamento}`}
                              </div>
                              {property.direccion.barrio && (
                                <div className="text-gray-600 text-xs">Barrio: {property.direccion.barrio}</div>
                              )}
                              <div className="text-gray-600 text-xs">
                                {property.direccion.ciudad}, {property.direccion.provincia}
                              </div>
                              <div className="text-gray-500 text-xs">
                                CP: {property.direccion.codigo_postal}
                              </div>
                            </div>
                            {property.direccion.latitud && property.direccion.longitud && (
                              <div className="text-gray-400 text-xs bg-gray-50 p-2 rounded">
                                Coordenadas: {property.direccion.latitud}, {property.direccion.longitud}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-500 bg-gray-50 p-3 rounded-lg">Dirección no especificada</div>
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