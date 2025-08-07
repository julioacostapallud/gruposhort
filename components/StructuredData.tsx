'use client'

import Script from 'next/script'
import { Propiedad } from '@/lib/services/propiedades'

interface StructuredDataProps {
  property: Propiedad
}

export function StructuredData({ property }: StructuredDataProps) {
  const generateRealEstateListing = () => ({
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.titulo,
    "description": property.descripcion || `${property.titulo} en ${property.direccion?.ciudad}, ${property.direccion?.provincia}`,
    "price": property.precio,
    "priceCurrency": property.moneda?.codigo_iso || "ARS",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": `${property.direccion?.calle} ${property.direccion?.numero}`,
      "addressLocality": property.direccion?.ciudad,
      "addressRegion": property.direccion?.provincia,
      "addressCountry": "AR",
      "postalCode": property.direccion?.codigo_postal,
    },
    "numberOfBedrooms": property.dormitorios,
    "numberOfBathrooms": property.banos,
    "floorSize": property.superficie_m2 ? {
      "@type": "QuantitativeValue",
      "value": property.superficie_m2,
      "unitCode": "MTK"
    } : undefined,
    "image": property.imagenes?.map(img => 
      typeof img === 'string' ? img : img.url
    ) || [],
    "datePosted": property.fecha_publicacion,
    "dateModified": property.fecha_actualizacion,
    "category": property.tipo_propiedad?.nombre,
    "amenityFeature": property.caracteristicas?.map(caract => ({
      "@type": "LocationFeatureSpecification",
      "name": caract.nombre,
      "value": true
    })) || [],
  })

  const generateLocalBusiness = () => ({
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Short Grupo Inmobiliario",
    "description": "Inmobiliaria especializada en venta y alquiler de propiedades en Resistencia, Chaco. Casas, departamentos y terrenos en venta y alquiler.",
    "url": "https://gruposhort.com.ar",
    "telephone": "+54-362-4727330",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Resistencia",
      "addressRegion": "Chaco",
      "addressCountry": "AR",
      "postalCode": "3500"
    },
    "areaServed": {
      "@type": "City",
      "name": "Resistencia"
    },
    "serviceArea": {
      "@type": "City",
      "name": "Resistencia"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Propiedades en Venta y Alquiler",
      "itemListElement": []
    },
    "serviceType": [
      "Venta de Propiedades",
      "Alquiler de Propiedades", 
      "Tasaciones",
      "Administración de Propiedades"
    ],
    "priceRange": "$$",
    "openingHours": "Mo-Fr 09:00-18:00",
    "sameAs": [
      "https://www.facebook.com/shortinmobiliaria",
      "https://www.instagram.com/shortinmobiliaria"
    ]
  })

  const generateBreadcrumbList = () => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://gruposhort.com.ar"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Propiedades",
        "item": "https://gruposhort.com.ar"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": property.titulo,
        "item": `https://gruposhort.com.ar/propiedad/${property.titulo?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${property.id}`
      }
    ]
  })

  const generateOrganization = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Short Grupo Inmobiliario",
    "url": "https://gruposhort.com.ar",
    "logo": "https://gruposhort.com.ar/Logo.svg",
    "description": "Inmobiliaria especializada en venta y alquiler de propiedades en Resistencia, Chaco",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Resistencia",
      "addressRegion": "Chaco",
      "addressCountry": "AR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+54-362-4727330",
      "contactType": "customer service",
      "areaServed": "AR",
      "availableLanguage": "Spanish"
    },
    "sameAs": [
      "https://www.facebook.com/shortinmobiliaria",
      "https://www.instagram.com/shortinmobiliaria"
    ]
  })

  const generateService = () => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Servicios Inmobiliarios",
    "description": "Venta y alquiler de propiedades, tasaciones y administración inmobiliaria en Resistencia, Chaco",
    "provider": {
      "@type": "RealEstateAgent",
      "name": "Short Grupo Inmobiliario"
    },
    "areaServed": {
      "@type": "City",
      "name": "Resistencia"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Servicios Inmobiliarios",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Venta de Propiedades"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Alquiler de Propiedades"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Tasaciones"
          }
        }
      ]
    }
  })

  return (
    <>
      <Script
        id="real-estate-listing"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateRealEstateListing())
        }}
      />
      <Script
        id="local-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalBusiness())
        }}
      />
      <Script
        id="breadcrumb-list"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbList())
        }}
      />
      <Script
        id="organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganization())
        }}
      />
      <Script
        id="service"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateService())
        }}
      />
    </>
  )
} 