'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Mail, Link, QrCode, Copy, Check } from 'lucide-react'
import { WhatsAppIcon, TelegramIcon, InstagramIcon, FacebookIcon } from './ui/social-icons'
import { Propiedad } from '@/lib/services/propiedades'
import { generatePropertyUrl } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface SharePropertyModalProps {
  property: Propiedad
  isOpen: boolean
  onClose: () => void
}

export function SharePropertyModal({ property, isOpen, onClose }: SharePropertyModalProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [propertyUrl, setPropertyUrl] = useState('')

  // Generar la URL SEO friendly solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = generatePropertyUrl(property)
      setPropertyUrl(url)
    }
  }, [property])

  // Generar mensaje para compartir con información real
  const shareMessage = `¡Mira esta propiedad! ${property.titulo} - ${property.precio} ${property.moneda?.simbolo} en ${property.direccion?.barrio || property.direccion?.ciudad}`

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        if (typeof window !== 'undefined') {
          const url = `https://wa.me/?text=${encodeURIComponent(`${shareMessage}\n\n${propertyUrl}`)}`
          window.open(url, '_blank')
        }
      }
    },
    {
      name: 'Telegram',
      icon: TelegramIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        if (typeof window !== 'undefined') {
          const url = `https://t.me/share/url?url=${encodeURIComponent(propertyUrl)}&text=${encodeURIComponent(shareMessage)}`
          window.open(url, '_blank')
        }
      }
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => {
        if (typeof window !== 'undefined') {
          const subject = encodeURIComponent(`Propiedad: ${property.titulo}`)
          const body = encodeURIComponent(`${shareMessage}\n\nVer más detalles: ${propertyUrl}`)
          const url = `mailto:?subject=${subject}&body=${body}`
          window.open(url)
        }
      }
    },
    {
      name: 'Copiar Link',
      icon: copied ? Check : Copy,
      color: copied ? 'bg-green-500' : 'bg-purple-500 hover:bg-purple-600',
      action: async () => {
        if (typeof window !== 'undefined' && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(propertyUrl)
            setCopied(true)
            toast({
              title: "Link copiado",
              description: "El enlace de la propiedad se copió al portapapeles",
            })
            setTimeout(() => setCopied(false), 2000)
          } catch (error) {
            toast({
              title: "Error",
              description: "No se pudo copiar el enlace",
              variant: "destructive",
            })
          }
        }
      }
    },
    {
      name: 'QR Code',
      icon: QrCode,
      color: 'bg-black hover:bg-gray-800',
      action: () => {
        setShowQR(true)
      }
    }
  ]

  const generateQRCode = (text: string) => {
    // Usar una API gratuita para generar QR
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
  }

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
                    {option.name}
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
                    onClick={shareOptions[3].action}
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
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Código QR
                      </h3>
                      <img
                        src={generateQRCode(propertyUrl)}
                        alt="QR Code"
                        className="mx-auto mb-4 border border-gray-200 rounded-lg"
                      />
                      <p className="text-sm text-gray-600 mb-4">
                        Escanea este código para acceder directamente a la propiedad
                      </p>
                      <button
                        onClick={() => setShowQR(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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