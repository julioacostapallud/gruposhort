import { notFound } from 'next/navigation'
import { propiedades } from '@/lib/services/propiedades'
import { PropertyDetail } from '@/components/PropertyDetail'
import { PropertyNotFound } from '@/components/PropertyNotFound'
import { VisitaTracker } from '@/components/VisitaTracker'
import { Metadata } from 'next'
import { PropertyPageClient } from '@/components/PropertyPageClient'

interface PropertyPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    
    // Extraer el ID del slug
    let propertyId: number | null = null
    const idMatch1 = slug.match(/-(\d+)$/)
    if (idMatch1) {
      propertyId = parseInt(idMatch1[1])
    }
    
    if (!propertyId) {
      const idMatch2 = slug.match(/(\d+)$/)
      if (idMatch2) {
        propertyId = parseInt(idMatch2[1])
      }
    }
    
    if (!propertyId) {
      const numbers = slug.match(/\d+/g)
      if (numbers && numbers.length > 0) {
        propertyId = parseInt(numbers[numbers.length - 1])
      }
    }
    
    if (!propertyId) {
      return {
        title: 'Propiedad no encontrada - Short Inmobiliaria',
        description: 'La propiedad que buscas no está disponible.',
      }
    }

    const property = await propiedades.get(propertyId)
    
    if (!property) {
      return {
        title: 'Propiedad no encontrada - Short Inmobiliaria',
        description: 'La propiedad que buscas no está disponible.',
      }
    }

    // Formatear precio para el título
    const formatPriceForTitle = (price: string, moneda: any) => {
      const numericPrice = parseFloat(price)
      if (numericPrice >= 1000000) {
        return `${(numericPrice / 1000000).toFixed(1)}M ${moneda?.simbolo || ''}`
      } else if (numericPrice >= 1000) {
        return `${(numericPrice / 1000).toFixed(0)}K ${moneda?.simbolo || ''}`
      }
      return `${numericPrice.toLocaleString('es-AR')} ${moneda?.simbolo || ''}`
    }

    const formattedPrice = formatPriceForTitle(property.precio, property.moneda)
    const operationType = property.estado_comercial?.nombre === 'Venta' ? 'Venta' : 'Alquiler'
    const propertyType = property.tipo_propiedad?.nombre || 'Propiedad'
    
    const title = `${propertyType} ${operationType} - ${property.titulo} - ${formattedPrice} - ${property.direccion?.ciudad}, ${property.direccion?.provincia} | Short Grupo Inmobiliario`
    const description = property.descripcion 
      ? `${property.descripcion.substring(0, 160)}...`
      : `${property.titulo} en ${property.direccion?.ciudad}, ${property.direccion?.provincia}. ${formattedPrice}`
    
    const images = property.imagenes?.map(img => ({
      url: typeof img === 'string' ? img : img.url,
      width: 1200,
      height: 630,
      alt: `${property.titulo} - ${property.direccion?.ciudad}`,
    })) || []

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://gruposhort.com.ar/propiedad/${slug}`,
        siteName: 'Short Inmobiliaria',
        images,
        locale: 'es_AR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: images.map(img => img.url),
      },
      alternates: {
        canonical: `https://gruposhort.com.ar/propiedad/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    }
  } catch (error) {
    return {
      title: 'Propiedad no encontrada - Short Inmobiliaria',
      description: 'La propiedad que buscas no está disponible.',
    }
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  try {
    // Await params para cumplir con Next.js 15
    const { slug } = await params
    
    // Extraer el ID del slug (último segmento después del último guión)
    let propertyId: number | null = null
    
    // Patrón 1: ID al final después del último guión
    const idMatch1 = slug.match(/-(\d+)$/)
    if (idMatch1) {
      propertyId = parseInt(idMatch1[1])
    }
    
    // Patrón 2: ID al final sin guión
    if (!propertyId) {
      const idMatch2 = slug.match(/(\d+)$/)
      if (idMatch2) {
        propertyId = parseInt(idMatch2[1])
      }
    }
    
    // Patrón 3: Buscar cualquier número en el slug
    if (!propertyId) {
      const numbers = slug.match(/\d+/g)
      if (numbers && numbers.length > 0) {
        propertyId = parseInt(numbers[numbers.length - 1])
      }
    }
    
    if (!propertyId || isNaN(propertyId)) {
      notFound()
    }

    // Buscar la propiedad por ID
    const property = await propiedades.get(propertyId)
    
    // Si la propiedad no existe, mostrar página de error
    if (!property) {
      return <PropertyNotFound propertyId={propertyId} />
    }
    
    // Si la propiedad no está activa, mostrar página de error
    const estadoActivo = ['Activo', 'Activa', 'Disponible', 'Publicado', 'Vigente']
    if (!estadoActivo.includes(property.estado_registro?.nombre)) {
      return <PropertyNotFound propertyId={propertyId} />
    }

    return (
      <>
        <VisitaTracker propiedadId={propertyId} />
        <PropertyPageClient property={property} />
      </>
    )
  } catch (error) {
    console.error('Error loading property:', error)
    notFound()
  }
} 