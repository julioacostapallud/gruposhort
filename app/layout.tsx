import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Rubik } from "next/font/google"
import { Providers } from "@/lib/store/providers"
import Script from "next/script"
import { GA_TRACKING_ID, GA_SCRIPT } from "@/lib/analytics"
import { GlobalStructuredData } from "@/components/GlobalStructuredData"

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rubik",
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: "Short Grupo Inmobiliario - Propiedades en Venta y Alquiler en Resistencia, Chaco",
  description:
    "Encuentra tu hogar ideal en Resistencia, Chaco. Casas, departamentos y terrenos en venta y alquiler. Financiación disponible. ¡Contacta ahora!",
  keywords: "inmobiliaria Resistencia, propiedades Chaco, casas en venta, alquiler departamentos, terrenos Resistencia, Short Grupo Inmobiliario, comprar casa Resistencia, alquilar departamento Chaco, inmobiliaria confiable Resistencia, financiación propiedades Chaco",
  authors: [{ name: "Short Grupo Inmobiliario" }],
  creator: "Short Grupo Inmobiliario",
  publisher: "Short Grupo Inmobiliario",
  icons: {
    icon: '/icons/icon.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gruposhort.com.ar'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Short Grupo Inmobiliario - Propiedades en Venta y Alquiler en Resistencia, Chaco",
    description: "Encuentra tu hogar ideal en Resistencia, Chaco. Casas, departamentos y terrenos en venta y alquiler. Financiación disponible. ¡Contacta ahora!",
    url: 'https://gruposhort.com.ar',
    siteName: 'Short Grupo Inmobiliario',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: '/Logo.svg',
        width: 1200,
        height: 630,
        alt: 'Short Grupo Inmobiliario - Propiedades en Resistencia, Chaco',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Short Grupo Inmobiliario - Propiedades en Venta y Alquiler en Resistencia, Chaco",
    description: "Encuentra tu hogar ideal en Resistencia, Chaco. Casas, departamentos y terrenos en venta y alquiler. Financiación disponible. ¡Contacta ahora!",
    images: ['/Logo.svg'],
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
  verification: {
    google: 'tu-codigo-de-verificacion-google',
  },
  other: {
    'geo.region': 'AR-CH',
    'geo.placename': 'Resistencia',
    'geo.position': '-27.4511;-58.9866',
    'ICBM': '-27.4511, -58.9866',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={rubik.variable}>
      <body className="font-rubik">
        <GlobalStructuredData />
        {GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: GA_SCRIPT,
              }}
            />
          </>
        )}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}