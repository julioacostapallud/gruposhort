import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Rubik } from "next/font/google"
import { Providers } from "@/lib/store/providers"

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rubik",
})

export const metadata: Metadata = {
  title: "Short Grupo Inmobiliario - Desarrollos Comerciales",
  description:
    "Encuentra el hogar de tus sueños con Short Grupo Inmobiliario. Compra, venta y alquiler de propiedades en Resistencia, Chaco.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={rubik.variable}>
      <body className="font-rubik">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}