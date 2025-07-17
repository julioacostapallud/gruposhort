'use client'
import NextImage from "next/image"
import { Header } from "@/components/Header"
import { SearchBar } from "@/components/search-bar"
import { CategorySection } from "@/components/category-section"
import { PropertyCard } from "@/components/property-card"
import { BoostSection } from "@/components/boost-section"
import { ExploreSection } from "@/components/explore-section"
import { TrendsSection } from "@/components/trends-section"
import { Footer } from "@/components/footer"
import { LoginModal } from "@/components/LoginModal"
import { propiedades, Propiedad } from "@/lib/services/propiedades"   // ← importa tu servicio
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store/store"
import { AdminPanel } from "@/components/AdminPanel"

export default function Home() {
  const [propiedadesList, setPropiedadesList] = useState<Propiedad[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  
  useEffect(() => {
    propiedades
      .list()
      .then(data => {
        console.log("Propiedades:", data)
        setPropiedadesList(data)
      })
      .catch(err => console.error("Error al cargar propiedades:", err))
  }, [])

  const handleToggleAdmin = () => {
    setIsAdminMode(!isAdminMode)
  }

  const handleLogout = () => {
    setIsAdminMode(false)
  }

  // Si está en modo admin, mostrar solo el panel de administración
  if (isAdminMode) {
    return (
      <main className="min-h-screen">
        <Header 
          variant="admin"
          onLogout={handleLogout}
          onToggleAdmin={handleToggleAdmin}
          isAdminMode={isAdminMode}
        />
        <AdminPanel />
      </main>
    )
  }

  // Vista normal de la página principal
  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header 
        variant="main"
        onLoginClick={() => setShowLoginModal(true)}
        onToggleAdmin={handleToggleAdmin}
        isAdminMode={isAdminMode}
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
                image={p.imagenes[0] ?? '/property1.jpg'}
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
            {/* <PropertyCard
              image="/property1.jpg"
              price="$45,000,000"
              beds={3}
              baths={2}
              sqft="150 m²"
              address="Av. Sarmiento 1250"
              city="Resistencia, Chaco"
              status="Nuevo en el Mercado"
              daysAgo={1}
            />
            <PropertyCard
              image="/property2.jpg"
              price="$32,500,000"
              beds={2}
              baths={1}
              sqft="90 m²"
              address="French 942"
              city="Resistencia, Chaco"
              status="Nuevo en el Mercado"
              daysAgo={2}
            />
            <PropertyCard
              image="/property3.jpg"
              price="$68,900,000"
              beds={4}
              baths={3}
              sqft="220 m²"
              address="Av. 9 de Julio 800"
              city="Resistencia, Chaco"
              status="Nuevo en el Mercado"
              daysAgo={1}
            /> */}
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

