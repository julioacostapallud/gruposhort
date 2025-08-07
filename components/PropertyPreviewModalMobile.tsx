'use client'

import React, { useState, useEffect } from 'react'
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
  MessageCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import NextImage from 'next/image'
import { Propiedad } from '@/lib/services/propiedades'
import { getGoogleMapsEmbedUrl } from '@/lib/config/maps'
import { SharePropertyModal } from './SharePropertyModal'
import { generatePropertyUrl } from '@/lib/utils'
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'
import { useRouter } from 'next/navigation'
import { usePropertyNavigation } from '@/hooks/usePropertyNavigation'
import { useEscapeKey } from '@/hooks/useEscapeKey'

interface PropertyPreviewModalMobileProps {
  property: Propiedad | null
  isOpen: boolean
  onClose: () => void
  isAdminMode?: boolean
}

export function PropertyPreviewModalMobile({ 
  property, 
  isOpen, 
  onClose, 
  isAdminMode = false 
}: PropertyPreviewModalMobileProps) {
  const router = useRouter()
  const { closeProperty } = usePropertyNavigation()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'contact' | 'location'>('details')
  const [showShareModal, setShowShareModal] = useState(false)
  const [chatMsg, setChatMsg] = useState('')

  // Resetear índice de imagen cuando cambia la propiedad
  useEffect(() => {
    setCurrentImageIndex(0)
    setActiveTab('details')
  }, [property?.id])

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
      {/* Modal de imagen fullscreen */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center" 
          onClick={() => setShowImageModal(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowImageModal(false)
            }
          }}
          tabIndex={0}
        >
          <button
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-50"
            onClick={e => { e.stopPropagation(); setShowImageModal(false); }}
            aria-label="Cerrar"
          >
            <X className="h-6 w-6 text-gray-800" />
          </button>
          <div className="flex flex-col items-center justify-center w-full h-full px-4">
            <Carousel opts={{ loop: true, startIndex: currentImageIndex }}>
              <CarouselContent>
                {images.map((img, idx) => (
                  <CarouselItem key={img}>
                    <img
                      src={img}
                      alt="Preview"
                      className="max-h-[80vh] max-w-full object-contain rounded-lg mx-auto"
                    />
                    <div className="mt-4 text-white text-base bg-black/60 px-3 py-1 rounded-full text-center">
                      {idx + 1} / {images.length}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90"
            onClick={handleClose}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full flex flex-col mx-auto overflow-x-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <img src="/Logo.svg" alt="Short Grupo Inmobiliario" className="h-10 w-auto" />
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

                             {/* Image Gallery */}
               <div className="relative h-[200px] bg-gray-100" onClick={() => setShowImageModal(true)}>
                {images.length > 0 ? (
                  <Carousel opts={{ loop: true }}>
                    <CarouselContent>
                      {images.map((img, idx) => (
                        <CarouselItem key={img}>
                          <div className="w-full h-[200px] flex items-center justify-center relative">
                            <NextImage
                              src={img}
                              alt={property.titulo}
                              width={400}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                            <img
                              src="/Logo.svg"
                              alt="Marca de agua Short"
                              className="absolute bottom-0 right-0 opacity-50 pointer-events-none select-none w-40 h-auto drop-shadow-[0_0_8px_white] p-1"
                              style={{ zIndex: 2 }}
                            />
                            {hasMultipleImages && (
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                                {idx + 1} / {images.length}
                              </div>
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Home className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Sin imágenes</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 bg-white overflow-hidden">
                                 {/* Price & Title */}
                 <div className="p-3 border-b border-gray-200">
                   <div className="text-xl font-bold text-gray-900 mb-1">
                     {formatPrice(property.precio, property.moneda)}
                   </div>
                   <h2 className="text-base font-semibold text-gray-900 mb-1">{property.titulo}</h2>
                   <p className="text-xs text-gray-600 flex items-center">
                     <MapPin className="h-3 w-3 mr-1" />
                     {property.direccion?.calle} {property.direccion?.numero}, {property.direccion?.ciudad}
                   </p>
                 </div>

                                 {/* Quick Stats */}
                 <div className="px-3 py-2 bg-gray-50">
                   <div className="flex justify-between items-center">
                     {property.superficie_m2 && (
                       <div className="flex items-center text-xs text-gray-600">
                         <Square className="h-3 w-3 mr-1" />
                         <span>{property.superficie_m2}m²</span>
                       </div>
                     )}
                     {property.dormitorios && (
                       <div className="flex items-center text-xs text-gray-600">
                         <Bed className="h-3 w-3 mr-1" />
                         <span>{property.dormitorios} dorm</span>
                       </div>
                     )}
                     {property.banos && (
                       <div className="flex items-center text-xs text-gray-600">
                         <Bath className="h-3 w-3 mr-1" />
                         <span>{property.banos} baños</span>
                       </div>
                     )}
                     <div className="flex items-center text-xs text-gray-600">
                       <Building2 className="h-3 w-3 mr-1" />
                       <span>{property.tipo_propiedad.nombre}</span>
                     </div>
                   </div>
                 </div>

                                 {/* Tabs */}
                 <div className="flex border-b border-gray-200">
                   <button
                     onClick={() => setActiveTab('details')}
                     className={`flex-1 py-2 px-3 text-xs font-medium ${
                       activeTab === 'details' 
                         ? 'text-blue-600 border-b-2 border-blue-600' 
                         : 'text-gray-500 hover:text-gray-700'
                     }`}
                   >
                     Detalles
                   </button>
                   <button
                     onClick={() => setActiveTab('contact')}
                     className={`flex-1 py-2 px-3 text-xs font-medium ${
                       activeTab === 'contact' 
                         ? 'text-blue-600 border-b-2 border-blue-600' 
                         : 'text-gray-500 hover:text-gray-700'
                     }`}
                   >
                     Contacto
                   </button>
                   <button
                     onClick={() => setActiveTab('location')}
                     className={`flex-1 py-2 px-3 text-xs font-medium ${
                       activeTab === 'location' 
                         ? 'text-blue-600 border-b-2 border-blue-600' 
                         : 'text-gray-500 hover:text-gray-700'
                     }`}
                   >
                     Ubicación
                   </button>
                 </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                                     {activeTab === 'details' && (
                     <div className="p-3 space-y-3">
                                             {/* Description */}
                       <div>
                         <h3 className="text-base font-semibold text-gray-900 mb-2">Descripción</h3>
                         <p className="text-xs text-gray-700 leading-relaxed">
                           {property.descripcion || 'Sin descripción disponible.'}
                         </p>
                       </div>

                                             {/* Status Badges */}
                       <div>
                         <h3 className="text-base font-semibold text-gray-900 mb-2">Estado</h3>
                         <div className="flex flex-wrap gap-1">
                           <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                             {property.estado_comercial.nombre}
                           </span>
                           <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                             {property.estado_fisico.nombre}
                           </span>
                           <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                             {property.estado_situacion.nombre}
                           </span>
                         </div>
                       </div>

                                             {/* Characteristics */}
                       {property.caracteristicas && property.caracteristicas.length > 0 && (
                         <div>
                           <h3 className="text-base font-semibold text-gray-900 mb-2">Características</h3>
                           <div className="flex flex-wrap gap-1">
                             {property.caracteristicas.map((char) => (
                               <span
                                 key={char.id}
                                 className="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full text-xs"
                               >
                                 {char.nombre}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}

                                             {/* Additional Info */}
                       <div>
                         <h3 className="text-base font-semibold text-gray-900 mb-2">Información Adicional</h3>
                         <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Publicado:</span>
                            <span className="text-gray-900">{formatDate(property.fecha_publicacion)}</span>
                          </div>
                          {property.antiguedad && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Antigüedad:</span>
                              <span className="text-gray-900">{property.antiguedad} años</span>
                            </div>
                          )}
                          {property.ancho_m && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Ancho:</span>
                              <span className="text-gray-900">{property.ancho_m}m</span>
                            </div>
                          )}
                          {property.largo_m && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Largo:</span>
                              <span className="text-gray-900">{property.largo_m}m</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                                     {activeTab === 'contact' && (
                     <div className="p-3 space-y-3">
                                             {/* Phone */}
                       <a 
                         href="tel:+543624727330"
                         className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                       >
                         <Phone className="h-4 w-4 mr-2" />
                         3624-727-330
                       </a>

                      {/* Social Media */}
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

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => setShowShareModal(true)}
                          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartir
                        </button>
                      </div>
                    </div>
                  )}

                                     {activeTab === 'location' && (
                     <div className="p-3 space-y-3">
                      {/* Address */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Map className="h-5 w-5 mr-2" />
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

                                                                    {/* Google Map */}
                       <div className="bg-gray-100 rounded-lg h-48 relative">
                         {property.direccion?.latitud && property.direccion?.longitud ? (
                           <iframe
                             src={getGoogleMapsEmbedUrl(property.direccion.latitud, property.direccion.longitud)}
                             width="100%"
                             height="100%"
                             style={{ border: 0 }}
                             allowFullScreen
                             loading="lazy"
                             referrerPolicy="no-referrer-when-downgrade"
                             className="rounded-lg"
                           />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-500">
                             <div className="text-center">
                               <MapPin className="h-8 w-8 mx-auto mb-1 text-gray-300" />
                               <p className="text-xs">Ubicación no disponible</p>
                             </div>
                           </div>
                         )}
                       </div>
                    </div>
                  )}
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