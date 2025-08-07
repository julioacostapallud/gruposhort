import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setSelectedProperty, clearSelectedProperty, fetchPropertyById } from '@/lib/store/propertiesSlice'
import { generatePropertyUrl } from '@/lib/utils'

export function usePropertyNavigation() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { selectedProperty, properties } = useAppSelector(state => state.properties)

  // Función para abrir una propiedad
  const openProperty = (property: any) => {
    dispatch(setSelectedProperty(property))
    
    // Usar searchParams para cambiar la URL sin recargar
    const params = new URLSearchParams(searchParams)
    params.set('property', property.id.toString())
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // Función para cerrar la propiedad
  const closeProperty = () => {
    dispatch(clearSelectedProperty())
    
    // Limpiar el parámetro de la URL
    const params = new URLSearchParams(searchParams)
    params.delete('property')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // Función para navegar a la página completa de la propiedad
  const navigateToPropertyPage = (property: any) => {
    const propertyUrl = generatePropertyUrl(property)
    router.push(propertyUrl)
  }

  // Sincronizar con la URL cuando se carga la página
  useEffect(() => {
    const propertyId = searchParams.get('property')
    
    // Si estamos en una URL de propiedad directa (como /propiedad/[slug])
    if (pathname.startsWith('/propiedad/')) {
      const slug = pathname.replace('/propiedad/', '')
      
      // Extraer el ID del slug
      const idMatch = slug.match(/-(\d+)$/)
      if (idMatch) {
        const id = parseInt(idMatch[1])
        
        // Buscar la propiedad en el estado actual
        const property = properties.find(p => p.id === id)
        
        if (property) {
          // Si la propiedad está en el estado, seleccionarla
          dispatch(setSelectedProperty(property))
        } else {
          // Si no está en el estado, cargarla desde la API
          dispatch(fetchPropertyById(id))
        }
      }
    }
    // Si estamos en la página principal con parámetro de propiedad
    else if (propertyId) {
      const id = parseInt(propertyId)
      
      // Buscar la propiedad en el estado actual
      const property = properties.find(p => p.id === id)
      
      if (property) {
        // Si la propiedad está en el estado, seleccionarla
        dispatch(setSelectedProperty(property))
      } else {
        // Si no está en el estado, cargarla desde la API
        dispatch(fetchPropertyById(id))
      }
    } else {
      // Si no hay parámetro de propiedad ni estamos en una URL de propiedad, limpiar la selección
      dispatch(clearSelectedProperty())
    }
  }, [dispatch, properties, searchParams, pathname])

  return {
    openProperty,
    closeProperty,
    navigateToPropertyPage,
    selectedProperty
  }
} 