'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { Propiedad } from '@/lib/services/propiedades'

interface BreadcrumbsProps {
  property?: Propiedad
  currentPage?: string
}

export function Breadcrumbs({ property, currentPage }: BreadcrumbsProps) {
  const breadcrumbs = [
    {
      name: 'Inicio',
      href: '/',
      icon: Home,
    },
    {
      name: 'Propiedades',
      href: '/',
    },
  ]

  if (property) {
    breadcrumbs.push({
      name: property.titulo || 'Propiedad',
      href: '#',
    })
  } else if (currentPage) {
    breadcrumbs.push({
      name: currentPage,
      href: '#',
    })
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          const Icon = breadcrumb.icon

          return (
            <li key={breadcrumb.name} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              )}
              
              {isLast ? (
                <span className="text-gray-900 font-medium">
                  {Icon && <Icon className="h-4 w-4 inline mr-1" />}
                  {breadcrumb.name}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4 inline mr-1" />}
                  {breadcrumb.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
} 