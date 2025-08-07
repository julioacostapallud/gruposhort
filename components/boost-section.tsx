"use client"

import { motion } from "framer-motion"
import { Calculator, Gavel, FileText, Scale, Building, Award, CheckCircle, X } from "lucide-react"
import NextImage from "next/image"
import { useState } from "react"
import { solicitudes } from "@/lib/services/solicitudes"
import { useToast } from "@/hooks/use-toast"
import { ButtonSpinner } from '@/components/ui/spinner'
import { useEscapeKey } from '@/hooks/useEscapeKey'

export function TasacionesSection() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast();

  // Usar el hook para manejar Escape
  useEscapeKey(() => handleClose(), showForm)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await solicitudes.crearTasacion({
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        mensaje: form.mensaje
      })
      setEnviado(true)
      setForm({ nombre: '', email: '', telefono: '', mensaje: '' })
      toast({ title: '¡Solicitud enviada!', description: 'Nos comunicaremos a la brevedad.' })
    } catch (err: any) {
      toast({ title: 'Error al enviar', description: err?.message || 'Ocurrió un error al enviar la solicitud', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setShowForm(false)
    setEnviado(false)
    setForm({ nombre: '', email: '', telefono: '', mensaje: '' })
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Award className="h-4 w-4" />
                <span>Especialistas Certificados</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Pericias y Tasaciones Judiciales
              </h2>
              <p className="text-xl text-gray-200 leading-relaxed">
                Contamos con una basta trayectoria en tasaciones judiciales y privadas que se ajustan a las normas del Tribunal de Tasaciones de la Nación (TTN).
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-xl text-white flex-shrink-0">
                  <Calculator className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-2">Tasaciones Privadas</h3>
                  <p className="text-gray-300">Valoración precisa de propiedades para transacciones particulares con metodologías avaladas por el TTN.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-600 p-3 rounded-xl text-white flex-shrink-0">
                  <Gavel className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-2">Tasaciones Judiciales</h3>
                  <p className="text-gray-300">Informes periciales detallados para litigios, sucesiones y procesos judiciales con validez legal.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-600 p-3 rounded-xl text-white flex-shrink-0">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-2">Tasaciones Bancarias</h3>
                  <p className="text-gray-300">Evaluaciones para entidades financieras, hipotecas y garantías con estándares bancarios.</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              {!showForm && !enviado && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    <h4 className="font-bold text-lg text-white">¿Necesitás una tasación?</h4>
                  </div>
                  <p className="text-gray-200 mb-4">
                    Si necesitás saber cuál es el valor de mercado de tu propiedad o tenés que presentar un informe circunstanciado para presentar en un litigio o ante una entidad bancaria, contactate con nuestro equipo y te responderemos a la brevedad.
                  </p>
                  <button
                    className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                    onClick={() => setShowForm(true)}
                  >
                    <FileText className="h-4 w-4" />
                    Solicitar Tasación
                  </button>
                </>
              )}
              {showForm && !enviado && (
                <form 
                  className="space-y-4" 
                  onSubmit={handleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      handleClose()
                    }
                  }}
                  tabIndex={0}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-lg text-white">Solicitar Tasación</h4>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-white hover:text-gray-300 transition-colors p-1"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm text-white mb-1" htmlFor="nombre">Nombre</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white mb-1" htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white mb-1" htmlFor="telefono">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white mb-1" htmlFor="mensaje">Mensaje</label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={form.mensaje}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? <ButtonSpinner text="Enviando..." /> : 'Enviar solicitud'}
                  </button>
                </form>
              )}
              {enviado && (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">¡Solicitud enviada!</h4>
                  <p className="text-gray-200 text-center mb-4">Gracias por contactarnos. Nos comunicaremos a la brevedad.</p>
                  <button
                    onClick={handleClose}
                    className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Nueva Solicitud
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              {/* Elementos decorativos */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-200 rounded-full opacity-20 hidden md:block"></div>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-green-200 rounded-full opacity-20 hidden md:block"></div>
              
              {/* Imagen principal */}
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                <NextImage
                  src="/buildings.jpg"
                  alt="Tasaciones y Pericias"
                  width={600}
                  height={500}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Overlay con estadísticas */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">500+</div>
                        <div className="text-xs text-gray-600">Tasaciones Realizadas</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">100%</div>
                        <div className="text-xs text-gray-600">Aprobadas TTN</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">15+</div>
                        <div className="text-xs text-gray-600">Años de Experiencia</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta flotante */}
              <div className="absolute top-2 left-2 md:-top-6 md:-right-6 md:left-auto bg-white rounded-xl p-3 md:p-4 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Scale className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">TTN</div>
                    <div className="text-xs text-gray-600">Certificados</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


