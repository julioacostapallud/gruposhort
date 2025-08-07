'use client'

import Script from 'next/script'

export function GlobalStructuredData() {
  const generateWebSite = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Short Grupo Inmobiliario",
    "url": "https://gruposhort.com.ar",
    "description": "Inmobiliaria especializada en venta y alquiler de propiedades en Resistencia, Chaco",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://gruposhort.com.ar?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
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

  return (
    <>
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWebSite())
        }}
      />
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalBusiness())
        }}
      />
    </>
  )
} 