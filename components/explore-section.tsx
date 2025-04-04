"use client"

import { motion } from "framer-motion"
import { Video, Building, Home } from "lucide-react"
import NextImage from "next/image"

export function ExploreSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            className="bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">Explorar Vecindarios</h3>
              <p className="text-gray-600 mb-6">
                Explora recorridos en video, investigaciones detalladas y artículos sobre los mejores vecindarios.
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                <Video className="mr-2 h-5 w-5" />
                <span>Buscar Vecindarios</span>
              </div>
            </div>
            <div className="relative h-48">
              <NextImage src="/neighborhood.jpg" alt="Vecindarios" fill className="object-cover" />
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">Explorar Edificios</h3>
              <p className="text-gray-600 mb-6">
                Descubre edificios residenciales con nuestra búsqueda integral de edificios y nuevas construcciones.
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                <Building className="mr-2 h-5 w-5" />
                <span>Buscar Edificios</span>
              </div>
            </div>
            <div className="relative h-48">
              <NextImage src="/buildings.jpg" alt="Edificios" fill className="object-cover" />
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">Nuevas Construcciones</h3>
              <p className="text-gray-600 mb-6">
                Busca casas de nueva construcción y desarrollos inmobiliarios recientes en las mejores zonas.
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                <Home className="mr-2 h-5 w-5" />
                <span>Buscar Nuevas Construcciones</span>
              </div>
            </div>
            <div className="relative h-48">
              <NextImage src="/new-construction.jpg" alt="Nuevas Construcciones" fill className="object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

