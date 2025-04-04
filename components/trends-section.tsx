"use client"

import { motion } from "framer-motion"
import NextImage from "next/image"

const articles = [
  {
    title: "El mercado inmobiliario en Chaco muestra signos de recuperación",
    excerpt: "Los precios de las propiedades en Resistencia han aumentado un 15% en el último trimestre.",
    author: "Leonardo Short",
    date: "01 Abr, 2025",
    image: "/article1.jpg",
  },
  {
    title: "Cómo preparar tu casa para una venta rápida y rentable",
    excerpt: "Consejos prácticos para maximizar el valor de tu propiedad antes de ponerla en el mercado.",
    author: "Equipo Short",
    date: "28 Mar, 2025",
    image: "/article2.jpg",
  },
  {
    title: "Las zonas con mayor crecimiento inmobiliario en Resistencia",
    excerpt: "Descubre los barrios que están experimentando un boom en el desarrollo inmobiliario.",
    author: "Leonardo Short",
    date: "25 Mar, 2025",
    image: "/article3.jpg",
  },
]

export function TrendsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Tendencias del Mercado</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <motion.div
              key={article.title}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative h-48">
                <NextImage
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{article.author}</span>
                  <span>{article.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
            Ver Más Artículos
          </button>
        </div>
      </div>
    </section>
  )
}

