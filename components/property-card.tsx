"use client"

import { motion } from "framer-motion"
import { Bed, Bath, Square } from "lucide-react"
import NextImage from "next/image"

interface PropertyCardProps {
  image: string
  price: string
  beds: number
  baths: number
  sqft: string
  address: string
  city: string
  status: string
  daysAgo: number
  onClick?: () => void
}

export function PropertyCard({ image, price, beds, baths, sqft, address, city, status, daysAgo, onClick }: PropertyCardProps) {
  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="relative">
        <NextImage
          src={image || "/placeholder.svg"}
          alt={address}
          width={500}
          height={300}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-md text-sm">{status}</div>
        <div className="absolute top-4 right-4 bg-white text-gray-800 px-3 py-1 rounded-md text-sm">
          {daysAgo === 1 ? "Hace 1 día" : `Hace ${daysAgo} días`}
        </div>
      </div>
      <div className="p-6">
        <div className="text-2xl font-bold text-gray-800 mb-2">{price}</div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-600">
            <Bed className="h-5 w-5 mr-1" />
            <span>{beds} Hab</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Bath className="h-5 w-5 mr-1" />
            <span>
              {baths} Baño{baths > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Square className="h-5 w-5 mr-1" />
            <span>{sqft}</span>
          </div>
        </div>
        <div className="text-gray-800">{address}</div>
        <div className="text-gray-600">{city}</div>
      </div>
    </motion.div>
  )
}

