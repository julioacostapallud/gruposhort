"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { motion } from "framer-motion"

export function SearchBar() {
  const [focused, setFocused] = useState(false)

  return (
    <motion.div
      className="max-w-3xl mx-auto relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`flex items-center bg-white rounded-lg overflow-hidden shadow-lg ${focused ? "ring-2 ring-blue-400" : ""}`}
      >
        <input
          type="text"
          placeholder="Ciudad, barrio o escuela"
          className="flex-grow px-6 py-4 text-gray-800 focus:outline-none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button className="bg-blue-600 text-white px-6 py-4 hover:bg-blue-700 transition-colors flex items-center">
          <Search className="mr-2" size={20} />
          <span>Buscar</span>
        </button>
      </div>
    </motion.div>
  )
}

