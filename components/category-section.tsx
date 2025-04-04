"use client"

import { motion } from "framer-motion"
import { Home, CuboidIcon as Cube, Eye, Calendar, TrendingDown, Diamond } from "lucide-react"

const categories = [
  { name: "Nuevas en el Mercado", icon: <Home className="h-6 w-6" /> },
  { name: "Tours 3D", icon: <Cube className="h-6 w-6" /> },
  { name: "Más vistas", icon: <Eye className="h-6 w-6" /> },
  { name: "Casas abiertas", icon: <Calendar className="h-6 w-6" /> },
  { name: "Bajadas de precio", icon: <TrendingDown className="h-6 w-6" /> },
  { name: "Casas de lujo", icon: <Diamond className="h-6 w-6" /> },
]

export function CategorySection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Explorar Propiedades</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-4">{category.icon}</div>
              <h3 className="text-center font-medium">{category.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

