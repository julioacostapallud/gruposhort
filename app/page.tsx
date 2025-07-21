"use client"
import NextImage from "next/image"
import { Header } from "../components/Header"
import { PropertyCard } from "@/components/property-card"
import { PropertyFilter } from "@/components/PropertyFilter"
import { CategorySection } from "@/components/category-section"
import { PropertyPreviewModal } from "@/components/PropertyPreviewModal"
import { LoginModal } from "@/components/LoginModal"
import { Footer } from "@/components/footer"
import { TasacionesSection } from "@/components/boost-section"
import { ExploreSection } from "@/components/explore-section"
import { TrendsSection } from "@/components/trends-section"
import { propiedades, Propiedad } from "@/lib/services/propiedades"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store/store"
import { useRouter } from "next/navigation"
import { Building, HomeIcon, Calculator, Gavel, MapPin, FileText, Scale } from "lucide-react"

export default function Home() {
  const [propiedadesList, setPropiedadesList] = useState<Propiedad[]>([])
  const [filteredPropiedades, setFilteredPropiedades] = useState<Propiedad[]>([])
  const [currentFilters, setCurrentFilters] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Propiedad | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth as any)
  const router = useRouter()

  // Función para formatear el precio con la moneda de la propiedad
  const formatPrice = (price: string, moneda: any) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda?.codigo_iso || 'ARS'
    }).format(parseFloat(price))
  }

  // Función para formatear solo el número sin símbolo de moneda
  const formatPriceNumber = (price: string) => {
    return parseFloat(price).toLocaleString('es-AR', { minimumFractionDigits: 0 })
  }

  useEffect(() => {
    propiedades
      .list()
      .then(data => {
        setPropiedadesList(data)
        setFilteredPropiedades(data)
      })
      .catch(err => console.error("Error al cargar propiedades:", err))
  }, [])

  // Función para manejar los filtros
  const handleFilter = (filters: any) => {
    setCurrentFilters(filters)
    setIsLoading(true)
    
    // Filtrado completamente en el frontend
    const localFiltered = propiedadesList.filter(prop => {
      // Filtro por operación (Comprar/Alquilar)
      if (filters.operacion) {
        // Por ahora, asumimos que todas las propiedades son para comprar
        // En el futuro, esto se puede basar en un campo específico de la propiedad
        if (filters.operacion === "Alquilar") {
          // Si no hay lógica específica para alquiler, mostrar todas
          // return false; // Comentar esta línea si queremos mostrar todas
        }
      }
      
      // Filtro por tipo de propiedad
      if (filters.tipo_propiedad && prop.tipo_propiedad.id !== filters.tipo_propiedad) return false
      
      // Filtro por estado comercial
      if (filters.estado_comercial && prop.estado_comercial.id !== filters.estado_comercial) return false
      
      // Filtro por estado físico
      if (filters.estado_fisico && prop.estado_fisico.id !== filters.estado_fisico) return false
      
      // Filtro por estado situación
      if (filters.estado_situacion && prop.estado_situacion.id !== filters.estado_situacion) return false
      
      // Filtro por estado registro
      if (filters.estado_registro && prop.estado_registro.id !== filters.estado_registro) return false
      
      // Filtro por provincia
      if (filters.provincia && prop.direccion?.provincia !== filters.provincia) return false
      
      // Filtro por ciudad
      if (filters.ciudad && prop.direccion?.ciudad !== filters.ciudad) return false
      
      // Filtro por barrio
      if (filters.barrio && prop.direccion?.barrio !== filters.barrio) return false
      
      // Filtro por precio
      const precio = Number(prop.precio)
      if (filters.min_precio && precio < filters.min_precio) return false
      if (filters.max_precio && precio > filters.max_precio) return false
      
      // Filtro por superficie
      const superficie = Number(prop.superficie_m2)
      if (filters.min_superficie && superficie < filters.min_superficie) return false
      if (filters.max_superficie && superficie > filters.max_superficie) return false
      
      // Filtro por ancho
      const ancho = Number(prop.ancho_m)
      if (filters.min_ancho && ancho < filters.min_ancho) return false
      if (filters.max_ancho && ancho > filters.max_ancho) return false
      
      // Filtro por largo
      const largo = Number(prop.largo_m)
      if (filters.min_largo && largo < filters.min_largo) return false
      if (filters.max_largo && largo > filters.max_largo) return false
      
      // Filtro por antigüedad
      if (filters.max_antiguedad && (prop.antiguedad || 0) > filters.max_antiguedad) return false
      
      // Filtro por dormitorios
      if (filters.min_dormitorios && (prop.dormitorios || 0) < filters.min_dormitorios) return false
      
      // Filtro por baños
      if (filters.min_banos && (prop.banos || 0) < filters.min_banos) return false
      
      // Filtro por moneda
      if (filters.moneda && prop.moneda.id !== filters.moneda) return false
      
      // Filtro por características
      if (filters.caracteristicas && filters.caracteristicas.length > 0) {
        const propCaracts = prop.caracteristicas.map(c => c.id)
        const hasAllCaracts = filters.caracteristicas.every((catId: number) => propCaracts.includes(catId))
        if (!hasAllCaracts) return false
      }
      
      return true
    })
    
    setFilteredPropiedades(localFiltered)
    setIsLoading(false)
  }

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
        <div className="w-full flex flex-col items-center px-2 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Confiar también es parte de sentirse en casa</h1>
          <div className="text-sm mb-8 max-w-6xl mx-auto text-center font-medium flex flex-wrap justify-center items-center gap-4">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>NEGOCIOS INMOBILIARIOS</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <HomeIcon className="h-4 w-4" />
              <span>ADMINISTRACIÓN DE ALQUILERES</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calculator className="h-4 w-4" />
              <span>TASACIONES PRIVADAS, JUDICIALES Y BANCARIAS</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>TASACIONES URBANAS Y RURALES</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Gavel className="h-4 w-4" />
              <span>PERICIAS Y DILIGENCIAS EN TRIBUNALES FEDERALES Y PROVINCIALES</span>
            </div>
          </div>
          <div className="w-full max-w-7xl mx-auto">
            <PropertyFilter onFilter={handleFilter} />
          </div>
        </div>
      </section>

      {/* Explore Properties Section */}
      {/* <CategorySection /> */}

      {/* Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Propiedades</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">Buscando propiedades...</div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredPropiedades.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPropiedades.map((p) => (
                  <PropertyCard
                    key={p.id}
                    image={typeof p.imagenes[0] === 'string' ? p.imagenes[0] : p.imagenes[0]?.url ?? '/property1.jpg'}
                    price={formatPriceNumber(p.precio)}
                    moneda={p.moneda}
                    beds={p.dormitorios && p.dormitorios > 0 ? p.dormitorios : ''}
                    baths={p.banos && p.banos > 0 ? p.banos : ''}
                    sqft={p.superficie_m2 && parseFloat(p.superficie_m2) > 0 ? `${p.superficie_m2} m²` : ''}
                    address={`${p.direccion?.calle ?? ''} ${p.direccion?.numero ?? ''}`}
                    city={`${p.direccion?.ciudad ?? ''}, ${p.direccion?.provincia ?? ''}${p.direccion?.barrio ? ` - ${p.direccion.barrio}` : ''}`}
                    status={p.estado_situacion.nombre}
                    daysAgo={1}
                    tipoPropiedad={p.tipo_propiedad?.nombre}
                    estadoComercial={p.estado_comercial?.nombre}
                    estadoSituacion={p.estado_situacion?.nombre}
                    estadoFisico={p.estado_fisico?.nombre}
                    ancho_m={p.ancho_m ?? undefined}
                    largo_m={p.largo_m ?? undefined}
                    antiguedad={p.antiguedad ?? undefined}
                    onClick={() => { setSelectedProperty(p); setShowPreview(true); }}
                  />
                ))}
              </div>
              {/* <div className="text-center mt-10">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                  Ver Más Propiedades
                </button>
              </div> */}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {currentFilters ? 'No se encontraron propiedades con los filtros seleccionados' : 'No hay propiedades disponibles'}
              </div>
              {currentFilters && (
                <button 
                  onClick={() => handleFilter({})}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal de preview de propiedad */}
      <PropertyPreviewModal
        property={selectedProperty}
        isOpen={showPreview && !!selectedProperty}
        onClose={() => setShowPreview(false)}
      />

      {/* Boost Section */}
      <TasacionesSection />

      {/* Explore Neighborhoods */}
      {/* <ExploreSection /> */}

      {/* Market Trends */}
      {/* <TrendsSection /> */}

      {/* Footer */}
      <Footer />
    </main>
  )
}

