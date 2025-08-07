'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Mail, Link, QrCode, Copy, Check } from 'lucide-react'
import { WhatsAppIcon, TelegramIcon, FacebookIcon } from './ui/social-icons'
import { Propiedad } from '@/lib/services/propiedades'
import { generatePropertyUrl } from '@/lib/utils'
import QRCode from 'qrcode'
import { Spinner } from '@/components/ui/spinner'
import { useEscapeKey } from '@/hooks/useEscapeKey'

interface SharePropertyModalProps {
  property: Propiedad
  isOpen: boolean
  onClose: () => void
}

export function SharePropertyModal({ property, isOpen, onClose }: SharePropertyModalProps) {
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [propertyUrl, setPropertyUrl] = useState('')

  useEffect(() => {
    if (property) {
      const url = generatePropertyUrl(property)
      setPropertyUrl(url)
    }
  }, [property])

  // Función para manejar Escape
  const handleEscape = () => {
    if (showQR) {
      setShowQR(false)
    } else if (isOpen) {
      onClose()
    }
  }

  // Usar el hook para manejar Escape
  useEscapeKey(handleEscape, isOpen || showQR)

  const generateQRWithLogo = async (text: string) => {
    try {
      setQrLoading(true)
      setQrError(false)
      
      // Generar QR base
      const qrDataUrl = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      // Crear canvas para combinar QR con logo
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 300
      canvas.height = 300
      
      // Cargar imagen del QR
      const qrImage = new Image()
      qrImage.onload = () => {
        // Dibujar QR en el canvas
        ctx?.drawImage(qrImage, 0, 0, 300, 300)
        
        // Cargar logo
        const logoImage = new Image()
        logoImage.crossOrigin = 'anonymous'
        logoImage.onload = () => {
          // Calcular dimensiones del logo manteniendo proporción
          const maxLogoSize = 80 // Tamaño máximo del logo
          const logoAspectRatio = logoImage.width / logoImage.height
          
          let logoWidth, logoHeight
          if (logoAspectRatio > 1) {
            // Logo más ancho que alto
            logoWidth = maxLogoSize
            logoHeight = maxLogoSize / logoAspectRatio
          } else {
            // Logo más alto que ancho o cuadrado
            logoHeight = maxLogoSize
            logoWidth = maxLogoSize * logoAspectRatio
          }
          
          const logoX = (300 - logoWidth) / 2
          const logoY = (300 - logoHeight) / 2
          
          // Dibujar fondo blanco para el logo (un poco más grande que el logo)
          ctx!.fillStyle = '#FFFFFF'
          ctx!.fillRect(logoX - 4, logoY - 4, logoWidth + 8, logoHeight + 8)
          
          // Dibujar logo con sus dimensiones originales
          ctx?.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight)
          
          // Convertir a data URL
          const finalQRDataUrl = canvas.toDataURL('image/png')
          setQrDataUrl(finalQRDataUrl)
          setQrLoading(false)
        }
        logoImage.onerror = () => {
          // Si falla el logo, usar solo el QR
          setQrDataUrl(qrDataUrl)
          setQrLoading(false)
        }
        logoImage.src = '/Logo.svg'
      }
      qrImage.src = qrDataUrl
      
    } catch (error) {
      console.error('Error generating QR:', error)
      setQrError(true)
      setQrLoading(false)
    }
  }

  const generateQRCode = (text: string) => {
    // Usar una API que soporte logos en el centro del QR
    // Usar la URL completa del dominio actual para el logo
    const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://short-grupo-inmobiliario.vercel.app'
    const logoUrl = encodeURIComponent(`${currentDomain}/Logo.svg`)
    // Usar QR Server API con parámetros optimizados para logo en el centro
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}&logo=${logoUrl}&logo_size=20%&logo_margin=0&logo_bg_color=FFFFFF&logo_corner_radius=0`
    console.log('QR URL:', qrUrl)
    return qrUrl
  }

  const generateQRCodeAlternative = (text: string) => {
    // API alternativa sin logo para casos de fallo
    return `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(text)}&chld=L|1`
  }

  // Generar mensaje para compartir con información real
  const shareMessage = `¡Mira esta propiedad! ${property.titulo} - ${property.precio} ${property.moneda?.simbolo} en ${property.direccion?.barrio || property.direccion?.ciudad}`

  // Detectar si es mobile
  const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);

  // Función para copiar al portapapeles
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      color: 'bg-green-600 hover:bg-green-700',
      icon: WhatsAppIcon,
      action: () => {
        // Para compartir con contactos elegidos, usar Web Share API si está disponible
        if (navigator.share && isMobile) {
          navigator.share({
            title: property.titulo,
            text: `¡Mira esta propiedad! ${property.titulo} - ${property.precio} ${property.moneda?.simbolo} en ${property.direccion?.barrio || property.direccion?.ciudad}`,
            url: propertyUrl
          }).catch(() => {
            // Fallback a WhatsApp directo
            const message = `¡Mira esta propiedad! ${property.titulo} - ${property.precio} ${property.moneda?.simbolo} en ${property.direccion?.barrio || property.direccion?.ciudad}\n\nVer propiedad: ${propertyUrl}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
          });
        } else {
          // Fallback para desktop o navegadores sin Web Share API
          const message = `¡Mira esta propiedad! ${property.titulo} - ${property.precio} ${property.moneda?.simbolo} en ${property.direccion?.barrio || property.direccion?.ciudad}\n\nVer propiedad: ${propertyUrl}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        }
      }
    },
    {
      name: 'Telegram',
      color: 'bg-blue-500 hover:bg-blue-600',
      icon: TelegramIcon,
      action: () => {
        // Para compartir con contactos elegidos, usar Web Share API si está disponible
        if (navigator.share && isMobile) {
          navigator.share({
            title: property.titulo,
            text: `¡Mira esta propiedad! ${property.titulo} - ${property.precio} ${property.moneda?.simbolo} en ${property.direccion?.barrio || property.direccion?.ciudad}`,
            url: propertyUrl
          }).catch(() => {
            // Fallback a Telegram directo
            const message = `¡Mira esta propiedad! ${property.titulo} - ${property.precio} ${property.moneda?.simbolo} en ${property.direccion?.barrio || property.direccion?.ciudad}\n\nVer propiedad: ${propertyUrl}`;
            window.open(`https://t.me/?text=${encodeURIComponent(message)}`, '_blank');
          });
        } else {
          // Fallback para desktop o navegadores sin Web Share API
          const message = `¡Mira esta propiedad! ${property.titulo} - ${property.precio} ${property.moneda?.simbolo} en ${property.direccion?.barrio || property.direccion?.ciudad}\n\nVer propiedad: ${propertyUrl}`;
          window.open(`https://t.me/?text=${encodeURIComponent(message)}`, '_blank');
        }
      }
    },
    {
      name: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: FacebookIcon,
      action: () => {
        // Usar Web Share API en móvil, fallback a Facebook Share en desktop
        if (navigator.share && isMobile) {
          navigator.share({
            title: property.titulo,
            text: `¡Mira esta propiedad! ${property.titulo} - ${property.precio} ${property.moneda?.simbolo} en ${property.direccion?.barrio || property.direccion?.ciudad}`,
            url: propertyUrl
          }).catch(() => {
            // Fallback a Facebook Share
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`, '_blank');
          });
        } else {
          // Facebook Share para desktop
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`, '_blank');
        }
      }
    },
    {
      name: 'QR Code',
      color: 'bg-purple-600 hover:bg-purple-700',
      icon: QrCode,
      action: () => {
        setQrLoading(true)
        setQrError(false)
        setShowQR(true)
        // Generar QR con logo
        generateQRWithLogo(propertyUrl)
      }
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                Compartir Propiedad
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Property Info */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">{property.titulo}</h3>
              <p className="text-gray-600 text-sm mb-2">
                {property.direccion?.calle} {property.direccion?.numero}, {property.direccion?.ciudad}
              </p>
              <p className="text-lg font-bold text-blue-600">
                {property.precio} {property.moneda?.simbolo}
              </p>
            </div>

            {/* Share Options */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={option.action}
                    className={`${option.color} text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center`}
                  >
                    <option.icon className="h-10 w-10 mr-2" />
                    <span className={option.name === 'Facebook' ? 'ml-[10px]' : ''}>{option.name}</span>
                  </button>
                ))}
              </div>

              {/* Direct Link */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enlace directo:
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={propertyUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg text-sm bg-white"
                  />
                  <button
                    onClick={() => copyToClipboard(propertyUrl)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code Modal */}
            <AnimatePresence>
              {showQR && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4"
                  onClick={() => setShowQR(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowQR(false)
                    }
                  }}
                  tabIndex={0}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <img 
                          src="/Logo.svg" 
                          alt="Short Grupo Inmobiliario" 
                          className="h-8 w-auto mr-2"
                        />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Código QR
                        </h3>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        {qrLoading && (
                          <div className="flex items-center justify-center h-64">
                            <Spinner size="md" color="primary" showText text="Generando QR con logo..." />
                          </div>
                        )}
                        {qrDataUrl && !qrLoading && (
                          <img
                            src={qrDataUrl}
                            alt="QR Code con logo"
                            className="mx-auto border border-gray-200 rounded-lg shadow-sm"
                          />
                        )}
                        {!qrDataUrl && !qrLoading && (
                          <img
                            src={generateQRCode(propertyUrl)}
                            alt="QR Code"
                            className="mx-auto border border-gray-200 rounded-lg shadow-sm"
                            onError={(e) => {
                              setQrError(true)
                              // Si falla la carga del QR con logo, usar la versión sin logo
                              const target = e.target as HTMLImageElement;
                              target.src = generateQRCodeAlternative(propertyUrl);
                            }}
                          />
                        )}
                        {qrError && (
                          <div className="text-center text-sm text-gray-500 mt-2">
                            <p>QR generado sin logo (fallback)</p>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Escanea este código para acceder directamente a la propiedad
                      </p>
                      <div className="text-xs text-gray-500 mb-4">
                        <p>Propiedad: {property.titulo}</p>
                        <p>Precio: {property.precio} {property.moneda?.simbolo}</p>
                      </div>
                      <button
                        onClick={() => setShowQR(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Cerrar
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 