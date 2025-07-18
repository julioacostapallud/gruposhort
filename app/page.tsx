"use client"
import NextImage from "next/image"
import { Header } from "../components/Header"
import { SearchBar } from "@/components/search-bar"
import { CategorySection } from "@/components/category-section"
import { PropertyCard } from "@/components/property-card"
import { BoostSection } from "@/components/boost-section"
import { ExploreSection } from "@/components/explore-section"
import { TrendsSection } from "@/components/trends-section"
import { Footer } from "@/components/footer"
import { LoginModal } from "@/components/LoginModal"
import { propiedades, Propiedad } from "@/lib/services/propiedades"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store/store"
import { useRouter } from "next/navigation"

export default function Home() {
  const [propiedadesList, setPropiedadesList] = useState<Propiedad[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth as any)
  const router = useRouter()

  useEffect(() => {
    propiedades
      .list()
      .then(data => {
        setPropiedadesList(data)
      })
      .catch(err => console.error("Error al cargar propiedades:", err))
  }, [])

  // Redirigir al admin si está autenticado y es administrador
  useEffect(() => {
    if (isAuthenticated && user?.rol === 'administrador') {
      router.push('/admin')
    }
  }, [isAuthenticated, user, router])

  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header 
        variant="main"
        onLoginClick={() => setShowLoginModal(true)}
      />

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Encuentra el hogar de tus sueños</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Short Grupo Inmobiliario te conecta directamente con las mejores propiedades del mercado
          </p>
          <SearchBar />
          <div className="mt-8 text-sm">Confiado por más de 10,000 compradores de viviendas</div>
        </div>
      </section>

      {/* Explore Properties Section */}
      <CategorySection />

      {/* Recent Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Propiedades Recientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {propiedadesList.map((p) => (
              <PropertyCard
                key={p.id}
                image={typeof p.imagenes[0] === 'string' ? p.imagenes[0] : p.imagenes[0]?.url ?? '/property1.jpg'}
                price={`${p.moneda.simbolo} ${Number(p.precio).toLocaleString()}`}
                beds={p.dormitorios ?? 0}
                baths={p.banos ?? 0}
                sqft={`${p.superficie_m2 ?? 0} m²`}
                address={`${p.direccion?.calle ?? ''} ${p.direccion?.numero ?? ''}`}
                city={`${p.direccion?.ciudad ?? ''}, ${p.direccion?.provincia ?? ''}`}
                status={p.estado_situacion.nombre}
                daysAgo={1}
              />
            ))}
          </div>
          <div className="text-center mt-10">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
              Ver Más Propiedades
            </button>
          </div>
        </div>
      </section>

      {/* Boost Section */}
      <BoostSection />

      {/* Explore Neighborhoods */}
      <ExploreSection />

      {/* Market Trends */}
      <TrendsSection />

      {/* Footer */}
      <Footer />
    </main>
  )
}

