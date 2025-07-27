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
import { WhatsAppIcon, TelegramIcon, InstagramIcon, FacebookIcon } from './ui/social-icons'
import NextImage from 'next/image'
import { Propiedad } from '@/lib/services/propiedades'
import { getGoogleMapsEmbedUrl } from '@/lib/config/maps'
import { SharePropertyModal } from './SharePropertyModal'
import { generatePropertyUrl } from '@/lib/utils'
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'
import { useRouter } from 'next/navigation'

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'contact' | 'location'>('details')
  const [showShareModal, setShowShareModal] = useState(false)

  // Resetear índice de imagen cuando cambia la propiedad
  useEffect(() => {
    setCurrentImageIndex(0)
    setActiveTab('details')
  }, [property?.id])

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

  const chatMsg = `¡Hola! Me interesa esta propiedad: ${property.titulo} - ${formatPrice(property.precio, property.moneda)} en ${property.direccion?.barrio || property.direccion?.ciudad}. ¿Podrían enviarme más información?\n\nVer propiedad: ${generatePropertyUrl(property)}`;

  return (
    <>
      {/* Modal de imagen fullscreen */}
      {showImageModal && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center" onClick={() => setShowImageModal(false)}>
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
            onClick={onClose}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full flex flex-col mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <img src="/Logo.svg" alt="Short Grupo Inmobiliario" className="h-10 w-auto" />
                </div>
                <button
                  onClick={onClose}
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
                       <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                         <Phone className="h-4 w-4 mr-2" />
                         3624-727-330
                       </button>

                      {/* Social Media */}
                      <div>
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Consultanos por:
                          </span>
                          <div className="flex items-center">
                            <a 
                              href={`https://wa.me/5493624727330?text=${encodeURIComponent(chatMsg)}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:scale-110 transition-transform duration-200"
                              title="WhatsApp"
                            >
                              <WhatsAppIcon />
                            </a>
                            <a 
                              href={`https://t.me/shortgrupoinmobiliario?text=${encodeURIComponent(chatMsg)}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:scale-110 transition-transform duration-200"
                              title="Telegram"
                            >
                              <TelegramIcon />
                            </a>
                            <a
                              href="https://www.instagram.com/short.grupoinmobiliario/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:scale-110 transition-transform duration-200 ml-2"
                              title="Instagram"
                            >
                              <InstagramIcon />
                            </a>
                            <a
                              href="https://www.facebook.com/profile.php?id=100077725346540"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:scale-110 transition-transform duration-200 ml-2"
                              title="Facebook"
                            >
                              <FacebookIcon />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => {
                            const url = generatePropertyUrl(property);
                            router.push(url);
                            onClose();
                          }}
                          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver página completa
                        </button>
                        <button 
                          onClick={() => setShowShareModal(true)}
                          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
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
                              <p className="text-gray-700">
                                {property.direccion.calle} {property.direccion.numero}
                                {property.direccion.piso && `, Piso ${property.direccion.piso}`}
                                {property.direccion.departamento && `, Depto ${property.direccion.departamento}`}
                              </p>
                              <p className="text-gray-600">
                                {property.direccion.ciudad}, {property.direccion.provincia}
                                {property.direccion.barrio && ` - ${property.direccion.barrio}`}
                              </p>
                              <p className="text-gray-600">
                                CP: {property.direccion.codigo_postal}
                              </p>
                              {property.direccion.latitud && property.direccion.longitud && (
                                <p className="text-gray-500 text-xs">
                                  Coordenadas: {property.direccion.latitud}, {property.direccion.longitud}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-gray-500">Dirección no especificada</p>
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