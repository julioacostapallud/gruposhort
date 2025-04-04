"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Clock } from "lucide-react"
import NextImage from "next/image"

export function BoostSection() {
  return (
    <section className="py-16 bg-blue-600 text-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Vende más rápido con nuestro boost</h2>
            <p className="text-lg mb-8">
              Ya sea que seas el propietario o el agente inmobiliario, puedes aprovechar el Boost de Short Grupo
              Inmobiliario.
            </p>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-white p-2 rounded-full text-blue-600 mr-4">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">20% más probabilidades</h3>
                  <p>De cerrar contrato dentro de los primeros 10 días</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white p-2 rounded-full text-blue-600 mr-4">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Publicidad estratégica</h3>
                  <p>Anuncie donde los compradores están buscando en línea, como Facebook e Instagram</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white p-2 rounded-full text-blue-600 mr-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Mayor alcance</h3>
                  <p>
                    Más de 10.000 visitantes únicos buscan en nuestra plataforma, lo que significa que su hogar llegará
                    a más compradores
                  </p>
                </div>
              </div>
            </div>
            <button className="mt-8 bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Conocer Más
            </button>
          </motion.div>
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-blue-500 rounded-lg"></div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-blue-700 rounded-lg"></div>
              <div className="relative bg-white rounded-lg overflow-hidden shadow-xl">
                <NextImage
                  src="/boost-image.jpg"
                  alt="Vende más rápido"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

