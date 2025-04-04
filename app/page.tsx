import NextImage from "next/image"
import { SearchBar } from "@/components/search-bar"
import { CategorySection } from "@/components/category-section"
import { PropertyCard } from "@/components/property-card"
import { BoostSection } from "@/components/boost-section"
import { ExploreSection } from "@/components/explore-section"
import { TrendsSection } from "@/components/trends-section"
import { Footer } from "@/components/footer"

export default function Home() {
  
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center">
            <NextImage src="/logo.png" alt="Short Grupo Inmobiliario" width={50} height={50} className="mr-2" />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-blue-600">Short</h1>
              <p className="text-xs text-gray-600">Grupo Inmobiliario - Desarrollos Comerciales</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
              Comprar
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
              Alquilar
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
              Vender
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
              Explorar
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
              Noticias
            </a>
          </nav>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Iniciar Sesión
          </button>
        </div>
      </header>

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
            <PropertyCard
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
            />
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

