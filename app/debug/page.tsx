'use client'

import { useState } from 'react'
import { generatePropertySlug } from '@/lib/utils'

export default function DebugPage() {
  const [slug, setSlug] = useState('')

  const testSlugs = [
    {
      tipo: 'Casa',
      dormitorios: 3,
      barrio: 'Centro',
      ciudad: 'Resistencia',
      id: 123
    },
    {
      tipo: 'Departamento',
      dormitorios: 2,
      barrio: 'Norte',
      ciudad: 'Resistencia',
      id: 456
    },
    {
      tipo: 'Terreno',
      barrio: 'Sur',
      ciudad: 'Resistencia',
      id: 789
    }
  ]

  const generateTestSlug = (data: any) => {
    const generatedSlug = generatePropertySlug(data)
    setSlug(generatedSlug)
    console.log('Generated slug:', generatedSlug)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Debug: Generación de Slugs
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Slugs de Prueba</h2>
          <div className="space-y-4">
            {testSlugs.map((data, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-2">Prueba {index + 1}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {JSON.stringify(data, null, 2)}
                </p>
                <button
                  onClick={() => generateTestSlug(data)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Generar Slug
                </button>
              </div>
            ))}
          </div>
        </div>

        {slug && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Slug Generado</h2>
            <p className="text-lg font-mono bg-gray-100 p-3 rounded-lg mb-4">
              {slug}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                URL completa: <span className="font-mono">/propiedad/{slug}</span>
              </p>
              <a
                href={`/propiedad/${slug}`}
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Probar URL
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 